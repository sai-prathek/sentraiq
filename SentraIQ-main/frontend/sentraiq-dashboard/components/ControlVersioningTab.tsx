import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Clock, 
  FileCheck, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  AlertCircle,
  History,
  Package,
  Code,
  Eye,
  Edit3,
  Save,
  X,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ControlVersion {
  version: string;
  created_at: string;
  created_by: string;
  description: string;
  logic: string;
  assessment_questions: string[];
  evidence_types: string[];
  is_active: boolean;
  used_in_packs: string[];
}

interface Control {
  control_id: string;
  name: string;
  description: string;
  type: 'mandatory' | 'advisory';
  frameworks: string[];
  current_version: string;
  versions: ControlVersion[];
  expanded?: boolean;
}

interface Framework {
  id: string;
  name: string;
  description: string;
}

interface ControlVersioningTabProps {
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const FRAMEWORK_OPTIONS: Framework[] = [
  {
    id: 'SWIFT_CSP',
    name: 'SWIFT CSP',
    description: 'SWIFT Customer Security Programme'
  },
  {
    id: 'SOC2',
    name: 'SOC 2',
    description: 'Service Organization Control 2'
  },
  {
    id: 'ISO27001_2022',
    name: 'ISO/IEC 27001:2022',
    description: 'Information Security Management System (ISMS)'
  },
  {
    id: 'PCI_DSS',
    name: 'PCI DSS v4.0',
    description: 'Payment Card Industry Data Security Standard'
  }
];

// Mock control data with versioning - matches ObjectiveSelector structure
const getAllControls = (): Control[] => {
  return [
    // SWIFT CSP Controls
    {
      control_id: 'SWIFT-1.1',
      name: 'Restrict Internet Access',
      description: 'Restrict logical access to the SWIFT environment to internet-facing entry points',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP'],
      current_version: 'v1.2',
      versions: [
        {
          version: 'v1.2',
          created_at: '2024-10-20T14:15:00Z',
          created_by: 'Network Security Team',
          description: 'Added requirement for DDoS protection',
          logic: 'Internet access to SWIFT environment must be restricted to designated entry points. DDoS protection must be enabled.',
          assessment_questions: [
            'Is internet access to SWIFT environment restricted?',
            'Are there documented network segmentation controls?',
            'Is DDoS protection enabled?',
            'Are firewall rules reviewed quarterly?'
          ],
          evidence_types: ['network_logs', 'firewall_configs', 'network_diagrams', 'ddos_protection_logs'],
          is_active: true,
          used_in_packs: ['PACK-20241025-150000']
        },
        {
          version: 'v1.1',
          created_at: '2024-06-10T11:00:00Z',
          created_by: 'Security Team',
          description: 'Clarified firewall review requirements',
          logic: 'Internet access to SWIFT environment must be restricted to designated entry points. Firewall rules must be reviewed quarterly.',
          assessment_questions: [
            'Is internet access to SWIFT environment restricted?',
            'Are there documented network segmentation controls?',
            'Are firewall rules reviewed quarterly?'
          ],
          evidence_types: ['network_logs', 'firewall_configs', 'network_diagrams'],
          is_active: false,
          used_in_packs: ['PACK-20240615-120000', 'PACK-20240720-140000', 'PACK-20240810-100000']
        },
        {
          version: 'v1.0',
          created_at: '2024-01-10T09:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Internet access to SWIFT environment must be restricted.',
          assessment_questions: [
            'Is internet access to SWIFT environment restricted?',
            'Are there documented network segmentation controls?'
          ],
          evidence_types: ['network_logs', 'firewall_configs'],
          is_active: false,
          used_in_packs: ['PACK-20240115-100000']
        }
      ]
    },
    {
      control_id: 'SWIFT-1.2',
      name: 'Segregate Critical Systems',
      description: 'Segregate critical systems from general IT environment',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-01-15T09:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Critical SWIFT systems must be segregated from general IT environment.',
          assessment_questions: [
            'Are critical SWIFT systems segregated from general IT?',
            'Is network segmentation documented and tested?'
          ],
          evidence_types: ['network_diagrams', 'access_logs'],
          is_active: true,
          used_in_packs: ['PACK-20240120-100000']
        }
      ]
    },
    {
      control_id: 'SWIFT-2.1',
      name: 'Password Policy',
      description: 'Enforce strong password policy for operator accounts (min 12 chars, complexity)',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP', 'SOC2', 'ISO27001_2022', 'PCI_DSS'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-02-01T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Password policy must enforce minimum 12 characters with complexity requirements.',
          assessment_questions: [
            'Is password policy enforced (min 12 chars, complexity)?',
            'Are passwords changed every 90 days?'
          ],
          evidence_types: ['policy_documents', 'configurations'],
          is_active: true,
          used_in_packs: ['PACK-20240210-110000']
        }
      ]
    },
    {
      control_id: 'SWIFT-2.7',
      name: 'Vulnerability Scanning',
      description: 'Perform vulnerability scanning of SWIFT-related infrastructure quarterly',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP', 'ISO27001_2022', 'PCI_DSS'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-03-01T09:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Vulnerability scans must be performed quarterly on SWIFT-related infrastructure.',
          assessment_questions: [
            'Are vulnerability scans performed quarterly?',
            'Are critical vulnerabilities remediated within 30 days?'
          ],
          evidence_types: ['scan_reports', 'vulnerability_logs'],
          is_active: true,
          used_in_packs: ['PACK-20240315-120000']
        }
      ]
    },
    {
      control_id: 'SWIFT-2.8',
      name: 'Multi-Factor Authentication',
      description: 'Enforce MFA for all operator accounts',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP', 'SOC2', 'ISO27001_2022', 'PCI_DSS'],
      current_version: 'v2.1',
      versions: [
        {
          version: 'v2.1',
          created_at: '2024-11-15T10:30:00Z',
          created_by: 'Security Team',
          description: 'Updated to require hardware tokens in addition to SMS',
          logic: 'MFA must be enforced for all SWIFT operator accounts. Hardware tokens are mandatory for privileged access.',
          assessment_questions: [
            'Is MFA enabled for all operator accounts?',
            'Are hardware tokens issued to privileged operators?',
            'Is MFA bypass logged and reviewed?'
          ],
          evidence_types: ['mfa_logs', 'token_inventory', 'access_reviews'],
          is_active: true,
          used_in_packs: ['PACK-20241115-103045', 'PACK-20241120-140230']
        },
        {
          version: 'v2.0',
          created_at: '2024-09-01T08:00:00Z',
          created_by: 'Compliance Team',
          description: 'Expanded MFA requirements to include break-glass accounts',
          logic: 'MFA must be enforced for all SWIFT operator accounts, including break-glass emergency accounts.',
          assessment_questions: [
            'Is MFA enabled for all operator accounts?',
            'Are break-glass accounts included in MFA policy?',
            'Is MFA bypass logged and reviewed?'
          ],
          evidence_types: ['mfa_logs', 'access_reviews'],
          is_active: false,
          used_in_packs: ['PACK-20240915-091200', 'PACK-20241001-120000']
        },
        {
          version: 'v1.0',
          created_at: '2024-01-15T09:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'MFA must be enforced for all SWIFT operator accounts.',
          assessment_questions: [
            'Is MFA enabled for all operator accounts?',
            'Is MFA bypass logged?'
          ],
          evidence_types: ['mfa_logs'],
          is_active: false,
          used_in_packs: ['PACK-20240120-100000', 'PACK-20240215-110000', 'PACK-20240310-130000']
        }
      ]
    },
    {
      control_id: 'SWIFT-3.1',
      name: 'Audit Logging',
      description: 'Maintain comprehensive audit logs of SWIFT-related activities',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP', 'SOC2', 'ISO27001_2022', 'PCI_DSS'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-01-20T09:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Comprehensive audit logs must be maintained for all SWIFT-related activities.',
          assessment_questions: [
            'Are audit logs maintained for all SWIFT activities?',
            'Are logs retained for at least 1 year?'
          ],
          evidence_types: ['audit_logs', 'log_reviews'],
          is_active: true,
          used_in_packs: ['PACK-20240125-100000']
        }
      ]
    },
    // SOC 2 Controls
    {
      control_id: 'SOC2-CC6.1',
      name: 'Logical Access Controls',
      description: 'Implement logical access controls to restrict access to systems and data',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022', 'PCI_DSS'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-08-01T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Logical access controls must be implemented to restrict access to systems and data based on job function.',
          assessment_questions: [
            'Are access controls implemented based on job function?',
            'Is access reviewed quarterly?',
            'Are access violations logged and monitored?'
          ],
          evidence_types: ['access_logs', 'user_profiles', 'access_reviews'],
          is_active: true,
          used_in_packs: ['PACK-20240815-110000', 'PACK-20240910-130000']
        }
      ]
    },
    {
      control_id: 'SOC2-CC6.2',
      name: 'Multi-Factor Authentication (SOC2)',
      description: 'Require MFA for privileged access',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022', 'PCI_DSS'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-08-05T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'MFA must be required for all privileged access.',
          assessment_questions: [
            'Is MFA required for privileged access?',
            'Are MFA exceptions logged and reviewed?'
          ],
          evidence_types: ['mfa_logs', 'access_reviews'],
          is_active: true,
          used_in_packs: ['PACK-20240820-120000']
        }
      ]
    },
    {
      control_id: 'SOC2-CC7.1',
      name: 'System Monitoring',
      description: 'Monitor system activities and detect anomalies',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022', 'PCI_DSS'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-08-10T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'System activities must be monitored continuously to detect anomalies.',
          assessment_questions: [
            'Is system monitoring implemented?',
            'Are anomalies detected and responded to?'
          ],
          evidence_types: ['monitoring_logs', 'incident_reports'],
          is_active: true,
          used_in_packs: ['PACK-20240825-130000']
        }
      ]
    },
    {
      control_id: 'SOC2-CC7.2',
      name: 'Incident Response',
      description: 'Establish and maintain incident response procedures',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022', 'PCI_DSS'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-08-15T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Incident response procedures must be established and maintained.',
          assessment_questions: [
            'Are incident response procedures documented?',
            'Are incidents tracked and resolved?'
          ],
          evidence_types: ['incident_reports', 'response_procedures'],
          is_active: true,
          used_in_packs: ['PACK-20240830-140000']
        }
      ]
    },
    {
      control_id: 'SOC2-CC8.1',
      name: 'Change Management',
      description: 'Manage changes to systems and processes with approval and testing',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-08-20T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Changes to systems and processes must be managed with approval and testing.',
          assessment_questions: [
            'Are changes approved before implementation?',
            'Are changes tested before deployment?'
          ],
          evidence_types: ['change_requests', 'test_results'],
          is_active: true,
          used_in_packs: ['PACK-20240905-150000']
        }
      ]
    },
    {
      control_id: 'SOC2-CC1.1',
      name: 'Control Environment',
      description: 'Establish and maintain a control environment',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-08-25T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'A control environment must be established and maintained.',
          assessment_questions: [
            'Is a control environment established?',
            'Is it reviewed and updated regularly?'
          ],
          evidence_types: ['policy_documents', 'review_reports'],
          is_active: true,
          used_in_packs: ['PACK-20240910-160000']
        }
      ]
    },
    {
      control_id: 'SOC2-CC2.1',
      name: 'Communication and Information',
      description: 'Communicate objectives and responsibilities to internal and external parties',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-08-30T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Objectives and responsibilities must be communicated to internal and external parties.',
          assessment_questions: [
            'Are objectives communicated to stakeholders?',
            'Are responsibilities clearly defined?'
          ],
          evidence_types: ['communication_records', 'policy_documents'],
          is_active: true,
          used_in_packs: ['PACK-20240915-170000']
        }
      ]
    },
    // ISO/IEC 27001:2022 Controls
    {
      control_id: 'ISO-A.5.1',
      name: 'Policies for Information Security',
      description: 'Define and review information security policies',
      type: 'mandatory',
      frameworks: ['ISO27001_2022'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-09-01T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Information security policies must be defined and reviewed regularly.',
          assessment_questions: [
            'Are information security policies defined?',
            'Are they reviewed annually?'
          ],
          evidence_types: ['policy_documents', 'review_records'],
          is_active: true,
          used_in_packs: ['PACK-20240920-180000']
        }
      ]
    },
    {
      control_id: 'ISO-A.5.10',
      name: 'Acceptable Use of Information',
      description: 'Define rules for acceptable use of information and assets',
      type: 'mandatory',
      frameworks: ['ISO27001_2022'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-09-05T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Rules for acceptable use of information and assets must be defined.',
          assessment_questions: [
            'Are acceptable use rules defined?',
            'Are they communicated to users?'
          ],
          evidence_types: ['policy_documents', 'training_records'],
          is_active: true,
          used_in_packs: ['PACK-20240925-190000']
        }
      ]
    },
    {
      control_id: 'ISO-A.8.2',
      name: 'User Access Management',
      description: 'Manage user access provisioning, modification, and deprovisioning',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'SOC2', 'PCI_DSS'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-09-10T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'User access must be managed through proper provisioning, modification, and deprovisioning processes.',
          assessment_questions: [
            'Is user access managed through proper processes?',
            'Are access changes approved?'
          ],
          evidence_types: ['access_requests', 'approval_records'],
          is_active: true,
          used_in_packs: ['PACK-20240930-200000']
        }
      ]
    },
    {
      control_id: 'ISO-A.8.3',
      name: 'Privileged Access Rights',
      description: 'Manage and restrict privileged access rights',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'SOC2', 'PCI_DSS'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-09-15T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Privileged access rights must be managed and restricted.',
          assessment_questions: [
            'Are privileged access rights managed?',
            'Are they reviewed regularly?'
          ],
          evidence_types: ['privileged_access_logs', 'review_records'],
          is_active: true,
          used_in_packs: ['PACK-20241005-210000']
        }
      ]
    },
    {
      control_id: 'ISO-A.12.6',
      name: 'Technical Vulnerability Management',
      description: 'Manage technical vulnerabilities in systems',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'PCI_DSS'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-09-20T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Technical vulnerabilities must be managed through identification, assessment, and remediation.',
          assessment_questions: [
            'Are vulnerabilities identified and assessed?',
            'Are they remediated in a timely manner?'
          ],
          evidence_types: ['vulnerability_reports', 'remediation_records'],
          is_active: true,
          used_in_packs: ['PACK-20241010-220000']
        }
      ]
    },
    // PCI DSS Controls
    {
      control_id: 'PCI-3.5.1',
      name: 'Protect Stored Cardholder Data',
      description: 'Protect stored cardholder data using strong cryptography',
      type: 'mandatory',
      frameworks: ['PCI_DSS'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-10-01T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Stored cardholder data must be protected using strong cryptography.',
          assessment_questions: [
            'Is cardholder data encrypted at rest?',
            'Are encryption keys managed securely?'
          ],
          evidence_types: ['encryption_configs', 'key_management_logs'],
          is_active: true,
          used_in_packs: ['PACK-20241015-230000']
        }
      ]
    },
    {
      control_id: 'PCI-8.3.1',
      name: 'MFA for Remote Access',
      description: 'Require MFA for all remote network access',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'SOC2', 'ISO27001_2022'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-10-05T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'MFA must be required for all remote network access.',
          assessment_questions: [
            'Is MFA required for remote access?',
            'Are remote access attempts logged?'
          ],
          evidence_types: ['mfa_logs', 'remote_access_logs'],
          is_active: true,
          used_in_packs: ['PACK-20241020-240000']
        }
      ]
    },
    {
      control_id: 'PCI-10.2.1',
      name: 'Audit Logging',
      description: 'Implement automated audit trails for all system components',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'SOC2', 'ISO27001_2022'],
      current_version: 'v1.0',
      versions: [
        {
          version: 'v1.0',
          created_at: '2024-10-10T10:00:00Z',
          created_by: 'Initial Setup',
          description: 'Initial control definition',
          logic: 'Automated audit trails must be implemented for all system components.',
          assessment_questions: [
            'Are audit trails implemented?',
            'Are they reviewed regularly?'
          ],
          evidence_types: ['audit_logs', 'review_records'],
          is_active: true,
          used_in_packs: ['PACK-20241025-250000']
        }
      ]
    }
  ];
};

const ControlVersioningTab: React.FC<ControlVersioningTabProps> = ({ onToast }) => {
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [controls, setControls] = useState<Control[]>([]);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [newVersionData, setNewVersionData] = useState({
    description: '',
    logic: '',
    assessment_questions: [''],
    evidence_types: ['']
  });

  useEffect(() => {
    setControls(getAllControls());
  }, []);

  const handleFrameworkSelect = (framework: Framework) => {
    setSelectedFramework(framework);
  };

  const handleBackToFrameworks = () => {
    setSelectedFramework(null);
  };

  const getFrameworkControls = (frameworkId: string): Control[] => {
    return controls.filter(c => c.frameworks.includes(frameworkId));
  };

  const toggleControl = (controlId: string) => {
    setControls(prev => 
      prev.map(control => 
        control.control_id === controlId 
          ? { ...control, expanded: !control.expanded }
          : control
      )
    );
  };

  const handleCreateVersion = (control: Control) => {
    setSelectedControl(control);
    setNewVersionData({
      description: '',
      logic: control.versions.find(v => v.is_active)?.logic || '',
      assessment_questions: control.versions.find(v => v.is_active)?.assessment_questions || [''],
      evidence_types: control.versions.find(v => v.is_active)?.evidence_types || ['']
    });
    setShowCreateVersion(true);
  };

  const handleSaveVersion = async () => {
    if (!selectedControl) return;

    const newVersion: ControlVersion = {
      version: `v${(parseFloat(selectedControl.current_version.substring(1)) + 0.1).toFixed(1)}`,
      created_at: new Date().toISOString(),
      created_by: 'Current User',
      description: newVersionData.description,
      logic: newVersionData.logic,
      assessment_questions: newVersionData.assessment_questions.filter(q => q.trim() !== ''),
      evidence_types: newVersionData.evidence_types.filter(e => e.trim() !== ''),
      is_active: true,
      used_in_packs: []
    };

    setControls(prev => 
      prev.map(control => 
        control.control_id === selectedControl.control_id
          ? {
              ...control,
              versions: control.versions.map(v => ({ ...v, is_active: false })).concat(newVersion),
              current_version: newVersion.version
            }
          : control
      )
    );

    setShowCreateVersion(false);
    setSelectedControl(null);
    onToast(`New version ${newVersion.version} created for ${selectedControl.name}`, 'success');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const frameworkControls = selectedFramework ? getFrameworkControls(selectedFramework.id) : [];
  const mandatoryControls = frameworkControls.filter(c => c.type === 'mandatory');
  const advisoryControls = frameworkControls.filter(c => c.type === 'advisory');

  return (
    <div className="space-y-6">
      {/* Framework Selection View */}
      {!selectedFramework && (
        <>
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-blue-900" />
              Control Versioning
            </h2>
            <p className="text-sm text-gray-600">
              Control logic is treated as versioned artifacts. Each control definition is versioned, reviewable, and testable. 
              When logic changes, a new version is created, and historical assurance views continue to evaluate against the logic that was active at the time.
            </p>
          </div>

          {/* Framework Selection - Same UI as Step 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FRAMEWORK_OPTIONS.map((framework) => {
              return (
                <motion.button
                  key={framework.id}
                  onClick={() => handleFrameworkSelect(framework)}
                  className="p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-gray-50 transition-all text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{framework.name}</h3>
                      <p className="text-sm text-gray-600">{framework.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </>
      )}

      {/* Controls View for Selected Framework */}
      {selectedFramework && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Back Button and Header */}
          <div>
            <button
              onClick={handleBackToFrameworks}
              className="flex items-center gap-2 text-blue-900 font-medium hover:text-blue-700 mb-4"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Frameworks
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <GitBranch className="w-6 h-6 text-blue-900" />
                {selectedFramework.name} - Control Versioning
              </h2>
              <p className="text-sm text-gray-600">
                {selectedFramework.description} - Manage control versions and view version history
              </p>
            </div>
          </div>

          {/* Controls Display */}
          <div className="space-y-4">
            {/* Mandatory Controls */}
            {mandatoryControls.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Mandatory Controls ({mandatoryControls.length})
                </h4>
                <div className="space-y-2">
                  {mandatoryControls.map(control => (
                    <ControlCard
                      key={control.control_id}
                      control={control}
                      onToggle={() => toggleControl(control.control_id)}
                      onCreateVersion={() => handleCreateVersion(control)}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Advisory Controls */}
            {advisoryControls.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-500" />
                  Advisory Controls ({advisoryControls.length})
                </h4>
                <div className="space-y-2">
                  {advisoryControls.map(control => (
                    <ControlCard
                      key={control.control_id}
                      control={control}
                      onToggle={() => toggleControl(control.control_id)}
                      onCreateVersion={() => handleCreateVersion(control)}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Create New Version Modal */}
      {showCreateVersion && selectedControl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Create New Version</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedControl.control_id} - {selectedControl.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateVersion(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newVersionData.description}
                  onChange={(e) => setNewVersionData({ ...newVersionData, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                  placeholder="Describe what changed in this version..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Control Logic <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newVersionData.logic}
                  onChange={(e) => setNewVersionData({ ...newVersionData, logic: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none font-mono"
                  placeholder="Define the control logic..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compliance Assessment Questions
                </label>
                {newVersionData.assessment_questions.map((q, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => {
                        const newQuestions = [...newVersionData.assessment_questions];
                        newQuestions[idx] = e.target.value;
                        setNewVersionData({ ...newVersionData, assessment_questions: newQuestions });
                      }}
                      className="flex-1 rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                      placeholder="Assessment question..."
                    />
                    {newVersionData.assessment_questions.length > 1 && (
                      <button
                        onClick={() => {
                          const newQuestions = newVersionData.assessment_questions.filter((_, i) => i !== idx);
                          setNewVersionData({ ...newVersionData, assessment_questions: newQuestions });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setNewVersionData({ 
                    ...newVersionData, 
                    assessment_questions: [...newVersionData.assessment_questions, ''] 
                  })}
                  className="text-sm text-blue-900 hover:text-blue-800 font-medium"
                >
                  + Add Question
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence Types
                </label>
                {newVersionData.evidence_types.map((et, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={et}
                      onChange={(e) => {
                        const newTypes = [...newVersionData.evidence_types];
                        newTypes[idx] = e.target.value;
                        setNewVersionData({ ...newVersionData, evidence_types: newTypes });
                      }}
                      className="flex-1 rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                      placeholder="Evidence type..."
                    />
                    {newVersionData.evidence_types.length > 1 && (
                      <button
                        onClick={() => {
                          const newTypes = newVersionData.evidence_types.filter((_, i) => i !== idx);
                          setNewVersionData({ ...newVersionData, evidence_types: newTypes });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setNewVersionData({ 
                    ...newVersionData, 
                    evidence_types: [...newVersionData.evidence_types, ''] 
                  })}
                  className="text-sm text-blue-900 hover:text-blue-800 font-medium"
                >
                  + Add Evidence Type
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateVersion(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVersion}
                disabled={!newVersionData.description.trim() || !newVersionData.logic.trim()}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Create Version
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Control Card Component
interface ControlCardProps {
  control: Control;
  onToggle: () => void;
  onCreateVersion: () => void;
  formatDate: (date: string) => string;
}

const ControlCard: React.FC<ControlCardProps> = ({ control, onToggle, onCreateVersion, formatDate }) => {
  const isAdvisory = control.type === 'advisory';
  return (
    <div className={`rounded-lg border p-3 opacity-75 ${
      isAdvisory
        ? 'bg-gray-50 border-gray-300' 
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium ${isAdvisory ? 'text-gray-600' : 'text-gray-900'}`}>{control.control_id}: {control.name}</span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
              {control.current_version}
            </span>
          </div>
          <p className={`text-sm mb-2 ${isAdvisory ? 'text-gray-500' : 'text-gray-600'}`}>{control.description}</p>
          <div className={`flex items-center gap-4 text-xs ${isAdvisory ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className="flex items-center gap-1">
              <History className="w-3 h-3" />
              {control.versions.length} version{control.versions.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              Used in {control.versions.reduce((sum, v) => sum + v.used_in_packs.length, 0)} pack{control.versions.reduce((sum, v) => sum + v.used_in_packs.length, 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateVersion}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            New Version
          </button>
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {control.expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Version History */}
      <AnimatePresence>
        {control.expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-gray-300 space-y-2"
          >
            {control.versions.map((version) => (
              <div
                key={version.version}
                className={`p-3 rounded border ${
                  version.is_active
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      version.is_active
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-400 text-white'
                    }`}>
                      {version.version}
                    </span>
                    {version.is_active && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDate(version.created_at)} by {version.created_by}
                    </span>
                  </div>
                </div>
                {version.description && (
                  <p className="text-xs text-gray-700 mb-2">{version.description}</p>
                )}
                <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded border border-gray-200 mb-2">
                  {version.logic}
                </div>
                {version.used_in_packs.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Used in: {version.used_in_packs.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      Historical assurance views continue to evaluate against this version logic
                    </p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ControlVersioningTab;
