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
}
