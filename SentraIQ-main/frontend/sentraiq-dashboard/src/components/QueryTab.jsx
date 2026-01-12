import React, { useState } from 'react';
import { Search, FileText, Database } from 'lucide-react';
import { assuranceAPI } from '../services/api';
import { showToast } from '../utils/toast';
import { format } from 'date-fns';

const QueryTab = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const exampleQueries = [
    'Show me all MFA evidence from last 6 months',
    'Find encryption logs from Q3 2025',
    'Get access control policies',
    'Show me firewall logs with failed authentication',
  ];

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) {
      showToast('Please enter a search query', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await assuranceAPI.query(searchQuery);
      setResults(response.data);
      showToast(`Found ${response.data.results_count} results in ${response.data.execution_time_ms}ms`, 'success');
    } catch (error) {
      showToast(`Query failed: ${error.response?.data?.detail || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
    handleSearch(exampleQuery);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center">Natural Language Evidence Search</h3>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ask a natural language question about your evidence..."
            className="input-field pr-12 text-lg"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Example Queries */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-gray-600 mb-3">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Searching evidence...</p>
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-lg font-semibold">
              <span className="text-purple-600">{results.results_count}</span> results found
            </p>
            <p className="text-sm text-gray-500">Execution time: {results.execution_time_ms}ms</p>
          </div>

          {results.results_count === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No evidence found matching your query.</p>
              <p className="text-sm">Try a different search term or example query.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.evidence_items.map((item, index) => (
                <div key={index} className="result-card">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`badge ${item.type === 'log' ? 'badge-primary' : 'badge-secondary'}`}>
                      {item.type === 'log' ? (
                        <>
                          <Database className="w-3 h-3 inline mr-1" />
                          Log
                        </>
                      ) : (
                        <>
                          <FileText className="w-3 h-3 inline mr-1" />
                          Document
                        </>
                      )}
                    </span>
                    <span className="text-sm text-gray-500">{format(new Date(item.ingested_at), 'MMM dd, yyyy')}</span>
                  </div>

                  <h4 className="font-semibold text-lg mb-2">{item.filename}</h4>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{item.content_preview}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Relevance:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                            style={{ width: `${item.relevance_score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-purple-600 font-semibold">{(item.relevance_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    {item.control_id && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Control:</span>
                        <span className="badge badge-success">{item.control_id}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 font-mono">{item.hash}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QueryTab;
