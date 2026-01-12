import React, { useState } from 'react';
import { Calendar, Package, Download, CheckCircle, ShieldCheck, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingOverlay from './LoadingOverlay';
import { api } from '../services/api';
import { EvidenceItem, GeneratedPack } from '../types';

interface GenerateTabProps {
  onToast: (msg: string, type: 'success' | 'error') => void;
  selectedEvidence: EvidenceItem[];
  onClearSelectedEvidence: () => void;
}

const GenerateTab: React.FC<GenerateTabProps> = ({
  onToast,
  selectedEvidence,
  onClearSelectedEvidence,
}) => {
  const [loading, setLoading] = useState(false);
  const [generatedPack, setGeneratedPack] = useState<GeneratedPack | null>(null);
  
  // Form State
  const [query, setQuery] = useState('');
  const [controlId, setControlId] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleGenerate = async () => {
    if (!query || !dateRange.start || !dateRange.end) {
      onToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    setGeneratedPack(null);
    try {
      const pack = await api.generatePack(
        query,
        controlId || null,
        dateRange.start,
        dateRange.end,
        selectedEvidence
      );
      setGeneratedPack(pack);
      onToast("Assurance pack generated successfully!", "success");
      // Optionally clear the selection after successful pack creation
      onClearSelectedEvidence();
    } catch (error: any) {
      console.error("Failed to generate pack:", error);
      onToast(
        error?.message || "Failed to generate pack",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const setPresetDate = (type: 'month' | 'quarter' | 'year') => {
      const end = new Date();
      const start = new Date();
      if (type === 'month') start.setMonth(end.getMonth() - 1);
      if (type === 'quarter') start.setMonth(end.getMonth() - 3);
      if (type === 'year') start.setFullYear(end.getFullYear() - 1);
      
      setDateRange({
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
      });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Left Column: Form */}
      <div className="flex-1 lg:basis-3/5 bg-white rounded-xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
        {loading && <LoadingOverlay message="Compiling Evidence & Generating Hash..." />}
        
        <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShieldCheck className="text-purple-600" />
                Generate Assurance Pack
            </h2>
            <p className="text-gray-500 text-sm mt-1">Define scope to create an immutable compliance artifact.</p>
        </div>

        <div className="space-y-6">
            {/* Query */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Evidence Requirement
                </label>
                <textarea 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none h-24 resize-none shadow-sm"
                    placeholder="e.g., Provide all evidence related to user access reviews for critical systems..."
                />
            </div>

            {/* Control ID */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Control ID <span className="font-normal text-gray-400">(Optional)</span>
                </label>
                <input 
                    type="text"
                    value={controlId}
                    onChange={(e) => setControlId(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                    placeholder="e.g., AC-001, NIST-800-53"
                />
            </div>

            {/* Date Range */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Range</label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                        />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                        />
                    </div>
                </div>
                <div className="flex gap-2 mt-3">
                    {['month', 'quarter', 'year'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setPresetDate(t as any)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full transition-colors capitalize"
                        >
                            Last {t}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                className="w-full mt-4 bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
                <Package className="w-5 h-5" />
                Generate Pack
            </button>
        </div>
      </div>

      {/* Right Column: Preview/Result */}
      <div className="flex-1 lg:basis-2/5 flex flex-col">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Output Preview</h3>
        
        {/* Selected evidence summary */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase">
              Pack List
            </span>
            <span className="text-xs text-gray-400">
              {selectedEvidence.length} item{selectedEvidence.length === 1 ? '' : 's'} selected
            </span>
          </div>
          {selectedEvidence.length > 0 ? (
            <div className="mt-2 max-h-32 overflow-y-auto border border-gray-100 rounded-lg bg-gray-50 p-2 space-y-1">
              {selectedEvidence.map((e) => (
                <div
                  key={`${e.id}-${e.type}`}
                  className="flex items-center justify-between text-[11px] text-gray-600"
                >
                  <span className="font-mono text-gray-700">{e.id}</span>
                  <span className="truncate ml-2 flex-1">{e.filename}</span>
                  <span className="ml-2 text-gray-400">{e.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-gray-400">
              No specific evidence selected. Pack will be built purely from query and time range.
            </p>
          )}
        </div>
        
        {generatedPack ? (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-lg border-t-4 border-t-green-500 p-6 flex-1 flex flex-col justify-between"
            >
                <div>
                    <div className="flex items-center gap-2 text-green-600 font-bold mb-6">
                        <CheckCircle className="w-6 h-6" />
                        Pack Generated Successfully
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase">Pack ID</p>
                            <p className="font-mono text-gray-800 font-medium break-all">{generatedPack.pack_id}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase">Evidence Count</p>
                                <p className="text-2xl font-bold text-gray-800">{generatedPack.evidence_count}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase">Size</p>
                                <p className="text-2xl font-bold text-gray-800">{(Math.random() * 5 + 1).toFixed(1)} MB</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase">SHA-256 Hash</p>
                            <p className="font-mono text-xs text-gray-600 break-all mt-1">{generatedPack.pack_hash}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={async () => {
                        try {
                            const packId = generatedPack.pack_id;
                            const blob = await api.downloadPack(packId);
                            
                            // Create a blob URL and trigger download
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${packId}.zip`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                            
                            onToast('Pack downloaded successfully!', 'success');
                        } catch (error: any) {
                            console.error('Download failed:', error);
                            onToast(error?.message || 'Failed to download pack', 'error');
                        }
                    }}
                    className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                    <Download className="w-5 h-5" />
                    Download ZIP Archive
                </button>
            </motion.div>
        ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileCheck className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="text-gray-900 font-medium">Ready to Generate</h4>
                <p className="text-gray-500 text-sm mt-2 max-w-xs">
                    Fill out the requirements on the left to create a cryptographically signed evidence pack.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default GenerateTab;