import React, { useState } from 'react';
import { Cloud, Server, Network, Shield, CheckCircle, AlertCircle, ArrowRight, X } from 'lucide-react';
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
  }
];

// Mock control data - in production, this would come from the API
const getControlsForInfrastructure = (infraId: string, frameworkIds: string[]): {
  controls: Control[];
  sharedControls: Control[];
} => {
  // Mock controls based on infrastructure and frameworks
  const allControls: Control[] = [
    {
      control_id: 'SWIFT-2.8',
      name: 'Multi-Factor Authentication',
      description: 'Enforce MFA for all operator accounts',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP', 'SOC2']
    },
    {
      control_id: 'SWIFT-3.1',
      name: 'Audit Logging',
      description: 'Maintain comprehensive audit logs',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP', 'SOC2']
    },
    {
      control_id: 'SWIFT-2.7',
      name: 'Vulnerability Scanning',
      description: 'Perform vulnerability scanning quarterly',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP']
    },
    {
      control_id: 'SWIFT-1.1',
      name: 'Restrict Internet Access',
      description: 'Restrict logical access to SWIFT environment',
      type: 'mandatory',
      frameworks: ['SWIFT_CSP']
    },
    {
      control_id: 'SOC2-CC6.1',
      name: 'Logical Access Controls',
      description: 'Implement logical access controls',
      type: 'mandatory',
      frameworks: ['SOC2']
    },
    {
      control_id: 'SOC2-CC7.1',
      name: 'System Monitoring',
      description: 'Monitor system activities and detect anomalies',
      type: 'mandatory',
      frameworks: ['SOC2']
    }
  ];
  
  // Filter controls by selected frameworks
  const relevantControls = allControls.filter(c => 
    c.frameworks.some(f => frameworkIds.includes(f))
  );
  
  // Find shared controls (appear in multiple frameworks)
  const sharedControls = relevantControls.filter(c => 
    c.frameworks.length > 1 && frameworkIds.length > 1
  );
  
  return {
    controls: relevantControls,
    sharedControls
  };
};

const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({ onSelectionComplete }) => {
  const [selectedFrameworks, setSelectedFrameworks] = useState<Framework[]>([]);
  const [showControls, setShowControls] = useState(false);

  const handleFrameworkToggle = (framework: Framework) => {
    setSelectedFrameworks(prev => {
      const exists = prev.find(f => f.id === framework.id);
      if (exists) {
        return prev.filter(f => f.id !== framework.id);
      } else {
        return [...prev, framework];
      }
    });
  };

  const handleContinue = () => {
    if (selectedFrameworks.length === 0) return;
    
    const { controls, sharedControls } = getControlsForInfrastructure(
      'default',
      selectedFrameworks.map(f => f.id)
    );
    
    onSelectionComplete({
      infrastructure: null,
      frameworks: selectedFrameworks,
      controls,
      sharedControls
    });
  };

  const { controls, sharedControls } = selectedFrameworks.length > 0
    ? getControlsForInfrastructure('default', selectedFrameworks.map(f => f.id))
    : { controls: [], sharedControls: [] };

  const mandatoryControls = controls.filter(c => c.type === 'mandatory');
  const advisoryControls = controls.filter(c => c.type === 'advisory');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Step 1: Framework Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Select Compliance Frameworks</h2>
        <p className="text-gray-600 mb-6">Select one or more frameworks. Overlapping controls will be identified.</p>
          
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {FRAMEWORK_OPTIONS.map((framework) => {
              const isSelected = selectedFrameworks.some(f => f.id === framework.id);
              
              return (
                <motion.button
                  key={framework.id}
                  onClick={() => handleFrameworkToggle(framework)}
                  className={`
                    p-6 rounded-lg border-2 transition-all text-left
                    ${isSelected 
                      ? 'border-blue-900 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{framework.name}</h3>
                      <p className="text-sm text-gray-600">{framework.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-900" />
                    )}
                  </div>
                </motion.button>
              );
            })}
        </div>

        {/* Shared Controls Indicator */}
        {selectedFrameworks.length > 1 && sharedControls.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-700" />
              <span className="font-semibold text-green-900">
                Map Once, Report Many: {sharedControls.length} shared controls detected
              </span>
            </div>
            <p className="text-sm text-green-700">
              These controls satisfy multiple frameworks. Evidence will be collected once and used for all selected frameworks.
            </p>
          </div>
        )}

        {/* Controls Preview */}
        {selectedFrameworks.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-2 text-blue-900 font-medium hover:text-blue-700"
            >
              {showControls ? 'Hide' : 'Show'} Applicable Controls ({controls.length})
              <ArrowRight className={`w-4 h-4 transition-transform ${showControls ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  {/* Mandatory Controls */}
                  {mandatoryControls.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        Mandatory Controls ({mandatoryControls.length})
                      </h4>
                      <div className="space-y-2">
                        {mandatoryControls.map(control => (
                          <div key={control.control_id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-medium text-gray-900">{control.control_id}: {control.name}</span>
                                <p className="text-sm text-gray-600 mt-1">{control.description}</p>
                              </div>
                              {sharedControls.some(sc => sc.control_id === control.control_id) && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Shared</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advisory Controls */}
                  {advisoryControls.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        Advisory Controls ({advisoryControls.length})
                      </h4>
                      <div className="space-y-2">
                        {advisoryControls.map(control => (
                          <div key={control.control_id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-medium text-gray-900">{control.control_id}: {control.name}</span>
                                <p className="text-sm text-gray-600 mt-1">{control.description}</p>
                              </div>
                              {sharedControls.some(sc => sc.control_id === control.control_id) && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Shared</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Continue Button */}
        {selectedFrameworks.length > 0 && (
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
    </div>
  );
};

export default ObjectiveSelector;
