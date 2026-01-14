import React, { useState, useEffect } from 'react';
import ControlTimeline from '../components/ControlTimeline';
import { useOutletContext } from 'react-router-dom';
import { DashboardOutletContext } from '../types';

const TimelinePage: React.FC = () => {
  const { addToast } = useOutletContext<DashboardOutletContext>();

  const [controlId, setControlId] = useState<string>('');
  const [framework, setFramework] = useState<string>('');
  const [swiftArchitectureType, setSwiftArchitectureType] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  useEffect(() => {
    // Default to last 90 days
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 3);
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
  }, []);

  const handlePreset = (type: 'month' | 'quarter' | 'year') => {
    const end = new Date();
    const start = new Date();
    if (type === 'month') start.setMonth(end.getMonth() - 1);
    if (type === 'quarter') start.setMonth(end.getMonth() - 3);
    if (type === 'year') start.setFullYear(end.getFullYear() - 1);
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
  };

  const handleApplyFilters = () => {
    if (!dateRange.start || !dateRange.end) {
      addToast('Please select a valid time range for the timeline.', 'error');
      return;
    }
    addToast('Timeline filters applied.', 'info');
  };

  if (!dateRange.start || !dateRange.end) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control Timeline</h1>
          <p className="text-sm text-gray-600 mt-1">
            Visualize control status changes and evidence activity over a defined period.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Control ID <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={controlId}
              onChange={(e) => setControlId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
              placeholder="e.g., SWIFT-2.8"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Framework <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
              placeholder="e.g., SWIFT_CSP, SOC2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              SWIFT Architecture <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={swiftArchitectureType}
              onChange={(e) => setSwiftArchitectureType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
              placeholder="e.g., A1, A2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Time Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => handlePreset('month')}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 font-medium"
              >
                Last month
              </button>
              <button
                type="button"
                onClick={() => handlePreset('quarter')}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 font-medium"
              >
                Last quarter
              </button>
              <button
                type="button"
                onClick={() => handlePreset('year')}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 font-medium"
              >
                Last year
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="px-5 py-2.5 rounded-lg bg-blue-900 text-white text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Timeline visualization */}
      <ControlTimeline
        controlId={controlId || undefined}
        framework={framework || undefined}
        swiftArchitectureType={swiftArchitectureType || undefined}
        timeRangeStart={`${dateRange.start}T00:00:00`}
        timeRangeEnd={`${dateRange.end}T23:59:59`}
      />
    </div>
  );
};

export default TimelinePage;

