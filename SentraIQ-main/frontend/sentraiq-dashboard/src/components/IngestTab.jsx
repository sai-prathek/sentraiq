import React, { useState } from 'react';
import { Upload, FileText, Database, CloudUpload } from 'lucide-react';
import { ingestAPI } from '../services/api';
import { showToast } from '../utils/toast';
import DemoDataSelector from './DemoDataSelector';

const IngestTab = ({ onIngestComplete }) => {
  const [logFile, setLogFile] = useState(null);
  const [logSource, setLogSource] = useState('SWIFT');
  const [logDesc, setLogDesc] = useState('');
  const [logLoading, setLogLoading] = useState(false);

  const [docFile, setDocFile] = useState(null);
  const [docType, setDocType] = useState('Policy');
  const [docDesc, setDocDesc] = useState('');
  const [docLoading, setDocLoading] = useState(false);

  const handleLogDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) setLogFile(file);
  };

  const handleDocDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) setDocFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDemoSelect = async (type, demo) => {
    showToast(`Loading demo ${type}: ${demo.name}...`, 'info');

    try {
      // Fetch the demo file from backend
      const response = await fetch(
        `http://localhost:8080/data/sample_${type === 'log' ? 'logs' : 'policies'}/${demo.file}`
      );
      const blob = await response.blob();
      const file = new File([blob], demo.file, { type: blob.type });

      if (type === 'log') {
        setLogFile(file);
        setLogSource(demo.source);
        setLogDesc(demo.description);
        showToast(`Demo log loaded: ${demo.name}`, 'success');
      } else {
        setDocFile(file);
        setDocType(demo.docType);
        setDocDesc(demo.description);
        showToast(`Demo document loaded: ${demo.name}`, 'success');
      }
    } catch (error) {
      showToast(`Failed to load demo file: ${error.message}`, 'error');
    }
  };

  const uploadLog = async () => {
    if (!logFile) {
      showToast('Please select a log file', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', logFile);
    formData.append('source', logSource);
    formData.append('description', logDesc);
    formData.append('auto_map', 'true');

    setLogLoading(true);
    try {
      const response = await ingestAPI.uploadLog(formData);
      const result = response.data;
      showToast(
        `✅ Log uploaded! Hash: ${result.hash.substring(0, 16)}... | Auto-mapped to ${result.auto_mapped_count || 0} controls`,
        'success',
        7000
      );
      setLogFile(null);
      setLogDesc('');
      if (onIngestComplete) onIngestComplete();
    } catch (error) {
      showToast(`❌ Upload failed: ${error.response?.data?.detail || error.message}`, 'error');
    } finally {
      setLogLoading(false);
    }
  };

  const uploadDocument = async () => {
    if (!docFile) {
      showToast('Please select a document file', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', docFile);
    formData.append('doc_type', docType);
    formData.append('description', docDesc);
    formData.append('auto_map', 'true');

    setDocLoading(true);
    try {
      const response = await ingestAPI.uploadDocument(formData);
      const result = response.data;
      showToast(
        `✅ Document uploaded! ${result.page_count || 0} pages | Auto-mapped to ${result.auto_mapped_count || 0} controls`,
        'success',
        7000
      );
      setDocFile(null);
      setDocDesc('');
      if (onIngestComplete) onIngestComplete();
    } catch (error) {
      showToast(`❌ Upload failed: ${error.response?.data?.detail || error.message}`, 'error');
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <div>
      {/* Demo Data Selector */}
      <DemoDataSelector onSelectDemo={handleDemoSelect} />

      {/* Manual Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Log Ingestion */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-600" />
            Ingest Machine Logs
          </h3>

          <div
            className="drop-zone mb-4"
            onDrop={handleLogDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('log-file-input').click()}
          >
            <CloudUpload className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Drag and drop log file here</p>
            <p className="text-sm text-gray-500 mb-4">or click to browse</p>
            {logFile && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
                <p className="text-sm font-semibold text-purple-800">{logFile.name}</p>
                <p className="text-xs text-purple-600">{(logFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
            <input
              type="file"
              id="log-file-input"
              className="hidden"
              accept=".log,.txt"
              onChange={(e) => setLogFile(e.target.files[0])}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Source</label>
              <select value={logSource} onChange={(e) => setLogSource(e.target.value)} className="input-field">
                <option>SWIFT</option>
                <option>Firewall</option>
                <option>FPS</option>
                <option>CHAPS</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
              <textarea
                value={logDesc}
                onChange={(e) => setLogDesc(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Describe this log file..."
              />
            </div>

            <button onClick={uploadLog} disabled={logLoading || !logFile} className="btn-primary w-full">
              {logLoading ? '⏳ Uploading...' : '🚀 Ingest Log'}
            </button>
          </div>
        </div>

        {/* Document Ingestion */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-pink-600" />
            Ingest Documentary Evidence
          </h3>

          <div
            className="drop-zone mb-4"
            onDrop={handleDocDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('doc-file-input').click()}
          >
            <CloudUpload className="w-16 h-16 text-pink-600 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Drag and drop document here</p>
            <p className="text-sm text-gray-500 mb-4">or click to browse</p>
            {docFile && (
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mt-4">
                <p className="text-sm font-semibold text-pink-800">{docFile.name}</p>
                <p className="text-xs text-pink-600">{(docFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
            <input
              type="file"
              id="doc-file-input"
              className="hidden"
              accept=".pdf,.txt"
              onChange={(e) => setDocFile(e.target.files[0])}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="input-field">
                <option>Policy</option>
                <option>Audit Report</option>
                <option>Configuration</option>
                <option>Procedure</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
              <textarea
                value={docDesc}
                onChange={(e) => setDocDesc(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Describe this document..."
              />
            </div>

            <button onClick={uploadDocument} disabled={docLoading || !docFile} className="btn-primary w-full">
              {docLoading ? '⏳ Uploading...' : '🚀 Ingest Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngestTab;
