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

export type TabType = 'ingest' | 'query' | 'generate';

export interface DashboardOutletContext {
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  selectedEvidence: EvidenceItem[];
  addEvidenceToPack: (item: EvidenceItem) => void;
  removeEvidenceFromPack: (id: string, type: 'Log' | 'Document') => void;
  clearSelectedEvidence: () => void;
}
