import React, { useState, useCallback } from 'react';
import { UploadCloud, File as FileIcon, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingOverlay from './LoadingOverlay';
import { api } from '../services/api';

interface IngestTabProps {
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const IngestTab: React.FC<IngestTabProps> = ({ onToast }) => {
  const [loading, setLoading] = useState(false);

  // Reusable Dropzone Component
  const DropZone = ({ 
    title, 
    type, 
    icon, 
    acceptedTypes,
    options 
  }: { 
    title: string; 
    type: 'log' | 'document'; 
    icon: React.ReactNode; 
    acceptedTypes: string;
    options: string[];
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <DropZone 
        title="Ingest Machine Logs" 
        type="log" 
        icon={<CheckCircle2 className="w-5 h-5 text-purple-600" />}
        acceptedTypes=".log,.txt"
        options={['SWIFT', 'Firewall', 'FPS', 'CHAPS', 'Other']}
      />
      <DropZone 
        title="Ingest Documentary Evidence" 
        type="document" 
        icon={<FileIcon className="w-5 h-5 text-pink-600" />}
        acceptedTypes=".pdf,.doc,.docx,.txt"
        options={['Policy', 'Audit Report', 'Configuration', 'Procedure', 'Other']}
      />
    </div>
  );
};

export default IngestTab;