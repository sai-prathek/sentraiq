import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, Hash, Package, Search, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { PackHistoryItem } from '../types';
import MarkdownViewer from './MarkdownViewer';

interface PackHistoryProps {
  onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const PackHistory: React.FC<PackHistoryProps> = ({ onToast }) => {
  const [packs, setPacks] = useState<PackHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<PackHistoryItem | null>(null);
  const [reportContent, setReportContent] = useState<string>('');
  const [showReport, setShowReport] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    setLoading(true);
    try {
      const data = await api.listPacks();
      setPacks(data);
    } catch (error: any) {
      console.error('Failed to load packs:', error);
      onToast(error?.message || 'Failed to load pack history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (pack: PackHistoryItem) => {
    setSelectedPack(pack);
    setLoadingReport(true);
    setShowReport(true);
    try {
      const report = await api.getPackReport(pack.pack_id);
      setReportContent(report);
    } catch (error: any) {
      console.error('Failed to load report:', error);
      onToast(error?.message || 'Failed to load report', 'error');
      setReportContent('Failed to load report. Please try again.');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDownload = async (pack: PackHistoryItem) => {
    try {
      const blob = await api.downloadPack(pack.pack_id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pack.pack_id}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      onToast('Pack downloaded successfully!', 'success');
    } catch (error: any) {
      console.error('Download failed:', error);
      onToast(error?.message || 'Failed to download pack', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const filteredPacks = packs.filter(pack => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      pack.pack_id.toLowerCase().includes(query) ||
      pack.query?.toLowerCase().includes(query) ||
      pack.control_id?.toLowerCase().includes(query) ||
      pack.pack_hash.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pack history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="text-purple-600 w-7 h-7" />
            Assurance Pack History
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            View and manage all generated compliance assurance packs
          </p>
        </div>
        <button
          onClick={loadPacks}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by pack ID, query, control ID, or hash..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Packs Table */}
      {filteredPacks.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 font-semibold mb-2">
            {searchQuery ? 'No packs found' : 'No packs generated yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {searchQuery 
              ? 'Try adjusting your search query'
              : 'Generate your first assurance pack to see it here'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pack ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Query / Control
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Evidence
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPacks.map((pack, index) => (
                  <motion.tr
                    key={pack.pack_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {pack.pack_id.substring(0, 12)}...
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {pack.query && (
                          <p className="text-sm text-gray-900 font-medium line-clamp-1 max-w-md">
                            {pack.query}
                          </p>
                        )}
                        {pack.control_id && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                            {pack.control_id}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="max-w-xs truncate">
                          {formatDateRange(pack.time_range_start, pack.time_range_end)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {pack.evidence_count}
                        </span>
                        <span className="text-xs text-gray-500">items</span>
                        {pack.pack_size_mb && (
                          <span className="text-xs text-gray-400">
                            • {pack.pack_size_mb.toFixed(2)} MB
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(pack.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewReport(pack)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Report"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownload(pack)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Pack"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Viewer Modal */}
      <MarkdownViewer
        content={loadingReport ? 'Loading report...' : reportContent}
        title={selectedPack ? `Pack Report: ${selectedPack.pack_id}` : 'Pack Report'}
        isOpen={showReport}
        onClose={() => {
          setShowReport(false);
          setSelectedPack(null);
          setReportContent('');
        }}
      />
    </div>
  );
};

export default PackHistory;
