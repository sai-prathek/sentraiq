import React, { useState } from 'react';
import { Package, Download, Calendar } from 'lucide-react';
import { assuranceAPI } from '../services/api';
import { showToast } from '../utils/toast';
import { format, subMonths, subDays } from 'date-fns';

const AssuranceTab = () => {
  const [query, setQuery] = useState('');
  const [controlId, setControlId] = useState('');
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [generatedPack, setGeneratedPack] = useState(null);

  const handleGenerate = async () => {
    // Relax validation so we can ensure this handler runs
    if (!query.trim()) {
      showToast('No query provided, using a generic description for this pack.', 'info');
    }

    if (!startDate || !endDate) {
      showToast('Please select date range', 'warning');
      return;
    }

    const payload = {
      query: query || 'Assurance pack generated from UI without explicit query',
      control_id: controlId || null,
      time_range_start: `${startDate}T00:00:00`,
      time_range_end: `${endDate}T23:59:59`,
    };

    console.log('AssuranceTab.handleGenerate payload:', payload);

    setLoading(true);
    try {
      const response = await assuranceAPI.generatePack(payload);
      console.log('AssuranceTab.handleGenerate response:', response);
      setGeneratedPack(response.data);
      showToast('Assurance pack generated successfully!', 'success');
    } catch (error) {
      console.error('AssuranceTab.handleGenerate error:', error);
      showToast(`Pack generation failed: ${error.response?.data?.detail || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const setDatePreset = (preset) => {
    const end = new Date();
    let start;

    switch (preset) {
      case 'month':
        start = subMonths(end, 1);
        break;
      case 'quarter':
        start = subMonths(end, 3);
        break;
      case '6months':
        start = subMonths(end, 6);
        break;
      case 'year':
        start = subMonths(end, 12);
        break;
      default:
        return;
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Package className="w-7 h-7 text-purple-600" />
          Generate Assurance Pack
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Query / Description</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field"
              rows="4"
              placeholder="e.g., MFA compliance evidence for Q3 2025"
            />
            <p className="text-xs text-gray-500 mt-1">Describe what evidence you need for this assurance pack</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Control ID (Optional)</label>
            <input
              type="text"
              value={controlId}
              onChange={(e) => setControlId(e.target.value)}
              className="input-field"
              placeholder="e.g., AC-001"
            />
            <p className="text-xs text-gray-500 mt-1">Link this pack to a specific control framework</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Time Range
            </label>

            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => setDatePreset('month')} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full">
                Last Month
              </button>
              <button onClick={() => setDatePreset('quarter')} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full">
                Last Quarter
              </button>
              <button onClick={() => setDatePreset('6months')} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full">
                Last 6 Months
              </button>
              <button onClick={() => setDatePreset('year')} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full">
                Last Year
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full text-lg py-4">
            {loading ? 'Generating Pack (calling API)...' : 'Generate Assurance Pack'}
          </button>
        </div>
      </div>

      {/* Preview / Result */}
      <div className="lg:col-span-1">
        <h3 className="text-xl font-bold mb-6">Pack Preview</h3>

        {!generatedPack ? (
          <div className="glass rounded-xl p-6 text-center text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Generate a pack to see details here</p>
          </div>
        ) : (
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-lg text-green-600">Pack Generated!</h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pack ID:</span>
                <span className="font-mono font-semibold text-xs">{generatedPack.pack_id}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Evidence Count:</span>
                <span className="font-bold text-purple-600">{generatedPack.evidence_count}</span>
              </div>

              {generatedPack.control_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Control ID:</span>
                  <span className="badge badge-success">{generatedPack.control_id}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1">SHA-256 Hash:</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">{generatedPack.pack_hash.substring(0, 32)}...</p>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Created:</p>
                <p className="text-sm font-medium">{format(new Date(generatedPack.created_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>

            <a
              href={generatedPack.download_url}
              download
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Pack
            </a>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">{generatedPack.disclaimer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssuranceTab;
