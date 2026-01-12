import React, { useState } from 'react';
import { Search, FileText, Database, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EvidenceItem, DashboardOutletContext } from '../types';
import { api } from '../services/api';
import EvidenceDetailModal from './EvidenceDetailModal';
import { useOutletContext } from 'react-router-dom';

interface QueryTabProps {
  onToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  selectedEvidence: EvidenceItem[];
  onAddEvidenceToPack: (item: EvidenceItem) => void;
}

const QueryTab: React.FC<QueryTabProps> = ({
  onToast,
  selectedEvidence,
  onAddEvidenceToPack,
}) => {
  const { setWorkflowState } = useOutletContext<DashboardOutletContext>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EvidenceItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentEvidence, setCurrentEvidence] = useState<EvidenceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setLoading(true);
    setResults(null); // Reset results for re-animation
    try {
      const data = await api.queryEvidence(searchQuery);
      setResults(data);
      
      // Mark query step as complete
      setWorkflowState((prev) => ({ ...prev, hasQueried: true }));
    } catch (error: any) {
      console.error('Query error:', error);
      onToast(
        error?.message || 'Failed to run evidence query',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    "Show me all MFA authentication logs for privileged users",
    "Find failed login attempts from external IP addresses",
    "Get all encryption policies and related audit logs",
    "Show me SWIFT transaction logs with anomalies",
    "Find evidence for PCI-DSS requirement 8.3",
    "List all documents mentioning data retention policies"
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 min-h-[500px]">

      {/* Search Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full">
          <Zap className="w-4 h-4 text-blue-900" />
          <span className="text-sm font-semibold text-blue-900">AI-Powered Search</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Natural Language Evidence Search</h2>
        <p className="text-gray-500">Ask questions about your compliance data using plain English. Powered by OpenAI GPT-4.</p>
      </div>

      {/* Search Input Area */}
      <div className="relative group z-10">
        <div className={`absolute inset-0 bg-blue-900 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300 ${loading ? 'animate-pulse' : ''}`}></div>
        <div className="relative flex items-center bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="pl-6">
            <Search className={`w-6 h-6 ${loading ? 'text-blue-900 animate-spin' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            className="w-full py-5 px-4 text-lg text-gray-800 placeholder-gray-400 focus:outline-none"
            placeholder="Ask anything about your evidence data..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="mr-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Suggestion Chips - Only show if no results yet */}
      {!results && !loading && (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-wrap justify-center gap-3"
        >
          <p className="w-full text-center text-sm text-gray-400 mb-2">Try these example queries:</p>
          {exampleQueries.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSearch(q)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              {q}
            </button>
          ))}
        </motion.div>
      )}

      {/* Results Section */}
      <div className="flex-1">
        {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin"></div>
                <p className="text-gray-400 animate-pulse">AI is analyzing your evidence lakehouse...</p>
                <p className="text-sm text-gray-400">Using OpenAI GPT-4 for semantic understanding</p>
            </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Found {results.length} relevant items</h3>
                <span className="text-xs text-gray-400">AI-enhanced relevance scoring</span>
            </div>

            <AnimatePresence>
              {results.map((item, index) => {
                const isInPack = selectedEvidence.some(
                  (e) => e.id === item.id && e.type === item.type
                );
                return (
                  <motion.div
                    key={`${item.id}-${item.type}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className={`p-3 rounded-lg h-fit ${item.type === 'Log' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {item.type === 'Log' ? <Database className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">{item.filename}</h4>
                            {item.control_id && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200 font-mono">
                                {item.control_id}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded border border-gray-100 mb-2 max-w-2xl line-clamp-2">
                            {item.preview}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                            <span>ID: {item.id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
                            <Sparkles className="w-3 h-3" />
                            {item.relevance}% Match
                          </div>
                          {isInPack && (
                            <span className="text-[10px] font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                              In Pack List
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setCurrentEvidence(item);
                            setIsModalOpen(true);
                          }}
                          className="text-sm text-blue-900 font-medium flex items-center hover:underline mt-2"
                        >
                          View Details <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!loading && !results && (
          <div className="text-center py-12 text-gray-400">
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Enter a query above or click an example to get started</p>
          </div>
        )}
      </div>

      {/* Evidence Detail Modal */}
      <EvidenceDetailModal
        evidence={currentEvidence}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToSelection={(item) => {
          onAddEvidenceToPack(item);
          onToast('Evidence added to pack list', 'success');
        }}
        isAlreadySelected={
          currentEvidence !== null &&
          selectedEvidence.some(
            (e) => e.id === currentEvidence.id && e.type === currentEvidence.type
          )
        }
      />
    </div>
  );
};

export default QueryTab;
