import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { ControlTimelineResponse, TimelineEvent } from '../types';
import { AlertCircle, Clock, Shield, Activity } from 'lucide-react';

interface ControlTimelineProps {
  controlId?: string;
  framework?: string;
  swiftArchitectureType?: string;
  timeRangeStart: string;
  timeRangeEnd: string;
}

const ControlTimeline: React.FC<ControlTimelineProps> = ({
  controlId,
  framework,
  swiftArchitectureType,
  timeRangeStart,
  timeRangeEnd,
}) => {
  const [data, setData] = useState<ControlTimelineResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getControlTimeline({
          control_id: controlId,
          framework,
          swift_architecture_type: swiftArchitectureType,
          time_range_start: timeRangeStart,
          time_range_end: timeRangeEnd,
        });
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load control timeline');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [controlId, framework, swiftArchitectureType, timeRangeStart, timeRangeEnd]);

  const groupedEvents = useMemo(() => {
    if (!data) return {};
    const groups: Record<string, TimelineEvent[]> = {};
    data.events.forEach((event) => {
      const key = event.control_id || 'ALL';
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });
    return groups;
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <span>Loading control timeline...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!data || data.events.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
        <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          No timeline events found for the selected filters and time period.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-900" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              Control Timeline ({new Date(data.time_range_start).toLocaleDateString()} –{' '}
              {new Date(data.time_range_end).toLocaleDateString()})
            </h3>
            <p className="text-xs text-blue-700">
              {data.summary.total_events} events • {data.summary.status_changes} status changes •{' '}
              {data.summary.evidence_added} evidence additions •{' '}
              {data.summary.assessment_milestones} assessment milestones
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([cid, events]) => (
          <div key={cid} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-blue-700" />
              <span className="text-sm font-semibold text-gray-900">
                {cid === 'ALL' ? 'All Controls / Sessions' : cid}
              </span>
            </div>

            <ol className="relative border-l border-gray-200 pl-4 space-y-4">
              {events.map((event, idx) => {
                let badgeClass = 'bg-gray-100 text-gray-700';
                let label = event.event_type;

                if (event.event_type === 'status_change') {
                  badgeClass =
                    event.status_after === 'in-place'
                      ? 'bg-green-100 text-green-700'
                      : event.status_after === 'not-in-place'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700';
                  label = `Status: ${event.status_before || 'unknown'} → ${
                    event.status_after || 'unknown'
                  }`;
                } else if (event.event_type === 'evidence_added') {
                  badgeClass = 'bg-blue-100 text-blue-700';
                  label = 'Evidence added';
                } else if (event.event_type === 'assessment_milestone') {
                  badgeClass = 'bg-purple-100 text-purple-700';
                  label =
                    event.metadata?.type === 'completed'
                      ? 'Assessment completed'
                      : 'Assessment started';
                }

                return (
                  <li key={`${idx}-${event.timestamp}`} className="ml-1">
                    <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-white border border-blue-300" />
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                        >
                          <Activity className="w-3 h-3 mr-1" />
                          {label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700">
                        {event.event_type === 'evidence_added' && event.evidence_filename && (
                          <span>
                            Evidence: <span className="font-mono">{event.evidence_filename}</span>
                          </span>
                        )}
                        {event.event_type === 'assessment_milestone' &&
                          event.assessment_session_id && (
                            <span>
                              Session ID:{' '}
                              <span className="font-mono">{event.assessment_session_id}</span>
                            </span>
                          )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlTimeline;

