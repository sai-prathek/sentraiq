import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { TabType, ToastNotification, EvidenceItem, WorkflowState } from '../types';
import Header from './Header';
import ToastContainer from './Toast';
import ScrollToTop from './ScrollToTop';
import { motion } from 'framer-motion';
import { Database, FileText, Package, History, FileCheck, GitBranch } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem[]>([]);
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    hasIngested: false,
    hasQueried: false,
  });
  const [generateTabClickCount, setGenerateTabClickCount] = useState(0);

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
    if (path.includes('/generate')) return 'generate';
    if (path.includes('/ingest')) return 'ingest';
    if (path.includes('/query')) return 'query';
    if (path.includes('/history')) return 'history';
    if (path.includes('/controls')) return 'controls';
    return 'generate';
  };

  const activeTab = getActiveTab();

  const tabs = [
    { id: 'generate', label: 'Generate Assurance Pack', icon: Package, path: '/dashboard/generate' },
    { id: 'ingest', label: 'Manage Evidence', icon: Database, path: '/dashboard/ingest' },
    { id: 'query', label: 'Query Evidence', icon: FileText, path: '/dashboard/query' },
    { id: 'history', label: 'Pack History', icon: History, path: '/dashboard/history' },
    { id: 'controls', label: 'Control Versioning', icon: GitBranch, path: '/dashboard/controls' },
  ];

  return (
    <div className="h-screen bg-[#f8f9fa] text-gray-900 flex flex-col overflow-hidden">
      <Header />
      <ToastContainer notifications={toasts} removeToast={removeToast} />
      <ScrollToTop />

      <div className="flex flex-1 overflow-hidden">
        {/* Side Panel - Tab Navigation */}
        <aside className="w-72 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col shadow-sm">
          <div className="p-5 border-b border-gray-200 bg-blue-50">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Navigation
            </h2>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  onClick={() => {
                    // Reset generate flow when Generate Assurance Pack tab is clicked
                    if (tab.id === 'generate') {
                      setGenerateTabClickCount(prev => prev + 1);
                    }
                  }}
                  className={`
                    relative flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-50 text-blue-900 font-semibold shadow-sm border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-blue-900' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-900 rounded-r-full"
                      initial={false}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-12">
            {/* Tab Content */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[600px] flex flex-col mb-8">
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
                    generateTabClickCount,
                  }}
                />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
