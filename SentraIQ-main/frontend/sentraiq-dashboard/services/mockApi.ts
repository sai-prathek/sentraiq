import { DashboardStats, EvidenceItem, GeneratedPack, IngestResponse } from '../types';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  getStats: async (): Promise<DashboardStats> => {
    // In a real app: return fetch('/api/v1/dashboard/stats').then(r => r.json());
    await delay(600);
    return {
      total_logs: 1245892,
      total_documents: 4821,
      total_evidence_objects: 89302,
      total_assurance_packs: 142
    };
  },

  ingestFile: async (file: File, type: 'log' | 'document'): Promise<IngestResponse> => {
    await delay(1500);
    // Simulate error occasionally
    if (file.name.includes('error')) throw new Error('Simulated upload failure');
    
    return {
      id: `evt-${Math.random().toString(36).substr(2, 9)}`,
      hash: 'a1b2c3d4e5f6...',
      filename: file.name,
      auto_mapped_count: Math.floor(Math.random() * 5) + 1
    };
  },

  queryEvidence: async (query: string): Promise<EvidenceItem[]> => {
    await delay(1200);
    const mockResults: EvidenceItem[] = [
      {
        id: '1',
        type: 'Log',
        filename: 'firewall_auth_failure.log',
        preview: '2025-05-12 14:02:11 SRC=192.168.1.55 DST=10.0.0.2 MSG=Auth Failed User=admin',
        relevance: 98,
        control_id: 'AC-002',
        timestamp: '2025-05-12T14:02:11Z'
      },
      {
        id: '2',
        type: 'Document',
        filename: 'MFA_Policy_v2.pdf',
        preview: 'Section 4.2: All remote access requires Multi-Factor Authentication using FIPS 140-2 compliant tokens.',
        relevance: 92,
        control_id: 'IA-005',
        timestamp: '2025-01-15T09:00:00Z'
      },
      {
        id: '3',
        type: 'Log',
        filename: 'SWIFT_Transaction_Log_2025.log',
        preview: '{ "msg_type": "MT103", "sender": "BANKUS33", "receiver": "BOFAUS3N", "amount": 1500000.00, "currency": "USD", "status": "ACK" }',
        relevance: 89,
        control_id: 'AU-012',
        timestamp: '2025-02-10T11:45:00Z'
      },
      {
        id: '4',
        type: 'Document',
        filename: 'NIST_800_53_Compliance_Audit.pdf',
        preview: 'Audit Finding: AC-2 (Account Management) - 3 user accounts were found active after termination date.',
        relevance: 85,
        control_id: 'AC-002',
        timestamp: '2025-03-22T14:30:00Z'
      },
      {
        id: '5',
        type: 'Log',
        filename: 'AWS_CloudTrail_Prod_Jan2025.json',
        preview: '"eventName": "AuthorizeSecurityGroupIngress", "userIdentity": { "type": "IAMUser", "userName": "dev_ops" }, "sourceIPAddress": "0.0.0.0/0"',
        relevance: 78,
        control_id: 'SC-007',
        timestamp: '2025-01-05T03:12:44Z'
      }
    ];
    return mockResults;
  },

  generatePack: async (query: string, range: any): Promise<GeneratedPack> => {
    await delay(2000);
    return {
      pack_id: `PACK-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      evidence_count: Math.floor(Math.random() * 50) + 10,
      pack_hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      file_path: '/tmp/packs/assurance_pack.zip',
      download_url: '#',
      timestamp: new Date().toISOString()
    };
  }
};