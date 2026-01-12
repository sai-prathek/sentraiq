import React from 'react';
import { Sparkles, Database, FileText } from 'lucide-react';

const DemoDataSelector = ({ onSelectDemo }) => {
  const demoFiles = {
    logs: [
      {
        name: 'SWIFT Access Logs Q3 2025',
        file: 'swift_access_q3_2025.log',
        source: 'SWIFT',
        description: 'SWIFT Alliance access logs with MFA authentication events',
        icon: Database,
        color: 'purple'
      },
      {
        name: 'Firewall Logs Q3 2025',
        file: 'firewall_logs_q3_2025.log',
        source: 'Firewall',
        description: 'Network firewall logs with encryption monitoring',
        icon: Database,
        color: 'blue'
      }
    ],
    documents: [
      {
        name: 'MFA Policy',
        file: 'mfa_policy.pdf',
        docType: 'Policy',
        description: 'Multi-Factor Authentication Policy - PCI-DSS & SWIFT CSP compliant',
        icon: FileText,
        color: 'green'
      },
      {
        name: 'Encryption Policy',
        file: 'encryption_policy.pdf',
        docType: 'Policy',
        description: 'Data Encryption Policy - TLS 1.3, AES-256, HSM requirements',
        icon: FileText,
        color: 'pink'
      },
      {
        name: 'Audit Logging Policy',
        file: 'audit_logging_policy.pdf',
        docType: 'Policy',
        description: 'Audit Logging and Monitoring Policy - Compliance requirements',
        icon: FileText,
        color: 'orange'
      },
      {
        name: 'Access Control Policy',
        file: 'corporate_access_control_policy_v2.txt',
        docType: 'Policy',
        description: 'Corporate Access Control Policy - Original demo document',
        icon: FileText,
        color: 'indigo'
      }
    ]
  };

  const colorClasses = {
    purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 border-green-200 hover:bg-green-100',
    pink: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
  };

  const iconColors = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    pink: 'text-pink-600',
    orange: 'text-orange-600',
    indigo: 'text-indigo-600',
  };

  return (
    <div className="mb-6 glass rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h4 className="font-bold text-lg">Quick Demo - Load Sample Data</h4>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Click any demo file below to automatically load it for testing. All files are real examples with compliance content.
      </p>

      {/* Demo Logs */}
      <div className="mb-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Demo Logs:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {demoFiles.logs.map((demo, index) => {
            const Icon = demo.icon;
            return (
              <button
                key={index}
                onClick={() => onSelectDemo('log', demo)}
                className={`${colorClasses[demo.color]} border-2 rounded-lg p-3 text-left transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${iconColors[demo.color]} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1">{demo.name}</p>
                    <p className="text-xs text-gray-600">{demo.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Demo Documents */}
      <div>
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Demo Documents:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {demoFiles.documents.map((demo, index) => {
            const Icon = demo.icon;
            return (
              <button
                key={index}
                onClick={() => onSelectDemo('document', demo)}
                className={`${colorClasses[demo.color]} border-2 rounded-lg p-3 text-left transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${iconColors[demo.color]} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1">{demo.name}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{demo.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DemoDataSelector;
