import React, { useState } from 'react';
import { X, Database, FileText, Calendar, Hash, CheckCircle, Shield, ExternalLink, RefreshCw, Package, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EvidenceItem } from '../types';
import { api } from '../services/api';

interface EvidenceDetailModalProps {
  evidence: EvidenceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({ evidence, isOpen, onClose }) => {
  const [mapping, setMapping] = useState(false);
  const [mappingResult, setMappingResult] = useState<any>(null);
  const [showPackModal, setShowPackModal] = useState(false);
  const [packCreating, setPackCreating] = useState(false);
  const [packResult, setPackResult] = useState<any>(null);
  const [packQuery, setPackQuery] = useState('');
  const [packControlId, setPackControlId] = useState('');
  const [packStartDate, setPackStartDate] = useState('');
  const [packEndDate, setPackEndDate] = useState('');

  if (!evidence) return null;

  // Initialize pack form when evidence changes
  React.useEffect(() => {
    if (evidence) {
      const evidenceDate = new Date(evidence.timestamp);
      const startDate = new Date(evidenceDate);
      startDate.setMonth(startDate.getMonth() - 1); // Default to 1 month before evidence date
      
      setPackQuery(`Evidence pack for ${evidence.filename}`);
      setPackControlId(evidence.control_id || '');
      setPackStartDate(startDate.toISOString().split('T')[0]);
      setPackEndDate(evidenceDate.toISOString().split('T')[0]);
    }
  }, [evidence]);

  const handleMapToControls = async () => {
    if (!evidence.id) return;
    
    setMapping(true);
    try {
      let result;
      if (evidence.type === 'Log') {
        result = await api.mapLogToControls(parseInt(evidence.id));
      } else {
        result = await api.mapDocumentToControls(parseInt(evidence.id));
      }
      setMappingResult(result);
    } catch (error: any) {
      console.error('Mapping failed:', error);
      setMappingResult({ error: error.message });
    } finally {
      setMapping(false);
    }
  };

  const handleCreatePack = async () => {
    if (!packQuery.trim() || !packStartDate || !packEndDate) {
      setPackResult({ error: 'Please fill in all required fields' });
      return;
    }

    setPackCreating(true);
    setPackResult(null);
    
    try {
      const result = await api.generatePack(
        packQuery,
        packControlId || null,
        packStartDate,
        packEndDate
      );
      setPackResult(result);
    } catch (error: any) {
      console.error('Pack creation failed:', error);
      setPackResult({ error: error.message || 'Failed to create assurance pack' });
    } finally {
      setPackCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${evidence.type === 'Log' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                    {evidence.type === 'Log' ? (
                      <Database className="w-5 h-5 text-white" />
                    ) : (
                      <FileText className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{evidence.filename}</h2>
                    <p className="text-sm text-purple-100">Evidence Details</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase">Relevance</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{evidence.relevance}%</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase">Control</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 font-mono">{evidence.control_id || 'N/A'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase">Evidence ID</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 font-mono">{evidence.id}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase">Type</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{evidence.type}</p>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Timestamp
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-900 font-mono">{new Date(evidence.timestamp).toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(evidence.timestamp).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Content Preview
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-words">
                      {evidence.preview}
                    </pre>
                  </div>
                </div>

                {/* Control Mapping */}
                {evidence.control_id && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Compliance Control Mapping
                    </h3>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-lg font-bold text-purple-900">{evidence.control_id}</p>
                          <p className="text-sm text-purple-700 mt-1">
                            {evidence.control_id.startsWith('AC-') && 'Access Control Family'}
                            {evidence.control_id.startsWith('IA-') && 'Identification and Authentication Family'}
                            {evidence.control_id.startsWith('AU-') && 'Audit and Accountability Family'}
                            {evidence.control_id.startsWith('SC-') && 'System and Communications Protection Family'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                          <CheckCircle className="w-3 h-3" />
                          Mapped
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Analysis */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    AI-Enhanced Analysis
                  </h3>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      This evidence item was analyzed using OpenAI GPT-4 and scored at <strong>{evidence.relevance}%</strong> relevance
                      based on semantic similarity to your query. The AI engine identified key compliance indicators and
                      automatically mapped this evidence to control <strong>{evidence.control_id || 'multiple controls'}</strong> within
                      the regulatory framework.
                    </p>
                  </div>
                </div>

                {/* Mapping Result */}
                {mappingResult && (
                  <div className={`mb-6 p-4 rounded-lg border ${
                    mappingResult.error 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    {mappingResult.error ? (
                      <p className="text-sm text-red-700">❌ {mappingResult.error}</p>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-green-700 mb-2">
                          ✅ Successfully mapped to {mappingResult.evidence_objects_created || 0} control(s)
                        </p>
                        {mappingResult.linkages && mappingResult.linkages.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {mappingResult.linkages.map((link: any, idx: number) => (
                              <div key={idx} className="text-xs text-green-600">
                                • {link.control_id}: {link.control_name} (Score: {(link.linkage_score * 100).toFixed(0)}%)
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button 
                    onClick={handleMapToControls}
                    disabled={mapping}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mapping ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Mapping...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        {evidence.control_id ? 'Re-map to Controls' : 'Map to Controls'}
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setShowPackModal(true)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Add to Assurance Pack
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Pack Creation Modal */}
      <AnimatePresence>
        {showPackModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPackModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-white" />
                    <div>
                      <h2 className="text-xl font-bold text-white">Create Assurance Pack</h2>
                      <p className="text-sm text-green-100">Include this evidence in a compliance pack</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowPackModal(false);
                      setPackResult(null);
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  {/* Evidence Info */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Including Evidence:</p>
                    <p className="text-gray-900 font-medium">{evidence.filename}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {evidence.type} • {new Date(evidence.timestamp).toLocaleDateString()}
                      {evidence.control_id && ` • Control: ${evidence.control_id}`}
                    </p>
                  </div>

                  {/* Pack Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pack Description / Query <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={packQuery}
                        onChange={(e) => setPackQuery(e.target.value)}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                        rows={3}
                        placeholder="Describe what this assurance pack covers..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Control ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={packControlId}
                        onChange={(e) => setPackControlId(e.target.value)}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder="e.g., AC-001"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Pre-filled from evidence. Leave empty to include all relevant controls.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={packStartDate}
                          onChange={(e) => setPackStartDate(e.target.value)}
                          className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={packEndDate}
                          onChange={(e) => setPackEndDate(e.target.value)}
                          className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pack Result */}
                  {packResult && (
                    <div className={`mt-6 p-4 rounded-lg border ${
                      packResult.error 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200'
                    }`}>
                      {packResult.error ? (
                        <p className="text-sm text-red-700">❌ {packResult.error}</p>
                      ) : (
                        <div>
                          <p className="text-sm font-semibold text-green-700 mb-3">
                            ✅ Assurance Pack Created Successfully!
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pack ID:</span>
                              <span className="font-mono font-semibold">{packResult.pack_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Evidence Count:</span>
                              <span className="font-bold text-green-700">{packResult.evidence_count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pack Hash:</span>
                              <span className="font-mono text-xs">{packResult.pack_hash.substring(0, 32)}...</span>
                            </div>
                          </div>
                          <a
                            href={packResult.download_url}
                            download
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download Pack ZIP
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowPackModal(false);
                        setPackResult(null);
                      }}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePack}
                      disabled={packCreating || !packQuery.trim() || !packStartDate || !packEndDate}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {packCreating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Creating Pack...
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4" />
                          Create Assurance Pack
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default EvidenceDetailModal;
