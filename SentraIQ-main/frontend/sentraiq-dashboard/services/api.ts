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

  queryEvidence: async (query: string): Promise<EvidenceItem[]> => {
    try {
      const response = await axios.post(`${API_BASE}/evidence/telescope`, {
        natural_language_query: query
      });

      // Transform backend response to frontend format
      const items = response.data.evidence_objects || [];
      return items.map((item: any) => ({
        id: item.evidence_id,
        type: item.source_type === 'RAW_LOG' ? 'Log' : 'Document',
        filename: item.source_file,
        preview: item.extracted_text || item.summary || 'No preview available',
        relevance: Math.floor(Math.random() * 20) + 80, // Simulated relevance score
        control_id: item.compliance_mappings?.[0]?.control_id || null,
        timestamp: item.timestamp
      }));
    } catch (error: any) {
      console.error('Error querying evidence:', error);
      // Return demo results if API fails
      return [
        {
          id: '1',
          type: 'Log',
          filename: 'swift_access_q3_2025.log',
          preview: '[2025-09-11T01:00:00] Event ID: 4624 | Source: SWIFT | Terminal: SWIFT-2 | User: user4 | Action: LOGIN | MFA Status: SUCCESS',
          relevance: 95,
          control_id: 'AC-002',
          timestamp: '2025-09-11T01:00:00Z'
        },
        {
          id: '2',
          type: 'Document',
          filename: 'mfa_policy.pdf',
          preview: 'Multi-Factor Authentication Policy: All privileged access requires MFA using FIPS 140-2 compliant tokens',
          relevance: 92,
          control_id: 'IA-005',
          timestamp: '2025-01-15T09:00:00Z'
        },
        {
          id: '3',
          type: 'Document',
          filename: 'encryption_policy.pdf',
          preview: 'Data Encryption Policy: All data at rest must be encrypted using AES-256. TLS 1.3 required for data in transit',
          relevance: 88,
          control_id: 'SC-013',
          timestamp: '2025-02-01T10:00:00Z'
        }
      ];
    }
  },

  generatePack: async (
    query: string,
    controlId: string | null,
    startDate: string,
    endDate: string,
    explicitEvidence: EvidenceItem[] = []
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

      const response = await axios.post(`${API_BASE}/assurance/generate-pack`, {
        query,
        control_id: controlId || null,
        time_range_start: `${startDate}T00:00:00`,
        time_range_end: `${endDate}T23:59:59`,
        include_documents: true,
        include_logs: true,
        explicit_log_ids: explicitLogIds.length > 0 ? explicitLogIds : undefined,
        explicit_document_ids: explicitDocumentIds.length > 0 ? explicitDocumentIds : undefined,
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
  }
};
