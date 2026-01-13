import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Download, CheckCircle, ShieldCheck, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import LoadingOverlay from './LoadingOverlay';
import Stepper from './Stepper';
import ObjectiveSelector, { ObjectiveSelection } from './ObjectiveSelector';
import AssessmentQuestions, { AssessmentAnswer } from './AssessmentQuestions';
import IngestTab from './IngestTab';
import QueryTab from './QueryTab';
import { api } from '../services/api';
import { EvidenceItem, GeneratedPack, DashboardOutletContext } from '../types';

interface GenerateTabProps {
  onToast: (msg: string, type: 'success' | 'error') => void;
  selectedEvidence: EvidenceItem[];
  onClearSelectedEvidence: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const STEPS = [
  { id: 1, label: 'Select Compliance Framework', description: 'Choose your compliance framework' },
  { id: 2, label: 'Select SWIFT Architecture', description: 'Choose your SWIFT architecture type' },
  { id: 3, label: 'Manage Evidence', description: 'Add and review evidence files' },
  { id: 4, label: 'Assessment Questions', description: 'Answer compliance questions' },
  { id: 5, label: 'Enhance Pack', description: 'Query evidence (optional)' },
  { id: 6, label: 'Create Pack', description: 'Generate assurance pack' },
  { id: 7, label: 'View Report', description: 'Download compliance report' },
];

const GenerateTab: React.FC<GenerateTabProps> = ({
  onToast,
  selectedEvidence,
  onClearSelectedEvidence,
}) => {
  const { addEvidenceToPack } = useOutletContext<DashboardOutletContext>();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [generatedPack, setGeneratedPack] = useState<GeneratedPack | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Step data
  const [objectiveSelection, setObjectiveSelection] = useState<ObjectiveSelection | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState<any>(null);
  const [swiftArchitectureType, setSwiftArchitectureType] = useState<string | null>(null);
  const [swiftArchitectureTypes, setSwiftArchitectureTypes] = useState<any[]>([]);
  const [controlApplicabilityMatrix, setControlApplicabilityMatrix] = useState<any>(null);
  
  // Track evidence count when entering Step 4 (to distinguish assessment vs enhanced evidence)
  const [evidenceCountBeforeEnhance, setEvidenceCountBeforeEnhance] = useState<number>(0);

  // Form State for Step 5
  const [query, setQuery] = useState('');
  const [controlId, setControlId] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Load saved data on mount
  useEffect(() => {
    const stored = localStorage.getItem('objectiveSelection');
    if (stored) {
      try {
        const selection = JSON.parse(stored);
        setObjectiveSelection(selection);
      } catch (e) {
        console.error('Failed to load objective selection:', e);
      }
    }

    const storedAnswers = localStorage.getItem('assessmentAnswers');
    if (storedAnswers) {
      try {
        const answers = JSON.parse(storedAnswers);
        setAssessmentAnswers(answers);
      } catch (e) {
        console.error('Failed to load assessment answers:', e);
      }
    }

    const storedArchitecture = localStorage.getItem('swiftArchitectureType');
    if (storedArchitecture) {
      setSwiftArchitectureType(storedArchitecture);
    }

    // Set default date range
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 3);
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  }, []);

  // Load SWIFT architecture types and control applicability matrix when SWIFT framework is selected
  useEffect(() => {
    const loadSwiftData = async () => {
      const isSwiftSelected = objectiveSelection?.frameworks?.some(f => f.id === 'SWIFT_CSP');
      if (isSwiftSelected) {
        try {
          // Load architecture types
          if (swiftArchitectureTypes.length === 0) {
            const types = await api.getSwiftArchitectureTypes();
            setSwiftArchitectureTypes(types);
          }
          
          // Load control applicability matrix
          if (!controlApplicabilityMatrix) {
            const matrix = await api.getSwiftControlApplicabilityMatrix();
            setControlApplicabilityMatrix(matrix);
          }
        } catch (error) {
          console.error('Failed to load SWIFT data:', error);
          onToast('Failed to load SWIFT data', 'error');
        }
      }
    };
    loadSwiftData();
  }, [objectiveSelection]);

  // Redirect away from step 2 if SWIFT is not selected
  useEffect(() => {
    const isSwiftSelected = objectiveSelection?.frameworks?.some(f => f.id === 'SWIFT_CSP');
    if (currentStep === 2 && !isSwiftSelected) {
      // If on step 2 but SWIFT is not selected, go to step 3 (evidence management)
      setCurrentStep(3);
    }
  }, [currentStep, objectiveSelection]);

  // Load regulatory updates when frameworks are selected
  useEffect(() => {
    if (objectiveSelection && objectiveSelection.frameworks.length > 0) {
      const loadUpdates = async () => {
        try {
          const updates = await api.checkRegulatoryUpdates();
          setRegulatoryUpdates(updates);
        } catch (error) {
          console.error('Failed to load regulatory updates:', error);
        }
      };
      loadUpdates();
    }
  }, [objectiveSelection]);

  // Auto-load PDF when pack is generated
  useEffect(() => {
    if (generatedPack && !pdfUrl && !loadingPdf) {
      loadPdf();
    }
  }, [generatedPack]);

  // Track evidence count when entering Step 5 or Step 6 (to distinguish assessment vs enhanced evidence)
  useEffect(() => {
    // If user enters Step 5 or Step 6 and we haven't tracked the baseline yet,
    // capture the current evidence count (this is from auto-assessment in Step 4)
    if ((currentStep === 5 || currentStep === 6) && evidenceCountBeforeEnhance === 0) {
      setEvidenceCountBeforeEnhance(selectedEvidence.length);
    }
  }, [currentStep, selectedEvidence.length, evidenceCountBeforeEnhance]);

  // Scroll to top when step changes
  useEffect(() => {
    // Find and scroll the main scrollable container (from DashboardLayout)
    const mainContainer = document.querySelector('main.overflow-y-auto') as HTMLElement;
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Also scroll window to top as fallback
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Scroll any nested scrollable containers
    const scrollableDivs = document.querySelectorAll('.overflow-y-auto');
    scrollableDivs.forEach((div) => {
      (div as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [currentStep]);

  const loadPdf = async () => {
    if (!generatedPack) return;
    setLoadingPdf(true);
    try {
      const pdfBlob = await api.getPackReportPdf(generatedPack.pack_id);
      const url = window.URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (error: any) {
      console.error('Failed to load PDF report:', error);
      onToast(
        error?.message ||
          'Failed to load PDF report. If this is a fresh environment, install reportlab on the backend.',
        'error'
      );
    } finally {
      setLoadingPdf(false);
    }
  };

  // Cleanup PDF object URL when component unmounts or URL changes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleStepComplete = (step: Step, data?: any) => {
    if (step === 1 && data) {
      setObjectiveSelection(data);
      localStorage.setItem('objectiveSelection', JSON.stringify(data));
      const frameworkIds = data.frameworks.map((f: any) => f.id);
      localStorage.setItem('selectedFramework', frameworkIds[0] || 'SWIFT_CSP');
      
      // Pre-fill query
      const frameworkNames = data.frameworks.map((f: any) => f.name).join(' + ');
      setQuery(`Compliance evidence for ${data.infrastructure?.name || 'your environment'} - ${frameworkNames}`);
      
      // If SWIFT is selected, go to architecture selection (step 2), otherwise skip to evidence (step 3)
      const isSwiftSelected = data.frameworks.some((f: any) => f.id === 'SWIFT_CSP');
      if (isSwiftSelected) {
        setCurrentStep(2);
        return;
      } else {
        setCurrentStep(3);
        return;
      }
    } else if (step === 2 && data) {
      // Architecture type selected
      setSwiftArchitectureType(data);
      localStorage.setItem('swiftArchitectureType', data);
      setCurrentStep(3);
      return;
    } else if (step === 4 && data) {
      setAssessmentAnswers(data);
      localStorage.setItem('assessmentAnswers', JSON.stringify(data));
      // Evidence count will be tracked when entering Step 5 via useEffect
    }
    
    // Move to next step
    if (step < 7) {
      setCurrentStep((step + 1) as Step);
    }
  };

  const handleStepNavigation = (step: Step) => {
    // Allow navigation to completed steps or current step
    const maxCompletedStep = getMaxCompletedStep();
    const isSwiftSelected = objectiveSelection?.frameworks?.some(f => f.id === 'SWIFT_CSP');
    
    // If trying to navigate to step 2 (architecture selection) but SWIFT is not selected, skip it
    if (step === 2 && !isSwiftSelected) {
      return; // Don't allow navigation to step 2 if SWIFT is not selected
    }
    
    if (step <= maxCompletedStep + 1) {
      // If user is navigating back before Step 4 (Assessment Questions), clear assessment answers
      // and any evidence that was added to the pack (both assessment
      // and enhancement), so that when they re-run the assessment and
      // enhancement it starts fresh.
      const assessmentStep = isSwiftSelected ? 4 : 3;
      
      if (step < assessmentStep) {
        setAssessmentAnswers([]);
        try {
          localStorage.removeItem('assessmentAnswers');
        } catch (e) {
          console.warn('Failed to clear stored assessment answers:', e);
        }

        // Clear all evidence currently in the pack and reset the baseline
        // so that Step 5 correctly treats Step 3 evidence as the new base
        // and Step 4 evidence as enhanced items for the new run.
        onClearSelectedEvidence();
        setEvidenceCountBeforeEnhance(0);
      }
      setCurrentStep(step);
    }
  };

  const getMaxCompletedStep = (): Step => {
    if (generatedPack) return 7;
    if (selectedEvidence.length > 0 || assessmentAnswers.length > 0) return 5;
    if (assessmentAnswers.length > 0) return 4;
    const isSwiftSelected = objectiveSelection?.frameworks?.some(f => f.id === 'SWIFT_CSP');
    if (isSwiftSelected && swiftArchitectureType) return 3;
    if (isSwiftSelected) return 2;
    if (objectiveSelection) return 3;
    return 1;
  };

  const handleGeneratePack = async () => {
    if (!query || !dateRange.start || !dateRange.end) {
      onToast("Please fill in all required fields", "error");
      return;
    }
    
    setLoading(true);
    setGeneratedPack(null);
    try {
      // Get assessment answers from localStorage
      const storedAnswers = localStorage.getItem('assessmentAnswers');
      const answers = storedAnswers ? JSON.parse(storedAnswers) : [];

      const pack = await api.generatePack(
        query,
        controlId || null,
        dateRange.start,
        dateRange.end,
        selectedEvidence,
        answers
      );
      
      setGeneratedPack(pack);
      onToast("Assurance pack generated successfully!", "success");
      onClearSelectedEvidence();
      
      // Move to step 7
      setCurrentStep(7);
    } catch (error: any) {
      console.error("Failed to generate pack:", error);
      onToast(error?.message || "Failed to generate pack", "error");
    } finally {
      setLoading(false);
    }
  };

  const setPresetDate = (type: 'month' | 'quarter' | 'year') => {
    const end = new Date();
    const start = new Date();
    if (type === 'month') start.setMonth(end.getMonth() - 1);
    if (type === 'quarter') start.setMonth(end.getMonth() - 3);
    if (type === 'year') start.setFullYear(end.getFullYear() - 1);
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  const maxCompletedStep = getMaxCompletedStep();
  const isSwiftSelected = objectiveSelection?.frameworks?.some(f => f.id === 'SWIFT_CSP');

  return (
    <div className="flex flex-col h-full">
      {/* Stepper UI */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 mb-3">
        <Stepper
          currentStep={currentStep}
          steps={STEPS}
          onStepClick={handleStepNavigation}
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {/* Step 1: Select Compliance Frameworks */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Select Compliance Framework</h2>
                  <p className="text-gray-600">Choose your compliance framework to begin</p>
                </div>
                <ObjectiveSelector
                  onSelectionComplete={(selection) => handleStepComplete(1, selection)}
                />
              </div>
            )}

            {/* Step 2: Select SWIFT Architecture (only shown when SWIFT is selected) */}
            {currentStep === 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 2: Select SWIFT Architecture</h2>
                    <p className="text-gray-600">Choose your SWIFT architecture type to determine applicable controls</p>
                    {swiftArchitectureType && controlApplicabilityMatrix && (
                      <p className="text-sm text-blue-700 mt-1">
                        {(() => {
                          let count = 0;
                          controlApplicabilityMatrix.control_applicability_matrix?.forEach((domain: any) => {
                            domain.controls?.forEach((control: any) => {
                              const mapping = control.mapping?.[swiftArchitectureType];
                              if (mapping?.is_applicable) count++;
                            });
                          });
                          return `${count} controls applicable for ${swiftArchitectureTypes.find(a => a.id === swiftArchitectureType)?.name || swiftArchitectureType}`;
                        })()}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons - Moved to top for easier accessibility */}
                <div className="mb-6 flex items-center justify-between pb-4 border-b border-gray-200">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (swiftArchitectureType) {
                        handleStepComplete(2, swiftArchitectureType);
                      } else {
                        onToast('Please select a SWIFT architecture type', 'error');
                      }
                    }}
                    disabled={!swiftArchitectureType}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Manage Evidence
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                {swiftArchitectureTypes.length === 0 || !controlApplicabilityMatrix ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Architecture Type Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                      {swiftArchitectureTypes.map((arch) => {
                        const isSelected = swiftArchitectureType === arch.id;
                        return (
                          <div
                            key={arch.id}
                            className={`
                              p-4 rounded-lg border-2 text-center transition-all cursor-pointer
                              ${isSelected
                                ? 'border-blue-900 bg-blue-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                              }
                            `}
                            onClick={() => {
                              setSwiftArchitectureType(arch.id);
                              localStorage.setItem('swiftArchitectureType', arch.id);
                            }}
                          >
                            <div className="font-bold text-lg text-gray-900 mb-1">{arch.id}</div>
                            <div className="text-xs text-gray-600">{arch.name}</div>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-blue-900 mx-auto mt-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Architecture Summary Box */}
                    {swiftArchitectureType && controlApplicabilityMatrix && (
                      <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                          {/* Control Count */}
                          <div className="flex items-center gap-4 pr-6 md:border-r md:border-blue-300">
                            <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-2xl font-bold text-blue-900">
                                {(() => {
                                  let count = 0;
                                  controlApplicabilityMatrix.control_applicability_matrix?.forEach((domain: any) => {
                                    domain.controls?.forEach((control: any) => {
                                      const mapping = control.mapping?.[swiftArchitectureType];
                                      if (mapping?.is_applicable) count++;
                                    });
                                  });
                                  return count;
                                })()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-blue-900 mb-1.5">Applicable Controls</h3>
                              <p className="text-sm text-blue-700 leading-relaxed">
                                {swiftArchitectureTypes.find(a => a.id === swiftArchitectureType)?.name || swiftArchitectureType} architecture
                              </p>
                            </div>
                          </div>

                          {/* Selected Architecture Info */}
                          <div className="flex items-start gap-3 pl-6 md:pl-6 pt-4 md:pt-0">
                            <CheckCircle className="w-6 h-6 text-blue-900 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-blue-900 mb-1.5 text-lg">
                                Selected: {swiftArchitectureTypes.find(a => a.id === swiftArchitectureType)?.name}
                              </h3>
                              <p className="text-sm text-blue-700 mb-1.5 leading-relaxed">
                                {swiftArchitectureTypes.find(a => a.id === swiftArchitectureType)?.description}
                              </p>
                              <p className="text-xs text-blue-600 italic leading-relaxed">
                                {swiftArchitectureTypes.find(a => a.id === swiftArchitectureType)?.logic_summary}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Control Applicability Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
                        <table className="w-full border-collapse">
                          <thead className="sticky top-0 z-30">
                            <tr>
                              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900 min-w-[300px] bg-gray-50 shadow-[0_2px_4px_rgba(0,0,0,0.1)] backdrop-blur-sm">
                                Mandatory and Advisory Security Controls
                              </th>
                              {swiftArchitectureTypes.map((arch) => (
                                <th
                                  key={arch.id}
                                  className={`
                                    border border-gray-200 px-4 py-3 text-center font-semibold text-gray-900 cursor-pointer transition-colors min-w-[100px] shadow-[0_2px_4px_rgba(0,0,0,0.1)] backdrop-blur-sm
                                    ${swiftArchitectureType === arch.id
                                      ? 'bg-blue-100 border-blue-900'
                                      : 'bg-gray-50 hover:bg-gray-100'
                                    }
                                  `}
                                  onClick={() => {
                                    setSwiftArchitectureType(arch.id);
                                    localStorage.setItem('swiftArchitectureType', arch.id);
                                  }}
                                >
                                  <div className="font-bold text-lg">{arch.id}</div>
                                  {swiftArchitectureType === arch.id && (
                                    <CheckCircle className="w-4 h-4 text-blue-900 mx-auto mt-1" />
                                  )}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="relative z-0">
                            {controlApplicabilityMatrix.control_applicability_matrix?.map((domain: any, domainIdx: number) => (
                              <React.Fragment key={domainIdx}>
                                {/* Domain Header Row */}
                                <tr className="bg-gray-100">
                                  <td
                                    colSpan={swiftArchitectureTypes.length + 1}
                                    className="border border-gray-200 px-4 py-3 font-bold text-gray-900"
                                  >
                                    {domain.domain}
                                  </td>
                                </tr>
                                {/* Controls in Domain */}
                                {domain.controls?.map((control: any, controlIdx: number) => (
                                  <tr
                                    key={`${domainIdx}-${controlIdx}`}
                                    className={controlIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                  >
                                    <td className="border border-gray-200 px-4 py-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-semibold text-gray-700">
                                          {control.control_id}
                                        </span>
                                        <span className="text-sm text-gray-900">
                                          {control.control_name}
                                        </span>
                                      </div>
                                    </td>
                                    {swiftArchitectureTypes.map((arch) => {
                                      const mapping = control.mapping?.[arch.id];
                                      const isApplicable = mapping?.is_applicable || false;
                                      return (
                                        <td
                                          key={arch.id}
                                          className={`
                                            border border-gray-200 px-4 py-2 text-center cursor-pointer transition-colors
                                            ${swiftArchitectureType === arch.id
                                              ? 'bg-blue-50 hover:bg-blue-100'
                                              : 'hover:bg-gray-100'
                                            }
                                          `}
                                          onClick={() => {
                                            setSwiftArchitectureType(arch.id);
                                            localStorage.setItem('swiftArchitectureType', arch.id);
                                          }}
                                          title={isApplicable ? `${mapping?.scope || 'Applicable'}` : 'Not Applicable'}
                                        >
                                          {isApplicable ? (
                                            <div className="w-3 h-3 bg-gray-900 rounded-full mx-auto"></div>
                                          ) : (
                                            <span className="text-gray-300">—</span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Manage Evidence */}
            {currentStep === 3 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 3: Manage Evidence</h2>
                    <p className="text-gray-600">Add and review evidence files for your compliance pack</p>
                    {objectiveSelection && objectiveSelection.frameworks.length > 0 && (
                      <p className="text-sm text-blue-700 mt-1">
                        Framework: {objectiveSelection.frameworks.map(f => f.name).join(', ')}
                        {swiftArchitectureType && (
                          <span className="ml-2">
                            • Architecture: {swiftArchitectureTypes.find(a => a.id === swiftArchitectureType)?.name || swiftArchitectureType}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons - Moved to top for easier accessibility */}
                <div className="mb-6 flex items-center justify-between pb-4 border-b border-gray-200">
                  <button
                    onClick={() => {
                      const isSwiftSelected = objectiveSelection?.frameworks?.some(f => f.id === 'SWIFT_CSP');
                      setCurrentStep(isSwiftSelected ? 2 : 1);
                    }}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => handleStepComplete(3)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                  >
                    Continue to Assessment Questions
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                <IngestTab 
                  onToast={onToast}
                  selectedFramework={objectiveSelection?.frameworks?.[0]?.id || null}
                />
              </div>
            )}

            {/* Step 4: Assessment Questions */}
            {currentStep === 4 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 4: Assessment Questions</h2>
                  <p className="text-gray-600">Answer compliance assessment questions to create initial pack</p>
                </div>
                <AssessmentQuestions
                  framework={localStorage.getItem('selectedFramework') || 'SWIFT_CSP'}
                  onComplete={(answers) => handleStepComplete(4, answers)}
                  onBack={() => setCurrentStep(3)}
                  swiftArchitectureType={swiftArchitectureType}
                  controlApplicabilityMatrix={controlApplicabilityMatrix}
                />
              </div>
            )}

            {/* Step 5: Enhance Pack (Query Evidence) */}
            {currentStep === 5 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 5: Enhance Pack (Optional)</h2>
                    <p className="text-gray-600">Use query evidence to find and add additional evidence items</p>
                  </div>
                </div>
                
                {/* Action Buttons - Moved to top for easier accessibility */}
                <div className="mb-6 flex items-center justify-between pb-4 border-b border-gray-200">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => handleStepComplete(5)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                  >
                    Continue to Create Pack
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                <QueryTab
                  onToast={onToast}
                  selectedEvidence={selectedEvidence}
                  onAddEvidenceToPack={addEvidenceToPack}
                />
              </div>
            )}

            {/* Step 6: Create Pack */}
            {currentStep === 6 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 relative">
                {loading && <LoadingOverlay message="Compiling Evidence & Generating Hash..." />}
                
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 6: Create Pack</h2>
                    <p className="text-gray-600">Review and generate your compliance assurance pack</p>
                  </div>
                </div>
                
                {/* Action Buttons - Moved to top for easier accessibility */}
                <div className="mb-6 flex items-center justify-between pb-4 border-b border-gray-200">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleGeneratePack}
                    disabled={loading || !query || !dateRange.start || !dateRange.end}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate Pack'}
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>

                {/* Configuration Summary */}
                {objectiveSelection && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Configuration Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {objectiveSelection.infrastructure && (
                        <div>
                          <span className="text-blue-700">Infrastructure:</span>
                          <p className="font-medium text-blue-900">{objectiveSelection.infrastructure.name}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-blue-700">Frameworks:</span>
                        <p className="font-medium text-blue-900">
                          {objectiveSelection.frameworks.map(f => f.name).join(', ')}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700">Assessment Answers:</span>
                        <p className="font-medium text-blue-900">{assessmentAnswers.length} questions answered</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Evidence Summary - Split by source */}
                {selectedEvidence.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {/* Assessment Evidence (from Step 3) */}
                    {evidenceCountBeforeEnhance > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Assessment Evidence ({evidenceCountBeforeEnhance} items)
                        </h3>
                        <p className="text-sm text-blue-700 mb-3">
                          Evidence items automatically identified during the compliance assessment (Step 4)
                        </p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedEvidence.slice(0, evidenceCountBeforeEnhance).map((item, idx) => (
                            <div key={`${item.id}-${item.type}-${idx}`} className="bg-white rounded p-3 flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                  {item.type}
                                </span>
                                <span className="font-medium text-gray-900">{item.filename}</span>
                                {item.control_id && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                                    {item.control_id}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {evidenceCountBeforeEnhance > 5 && (
                            <div className="text-xs text-blue-600 italic">
                              ... and {evidenceCountBeforeEnhance - 5} more assessment evidence items
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Evidence (from Step 4) */}
                    {selectedEvidence.length > evidenceCountBeforeEnhance && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Enhanced Evidence Items ({selectedEvidence.length - evidenceCountBeforeEnhance} items)
                        </h3>
                        <p className="text-sm text-green-700 mb-3">
                          Additional evidence items added via Query Evidence feature (Step 5)
                        </p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedEvidence.slice(evidenceCountBeforeEnhance).map((item, idx) => (
                            <div key={`${item.id}-${item.type}-${idx + evidenceCountBeforeEnhance}`} className="bg-white rounded p-3 flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  {item.type}
                                </span>
                                <span className="font-medium text-gray-900">{item.filename}</span>
                                {item.control_id && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">
                                    {item.control_id}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Total Summary */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">Total Evidence Items:</span>
                        <span className="font-bold text-gray-900">{selectedEvidence.length}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pack Generation Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Evidence Requirement
                    </label>
                    <textarea 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full rounded-lg border-gray-300 border p-4 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none h-28 resize-none shadow-sm"
                      placeholder="e.g., Provide all evidence related to user access reviews for critical systems..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Control ID <span className="font-normal text-gray-400">(Optional)</span>
                      </label>
                      <input 
                        type="text"
                        value={controlId}
                        onChange={(e) => setControlId(e.target.value)}
                        className="w-full rounded-lg border-gray-300 border p-4 text-sm focus:ring-2 focus:ring-blue-900 outline-none shadow-sm"
                        placeholder="e.g., SWIFT-2.8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Time Range</label>
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="date" 
                          value={dateRange.start}
                          onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 outline-none" 
                        />
                        <input 
                          type="date" 
                          value={dateRange.end}
                          onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 outline-none" 
                        />
                      </div>
                      <div className="flex gap-2 mt-4">
                        {['month', 'quarter', 'year'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setPresetDate(t as any)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-1.5 rounded-full transition-colors capitalize font-medium"
                          >
                            Last {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: View Report */}
            {currentStep === 7 && generatedPack && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 7: Compliance Report</h2>
                  <p className="text-gray-600">Review and download your compliance assurance report</p>
                </div>
                
                {/* Action Buttons - Moved to top for easier accessibility */}
                <div className="mb-6 flex items-center justify-between pb-4 border-b border-gray-200">
                  <button
                    onClick={() => setCurrentStep(6)}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        try {
                          const pdfBlob = await api.getPackReportPdf(generatedPack.pack_id);
                          const url = window.URL.createObjectURL(pdfBlob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${generatedPack.pack_id}_report.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          onToast('PDF report downloaded successfully!', 'success');
                        } catch (error: any) {
                          onToast(
                            error?.message ||
                              'Failed to download PDF report. If this is a fresh environment, install reportlab on the backend.',
                            'error'
                          );
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Download PDF Report
                    </button>
                    <a
                      href={generatedPack.download_url}
                      download
                      className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Pack (ZIP)
                    </a>
                  </div>
                </div>

                {loadingPdf ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin"></div>
                  </div>
                ) : pdfUrl ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">Pack Generated Successfully</span>
                    </div>
                    <div className="p-0 h-[600px]">
                      <iframe
                        src={pdfUrl}
                        title="Compliance Report PDF"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Report not available</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GenerateTab;
