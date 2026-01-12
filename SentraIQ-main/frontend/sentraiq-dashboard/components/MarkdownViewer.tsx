import React from 'react';
import { X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MarkdownViewerProps {
  content: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  title = 'Report',
  isOpen,
  onClose,
}) => {
  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string): JSX.Element[] => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let listItems: string[] = [];
    let inList = false;
    let tableHeaderIndex = -1; // Track which row is the header

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
        elements.push(<hr key={`hr-${index}`} className="my-8 border-gray-400 border-t-2" />);
        return;
      }

      // Lists
      if (line.trim().startsWith('- ')) {
        if (!inList) {
          inList = true;
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
        const isHeader = cells[0] && cells[0].includes('---');
        if (isHeader) return; // Skip separator row
        
        // Check if this is a header row (row before separator or first row)
        const isHeaderRow = index > 0 && lines[index - 1] && lines[index - 1].includes('|') && 
                           !lines[index - 1].includes('---') && 
                           (index < lines.length - 1 && lines[index + 1] && lines[index + 1].includes('---'));
        
        elements.push(
          <tr key={`tr-${index}`} className={isHeaderRow ? 'bg-gray-100 font-semibold' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
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

      // Regular paragraphs
      if (line.trim() === '') {
        if (inList) {
          elements.push(renderList(listItems));
          listItems = [];
          inList = false;
        }
        elements.push(<br key={`br-${index}`} />);
        return;
      }

      if (inList) {
        listItems.push(line);
        return;
      }

      // Check if previous element was a table
      const prevElement = elements[elements.length - 1];
      if (prevElement && prevElement.type === 'table') {
        // This is a table row, handled above
        return;
      }

      elements.push(
        <p key={`p-${index}`} className="text-gray-700 mb-5 leading-relaxed text-base">
          {parseInlineMarkdown(line)}
        </p>
      );
    });

    // Close any open lists
    if (inList) {
      elements.push(renderList(listItems));
    }

    // Wrap table rows in table with proper header detection
    const tableRows: JSX.Element[] = [];
    const finalElements: JSX.Element[] = [];
    let inTable = false;
    let headerRowIndex = -1;

    elements.forEach((el, idx) => {
      if (el.type === 'tr' || (el as any).type?.name === 'tr') {
        if (!inTable) {
          inTable = true;
          headerRowIndex = -1;
        }
        // Check if this row has th elements (header row)
        const hasTh = React.isValidElement(el) && 
                     React.Children.toArray((el as any).props.children).some(
                       (child: any) => child?.type === 'th' || child?.props?.className?.includes('font-semibold')
                     );
        if (hasTh && headerRowIndex === -1) {
          headerRowIndex = tableRows.length;
        }
        tableRows.push(el);
      } else {
        if (inTable && tableRows.length > 0) {
          // Separate header and body rows
          const headerRow = headerRowIndex >= 0 ? tableRows[headerRowIndex] : null;
          const bodyRows = headerRowIndex >= 0 
            ? [...tableRows.slice(0, headerRowIndex), ...tableRows.slice(headerRowIndex + 1)]
            : tableRows;
          
          finalElements.push(
            <div key={`table-wrapper-${idx}`} className="overflow-x-auto my-8 mb-10">
              <table className="min-w-full border-collapse border border-gray-400">
                {headerRow && <thead>{headerRow}</thead>}
                <tbody>{bodyRows}</tbody>
              </table>
            </div>
          );
          tableRows.length = 0;
          inTable = false;
          headerRowIndex = -1;
        }
        finalElements.push(el);
      }
    });

    if (inTable && tableRows.length > 0) {
      const headerRow = headerRowIndex >= 0 ? tableRows[headerRowIndex] : null;
      const bodyRows = headerRowIndex >= 0 
        ? [...tableRows.slice(0, headerRowIndex), ...tableRows.slice(headerRowIndex + 1)]
        : tableRows;
      
      finalElements.push(
        <div key="table-wrapper-final" className="overflow-x-auto my-8 mb-10">
          <table className="min-w-full border-collapse border border-gray-400">
            {headerRow && <thead>{headerRow}</thead>}
            <tbody>{bodyRows}</tbody>
          </table>
        </div>
      );
    }

    return finalElements;
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

  const parseInlineMarkdown = (text: string): JSX.Element => {
    const parts: (string | JSX.Element)[] = [];
    let currentIndex = 0;

    // Bold **text**
    const boldRegex = /\*\*(.+?)\*\*/g;
    // Code `text`
    const codeRegex = /`([^`]+)`/g;
    // Links [text](url) - simplified
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
        parts.push(<strong key={`bold-${m.start}`} className="font-bold">{m.content}</strong>);
      } else if (m.type === 'code') {
        parts.push(<code key={`code-${m.start}`} className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">{m.content}</code>);
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                <FileText className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10 lg:p-12 bg-gray-50">
              <div 
                className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-10 md:p-12 lg:p-16"
                style={{
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
                  lineHeight: '1.75',
                  color: '#374151'
                }}
              >
                <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
                  {parsedContent}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MarkdownViewer;
