/// <reference types="vite/client" />
import axios from 'axios';
import {
  DashboardStats,
  EvidenceItem,
  GeneratedPack,
  IngestResponse,
  AssessmentSessionHistoryItem,
  ControlTimelineResponse,
} from '../types';

// Use explicit local backend by default for development.
// If VITE_API_URL is set (e.g., in production), use that instead.
const API_BASE =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== ''
  ? `${import.meta.env.VITE_API_URL}/api/v1`
    : 'http://49.50.99.89:8080/api/v1';

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
    // Fully predefined, frontend-only flow for enhancing the pack.
    // Does NOT reuse assessment evidence; instead uses a separate mock
    // enhancement dataset per framework.
    await delay(400);

    const selectedFrameworkId =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('selectedFramework') || 'SWIFT_CSP'
        : 'SWIFT_CSP';

    // New enhancement-only evidence, distinct from assessment mocks.
    // Each framework gets 3–4 items with unique IDs/filenames.
    const frameworkMockEnhancementEvidence: Record<string, any[]> = {
      SWIFT_CSP: [
        {
          id: 'swift_enh_mfa_log_1',
          type: 'Log',
          filename: 'swift_mfa_enforcement_q4_enhanced.log',
          preview:
            '[2024-11-05T09:14:22] AUTH | SWIFT-CORE-02 | User: op-j.singh | MFA: REQUIRED & SUCCESS | Policy: SWIFT-MFA-ENF-02 | Session tracked by SIEM profile ID MFA-4271.',
          relevance: 96,
          control_id: 'SWIFT-2.8',
          timestamp: '2024-11-05T09:14:22Z',
          hash: 'swift-enh-log-hash-1',
        },
        {
          id: 'swift_enh_doc_1',
          type: 'Document',
          filename: 'swift_operator_mfa_attestation_enhanced.pdf',
          preview:
            'Q4 2024 Operator MFA Attestation: 100% of active SWIFT operators enrolled in MFA. Monthly reconciliation between HR roster and MFA directory completed with no orphaned accounts.',
          relevance: 93,
          control_id: 'SWIFT-2.8',
          timestamp: '2024-11-01T12:00:00Z',
          hash: 'swift-enh-doc-hash-1',
        },
        {
          id: 'swift_enh_doc_2',
          type: 'Document',
          filename: 'swift_mfa_exception_register_enhanced.xlsx',
          preview:
            'MFA Exception Register (empty): No active exceptions granted for SWIFT operator accounts as of 2024-10-31. Historical exceptions closed within approved time window.',
          relevance: 91,
          control_id: 'SWIFT-2.8',
          timestamp: '2024-10-31T18:30:00Z',
          hash: 'swift-enh-doc-hash-2',
        },
        {
          id: 'swift_enh_log_2',
          type: 'Log',
          filename: 'swift_break_glass_mfa_enhanced.log',
          preview:
            '[2024-10-12T02:12:09] AUTH | Break-glass account login invoked with emergency MFA workflow; security approval ticket SWIFT-BG-119 attached and session fully recorded.',
          relevance: 89,
          control_id: 'SWIFT-2.8',
          timestamp: '2024-10-12T02:12:09Z',
          hash: 'swift-enh-log-hash-2',
        },
      ],
      SOC2: [
        {
          id: 'soc2_enh_cc6.1_doc_1',
          type: 'Document',
          filename: 'soc2_access_review_q4_enhanced.pdf',
          preview:
            'SOC 2 Q4 Logical Access Review: Evidence of quarterly user access review for production systems, with sampled approvals from system owners and remediation of 3 excessive access findings.',
          relevance: 95,
          control_id: 'SOC2-CC6.1',
          timestamp: '2024-11-03T10:00:00Z',
          hash: 'soc2-enh-doc-hash-1',
        },
        {
          id: 'soc2_enh_cc7.1_log_1',
          type: 'Log',
          filename: 'soc2_incident_detection_enhanced.log',
          preview:
            '[2024-10-22T03:41:09] SIEM ALERT | Correlated brute-force pattern detected on admin portal | Auto-containment triggered; incident INC-8743 opened and escalated to on-call engineer.',
          relevance: 92,
          control_id: 'SOC2-CC7.1',
          timestamp: '2024-10-22T03:41:09Z',
          hash: 'soc2-enh-log-hash-1',
        },
        {
          id: 'soc2_enh_cc1.1_doc_1',
          type: 'Document',
          filename: 'soc2_tone_at_the_top_statement_enhanced.pdf',
          preview:
            'Annual SOC 2 Control Environment Statement signed by CEO and CFO, reaffirming commitment to ethical conduct, segregation of duties, and independent audit oversight.',
          relevance: 90,
          control_id: 'SOC2-CC1.1',
          timestamp: '2024-09-30T16:00:00Z',
          hash: 'soc2-enh-doc-hash-2',
        },
        {
          id: 'soc2_enh_cc7.2_doc_1',
          type: 'Document',
          filename: 'soc2_incident_runbook_enhanced.pdf',
          preview:
            'SOC 2 Incident Runbook showing triage, escalation, communication, and post-incident review steps, with mapping to CC7.2 monitoring and response criteria.',
          relevance: 88,
          control_id: 'SOC2-CC7.2',
          timestamp: '2024-10-01T07:30:00Z',
          hash: 'soc2-enh-doc-hash-3',
        },
      ],
      ISO27001_2022: [
        {
          id: 'iso_enh_a5.1_doc_1',
          type: 'Document',
          filename: 'isms_policy_board_approval_enhanced.pdf',
          preview:
            'Board resolution 2024-ISMS-03 approving the revised Information Security Policy, with explicit reference to ISO/IEC 27001:2022 Annex A alignment.',
          relevance: 96,
          control_id: 'ISO-A.5.1',
          timestamp: '2024-08-15T11:30:00Z',
          hash: 'iso-enh-doc-hash-1',
        },
        {
          id: 'iso_enh_a8.2_doc_1',
          type: 'Document',
          filename: 'joiner_mover_leaver_sample_enhanced.xlsx',
          preview:
            'Sample of 20 joiner/mover/leaver cases with documented approvals, timely deprovisioning, and evidence of revocation of privileged access for departing admins.',
          relevance: 93,
          control_id: 'ISO-A.8.2',
          timestamp: '2024-09-05T09:45:00Z',
          hash: 'iso-enh-doc-hash-2',
        },
        {
          id: 'iso_enh_a8.16_log_1',
          type: 'Log',
          filename: 'iso_monitoring_use_case_enhanced.log',
          preview:
            '[2024-10-10T08:02:17] USE CASE EXECUTED | Privileged command monitoring rule fired; session recording archived and integrity hash stored in SIEM vault.',
          relevance: 91,
          control_id: 'ISO-A.8.16',
          timestamp: '2024-10-10T08:02:17Z',
          hash: 'iso-enh-log-hash-1',
        },
        {
          id: 'iso_enh_a12.6_doc_1',
          type: 'Document',
          filename: 'vulnerability_management_schedule_enhanced.pdf',
          preview:
            'ISO 27001 vulnerability management schedule showing monthly authenticated scans and quarterly external scans with documented risk acceptance decisions.',
          relevance: 90,
          control_id: 'ISO-A.12.6',
          timestamp: '2024-09-18T13:10:00Z',
          hash: 'iso-enh-doc-hash-3',
        },
      ],
      PCI_DSS: [
        {
          id: 'pci_enh_3.5.1_doc_1',
          type: 'Document',
          filename: 'hsm_key_ceremony_minutes_enhanced.pdf',
          preview:
            'HSM Key Ceremony Minutes: Documented generation and distribution of new PAN encryption keys with dual control, split knowledge, and tamper-evident storage.',
          relevance: 97,
          control_id: 'PCI-3.5.1',
          timestamp: '2024-07-20T14:00:00Z',
          hash: 'pci-enh-doc-hash-1',
        },
        {
          id: 'pci_enh_8.3.1_log_1',
          type: 'Log',
          filename: 'pci_remote_access_geo_enforcement_enhanced.log',
          preview:
            '[2024-10-01T21:15:42] VPN | Remote admin login from country not on approved list blocked; MFA challenge denied and security ticket PCI-REM-552 opened.',
          relevance: 94,
          control_id: 'PCI-8.3.1',
          timestamp: '2024-10-01T21:15:42Z',
          hash: 'pci-enh-log-hash-1',
        },
        {
          id: 'pci_enh_11.3.1_doc_1',
          type: 'Document',
          filename: 'pci_pen_test_followup_enhanced.pdf',
          preview:
            'Penetration Test Follow-Up Report: Confirms remediation of prior year critical findings and provides evidence of retest results within the required 90-day window.',
          relevance: 92,
          control_id: 'PCI-11.3.1',
          timestamp: '2024-06-25T10:20:00Z',
          hash: 'pci-enh-doc-hash-2',
        },
        {
          id: 'pci_enh_10.2.1_log_1',
          type: 'Log',
          filename: 'pci_cde_audit_trail_enhanced.log',
          preview:
            '[2024-09-14T12:44:03] AUDIT | CDE database account change recorded with before/after values, operator ID, and originating jump host, retained for 400 days.',
          relevance: 90,
          control_id: 'PCI-10.2.1',
          timestamp: '2024-09-14T12:44:03Z',
          hash: 'pci-enh-log-hash-2',
        },
      ],
    };

    const demoItems = frameworkMockEnhancementEvidence[selectedFrameworkId] || [];

    // To avoid full overlap across questions, randomize and
    // only return up to 4 items per query, creating partial
    // overlap between different questions for the same framework.
    const shuffled = [...demoItems].sort(() => Math.random() - 0.5);
    const limited = shuffled.slice(0, 4);

    const result: any = limited;
    const selectedFrameworkName =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('selectedFramework') || 'your selected framework'
        : 'your selected framework';

    result.ai_summary = `Using predefined enhancement evidence to simulate query results for ${selectedFrameworkName}.`;
    result.gap_analysis = null;
    return result;
  },

  generatePack: async (
    query: string,
    controlId: string | null,
    startDate: string,
    endDate: string,
    explicitEvidence: EvidenceItem[] = [],
    assessmentAnswers: any[] = [],
    sessionId?: number | null
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
        session_id: sessionId ?? undefined,
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

  // Fetch markdown report (used for in-app viewing)
  getPackReport: async (packId: string): Promise<string> => {
    try {
      const response = await axios.get(`${API_BASE}/assurance/report/${packId}?format=markdown`, {
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
        : 'http://49.50.99.89:8080';
      
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

  listAssessmentSessions: async (): Promise<AssessmentSessionHistoryItem[]> => {
    try {
      const response = await axios.get(`${API_BASE}/assurance/sessions`);
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching assessment sessions:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch assessment sessions');
    }
  },

  deleteAssessmentSession: async (sessionId: number) => {
    try {
      const response = await axios.delete(`${API_BASE}/assurance/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting assessment session:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete assessment session');
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

  getSwiftArchitectureTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE}/assurance/swift/architecture-types`);
      return response.data.architecture_types || [];
    } catch (error: any) {
      console.error('Error fetching SWIFT architecture types:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch SWIFT architecture types');
    }
  },

  getSwiftControlsByArchitecture: async (architectureType: string) => {
    try {
      const response = await axios.get(`${API_BASE}/assurance/swift/controls-by-architecture`, {
        params: { architecture_type: architectureType }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching SWIFT controls by architecture:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch SWIFT controls');
    }
  },

  getSwiftControlApplicabilityMatrix: async () => {
    try {
      const response = await axios.get(`${API_BASE}/assurance/swift/control-applicability-matrix`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching SWIFT control applicability matrix:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch control applicability matrix');
    }
  },

  // Assessment session APIs for tracking multi-step generate flow
  startAssessmentSession: async (payload: {
    objective_selection: any;
    swift_architecture_type?: string | null;
  }) => {
    try {
      const response = await axios.post(`${API_BASE}/assurance/sessions`, {
        objective_selection: payload.objective_selection,
        swift_architecture_type: payload.swift_architecture_type ?? undefined,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error starting assessment session:', error);
      throw new Error(error.response?.data?.detail || 'Failed to start assessment session');
    }
  },

  updateAssessmentSession: async (sessionId: number, payload: any) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/assurance/sessions/${sessionId}`,
        payload,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating assessment session:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update assessment session');
    }
  },

  getAssessmentSession: async (sessionId: number) => {
    try {
      const response = await axios.get(`${API_BASE}/assurance/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching assessment session:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch assessment session');
    }
  },

  downloadSwiftExcelReport: async (
    swiftArchitectureType: string | null,
    controlStatuses: {
      control_id: string;
      status: 'in-place' | 'not-in-place' | 'not-applicable';
      advisory?: boolean;
      answer_summary?: string;
    }[],
    sessionId?: number | null,
    userBackground?: {
      customer_name?: string;
      bic?: string;
      cscf_version?: string;
      assessment_start_date?: string;
      assessment_end_date?: string;
      assessor_firm?: string;
      lead_assessor_name?: string;
      lead_assessor_title?: string;
      assessor_names?: string;
      architecture_type?: string | null;
    }
  ): Promise<Blob> => {
    try {
      const payload: any = {
        swift_architecture_type: swiftArchitectureType,
        control_statuses: controlStatuses,
        session_id: sessionId ?? undefined,
      };

      if (userBackground) {
        payload.user_background = {
          ...userBackground,
          // If architecture_type is not explicitly set, fall back to the SWIFT architecture type
          architecture_type: userBackground.architecture_type ?? swiftArchitectureType ?? undefined,
        };
      }

      const response = await axios.post(
        `${API_BASE}/assurance/swift/excel-report`,
        payload,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error generating SWIFT Excel report:', error);
      throw new Error(error.response?.data?.detail || 'Failed to generate SWIFT Excel report');
    }
  },

  downloadSwiftExcelForSession: async (sessionId: number): Promise<Blob> => {
    try {
      const response = await axios.get(
        `${API_BASE}/assurance/sessions/${sessionId}/swift-excel`,
        { responseType: 'blob' },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to download SWIFT Excel report');
    }
  },

  getControlTimeline: async (params: {
    control_id?: string;
    framework?: string;
    swift_architecture_type?: string;
    time_range_start: string;
    time_range_end: string;
  }): Promise<ControlTimelineResponse> => {
    try {
      const response = await axios.get(`${API_BASE}/assurance/timeline`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching control timeline:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch control timeline');
    }
  },
};
