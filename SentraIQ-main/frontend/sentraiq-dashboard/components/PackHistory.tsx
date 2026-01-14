import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, Hash, Package, Search, AlertCircle, X, ArrowRightCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { AssessmentSessionHistoryItem } from '../types';
import { useNavigate } from 'react-router-dom';

interface PackHistoryProps {
  onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const PackHistory: React.FC<PackHistoryProps> = ({ onToast }) => {
  const [sessions, setSessions] = useState<AssessmentSessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<AssessmentSessionHistoryItem | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await api.listAssessmentSessions();
      setSessions(data);
    } catch (error: any) {
      console.error('Failed to load assessment sessions:', error);
      onToast(error?.message || 'Failed to load assessment history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (sessionItem: AssessmentSessionHistoryItem) => {
    if (!sessionItem.pack_id) {
      onToast('No assurance pack is associated with this session yet.', 'warning');
      return;
    }

    setSelectedSession(sessionItem);
    setLoadingReport(true);
    setShowReport(true);
    try {
      const markdown = await api.getPackReport(sessionItem.pack_id);
      setReportMarkdown(markdown);
    } catch (error: any) {
      console.error('Failed to load report:', error);
      onToast(error?.message || 'Failed to load pack report', 'error');
      setShowReport(false);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDownloadPack = async (sessionItem: AssessmentSessionHistoryItem) => {
    if (!sessionItem.pack_id) {
      onToast('No assurance pack is associated with this session yet.', 'warning');
      return;
    }

    try {
      const blob = await api.downloadPack(sessionItem.pack_id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sessionItem.pack_id}.zip`;
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

  const handleDownloadSwiftExcel = async (sessionItem: AssessmentSessionHistoryItem) => {
    try {
      const blob = await api.downloadSwiftExcelForSession(sessionItem.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = sessionItem.swift_excel_filename || `SWIFT_CSCF_Assessment_session-${sessionItem.id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      onToast('SWIFT Excel downloaded successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to download SWIFT Excel:', error);
      onToast(error?.message || 'Failed to download SWIFT Excel report', 'error');
    }
  };

  const handleDeleteSession = async (sessionItem: AssessmentSessionHistoryItem) => {
    const confirmed = window.confirm(
      `Delete assessment session #${sessionItem.id}? This will not delete any generated packs or evidence.`
    );
    if (!confirmed) return;

    try {
      await api.deleteAssessmentSession(sessionItem.id);
      setSessions((prev) => prev.filter((s) => s.id !== sessionItem.id));
      onToast(`Session #${sessionItem.id} deleted`, 'success');
    } catch (error: any) {
      console.error('Failed to delete assessment session:', error);
      onToast(error?.message || 'Failed to delete assessment session', 'error');
    }
  };

  const handleResumeFlow = (sessionItem: AssessmentSessionHistoryItem) => {
    // Persist the session id so the Generate flow can load and resume this session
    try {
      window.localStorage.setItem('activeAssessmentSessionId', String(sessionItem.id));
    } catch (e) {
      console.warn('Failed to store activeAssessmentSessionId in localStorage', e);
    }
    // Use existing routing - this will land on the Generate tab in the dashboard
    navigate('/dashboard/generate');
  };

  // No PDF object URLs to clean up now – reports are markdown only

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

  const getStatusLabel = (status?: string | null) => {
    const normalized = (status || 'in-progress').toLowerCase();
    if (normalized === 'completed') return 'Completed';
    if (normalized === 'cancelled') return 'Cancelled';
    return 'In progress';
  };

  const filteredSessions = sessions.filter((sessionItem) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const objectiveName =
      sessionItem.objective_selection?.infrastructure?.name ||
      sessionItem.objective_selection?.frameworks?.map((f: any) => f.name).join(' + ') ||
      '';
    return (
      String(sessionItem.id).toLowerCase().includes(query) ||
      getStatusLabel(sessionItem.status).toLowerCase().includes(query) ||
      sessionItem.swift_architecture_type?.toLowerCase().includes(query) ||
      objectiveName.toLowerCase().includes(query) ||
      sessionItem.pack_id?.toLowerCase().includes(query) ||
      sessionItem.swift_excel_filename?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
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
            <Package className="text-blue-900 w-7 h-7" />
            Assessment Sessions History
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            View and manage multi-step assurance assessment sessions, with links to packs and SWIFT Excel outputs
          </p>
        </div>
        <button
          onClick={loadSessions}
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
          placeholder="Search by session ID, framework, status, or pack ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
        />
      </div>

      {/* Packs Table */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 font-semibold mb-2">
            {searchQuery ? 'No assessment sessions found' : 'No assessment sessions yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {searchQuery 
              ? 'Try adjusting your search query'
              : 'Start a new assessment in the Generate tab to see it here'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Objective / Framework
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Outputs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Started / Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSessions.map((sessionItem, index) => (
                  <motion.tr
                    key={sessionItem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors align-middle"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <code className="text-xs font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {index + 1}
                        </code>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="text-[13px] text-gray-900 font-medium line-clamp-1 max-w-xs">
                          {sessionItem.objective_selection?.infrastructure?.name || 'Assessment Session'}
                        </p>
                        {sessionItem.objective_selection?.frameworks && (
                          <span className="inline-flex flex-wrap items-center gap-1 text-[11px] text-gray-600">
                            {sessionItem.objective_selection.frameworks.map((f: any) => (
                              <span
                                key={f.id}
                                className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 font-medium"
                              >
                                {f.version ? `${f.name} (${f.version})` : f.name}
                              </span>
                            ))}
                          </span>
                        )}
                        {sessionItem.swift_architecture_type && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-50 text-gray-700">
                            SWIFT Architecture: {sessionItem.swift_architecture_type}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-0.5 text-[13px]">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            sessionItem.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : sessionItem.status === 'cancelled'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {getStatusLabel(sessionItem.status)}
                        </span>
                        <div className="text-[11px] text-gray-500">
                          Current step: {sessionItem.current_step ?? 1} of 8
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[11px]">
                        {sessionItem.pack_id ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadPack(sessionItem)}
                            className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Download the assurance pack (ZIP)"
                          >
                            Pack: {sessionItem.pack_id.substring(0, 10)}...
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-yellow-50 text-yellow-700">
                            Pack not generated
                          </span>
                        )}
                        {sessionItem.swift_excel_filename && (
                          <button
                            type="button"
                            onClick={() => handleDownloadSwiftExcel(sessionItem)}
                            className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                            title="Download the SWIFT CSCF Excel assessment"
                          >
                            SWIFT Excel
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-[12px] text-gray-600 space-y-0.5">
                        <div className="flex flex-col">
                          <span className="font-medium">Started</span>
                          <span className="text-[11px] text-gray-500">
                            {formatDate(sessionItem.started_at)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Updated</span>
                          <span className="text-[11px] text-gray-500">
                            {formatDate(sessionItem.updated_at)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 text-[11px]">
                        <button
                          onClick={() => handleResumeFlow(sessionItem)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-900 hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-100"
                          title="Open this assessment in the Generate flow"
                        >
                          <ArrowRightCircle className="w-5 h-5" />
                          <span>Open flow</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSession(sessionItem)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100"
                          title="Delete this assessment session"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
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
      {showReport && selectedSession && (
        <>
          {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={() => {
                  setShowReport(false);
                  setSelectedSession(null);
                  setReportMarkdown(null);
                }}
              />

          {/* Modal */}
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-900" />
                <h2 className="text-lg font-bold text-gray-900">
                  Pack Report: {selectedSession.pack_id}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowReport(false);
                  setSelectedSession(null);
                  setReportMarkdown(null);
                }}
                className="p-2.5 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-50">
              {loadingReport ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading report...</p>
                  </div>
                </div>
              ) : reportMarkdown ? (
                <div className="h-full overflow-auto p-6">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                    {reportMarkdown}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Report not available.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PackHistory;
