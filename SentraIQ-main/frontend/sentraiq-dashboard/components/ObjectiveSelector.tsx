import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Server, Network, Shield, CheckCircle, AlertCircle, ArrowRight, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface InfrastructureType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  version?: string;
}

export interface Control {
  control_id: string;
  name: string;
  description: string;
  type: 'mandatory' | 'advisory';
  frameworks: string[];
}

export interface ObjectiveSelection {
  infrastructure: InfrastructureType | null;
  frameworks: Framework[];
  controls: Control[];
  sharedControls: Control[];
}

interface ObjectiveSelectorProps {
  onSelectionComplete: (selection: ObjectiveSelection) => void;
}

// Framework versions mapping
const FRAMEWORK_VERSIONS: Record<string, string[]> = {
  'SWIFT CSP': [
    'CSCF v2026 (Applicable starting 2026)',
    'CSCF v2025 (Valid for 2025 attestation)',
    'CSCF v2024 (Valid for 2024 attestation)'
  ],
  'SOC 2': [
    '2017 Trust Services Criteria (with 2022 Revised Points of Focus)'
  ],
  'ISO/IEC 27001': [
    'ISO/IEC 27001:2022',
    'ISO/IEC 27001:2013 (Valid until transition deadline: Oct 31, 2025)'
  ],
  'PCI DSS': [
    'v4.0.1 (Released June 2024)',
    'v4.0 (Released March 2022)',
    'v3.2.1 (Retired March 31, 2024)'
  ]
};

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
    name: 'ISO/IEC 27001',
    description: 'Information Security Management System (ISMS)'
  },
  {
    id: 'PCI_DSS',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard'
  }
];

// Mock control data - in production, this would come from the API
const getControlsForInfrastructure = (infraId: string, frameworkIds: string[]): {
  controls: Control[];
  sharedControls: Control[];
} => {
  // Comprehensive controls for all frameworks
  const allControls: Control[] = [
    // SWIFT CSP Controls
    {
      control_id: 'SWIFT-1.1',
      name: 'Restrict Internet Access',
      description: 'Restrict logical access to the SWIFT environment to internet-facing entry points',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP']
    },
    {
      control_id: 'SWIFT-1.2',
      name: 'Segregate Critical Systems',
      description: 'Segregate critical systems from general IT environment',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP']
    },
    {
      control_id: 'SWIFT-2.1',
      name: 'Password Policy',
      description: 'Enforce strong password policy for operator accounts (min 12 chars, complexity)',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP', 'SOC2', 'ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'SWIFT-2.7',
      name: 'Vulnerability Scanning',
      description: 'Perform vulnerability scanning of SWIFT-related infrastructure quarterly',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP', 'ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'SWIFT-2.8',
      name: 'Multi-Factor Authentication',
      description: 'Enforce MFA for all operator accounts',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP', 'SOC2', 'ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'SWIFT-3.1',
      name: 'Audit Logging',
      description: 'Maintain comprehensive audit logs of SWIFT-related activities',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP', 'SOC2', 'ISO27001_2022', 'PCI_DSS']
    },
    // SOC 2 Controls
    {
      control_id: 'SOC2-CC6.1',
      name: 'Logical Access Controls',
      description: 'Implement logical access controls to restrict access to systems and data',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'SOC2-CC6.2',
      name: 'Multi-Factor Authentication (SOC2)',
      description: 'Require MFA for privileged access',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'SOC2-CC7.1',
      name: 'System Monitoring',
      description: 'Monitor system activities and detect anomalies',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'SOC2-CC7.2',
      name: 'Incident Response',
      description: 'Establish and maintain incident response procedures',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'SOC2-CC8.1',
      name: 'Change Management',
      description: 'Manage changes to systems and processes with approval and testing',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022']
    },
    {
      control_id: 'SOC2-CC1.1',
      name: 'Control Environment',
      description: 'Establish and maintain a control environment',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022']
    },
    {
      control_id: 'SOC2-CC2.1',
      name: 'Communication and Information',
      description: 'Communicate objectives and responsibilities to internal and external parties',
      type: 'mandatory',
      frameworks: ['SOC2', 'ISO27001_2022']
    },
    // ISO/IEC 27001:2022 Controls
    {
      control_id: 'ISO-A.5.1',
      name: 'Policies for Information Security',
      description: 'Define and review information security policies',
      type: 'mandatory',
      frameworks: ['ISO27001_2022']
    },
    {
      control_id: 'ISO-A.5.10',
      name: 'Acceptable Use of Information',
      description: 'Define rules for acceptable use of information and assets',
      type: 'mandatory',
      frameworks: ['ISO27001_2022']
    },
    {
      control_id: 'ISO-A.7.4',
      name: 'Physical Security Perimeters',
      description: 'Secure perimeters using physical security controls',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'ISO-A.8.2',
      name: 'User Access Management',
      description: 'Manage user access provisioning, modification, and deprovisioning',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'SOC2', 'PCI_DSS']
    },
    {
      control_id: 'ISO-A.8.3',
      name: 'Privileged Access Rights',
      description: 'Manage and restrict privileged access rights',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'SOC2', 'PCI_DSS']
    },
    {
      control_id: 'ISO-A.8.9',
      name: 'Configuration Management',
      description: 'Manage configuration of technical security controls',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'SOC2']
    },
    {
      control_id: 'ISO-A.8.10',
      name: 'Information Deletion',
      description: 'Delete information when no longer required',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'ISO-A.8.16',
      name: 'Monitoring Activities',
      description: 'Monitor systems to detect potential security events',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'SOC2', 'PCI_DSS']
    },
    {
      control_id: 'ISO-A.8.23',
      name: 'Data Leakage Prevention',
      description: 'Implement data leakage prevention measures',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'ISO-A.8.24',
      name: 'Use of Cryptography',
      description: 'Use cryptography to protect information confidentiality and integrity',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'ISO-A.8.28',
      name: 'Secure Coding',
      description: 'Apply secure coding principles in development lifecycle',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'ISO-A.9.4',
      name: 'Network Security',
      description: 'Protect network services and network traffic',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'ISO-A.12.6',
      name: 'Technical Vulnerability Management',
      description: 'Manage technical vulnerabilities in systems',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'PCI_DSS']
    },
    {
      control_id: 'ISO-A.12.7',
      name: 'Information Security Event Management',
      description: 'Manage information security events and incidents',
      type: 'mandatory',
      frameworks: ['ISO27001_2022', 'SOC2', 'PCI_DSS']
    },
    // PCI DSS v4.0 Controls
    {
      control_id: 'PCI-1.2.1',
      name: 'Network Security Controls',
      description: 'Restrict inbound and outbound traffic to that which is necessary',
      type: 'mandatory',
      frameworks: ['PCI_DSS']
    },
    {
      control_id: 'PCI-2.2.1',
      name: 'System Configuration Standards',
      description: 'Develop configuration standards for system components',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'ISO27001_2022']
    },
    {
      control_id: 'PCI-3.5.1',
      name: 'Protect Stored Cardholder Data',
      description: 'Protect stored cardholder data using strong cryptography',
      type: 'mandatory',
      frameworks: ['PCI_DSS']
    },
    {
      control_id: 'PCI-4.2.1',
      name: 'Encrypt Transmission of Cardholder Data',
      description: 'Encrypt cardholder data sent across open, public networks',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'ISO27001_2022']
    },
    {
      control_id: 'PCI-5.2.1',
      name: 'Anti-Malware Protection',
      description: 'Deploy anti-malware software and keep it up to date',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'ISO27001_2022']
    },
    {
      control_id: 'PCI-6.2.1',
      name: 'Secure System Development',
      description: 'Develop secure systems and applications',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'ISO27001_2022']
    },
    {
      control_id: 'PCI-7.2.1',
      name: 'Restrict Access to Cardholder Data',
      description: 'Restrict access to cardholder data to only those who need it',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'SOC2', 'ISO27001_2022']
    },
    {
      control_id: 'PCI-8.2.1',
      name: 'Unique User Identification',
      description: 'Assign unique user IDs to each person with access',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'SOC2', 'ISO27001_2022']
    },
    {
      control_id: 'PCI-8.3.1',
      name: 'MFA for Remote Access',
      description: 'Require MFA for all remote network access',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'SOC2', 'ISO27001_2022']
    },
    {
      control_id: 'PCI-9.4.1',
      name: 'Physical Access Controls',
      description: 'Control physical access to cardholder data environment',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'ISO27001_2022']
    },
    {
      control_id: 'PCI-10.2.1',
      name: 'Audit Logging',
      description: 'Implement automated audit trails for all system components',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'SOC2', 'ISO27001_2022']
    },
    {
      control_id: 'PCI-11.3.1',
      name: 'Penetration Testing',
      description: 'Perform external and internal penetration testing annually',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'ISO27001_2022']
    },
    {
      control_id: 'PCI-12.3.1',
      name: 'Security Policy',
      description: 'Maintain information security policy and procedures',
      type: 'mandatory',
      frameworks: ['PCI_DSS', 'ISO27001_2022', 'SOC2']
    }
  ];
  
  // Filter controls by selected frameworks
  const relevantControls = allControls.filter(c => 
    c.frameworks.some(f => frameworkIds.includes(f))
  );
  
  // Find shared controls (appear in multiple selected frameworks)
  // A control is shared if it applies to 2+ of the selected frameworks
  const sharedControls = relevantControls.filter(c => {
    if (frameworkIds.length < 2) return false;
    const matchingFrameworks = c.frameworks.filter(f => frameworkIds.includes(f));
    return matchingFrameworks.length >= 2;
  });
  
  return {
    controls: relevantControls,
    sharedControls
  };
};

const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({ onSelectionComplete }) => {
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(dropdownRefs.current).forEach(([frameworkId, ref]) => {
        if (ref && !ref.contains(event.target as Node) && openDropdown === frameworkId) {
          setOpenDropdown(null);
        }
      });
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdown]);

  const handleFrameworkSelect = (framework: Framework) => {
    // If clicking the same framework, deselect it
    if (selectedFramework?.id === framework.id) {
      setSelectedFramework(null);
      setSelectedVersion(prev => {
        const newVersions = { ...prev };
        delete newVersions[framework.id];
        return newVersions;
      });
    } else {
      setSelectedFramework(framework);
      // Auto-select first version if only one available
      const versions = FRAMEWORK_VERSIONS[framework.name] || [];
      if (versions.length === 1 && !selectedVersion[framework.id]) {
        setSelectedVersion(prev => ({
          ...prev,
          [framework.id]: versions[0]
        }));
      }
    }
  };

  const handleVersionChange = (frameworkId: string, version: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent framework card click
    setSelectedVersion(prev => ({
      ...prev,
      [frameworkId]: version
    }));
    setOpenDropdown(null);
  };

  const toggleDropdown = (frameworkId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent framework card click
    setOpenDropdown(openDropdown === frameworkId ? null : frameworkId);
  };

  const handleContinue = () => {
    if (!selectedFramework) return;
    
    const version = selectedVersion[selectedFramework.id];
    if (!version) return;
    
    const frameworkWithVersion: Framework = {
      ...selectedFramework,
      version: version
    };
    
    const { controls, sharedControls } = getControlsForInfrastructure(
      'default',
      [selectedFramework.id]
    );
    
    onSelectionComplete({
      infrastructure: null,
      frameworks: [frameworkWithVersion],
      controls,
      sharedControls
    });
  };

  const { controls, sharedControls } = selectedFramework
    ? getControlsForInfrastructure('default', [selectedFramework.id])
    : { controls: [], sharedControls: [] };

  const mandatoryControls = controls.filter(c => c.type === 'mandatory');
  const advisoryControls = controls.filter(c => c.type === 'advisory');

  const canContinue = selectedFramework && selectedVersion[selectedFramework.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {FRAMEWORK_OPTIONS.map((framework) => {
          const isSelected = selectedFramework?.id === framework.id;
          const availableVersions = FRAMEWORK_VERSIONS[framework.name] || [];
          const currentVersion = selectedVersion[framework.id];
          const isDropdownOpen = openDropdown === framework.id;
          
          return (
            <div
              key={framework.id}
              className={`
                relative p-6 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-blue-900 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              <button
                onClick={() => handleFrameworkSelect(framework)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{framework.name}</h3>
                    <p className="text-sm text-gray-600">{framework.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-blue-900 flex-shrink-0 ml-2" />
                  )}
                </div>
              </button>
              
              {/* Version Dropdown */}
              {isSelected && availableVersions.length > 0 && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Select Version
                  </label>
                  <div 
                    className="relative"
                    ref={(el) => {
                      dropdownRefs.current[framework.id] = el;
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => toggleDropdown(framework.id, e)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                    >
                      <span className={currentVersion ? 'text-gray-900' : 'text-gray-500'}>
                        {currentVersion || 'Select version...'}
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {availableVersions.map((version) => (
                          <button
                            key={version}
                            type="button"
                            onClick={(e) => handleVersionChange(framework.id, version, e)}
                            className={`
                              w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors
                              ${currentVersion === version ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'}
                            `}
                          >
                            {version}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      {canContinue && (
        <div className="mt-6 flex justify-end">
          <motion.button
            onClick={handleContinue}
            className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue to Pack Generation
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default ObjectiveSelector;
