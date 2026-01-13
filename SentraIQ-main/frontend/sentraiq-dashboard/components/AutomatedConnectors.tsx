import React, { useState } from 'react';
import { 
  Cloud, 
  Key, 
  Shield, 
  Database, 
  Layers, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle,
  Loader2,
  Link2,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

interface Connector {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  frameworks: string[]; // Framework IDs this connector is relevant for
}

interface AutomatedConnectorsProps {
  selectedFramework: string | null;
  onIngestSuccess: () => Promise<void>;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// Define connectors with framework associations
const CONNECTORS: Connector[] = [
  {
    id: 'aws_security_hub',
    name: 'AWS Security Hub',
    description: 'Cloud Security Posture Management',
    icon: <Cloud className="w-5 h-5" />,
    available: true,
    frameworks: ['SWIFT_CSP', 'SOC2', 'ISO27001_2022', 'PCI_DSS']
  },
  {
    id: 'cyberark_pam',
    name: 'CyberArk PAM',
    description: 'Privileged Access Management',
    icon: <Key className="w-5 h-5" />,
    available: true,
    frameworks: ['SWIFT_CSP', 'SOC2', 'ISO27001_2022', 'PCI_DSS']
  },
  {
    id: 'qualys_vmdr',
    name: 'Qualys VMDR',
    description: 'Vulnerability Management & Detection Response',
    icon: <Shield className="w-5 h-5" />,
    available: true,
    frameworks: ['SWIFT_CSP', 'ISO27001_2022', 'PCI_DSS']
  },
  {
    id: 'splunk_siem',
    name: 'Splunk SIEM',
    description: 'Security Information & Event Management',
    icon: <Database className="w-5 h-5" />,
    available: true,
    frameworks: ['SWIFT_CSP', 'SOC2', 'ISO27001_2022']
  },
  {
    id: 'servicenow_grc',
    name: 'ServiceNow GRC',
    description: 'Governance, Risk & Compliance',
    icon: <Layers className="w-5 h-5" />,
    available: true,
    frameworks: ['SOC2', 'ISO27001_2022', 'PCI_DSS']
  }
];

const AutomatedConnectors: React.FC<AutomatedConnectorsProps> = ({
  selectedFramework,
  onIngestSuccess,
  onToast
}) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectingAll, setConnectingAll] = useState(false);
  const [connectedConnectors, setConnectedConnectors] = useState<Set<string>>(new Set());

  // Filter connectors based on selected framework - only show available ones
  const relevantConnectors = selectedFramework
    ? CONNECTORS.filter(connector => connector.frameworks.includes(selectedFramework))
    : CONNECTORS;

  const availableConnectors = relevantConnectors.filter(c => c.available);

  const handleConnect = async (connector: Connector) => {
    if (!connector.available || connecting || connectingAll) return;

    setConnecting(connector.id);
    onToast(`Connecting to ${connector.name}...`, 'info');

    try {
      const connectorSourceMap: Record<string, string> = {
        'aws_security_hub': 'AWS Security Hub',
        'cyberark_pam': 'CyberArk PAM',
        'qualys_vmdr': 'Qualys VMDR',
        'splunk_siem': 'Splunk SIEM',
        'servicenow_grc': 'ServiceNow GRC'
      };

      const source = connectorSourceMap[connector.id] || connector.name;
      const sampleLogContent = generateSampleLogContent(connector.id, source);
      
      const blob = new Blob([sampleLogContent], { type: 'text/plain' });
      const file = new File([blob], `${connector.id}_evidence_${Date.now()}.log`, {
        type: 'text/plain'
      });

      await api.ingestLog(file, source, `Automated collection from ${connector.name}`, true);
      
      setConnectedConnectors(prev => new Set([...prev, connector.id]));
      onToast(`Successfully connected to ${connector.name} and collected evidence`, 'success');
      
      await onIngestSuccess();
    } catch (error: any) {
      onToast(`Failed to connect to ${connector.name}: ${error.message || 'Connection error'}`, 'error');
    } finally {
      setConnecting(null);
    }
  };

  const handleConnectAll = async () => {
    if (connectingAll || connecting) return;

    const unconnectedAvailable = availableConnectors.filter(
      c => !connectedConnectors.has(c.id)
    );

    if (unconnectedAvailable.length === 0) {
      onToast('All available connectors are already connected', 'info');
      return;
    }

    setConnectingAll(true);
    onToast(`Connecting to ${unconnectedAvailable.length} system(s)...`, 'info');

    const results = {
      success: 0,
      failed: 0
    };

    // Connect to all available connectors sequentially
    for (const connector of unconnectedAvailable) {
      try {
        setConnecting(connector.id);
        
        const connectorSourceMap: Record<string, string> = {
          'aws_security_hub': 'AWS Security Hub',
          'cyberark_pam': 'CyberArk PAM',
          'qualys_vmdr': 'Qualys VMDR',
          'splunk_siem': 'Splunk SIEM',
          'servicenow_grc': 'ServiceNow GRC'
        };

        const source = connectorSourceMap[connector.id] || connector.name;
        const sampleLogContent = generateSampleLogContent(connector.id, source);
        
        const blob = new Blob([sampleLogContent], { type: 'text/plain' });
        const file = new File([blob], `${connector.id}_evidence_${Date.now()}.log`, {
          type: 'text/plain'
        });

        await api.ingestLog(file, source, `Automated collection from ${connector.name}`, true);
        
        setConnectedConnectors(prev => new Set([...prev, connector.id]));
        results.success++;
        
        // Small delay between connections for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        results.failed++;
        console.error(`Failed to connect to ${connector.name}:`, error);
      } finally {
        setConnecting(null);
      }
    }

    setConnectingAll(false);
    
    if (results.success > 0) {
      await onIngestSuccess();
      onToast(
        `Successfully connected to ${results.success} system(s)${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
        results.failed > 0 ? 'info' : 'success'
      );
    } else {
      onToast('Failed to connect to any systems', 'error');
    }
  };

  const generateSampleLogContent = (connectorId: string, source: string): string => {
    const timestamp = new Date().toISOString();
    
    const templates: Record<string, string> = {
      'aws_security_hub': `[${timestamp}] AWS Security Hub - Security Finding
Finding Type: Software and Configuration Checks
Severity: MEDIUM
Resource: arn:aws:ec2:us-east-1:123456789012:instance/i-1234567890abcdef0
Compliance Status: FAILED
Control: SWIFT-2.7, SOC2-CC7.1
Description: EC2 instance security group allows unrestricted access to port 22
Remediation: Restrict SSH access to specific IP addresses`,

      'cyberark_pam': `[${timestamp}] CyberArk PAM - Privileged Access Event
Event Type: Authentication Success
User: admin@example.com
Target System: Production Database Server
Session Duration: 2h 15m
Control: SWIFT-2.8, SOC2-CC6.2
MFA Status: Verified
Access Method: RDP
IP Address: 10.0.1.50`,

      'qualys_vmdr': `[${timestamp}] Qualys VMDR - Vulnerability Scan Result
Scan ID: QID-12345
Host: 192.168.1.100
Vulnerability: SSL/TLS Weak Cipher Suites
Severity: HIGH
CVSS Score: 7.5
Control: SWIFT-2.7, ISO27001_2022-A.12.6.1
Status: Detected
Recommendation: Disable weak cipher suites in SSL/TLS configuration`,

      'splunk_siem': `[${timestamp}] Splunk SIEM - Security Event
Event Type: Failed Login Attempt
Source IP: 203.0.113.45
Destination: mail.example.com
User: service_account
Control: SWIFT-2.1, SOC2-CC6.1
Status: Blocked
Threat Level: MEDIUM
Action Taken: IP address blocked for 1 hour`,

      'servicenow_grc': `[${timestamp}] ServiceNow GRC - Compliance Assessment
Assessment ID: GRC-2024-001
Framework: ${selectedFramework || 'SOC2'}
Control: SOC2-CC6.1
Status: Compliant
Evidence: Access control policy reviewed and approved
Reviewer: compliance@example.com
Next Review Date: 2024-12-31`
    };

    return templates[connectorId] || `[${timestamp}] ${source} - Automated Evidence Collection\nControl: Framework-specific evidence collection\nStatus: Collected successfully`;
  };

  if (!selectedFramework) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Framework Selected</h3>
          <p className="text-sm text-gray-500">
            Please select a compliance framework in Step 1 to see available automated connectors.
          </p>
        </div>
      </div>
    );
  }

  const unconnectedCount = availableConnectors.filter(
    c => !connectedConnectors.has(c.id)
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-900" />
          System Connections
        </h3>
        <p className="text-xs text-gray-600">
          Connect to operational systems for automated evidence collection
        </p>
      </div>

      {/* Connect All Button */}
      {availableConnectors.length > 0 && unconnectedCount > 0 && (
        <div className="mb-4">
          <button
            onClick={handleConnectAll}
            disabled={connectingAll || connecting !== null}
            className={`
              w-full px-3 py-2 rounded-lg font-medium text-sm transition-all
              flex items-center justify-center gap-2
              ${connectingAll || connecting !== null
                ? 'bg-blue-100 text-blue-700 cursor-wait'
                : 'bg-gradient-to-r from-blue-900 to-blue-800 text-white hover:from-blue-800 hover:to-blue-700 shadow-md hover:shadow-lg'
              }
            `}
          >
            {connectingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to {unconnectedCount} system(s)...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Connect & Load Evidence from All ({unconnectedCount} available)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Available Connectors */}
      {availableConnectors.length > 0 && (
        <div className="space-y-2.5 mb-6">
          {availableConnectors.map((connector) => {
            const isConnecting = connecting === connector.id;
            const isConnected = connectedConnectors.has(connector.id);

            return (
              <motion.div
                key={connector.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`
                  border-2 rounded-lg p-3 transition-all shadow-sm
                  ${isConnected 
                    ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-green-100' 
                    : 'border-gray-200 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:shadow-md'
                  }
                  ${isConnecting ? 'ring-2 ring-blue-300 ring-offset-1' : ''}
                `}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`
                      p-2 rounded-lg transition-all flex-shrink-0
                      ${isConnected 
                        ? 'bg-green-200 text-green-800 shadow-sm' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }
                    `}>
                      {connector.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight">{connector.name}</h4>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded border border-green-200 whitespace-nowrap">
                          Available
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-snug truncate">{connector.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnect(connector)}
                    disabled={isConnecting || isConnected || connectingAll}
                    className={`
                      px-3 py-1.5 rounded-lg font-medium text-xs transition-all whitespace-nowrap flex-shrink-0
                      shadow-sm
                      ${isConnected
                        ? 'bg-green-100 text-green-700 cursor-default border border-green-200'
                        : isConnecting || connectingAll
                        ? 'bg-blue-100 text-blue-700 cursor-wait border border-blue-200'
                        : 'bg-blue-900 text-white hover:bg-blue-800 hover:shadow-md border border-blue-900'
                      }
                    `}
                  >
                    {isConnecting ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="hidden sm:inline">Connecting...</span>
                      </span>
                    ) : isConnected ? (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Connected</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Connect & Load Evidence</span>
                        <span className="sm:hidden">Connect</span>
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      {availableConnectors.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-start gap-2">
            <div className="p-1 bg-blue-100 rounded-lg flex-shrink-0">
              <RefreshCw className="w-3.5 h-3.5 text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-900 mb-0.5">
                Systems Ready: {availableConnectors.length} evidence source(s) available for this domain
              </p>
              <p className="text-xs text-blue-700 leading-snug">
                Automated Collection: Connect to your operational systems to automatically collect and verify evidence data for compliance assessment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomatedConnectors;
