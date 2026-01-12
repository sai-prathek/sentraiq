import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { TabType, ToastNotification, EvidenceItem, WorkflowState } from '../types';
import Header from './Header';
import StatsDashboard from './StatsDashboard';
import ToastContainer from './Toast';
import { motion } from 'framer-motion';
import { Database, FileText, Package } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem[]>([]);
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    hasIngested: false,
    hasQueried: false,
  });

  // Check workflow state on mount (for tracking purposes only, no restrictions)
  useEffect(() => {
    // Check if user has ingested data
    checkIngestionStatus();
  }, []);

  const checkIngestionStatus = async () => {
    try {
      const { api } = await import('../services/api');
      const logs = await api.getIngestedLogs();
      const docs = await api.getIngestedDocuments();
      if (logs.length > 0 || docs.length > 0) {
        setWorkflowState((prev) => ({ ...prev, hasIngested: true }));
      }
    } catch (error) {
      console.error('Error checking ingestion status:', error);
    }
  };

  // Show welcome toast on mount (only once, even with React.StrictMode)
  const welcomeShownRef = useRef(false);
  useEffect(() => {
    if (!welcomeShownRef.current) {
      addToast("Welcome back to SentraIQ", "info");
      welcomeShownRef.current = true;
    }
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    // Generate a more unique ID using timestamp + random
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if the same message already exists (prevent duplicates)
    setToasts((prev) => {
      const exists = prev.some(
        (t) => t.message === message && t.type === type
      );
      if (exists) {
        return prev; // Don't add duplicate
      }
      return [...prev, { id, message, type }];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Pack list management
  const addEvidenceToPack = (item: EvidenceItem) => {
    setSelectedEvidence((prev) => {
      const exists = prev.some(
        (e) => e.id === item.id && e.type === item.type
      );
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeEvidenceFromPack = (id: string, type: 'Log' | 'Document') => {
    setSelectedEvidence((prev) =>
      prev.filter((e) => !(e.id === id && e.type === type))
    );
  };

  const clearSelectedEvidence = () => {
    setSelectedEvidence([]);
  };

  // Determine active tab from route
  const getActiveTab = (): TabType => {
    const path = location.pathname;
    if (path.includes('/ingest')) return 'ingest';
    if (path.includes('/query')) return 'query';
    if (path.includes('/generate')) return 'generate';
    return 'ingest';
  };

  const activeTab = getActiveTab();

  const tabs = [
    { id: 'ingest', label: 'Ingest Evidence', icon: Database, path: '/dashboard/ingest' },
    { id: 'query', label: 'Query Evidence', icon: FileText, path: '/dashboard/query' },
    { id: 'generate', label: 'Generate Assurance Pack', icon: Package, path: '/dashboard/generate' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 pb-20">
      <Header />
      <ToastContainer notifications={toasts} removeToast={removeToast} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Stats Section */}
        <section>
          <StatsDashboard />
        </section>

        {/* Tab Navigation */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`
                    relative px-8 py-5 text-sm font-medium transition-colors whitespace-nowrap outline-none flex items-center gap-2
                    ${isActive ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8 flex-1 bg-gradient-to-b from-white to-gray-50/30">
            <Outlet
              context={{
                addToast,
                selectedEvidence,
                addEvidenceToPack,
                removeEvidenceFromPack,
                clearSelectedEvidence,
                workflowState,
                setWorkflowState,
              }}
            />
          </div>
        </section>

      </main>
    </div>
  );
};

export default DashboardLayout;
