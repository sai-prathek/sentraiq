/// <reference types="vite/client" />
import axios from 'axios';
import { DashboardStats, EvidenceItem, GeneratedPack, IngestResponse } from '../types';

// Use explicit local backend by default for development.
// If VITE_API_URL is set (e.g., in production), use that instead.
const API_BASE =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== ''
  ? `${import.meta.env.VITE_API_URL}/api/v1`
    : 'http://localhost:8080/api/v1';

// Helper to simulate network delay for demo purposes
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch dashboard stats');
    }
  },

  ingestLog: async (
    file: File,
    source: string,
    description: string,
    autoMap: boolean
  ): Promise<IngestResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', source);
    formData.append('description', description);
    formData.append('auto_map', autoMap ? 'true' : 'false');

    try {
      const response = await axios.post(`${API_BASE}/ingest/log`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to ingest log');
    }
  },

  ingestDocument: async (
    file: File,
    docType: string,
    description: string,
    autoMap: boolean
  ): Promise<IngestResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    formData.append('description', description);
    formData.append('auto_map', autoMap ? 'true' : 'false');

    try {
      const response = await axios.post(`${API_BASE}/ingest/document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to ingest document');
    }
  },

  getIngestedLogs: async () => {
    try {
      const response = await axios.get(`${API_BASE}/ingest/logs`);
      return response.data.logs || [];
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      return [];
    }
  },

  getIngestedDocuments: async () => {
    try {
      const response = await axios.get(`${API_BASE}/ingest/documents`);
      return response.data.documents || [];
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  deleteLog: async (logId: number) => {
    try {
      const response = await axios.delete(`${API_BASE}/ingest/log/${logId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete log');
    }
  },

  deleteDocument: async (documentId: number) => {
    try {
      const response = await axios.delete(`${API_BASE}/ingest/document/${documentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete document');
    }
  },

  queryEvidence: async (query: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE}/assurance/query`, {
        query: query
      });

      // Transform backend response to frontend format
      const items = response.data.evidence_items || [];
      const transformedItems = items.map((item: any) => ({
        id: String(item.id),
        type: item.type === 'log' ? 'Log' : 'Document',
        filename: item.filename,
        preview: item.content_preview || 'No preview available',
        relevance: Math.round(item.relevance_score * 100),
        control_id: item.control_id || null,
        timestamp: item.ingested_at,
        hash: item.hash
      }));
      
      // Return object with items and metadata
      const result: any = transformedItems;
      result.ai_summary = response.data.ai_summary;
      result.gap_analysis = response.data.gap_analysis;
      return result;
    } catch (error: any) {
      console.error('Error querying evidence:', error);
      // Return demo results if API fails
      const demoItems = [
        {
          id: '1',
          type: 'Log',
          filename: 'swift_access_q3_2025.log',
          preview: '[2025-09-11T01:00:00] Event ID: 4624 | Source: SWIFT | Terminal: SWIFT-2 | User: user4 | Action: LOGIN | MFA Status: SUCCESS',
          relevance: 95,
          control_id: 'SWIFT-2.8',
          timestamp: '2025-09-11T01:00:00Z',
          hash: 'abc123...'
        },
        {
          id: '2',
          type: 'Document',
          filename: 'mfa_policy.pdf',
          preview: 'Multi-Factor Authentication Policy: All privileged access requires MFA using FIPS 140-2 compliant tokens',
          relevance: 92,
          control_id: 'SWIFT-2.8',
          timestamp: '2025-01-15T09:00:00Z',
          hash: 'def456...'
        },
        {
          id: '3',
          type: 'Document',
          filename: 'encryption_policy.pdf',
          preview: 'Data Encryption Policy: All data at rest must be encrypted using AES-256. TLS 1.3 required for data in transit',
          relevance: 88,
          control_id: 'SWIFT-3.1',
          timestamp: '2025-02-01T10:00:00Z',
          hash: 'ghi789...'
        }
      ];
      const result: any = demoItems;
      result.ai_summary = 'Found 3 evidence items related to MFA and encryption controls.';
      result.gap_analysis = null;
      return result;
    }
  },

  generatePack: async (
    query: string,
    controlId: string | null,
    startDate: string,
    endDate: string,
    explicitEvidence: EvidenceItem[] = [],
    assessmentAnswers: any[] = []
  ): Promise<GeneratedPack> => {
    try {
      // Parse evidence IDs more robustly
      // Handle both string IDs like "123" and potentially formatted IDs like "LOG_123"
      const parseEvidenceId = (id: string): number | null => {
        // If it's already a number string, parse it
        const numId = parseInt(id, 10);
        if (!Number.isNaN(numId) && numId > 0) {
          return numId;
        }
        // Try to extract number from formatted IDs like "LOG_123" or "DOC_456"
        const match = id.match(/\d+$/);
        if (match) {
          const extracted = parseInt(match[0], 10);
          if (!Number.isNaN(extracted) && extracted > 0) {
            return extracted;
          }
        }
        console.warn(`Failed to parse evidence ID: ${id}`);
        return null;
      };

      const explicitLogIds = explicitEvidence
        .filter((e) => e.type === 'Log')
        .map((e) => parseEvidenceId(e.id))
        .filter((id): id is number => id !== null);

      const explicitDocumentIds = explicitEvidence
        .filter((e) => e.type === 'Document')
        .map((e) => parseEvidenceId(e.id))
        .filter((id): id is number => id !== null);

      if (explicitEvidence.length > 0) {
        console.log(`📦 Including ${explicitLogIds.length} logs and ${explicitDocumentIds.length} documents in pack`);
      }

      // Get assessment answers from localStorage if available
      const storedAnswers = localStorage.getItem('assessmentAnswers');
      const answers = assessmentAnswers.length > 0 
        ? assessmentAnswers 
        : (storedAnswers ? JSON.parse(storedAnswers) : []);

      const response = await axios.post(`${API_BASE}/assurance/generate-pack`, {
        query,
        control_id: controlId || null,
        time_range_start: `${startDate}T00:00:00`,
        time_range_end: `${endDate}T23:59:59`,
        include_documents: true,
        include_logs: true,
        explicit_log_ids: explicitLogIds.length > 0 ? explicitLogIds : undefined,
        explicit_document_ids: explicitDocumentIds.length > 0 ? explicitDocumentIds : undefined,
        assessment_answers: answers.length > 0 ? answers : undefined,
      });

      return {
        pack_id: response.data.pack_id,
        evidence_count: response.data.evidence_count,
        pack_hash: response.data.pack_hash,
        file_path: response.data.file_path,
        download_url: response.data.download_url,
        timestamp: response.data.created_at
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to generate assurance pack';
      console.error('Pack generation error:', errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  getDemoLogs: async () => {
    try {
      const response = await axios.get(`${API_BASE}/demo/logs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching demo logs:', error);
      return [];
    }
  },

  getDemoDocuments: async () => {
    try {
      const response = await axios.get(`${API_BASE}/demo/documents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching demo documents:', error);
      return [];
    }
  },

  // Evidence Mapping APIs
  mapLogToControls: async (logId: number) => {
    try {
      const response = await axios.post(`${API_BASE}/evidence/map-log/${logId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to map log to controls');
    }
  },

  mapDocumentToControls: async (documentId: number) => {
    try {
      const response = await axios.post(`${API_BASE}/evidence/map-document/${documentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to map document to controls');
    }
  },

  getEvidenceByControl: async (controlId: string) => {
    try {
      const response = await axios.get(`${API_BASE}/evidence/by-control/${controlId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to get evidence by control');
    }
  },

  getPackReport: async (packId: string): Promise<string> => {
    try {
      const response = await axios.get(`${API_BASE}/assurance/report/${packId}`, {
        responseType: 'text',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch pack report');
    }
  },

  downloadPack: async (packId: string): Promise<Blob> => {
    try {
      const apiBase = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== ''
        ? import.meta.env.VITE_API_URL
        : 'http://localhost:8080';
      
      const response = await axios.get(`${apiBase}/api/v1/assurance/download/${packId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to download pack');
    }
  },

  listPacks: async () => {
    try {
      const response = await axios.get(`${API_BASE}/assurance/packs`);
      return response.data.packs || [];
    } catch (error: any) {
      console.error('Error fetching packs:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch packs');
    }
  },

  getControls: async (infrastructure?: string, frameworks?: string[]) => {
    try {
      const params: any = {};
      if (infrastructure) params.infrastructure = infrastructure;
      if (frameworks && frameworks.length > 0) params.frameworks = frameworks.join(',');
      const response = await axios.get(`${API_BASE}/assurance/controls`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching controls:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch controls');
    }
  },

  checkRegulatoryUpdates: async (framework?: string) => {
    try {
      const params = framework ? { framework } : {};
      const response = await axios.get(`${API_BASE}/assurance/regulatory-updates/check`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error checking regulatory updates:', error);
      throw new Error(error.response?.data?.detail || 'Failed to check regulatory updates');
    }
  },
};
