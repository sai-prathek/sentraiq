import React, { useState, useEffect } from 'react';
import { Calendar, Package, Download, CheckCircle, ShieldCheck, FileCheck, FileText, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingOverlay from './LoadingOverlay';
import MarkdownViewer from './MarkdownViewer';
import { api } from '../services/api';
import { EvidenceItem, GeneratedPack } from '../types';

// Inline markdown renderer component for report display
const ReportContent: React.FC<{ content: string }> = ({ content }) => {
  const parseMarkdown = (text: string): JSX.Element[] => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let listItems: string[] = [];
    let inList = false;
    let tableRows: JSX.Element[] = [];
    let inTable = false;

    lines.forEach((line, index) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headers
      if (line.startsWith('# ')) {
        if (inList) {
          elements.push(renderList(listItems));
          listItems = [];
          inList = false;
        }
        if (inTable) {
          elements.push(renderTable(tableRows));
          tableRows = [];
          inTable = false;
        }
      elements.push(
        <h1 key={`h1-${index}`} className="text-3xl font-bold text-gray-900 mt-10 mb-6 pb-3 border-b-2 border-gray-300">
          {line.substring(2)}
        </h1>
      );
        return;
      }
      if (line.startsWith('## ')) {
        if (inList) {
          elements.push(renderList(listItems));
          listItems = [];
          inList = false;
        }
        if (inTable) {
          elements.push(renderTable(tableRows));
          tableRows = [];
          inTable = false;
        }
        elements.push(
          <h2 key={`h2-${index}`} className="text-2xl font-bold text-gray-800 mt-8 mb-4 pt-5">
            {line.substring(3)}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        if (inList) {
          elements.push(renderList(listItems));
          listItems = [];
          inList = false;
        }
        if (inTable) {
          elements.push(renderTable(tableRows));
          tableRows = [];
          inTable = false;
        }
        elements.push(
          <h3 key={`h3-${index}`} className="text-xl font-semibold text-gray-700 mt-6 mb-3">
            {line.substring(4)}
          </h3>
        );
        return;
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim().startsWith('===')) {
        if (inList) {
          elements.push(renderList(listItems));
          listItems = [];
          inList = false;
        }
        if (inTable) {
          elements.push(renderTable(tableRows));
          tableRows = [];
          inTable = false;
        }
        elements.push(<hr key={`hr-${index}`} className="my-8 border-gray-400 border-t-2" />);
        return;
      }

      // Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        if (!inList) {
          inList = true;
        }
        if (inTable) {
          elements.push(renderTable(tableRows));
          tableRows = [];
          inTable = false;
        }
        listItems.push(line.trim().substring(2));
        return;
      }

      if (inList && line.trim() === '') {
        elements.push(renderList(listItems));
        listItems = [];
        inList = false;
        return;
      }

      // Tables
      if (line.includes('|') && line.trim().startsWith('|')) {
        if (inList) {
          elements.push(renderList(listItems));
          listItems = [];
          inList = false;
        }
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        const isHeader = cells[0] && (cells[0].includes('---') || cells[0].includes('----'));
        if (isHeader) {
          // This is a separator row - mark that the previous row was a header
          if (tableRows.length > 0 && tableRows[tableRows.length - 1]) {
            const lastRow = tableRows[tableRows.length - 1];
            // Mark as header by adding a flag
            (lastRow as any).isHeader = true;
          }
          return;
        }
        
        if (!inTable) {
          inTable = true;
        }
        
        const isHeaderRow = tableRows.length === 0; // First row is typically header
        
        tableRows.push(
          <tr key={`tr-${index}`} className={isHeaderRow ? 'bg-gray-100 font-semibold' : (tableRows.length % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
            {cells.map((cell, cellIndex) => {
              if (isHeaderRow) {
                return (
                  <th key={`th-${cellIndex}`} className="px-4 py-3 border border-gray-400 text-sm text-left font-semibold">
                    {parseInlineMarkdown(cell)}
                  </th>
                );
              }
              return (
                <td key={`td-${cellIndex}`} className="px-4 py-3 border border-gray-300 text-sm">
                  {parseInlineMarkdown(cell)}
                </td>
              );
            })}
          </tr>
        );
        return;
      }

      if (inTable && line.trim() === '') {
        elements.push(renderTable(tableRows));
        tableRows = [];
        inTable = false;
        return;
      }

      // Regular paragraphs
      if (line.trim() === '') {
        if (inList) {
          elements.push(renderList(listItems));
          listItems = [];
          inList = false;
        }
        if (inTable) {
          elements.push(renderTable(tableRows));
          tableRows = [];
          inTable = false;
        }
        elements.push(<br key={`br-${index}`} />);
        return;
      }

      if (inList) {
        listItems.push(line);
        return;
      }

      elements.push(
        <p key={`p-${index}`} className="text-gray-700 mb-5 leading-relaxed text-base">
          {parseInlineMarkdown(line)}
        </p>
      );
    });

    if (inList) {
      elements.push(renderList(listItems));
    }
    if (inTable) {
      elements.push(renderTable(tableRows));
    }

    return elements;
  };

  const renderList = (items: string[]): JSX.Element => {
    return (
      <ul key={`list-${items.length}`} className="list-disc list-inside mb-8 space-y-2.5 text-gray-700 text-base ml-5">
        {items.map((item, idx) => (
          <li key={`li-${idx}`} className="leading-relaxed pl-1">{parseInlineMarkdown(item)}</li>
        ))}
      </ul>
    );
  };

  const renderTable = (rows: JSX.Element[]): JSX.Element => {
    if (rows.length === 0) return <></>;
    
    // Separate header and data rows
    const headerRow = rows.find((r: any) => r.isHeader) || rows[0];
    const dataRows = rows.filter((r: any, idx) => !r.isHeader && idx > 0);
    
    return (
      <div key={`table-wrapper-${rows.length}`} className="overflow-x-auto my-8 mb-10">
        <table className="min-w-full border-collapse border border-gray-400">
          {headerRow && (
            <thead>
              {headerRow}
            </thead>
          )}
          <tbody>
            {dataRows.length > 0 ? dataRows : rows.slice(1)}
          </tbody>
        </table>
      </div>
    );
  };

  const parseInlineMarkdown = (text: string): JSX.Element => {
    const parts: (string | JSX.Element)[] = [];
    let currentIndex = 0;

    const boldRegex = /\*\*(.+?)\*\*/g;
    const codeRegex = /`([^`]+)`/g;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    const matches: Array<{ type: string; start: number; end: number; content: string; url?: string }> = [];

    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      matches.push({ type: 'bold', start: match.index, end: match.index + match[0].length, content: match[1] });
    }
    while ((match = codeRegex.exec(text)) !== null) {
      matches.push({ type: 'code', start: match.index, end: match.index + match[0].length, content: match[1] });
    }
    while ((match = linkRegex.exec(text)) !== null) {
      matches.push({ type: 'link', start: match.index, end: match.index + match[0].length, content: match[1], url: match[2] });
    }

    matches.sort((a, b) => a.start - b.start);

    matches.forEach((m) => {
      if (m.start > currentIndex) {
        parts.push(text.substring(currentIndex, m.start));
      }

      if (m.type === 'bold') {
        parts.push(<strong key={`bold-${m.start}`} className="font-bold text-gray-900">{m.content}</strong>);
      } else if (m.type === 'code') {
        parts.push(<code key={`code-${m.start}`} className="bg-gray-100 px-2 py-1 rounded font-mono text-sm text-blue-900">{m.content}</code>);
      } else if (m.type === 'link') {
        parts.push(<a key={`link-${m.start}`} href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{m.content}</a>);
      }

      currentIndex = m.end;
    });

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return <>{parts.length > 0 ? parts : text}</>;
  };

  const parsedContent = parseMarkdown(content);

  return <div className="report-content">{parsedContent}</div>;
};

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
  const [reportContent, setReportContent] = useState<string>('');
  const [showReport, setShowReport] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  
  // Form State
  const [query, setQuery] = useState('');
  const [controlId, setControlId] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Auto-load report when pack is generated
  useEffect(() => {
    if (generatedPack && !reportContent && !loadingReport) {
      loadReport();
    }
  }, [generatedPack]);

  const loadReport = async () => {
    if (!generatedPack) return;
    setLoadingReport(true);
    try {
      const report = await api.getPackReport(generatedPack.pack_id);
      setReportContent(report);
    } catch (error: any) {
      console.error('Failed to load report:', error);
      onToast(error?.message || 'Failed to load report', 'error');
    } finally {
      setLoadingReport(false);
    }
  };

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
    <div className="flex flex-col h-full gap-8 px-1">
      {/* Top Section: Generation Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-10 relative">
        {loading && <LoadingOverlay message="Compiling Evidence & Generating Hash..." />}
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <ShieldCheck className="text-blue-900 w-7 h-7" />
              Generate Compliance Assurance Pack
            </h2>
            <p className="text-gray-600 text-sm">Define evidence requirements to create an immutable compliance artifact</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Query */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Evidence Requirement
            </label>
            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-4 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none h-28 resize-none shadow-sm"
              placeholder="e.g., Provide all evidence related to user access reviews for critical systems..."
            />
          </div>

          {/* Control ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Control ID <span className="font-normal text-gray-400">(Optional)</span>
            </label>
            <input 
              type="text"
              value={controlId}
              onChange={(e) => setControlId(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-4 text-sm focus:ring-2 focus:ring-blue-900 outline-none shadow-sm"
              placeholder="e.g., AC-001, NIST-800-53"
            />
          </div>
        </div>

        {/* Date Range and Pack List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Time Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 outline-none" 
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 outline-none" 
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {['month', 'quarter', 'year'].map(t => (
                <button 
                  key={t}
                  onClick={() => setPresetDate(t as any)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-1.5 rounded-full transition-colors capitalize font-medium"
                >
                  Last {t}
                </button>
              ))}
            </div>
          </div>

          {/* Pack List Preview */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Selected Evidence ({selectedEvidence.length})
            </label>
            {selectedEvidence.length > 0 ? (
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-3 space-y-2">
                {selectedEvidence.map((e, index) => (
                  <div
                    key={`${e.id}-${e.type}`}
                    className="flex items-center gap-3 text-xs text-gray-600 py-1.5 px-1"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-semibold text-[10px]">
                      {index + 1}
                    </span>
                    <span className="truncate flex-1 text-gray-700 font-medium">{e.filename}</span>
                    <span className="flex-shrink-0 px-2.5 py-1 rounded text-[10px] bg-gray-200 text-gray-600 font-medium">
                      {e.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 text-xs text-gray-500 text-center">
                No evidence selected. Pack will include query results.
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          className="w-full bg-gray-900 text-white font-medium py-4 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
        >
          <Package className="w-5 h-5" />
          Generate Assurance Pack
        </button>
      </div>

      {/* Bottom Section: Report Display */}
      {generatedPack ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden"
        >
          {/* Report Header */}
          <div className="bg-blue-900 text-white p-8 border-b border-blue-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Compliance Assurance Report</h3>
                  <p className="text-blue-100 text-sm">Pack ID: {generatedPack.pack_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFullReport(true)}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Maximize2 className="w-4 h-4" />
                  Full Screen
                </button>
                <button
                  onClick={async () => {
                    try {
                      const packId = generatedPack.pack_id;
                      const blob = await api.downloadPack(packId);
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
                  className="px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download ZIP
                </button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-xs text-blue-100 uppercase mb-2 tracking-wide">Evidence Items</p>
                <p className="text-2xl font-bold">{generatedPack.evidence_count}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-xs text-blue-100 uppercase mb-2 tracking-wide">Pack Hash</p>
                <p className="text-xs font-mono truncate">{generatedPack.pack_hash.substring(0, 16)}...</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-xs text-purple-100 uppercase mb-2 tracking-wide">Status</p>
                <p className="text-sm font-semibold">Verified</p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {loadingReport ? (
              <div className="flex items-center justify-center h-full py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading compliance report...</p>
                </div>
              </div>
            ) : reportContent ? (
              <div className="p-8 md:p-10 lg:p-12">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-10 md:p-12 lg:p-16">
                  <ReportContent content={reportContent} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full py-12">
                <div className="text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Report will be displayed here once generated</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FileCheck className="w-10 h-10 text-gray-300" />
          </div>
          <h4 className="text-gray-900 font-semibold text-lg mb-3">Ready to Generate Compliance Report</h4>
          <p className="text-gray-500 text-sm max-w-md">
            Fill out the evidence requirements above to create a professional compliance assurance pack with a detailed markdown report.
          </p>
        </div>
      )}
      
      {/* Full Screen Report Modal */}
      <AnimatePresence>
        {showFullReport && reportContent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFullReport(false)}
              className="fixed inset-0 bg-black bg-opacity-75 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-8 lg:inset-12 z-50 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="bg-blue-900 text-white p-8 border-b border-blue-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Compliance Assurance Report - {generatedPack?.pack_id}</h2>
                </div>
                <button
                  onClick={() => setShowFullReport(false)}
                  className="p-2.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 md:p-12 bg-gray-50">
                <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-12 md:p-16 lg:p-20">
                  <ReportContent content={reportContent} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenerateTab;