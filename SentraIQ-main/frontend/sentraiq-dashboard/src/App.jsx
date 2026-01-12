import React, { useState, useEffect } from 'react';
import { Shield, Database, FileText, Link2, Package, ExternalLink } from 'lucide-react';
import StatsCard from './components/StatsCard';
import IngestTab from './components/IngestTab';
import QueryTab from './components/QueryTab';
import AssuranceTab from './components/AssuranceTab';
import Toast from './components/Toast';
import Loading from './components/Loading';
import { dashboardAPI } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('ingest');
  const [stats, setStats] = useState({
    total_logs: 0,
    total_documents: 0,
    total_evidence_objects: 0,
    total_assurance_packs: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const tabs = [
    { id: 'ingest', label: 'Ingest Evidence', icon: Database },
    { id: 'query', label: 'Query Evidence', icon: FileText },
    { id: 'assurance', label: 'Assurance Pack', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast />
      <Loading isOpen={loading} />

      {/* Header */}
      <header className="gradient-bg text-white shadow-2xl sticky top-0 z-40">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">SentraIQ</h1>
                <p className="text-sm opacity-90 font-medium">Hybrid Evidence Lakehouse for Payment Systems</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden md:inline font-semibold">API Docs</span>
              </a>
              <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm font-semibold">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Dashboard */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Database className="w-7 h-7 text-purple-600" />
            System Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard icon={Database} label="Total Logs Ingested" value={stats.total_logs} color="purple" />
            <StatsCard icon={FileText} label="Documents Uploaded" value={stats.total_documents} color="blue" />
            <StatsCard icon={Link2} label="Evidence Objects Mapped" value={stats.total_evidence_objects} color="green" />
            <StatsCard icon={Package} label="Assurance Packs Generated" value={stats.total_assurance_packs} color="orange" />
          </div>
        </div>

        {/* Main Content - Tabbed Interface */}
        <div className="glass rounded-2xl p-8">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="animate-slide-in">
            {activeTab === 'ingest' && <IngestTab onIngestComplete={loadStats} />}
            {activeTab === 'query' && <QueryTab />}
            {activeTab === 'assurance' && <AssuranceTab />}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            SentraIQ v1.0.0 - Powered by FastAPI & React
            <br />
            <span className="text-xs">Hybrid Evidence Lakehouse for Payment Systems Compliance</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
