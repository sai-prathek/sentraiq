import React, { useState, useEffect, useCallback } from 'react';
import { TabType, ToastNotification } from '../types';
import Header from './Header';
import StatsDashboard from './StatsDashboard';
import IngestTab from './IngestTab';
import QueryTab from './QueryTab';
import GenerateTab from './GenerateTab';
import ToastContainer from './Toast';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
    demoMode: boolean;
    onHome: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ demoMode, onHome }) => {
  const [activeTab, setActiveTab] = useState<TabType>('ingest');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Show welcome toast on mount
  useEffect(() => {
    if (demoMode) {
        addToast("Demo Environment Loaded with 1.2M Records", "success");
    } else {
        addToast("Welcome back to SentraIQ", "info");
    }
  }, [demoMode]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const tabs = [
    { id: 'ingest', label: 'Ingest Evidence' },
    { id: 'query', label: 'Query Evidence' },
    { id: 'generate', label: 'Generate Assurance Pack' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 pb-20">
      <Header onHome={onHome} />
      <ToastContainer notifications={toasts} removeToast={removeToast} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Stats Section */}
        <section>
          <StatsDashboard />
        </section>

        {/* Tab Navigation */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  relative px-8 py-5 text-sm font-medium transition-colors whitespace-nowrap outline-none
                  ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                `}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8 flex-1 bg-gradient-to-b from-white to-gray-50/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'ingest' && <IngestTab onToast={addToast} />}
                {activeTab === 'query' && <QueryTab />}
                {activeTab === 'generate' && <GenerateTab onToast={addToast} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;