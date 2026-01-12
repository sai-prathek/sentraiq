import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, File as FileIcon, CheckCircle2, Database, FileText, Calendar, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingOverlay from './LoadingOverlay';
import { api } from '../services/api';
import { IngestedLog, IngestedDocument, DashboardOutletContext } from '../types';
import { useOutletContext } from 'react-router-dom';

interface IngestTabProps {
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const IngestTab: React.FC<IngestTabProps> = ({ onToast }) => {
  const [loading, setLoading] = useState(false);
  const [ingestedLogs, setIngestedLogs] = useState<IngestedLog[]>([]);
  const [ingestedDocs, setIngestedDocs] = useState<IngestedDocument[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [deletingId, setDeletingId] = useState<{ type: 'log' | 'document'; id: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'log' | 'document'; id: number; name: string } | null>(null);
  
  const { setWorkflowState } = useOutletContext<DashboardOutletContext>();

  // Fetch ingested items on mount
  useEffect(() => {
    loadIngestedItems();
  }, []);

  const loadIngestedItems = async () => {
    setLoadingList(true);
    try {
      const [logs, docs] = await Promise.all([
        api.getIngestedLogs(),
        api.getIngestedDocuments(),
      ]);
      setIngestedLogs(logs);
      setIngestedDocs(docs);
      
      // Update workflow state if items exist
      if (logs.length > 0 || docs.length > 0) {
        setWorkflowState((prev) => ({ ...prev, hasIngested: true }));
      }
    } catch (error) {
      console.error('Error loading ingested items:', error);
    } finally {
      setLoadingList(false);
    }
  };

  // Reusable Dropzone Component
  const DropZone = ({ 
    title, 
    type, 
    icon, 
    acceptedTypes,
    options,
    onIngestSuccess
  }: { 
    title: string; 
    type: 'log' | 'document'; 
    icon: React.ReactNode; 
    acceptedTypes: string;
    options: string[];
    onIngestSuccess: () => Promise<void>;
  }) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [selectedOption, setSelectedOption] = useState(options[0]);
    const [description, setDescription] = useState('');
    const [autoMap, setAutoMap] = useState(true);

    const handleDrag = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setFile(e.dataTransfer.files[0]);
      }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
      }
    };

    const handleSubmit = async () => {
      if (!file) return;
      setLoading(true);
      onToast(`Uploading ${file.name}...`, 'info');

      try {
        let res;
        if (type === 'log') {
          res = await api.ingestLog(file, selectedOption, description, autoMap);
        } else {
          res = await api.ingestDocument(file, selectedOption, description, autoMap);
        }

        const filename = (res as any)?.filename || file.name;
        onToast(`Success! Ingested ${filename}`, 'success');
        setFile(null);
        setDescription('');
        
        // Reload ingested items and update workflow state
        await onIngestSuccess();
      } catch (err: any) {
        onToast(err.message || 'Ingestion failed', 'error');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full relative">
        {loading && <LoadingOverlay message={`Ingesting ${type}...`} />}
        
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {icon} {title}
          </h3>
        </div>

        <div className="p-6 flex flex-col gap-6 flex-1">
          {/* Drop Area */}
          <div 
            className={`
              relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center
              flex flex-col items-center justify-center gap-3 cursor-pointer group
              ${dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}
              ${file ? 'bg-purple-50 border-purple-200' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById(`file-input-${type}`)?.click()}
          >
            <input 
              id={`file-input-${type}`} 
              type="file" 
              className="hidden" 
              accept={acceptedTypes}
              onChange={handleChange}
            />
            
            {file ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <div className="bg-purple-100 p-3 rounded-full mb-2">
                  <FileIcon className="w-8 h-8 text-purple-600" />
                </div>
                <p className="font-semibold text-gray-800 truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                <p className="text-xs text-purple-600 mt-2 font-medium">Click to replace</p>
              </motion.div>
            ) : (
              <>
                <div className="bg-gray-100 p-3 rounded-full group-hover:bg-white group-hover:shadow-md transition-all">
                  <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-purple-600">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-gray-400">Supported: {type === 'log' ? '.log, .txt' : '.pdf, .docx, .txt'}</p>
              </>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === 'log' ? 'Log Source' : 'Document Type'}
              </label>
              <select 
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
              >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow resize-none"
                placeholder="Add context about this ingestion..."
              />
            </div>

            <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setAutoMap(!autoMap)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${autoMap ? 'bg-purple-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoMap ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-gray-600">Auto-map to controls</span>
            </div>
          </div>

          <button
            disabled={!file}
            onClick={handleSubmit}
            className={`
              mt-auto w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all shadow-md active:scale-95
              ${file 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            Ingest {type === 'log' ? 'Log' : 'Document'}
          </button>
        </div>
      </div>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleDeleteLog = async (logId: number, filename: string) => {
    setConfirmDelete({ type: 'log', id: logId, name: filename });
  };

  const handleDeleteDocument = async (docId: number, filename: string) => {
    setConfirmDelete({ type: 'document', id: docId, name: filename });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    
    setDeletingId({ type: confirmDelete.type, id: confirmDelete.id });
    setConfirmDelete(null);
    
    try {
      if (confirmDelete.type === 'log') {
        await api.deleteLog(confirmDelete.id);
        onToast(`Log "${confirmDelete.name}" deleted successfully`, 'success');
      } else {
        await api.deleteDocument(confirmDelete.id);
        onToast(`Document "${confirmDelete.name}" deleted successfully`, 'success');
      }
      
      // Reload the list
      await loadIngestedItems();
      
      // Check if we need to update workflow state (if no items left)
      const [logs, docs] = await Promise.all([
        api.getIngestedLogs(),
        api.getIngestedDocuments(),
      ]);
      if (logs.length === 0 && docs.length === 0) {
        setWorkflowState((prev) => ({ ...prev, hasIngested: false }));
      }
    } catch (error: any) {
      onToast(error?.message || 'Failed to delete item', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-purple-600" />
          Upload New Evidence
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DropZone 
            title="Ingest Machine Logs" 
            type="log" 
            icon={<CheckCircle2 className="w-5 h-5 text-purple-600" />}
            acceptedTypes=".log,.txt"
            options={['SWIFT', 'Firewall', 'FPS', 'CHAPS', 'Other']}
            onIngestSuccess={loadIngestedItems}
          />
          <DropZone 
            title="Ingest Documentary Evidence" 
            type="document" 
            icon={<FileIcon className="w-5 h-5 text-pink-600" />}
            acceptedTypes=".pdf,.doc,.docx,.txt"
            options={['Policy', 'Audit Report', 'Configuration', 'Procedure', 'Other']}
            onIngestSuccess={loadIngestedItems}
          />
        </div>
      </div>

      {/* Ingested Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Ingested Evidence ({ingestedLogs.length + ingestedDocs.length})
          </h2>
          <button
            onClick={loadIngestedItems}
            disabled={loadingList}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
          >
            {loadingList ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loadingList ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : ingestedLogs.length === 0 && ingestedDocs.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No evidence ingested yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload logs or documents above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ingested Logs */}
            {ingestedLogs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  Logs ({ingestedLogs.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {ingestedLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{log.filename}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Database className="w-3 h-3" />
                              {log.source}
                            </span>
                            <span>{formatFileSize(log.size_bytes)}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(log.ingested_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteLog(log.id, log.filename)}
                          disabled={deletingId?.type === 'log' && deletingId?.id === log.id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          title="Delete log"
                        >
                          {deletingId?.type === 'log' && deletingId?.id === log.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ingested Documents */}
            {ingestedDocs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  Documents ({ingestedDocs.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {ingestedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-orange-200 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{doc.filename}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {doc.doc_type}
                            </span>
                            <span>{formatFileSize(doc.size_bytes)}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(doc.ingested_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                          disabled={deletingId?.type === 'document' && deletingId?.id === doc.id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          title="Delete document"
                        >
                          {deletingId?.type === 'document' && deletingId?.id === doc.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete <strong>{confirmDelete.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently remove the {confirmDelete.type === 'log' ? 'log' : 'document'} and all associated evidence mappings. This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default IngestTab;