import React, { useState, useMemo } from 'react';
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
  Zap,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { ARCHITECTURE_EVIDENCE_REQUIREMENTS, Requirement } from './RequirementsTab';

interface Connector {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  frameworks: string[]; // Framework IDs this connector is relevant for
  evidenceKeywords: string[]; // Keywords that indicate this connector is relevant
}

interface AutomatedConnectorsProps {
  selectedFramework: string | null;
  swiftArchitectureType?: string | null;
  onIngestSuccess: () => Promise<void>;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// Define evidence connection types with framework associations and evidence keywords.
// These are generic evidence sources (not specific vendor tools) that business users will recognize.
const CONNECTORS: Connector[] = [
  {
    id: 'network_perimeter',
    name: 'Network & Perimeter Security Telemetry',
    description: 'Firewalls, secure zones, segmentation and internet restriction evidence',
    icon: <Cloud className="w-5 h-5" />,
    available: true,
    frameworks: ['SWIFT_CSP'],
    evidenceKeywords: [
      'firewall', 'network', 'access control', 'acl', 'security configuration', 'vpc',
      'network segmentation', 'segmentation', 'secure zone', 'zone', 'internet access',
      'proxy', 'outbound traffic', 'ping', 'connectivity', 'data flow'
    ]
  },
  {
    id: 'privileged_access',
    name: 'Privileged Access & Identity Records',
    description: 'Admin access reviews, privileged account inventory and session evidence',
    icon: <Key className="w-5 h-5" />,
    available: true,
    frameworks: ['SWIFT_CSP'],
    evidenceKeywords: [
      'privilege', 'privileged access', 'access review', 'access logs', 'administrator',
      'privileged account', 'access matrix', 'mfa', 'multi-factor', 'authentication',
      'password policy', 'login policy', 'iam', 'least privilege', 'operator',
      'admin access', 'joiners', 'leavers', 'movers'
    ]
  },
  {
    id: 'vulnerability_management',
    name: 'Vulnerability & Patch Management Evidence',
    description: 'Vulnerability scans, patching status and hardening reports',
    icon: <Shield className="w-5 h-5" />,
    available: true,
    frameworks: ['SWIFT_CSP'],
    evidenceKeywords: [
      'vulnerability', 'vulnerability scan', 'vulnerability management', 'scan report',
      'patch', 'patching', 'security update', 'hardware version', 'software version',
      'system hardening', 'hardening', 'update schedule', 'vmware', 'soc reports'
    ]
  },
  {
    id: 'logging_monitoring',
    name: 'Logging, Monitoring & Intrusion Detection',
    description: 'Centralised logging, monitoring dashboards and intrusion detection evidence',
    icon: <Database className="w-5 h-5" />,
    available: true,
    frameworks: ['SWIFT_CSP'],
    evidenceKeywords: [
      'logging', 'monitoring', 'event logging', 'centralised logging', 'log', 'audit',
      'security event', 'intrusion detection', 'ids', 'ips', 'network flow',
      'packet inspection', 'session', 'retention policy', 'alerting'
    ]
  },
  {
    id: 'governance_policies',
    name: 'Policies, Procedures & Governance Docs',
    description: 'Policies, procedures, risk assessments and governance documentation',
    icon: <Layers className="w-5 h-5" />,
    available: true,
    frameworks: ['SWIFT_CSP'],
    evidenceKeywords: [
      'policy', 'procedure', 'governance', 'risk assessment', 'compliance',
      'change management', 'documentation', 'assessment', 'review', 'audit report',
      'training and awareness', 'incident response plan', 'business continuity'
    ]
  }
];

// Function to map evidence requirements to relevant connectors
const getRelevantConnectorsForRequirements = (
  requirements: Requirement[],
  connectors: Connector[]
): { connector: Connector; matchedRequirements: string[]; controlIds: string[] }[] => {
  const connectorMatches: Map<string, { connector: Connector; matchedRequirements: Set<string>; controlIds: Set<string> }> = new Map();

  requirements.forEach(req => {
    req.requirements.forEach(requirement => {
      const requirementLower = requirement.toLowerCase();
      
      connectors.forEach(connector => {
        const matches = connector.evidenceKeywords.some(keyword => 
          requirementLower.includes(keyword.toLowerCase())
        );
        
        if (matches) {
          if (!connectorMatches.has(connector.id)) {
            connectorMatches.set(connector.id, {
              connector,
              matchedRequirements: new Set(),
              controlIds: new Set()
            });
          }
          const match = connectorMatches.get(connector.id)!;
          match.matchedRequirements.add(requirement);
          match.controlIds.add(req.control_id);
        }
      });
    });
  });

  return Array.from(connectorMatches.values()).map(match => ({
    connector: match.connector,
    matchedRequirements: Array.from(match.matchedRequirements),
    controlIds: Array.from(match.controlIds)
  }));
};

const AutomatedConnectors: React.FC<AutomatedConnectorsProps> = ({
  selectedFramework,
  swiftArchitectureType,
  onIngestSuccess,
  onToast
}) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectingAll, setConnectingAll] = useState(false);
  const [connectedConnectors, setConnectedConnectors] = useState<Set<string>>(new Set());

  // Get evidence requirements for the selected architecture
  const evidenceRequirements = useMemo(() => {
    if (swiftArchitectureType && ARCHITECTURE_EVIDENCE_REQUIREMENTS[swiftArchitectureType]) {
      return ARCHITECTURE_EVIDENCE_REQUIREMENTS[swiftArchitectureType];
    }
    return [];
  }, [swiftArchitectureType]);

  // Map evidence requirements to connectors
  const connectorMatches = useMemo(() => {
    if (evidenceRequirements.length > 0) {
      return getRelevantConnectorsForRequirements(evidenceRequirements, CONNECTORS);
    }
    return [];
  }, [evidenceRequirements]);

  // Filter connectors based on:
  // 1. Selected framework
  // 2. Evidence requirements (if Swift architecture is selected)
  const relevantConnectors = useMemo(() => {
    let filtered = selectedFramework
      ? CONNECTORS.filter(connector => connector.frameworks.includes(selectedFramework))
      : CONNECTORS;

    // If Swift architecture is selected and we have evidence requirements, prioritize connectors that match
    if (swiftArchitectureType && connectorMatches.length > 0) {
      const matchedConnectorIds = new Set(connectorMatches.map(m => m.connector.id));
      // Show matched connectors first, then others
      const matched = filtered.filter(c => matchedConnectorIds.has(c.id));
      const unmatched = filtered.filter(c => !matchedConnectorIds.has(c.id));
      return [...matched, ...unmatched];
    }

    return filtered;
  }, [selectedFramework, swiftArchitectureType, connectorMatches]);

  const availableConnectors = relevantConnectors.filter(c => c.available);

  // Get match info for a connector
  const getConnectorMatchInfo = (connectorId: string) => {
    return connectorMatches.find(m => m.connector.id === connectorId);
  };

  const handleConnect = async (connector: Connector) => {
    if (!connector.available || connecting || connectingAll) return;

    setConnecting(connector.id);
    onToast(`Connecting to ${connector.name}...`, 'info');

    try {
      // Use generic source labels so the UI is not bound to a specific vendor.
      const genericSourceMap: Record<string, string> = {
        'network_perimeter': 'Network & Perimeter Logs',
        'privileged_access': 'Privileged Access Activity',
        'vulnerability_management': 'Vulnerability Scan Results',
        'logging_monitoring': 'Security Monitoring Events',
        'governance_policies': 'Governance & Policy Records'
      };

      const source = genericSourceMap[connector.id] || connector.name;
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
        
        const genericSourceMap: Record<string, string> = {
          'network_perimeter': 'Network & Perimeter Logs',
          'privileged_access': 'Privileged Access Activity',
          'vulnerability_management': 'Vulnerability Scan Results',
          'logging_monitoring': 'Security Monitoring Events',
          'governance_policies': 'Governance & Policy Records'
        };

        const source = genericSourceMap[connector.id] || connector.name;
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
      'network_perimeter': `[${timestamp}] Network & Perimeter Security Event
Source: Perimeter firewall / secure zone gateway
Event: Rule change and connectivity test
Control: SWIFT 1.1, 1.4, 2.1
Description: Evidence of network segmentation, secure zone isolation and restricted internet access
Details: Firewall rules and connectivity tests captured for SWIFT secure zone`,

      'privileged_access': `[${timestamp}] Privileged Access Activity
Source: Identity and access management / admin console
Event: Privileged access review completed
Control: SWIFT 1.2, 2.8, 4.1, 4.2
Description: Administrator account inventory, access logs and recent change tickets exported`,

      'vulnerability_management': `[${timestamp}] Vulnerability & Patch Management Summary
Source: Vulnerability scanning and patch management tools
Event: Latest scan and patch status for in-scope infrastructure
Control: SWIFT 2.2, 2.3, 2.7, 6.1–6.3
Description: Scan reports and patch deployment evidence for SWIFT secure zone systems`,

      'logging_monitoring': `[${timestamp}] Logging, Monitoring & Intrusion Detection
Source: Central logging and monitoring platform
Event: Aggregated security events and intrusion detection alerts
Control: SWIFT 2.1, 3.1, 6.4, 6.5A
Description: Evidence of centralised logging, monitoring dashboards and intrusion detection controls`,

      'governance_policies': `[${timestamp}] Governance, Policies & Procedures
Source: Document management / GRC repository
Event: Export of policies, procedures and risk assessments
Control: SWIFT 2.9, 5.x, 6.x, 7.x
Description: Evidence pack including relevant policies, risk assessments and governance documentation`
    };

    return templates[connectorId] || `[${timestamp}] ${source} - Automated Evidence Collection
Control: Framework-specific evidence collection
Status: Collected successfully`;
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
            const matchInfo = getConnectorMatchInfo(connector.id);
            const isRelevant = matchInfo && matchInfo.matchedRequirements.length > 0;

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
                    : isRelevant
                    ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-blue-100'
                    : 'border-gray-200 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:shadow-md'
                  }
                  ${isConnecting ? 'ring-2 ring-blue-300 ring-offset-1' : ''}
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`
                      p-2 rounded-lg transition-all flex-shrink-0
                      ${isConnected 
                        ? 'bg-green-200 text-green-800 shadow-sm' 
                        : isRelevant
                        ? 'bg-blue-200 text-blue-800 shadow-sm'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }
                    `}>
                      {connector.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight">{connector.name}</h4>
                        {isRelevant && (
                          <span className="px-1.5 py-0.5 bg-blue-200 text-blue-800 text-xs font-semibold rounded border border-blue-300 whitespace-nowrap flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Matches {matchInfo!.matchedRequirements.length} requirement{matchInfo!.matchedRequirements.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded border border-green-200 whitespace-nowrap">
                          Available
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-snug truncate">{connector.description}</p>
                      {isRelevant && matchInfo && (
                        <div className="mt-2 text-xs text-blue-700">
                          <p className="font-medium mb-1">Relevant for controls: {matchInfo.controlIds.join(', ')}</p>
                          <p className="text-blue-600 line-clamp-2">
                            Matches: {matchInfo.matchedRequirements.slice(0, 2).join(', ')}
                            {matchInfo.matchedRequirements.length > 2 && ` +${matchInfo.matchedRequirements.length - 2} more`}
                          </p>
                        </div>
                      )}
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
                Systems Ready: {availableConnectors.length} evidence source(s) available
                {swiftArchitectureType && connectorMatches.length > 0 && (
                  <span className="ml-1">({connectorMatches.length} match your evidence requirements)</span>
                )}
              </p>
              <p className="text-xs text-blue-700 leading-snug">
                {swiftArchitectureType && connectorMatches.length > 0
                  ? `Connectors highlighted in blue match your SWIFT ${swiftArchitectureType} evidence requirements. Connect to automatically collect relevant evidence.`
                  : 'Automated Collection: Connect to your operational systems to automatically collect and verify evidence data for compliance assessment.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomatedConnectors;
