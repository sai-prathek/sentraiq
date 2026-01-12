import React, { useState } from 'react';
import { Search, FileText, Database, ArrowRight, Sparkles, Zap, Shield, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
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
  const [auditorMode, setAuditorMode] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setLoading(true);
    setResults(null);
    setAiSummary(null);
    setGapAnalysis(null);
    
    try {
      const data: any = await api.queryEvidence(searchQuery);
      
      // Extract items, AI summary, and gap analysis from response
      const items = Array.isArray(data) ? data : [];
      setResults(items);
      
      if (data.ai_summary) {
        setAiSummary(data.ai_summary);
      }
      if (data.gap_analysis) {
        setGapAnalysis(data.gap_analysis);
      }
      
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
        
        {/* Auditor Mode Toggle */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={auditorMode}
              onChange={(e) => setAuditorMode(e.target.checked)}
              className="w-4 h-4 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
            />
            <Shield className="w-4 h-4 text-blue-900" />
            <span className="text-sm font-medium text-gray-700">Auditor Mode</span>
          </label>
          <span className="text-xs text-gray-500">Enable to simulate auditor challenges</span>
        </div>
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
          <div className="space-y-6">
            {/* Show Your Work Section */}
            {aiSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-blue-900" />
                  <h3 className="font-semibold text-blue-900">AI Analysis: Show Your Work</h3>
                </div>
                <p className="text-gray-700 mb-4">{aiSummary}</p>
                
                {/* Evidence Summary */}
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Evidence Items:</span>
                      <p className="font-semibold text-gray-900">{results.length}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Controls Matched:</span>
                      <p className="font-semibold text-gray-900">
                        {new Set(results.filter(r => r.control_id).map(r => r.control_id)).size}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Logs:</span>
                      <p className="font-semibold text-gray-900">
                        {results.filter(r => r.type === 'Log').length}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Documents:</span>
                      <p className="font-semibold text-gray-900">
                        {results.filter(r => r.type === 'Document').length}
                      </p>
                    </div>
                  </div>
                  
                  {/* Control IDs with Links */}
                  {results.some(r => r.control_id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Control IDs: </span>
                      {Array.from(new Set(results.filter(r => r.control_id).map(r => r.control_id!))).map(ctrlId => (
                        <span key={ctrlId} className="inline-block mx-1 px-2 py-1 bg-blue-100 text-blue-900 text-xs rounded font-mono">
                          {ctrlId}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Gap Analysis Section */}
            {gapAnalysis && gapAnalysis.gap_count > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-yellow-700" />
                  <h3 className="font-semibold text-yellow-900">Compliance Gap Analysis</h3>
                </div>
                <p className="text-sm text-yellow-800 mb-4">
                  {gapAnalysis.gap_count} gap(s) identified: {gapAnalysis.temporal_gaps?.length || 0} temporal, {gapAnalysis.coverage_gaps?.length || 0} coverage
                </p>
                
                {gapAnalysis.temporal_gaps && gapAnalysis.temporal_gaps.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-yellow-900 mb-2">Temporal Gaps:</h4>
                    {gapAnalysis.temporal_gaps.slice(0, 3).map((gap: any, idx: number) => (
                      <div key={idx} className="bg-white rounded p-2 mb-2 text-sm">
                        <span className="font-medium">{gap.control_id}:</span> {gap.description}
                        {gap.days_overdue && (
                          <span className="text-red-700 ml-2">({gap.days_overdue} days overdue)</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Auditor Mode Challenge */}
            {auditorMode && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-red-700" />
                  <h3 className="font-semibold text-red-900">Auditor Challenge Mode</h3>
                </div>
                <p className="text-sm text-red-800 mb-3">
                  <strong>Challenge:</strong> "Prove to me that your evidence is current and comprehensive."
                </p>
                <div className="bg-white rounded-lg p-4 border border-red-100">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Response:</strong> Evidence includes {results.length} items covering {new Set(results.filter(r => r.control_id).map(r => r.control_id)).size} controls.
                  </p>
                  <p className="text-sm text-gray-700">
                    All evidence items are cryptographically hashed and timestamped. Evidence hashes available for verification.
                  </p>
                </div>
              </motion.div>
            )}

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
                                {item.control_id && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-mono">
                                    Control: {item.control_id}
                                  </span>
                                )}
                            </div>
                            {/* Show hash if available (for show your work) */}
                            {auditorMode && (item as any).hash && (
                              <div className="mt-2 text-xs text-gray-500 font-mono">
                                Hash: {(item as any).hash.substring(0, 16)}...
                              </div>
                            )}
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
