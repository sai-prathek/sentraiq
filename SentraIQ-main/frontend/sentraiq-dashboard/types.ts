export interface DashboardStats {
  total_logs: number;
  total_documents: number;
  total_evidence_objects: number;
  total_assurance_packs: number;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface IngestResponse {
  id: string;
  hash: string;
  filename: string;
  auto_mapped_count: number;
}

export interface EvidenceItem {
  id: string;
  type: 'Log' | 'Document';
  filename: string;
  preview: string;
  relevance: number;
  control_id?: string;
  timestamp: string;
}

export interface GeneratedPack {
  pack_id: string;
  evidence_count: number;
  pack_hash: string;
  file_path: string;
  download_url: string;
  timestamp: string;
}

export type TabType = 'ingest' | 'query' | 'generate' | 'history' | 'controls';

export interface PackHistoryItem {
  pack_id: string;
  control_id?: string;
  query?: string;
  evidence_count: number;
  pack_hash: string;
  created_at: string;
  time_range_start: string;
  time_range_end: string;
  download_url: string;
  report_url: string;
  pack_size_mb?: number;
  explicit_evidence?: {
    log_ids?: number[];
    document_ids?: number[];
  };
}

export interface AssessmentSessionHistoryItem {
  id: number;
  status?: string;
  current_step?: number;
  objective_selection?: any;
  swift_architecture_type?: string | null;
  requirements_status?: any;
  assessment_answers?: any[];
  control_statuses?: any[];
  evidence_summary?: any;
  pack_id?: string | null;
  swift_excel_filename?: string | null;
  swift_excel_path?: string | null;
  meta_data?: any;
  started_at: string;
  completed_at?: string | null;
  updated_at: string;
}

export interface TimelineEvent {
  event_type: 'status_change' | 'evidence_added' | 'evidence_removed' | 'assessment_milestone';
  control_id: string;
  control_name: string;
  timestamp: string;
  status_before?: string | null;
  status_after?: string | null;
  evidence_id?: number | null;
  evidence_filename?: string | null;
  assessment_session_id?: number | null;
  metadata?: any;
}

export interface ControlTimelineResponse {
  control_id?: string | null;
  time_range_start: string;
  time_range_end: string;
  events: TimelineEvent[];
  summary: {
    total_events: number;
    status_changes: number;
    evidence_added: number;
    assessment_milestones: number;
    [key: string]: any;
  };
}

export interface IngestedLog {
  id: number;
  hash: string;
  source: string;
  filename: string;
  size_bytes: number;
  ingested_at: string;
  description?: string;
}

export interface IngestedDocument {
  id: number;
  hash: string;
  doc_type: string;
  filename: string;
  size_bytes: number;
  ingested_at: string;
  description?: string;
}

export interface WorkflowState {
  hasIngested: boolean;
  hasQueried: boolean;
}

import React from 'react';

export interface DashboardOutletContext {
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  selectedEvidence: EvidenceItem[];
  addEvidenceToPack: (item: EvidenceItem) => void;
  removeEvidenceFromPack: (id: string, type: 'Log' | 'Document') => void;
  clearSelectedEvidence: () => void;
  workflowState: WorkflowState;
  setWorkflowState: React.Dispatch<React.SetStateAction<WorkflowState>>;
  generateTabClickCount?: number;
}
