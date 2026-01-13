import React, { useMemo } from 'react';
import { CheckCircle, XCircle, Minus, Shield } from 'lucide-react';
import { AssessmentAnswer } from './ComplianceAssessment';

interface ControlStatusTableProps {
  assessmentAnswers: AssessmentAnswer[];
  swiftArchitectureType: string | null;
  controlApplicabilityMatrix: any;
  swiftArchitectureTypes: any[];
  onBack: () => void;
  onComplete: () => void;
}

type ControlStatus = 'in-place' | 'not-in-place' | 'not-applicable';

interface ControlStatusData {
  control_id: string;
  control_name: string;
  domain: string;
  status: ControlStatus;
  applicable: boolean;
  advisory: boolean;
}

const ControlStatusTable: React.FC<ControlStatusTableProps> = ({
  assessmentAnswers,
  swiftArchitectureType,
  controlApplicabilityMatrix,
  swiftArchitectureTypes,
  onBack,
  onComplete,
}) => {
  // Extract control ID from question ID (e.g., "1.1.a.1" -> "1.1")
  const getControlIdFromQuestionId = (questionId: string): string | null => {
    const parts = questionId.split('.');
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1]}`;
    }
    return null;
  };

  // Check if control is applicable to selected architecture
  const isControlApplicable = (controlId: string): boolean => {
    if (!swiftArchitectureType || !controlApplicabilityMatrix) {
      return true;
    }

    for (const domain of controlApplicabilityMatrix.control_applicability_matrix || []) {
      for (const control of domain.controls || []) {
        if (control.control_id === controlId) {
          const mapping = control.mapping?.[swiftArchitectureType];
          return mapping?.is_applicable || false;
        }
      }
    }
    return false;
  };

  // Check if control is advisory
  const isControlAdvisory = (controlId: string): boolean => {
    if (!swiftArchitectureType || !controlApplicabilityMatrix) {
      // If control ID ends with "A", it's advisory
      return controlId.endsWith('A');
    }

    // Check if control ID ends with "A" (entire control is advisory)
    if (controlId.endsWith('A')) {
      return true;
    }

    // Check if the specific architecture mapping has advisory: true
    for (const domain of controlApplicabilityMatrix.control_applicability_matrix || []) {
      for (const control of domain.controls || []) {
        if (control.control_id === controlId) {
          const mapping = control.mapping?.[swiftArchitectureType];
          return mapping?.advisory === true;
        }
      }
    }
    return false;
  };

  // Get control name and domain from matrix
  const getControlInfo = (controlId: string): { name: string; domain: string; advisory: boolean } | null => {
    if (!controlApplicabilityMatrix) {
      return {
        name: controlId,
        domain: 'Unknown',
        advisory: controlId.endsWith('A')
      };
    }

    for (const domain of controlApplicabilityMatrix.control_applicability_matrix || []) {
      for (const control of domain.controls || []) {
        if (control.control_id === controlId) {
          const mapping = control.mapping?.[swiftArchitectureType];
          const isEntireControlAdvisory = controlId.endsWith('A');
          const isCellAdvisory = !isEntireControlAdvisory && mapping?.advisory === true;
          
          return {
            name: control.control_name || controlId,
            domain: domain.domain || 'Unknown',
            advisory: isEntireControlAdvisory || isCellAdvisory
          };
        }
      }
    }
    return {
      name: controlId,
      domain: 'Unknown',
      advisory: controlId.endsWith('A')
    };
  };

  // Determine control status based on assessment answers
  const getControlStatus = (controlId: string): ControlStatus => {
    // Check if control is applicable
    if (!isControlApplicable(controlId)) {
      return 'not-applicable';
    }

    // Get all questions for this control
    const controlQuestions = assessmentAnswers.filter(
      answer => getControlIdFromQuestionId(answer.questionId) === controlId
    );

    if (controlQuestions.length === 0) {
      return 'not-in-place'; // No answers means not in place
    }

    // Count answers
    const yesCount = controlQuestions.filter(q => q.answer === 'yes').length;
    const noCount = controlQuestions.filter(q => q.answer === 'no').length;
    const partialCount = controlQuestions.filter(q => q.answer === 'partial').length;
    const totalAnswered = yesCount + noCount + partialCount;

    if (totalAnswered === 0) {
      return 'not-in-place';
    }

    // Determine status based on majority
    const yesPercentage = (yesCount / totalAnswered) * 100;
    const noPercentage = (noCount / totalAnswered) * 100;

    if (yesPercentage >= 70) {
      return 'in-place';
    } else if (noPercentage >= 50) {
      return 'not-in-place';
    } else if (partialCount > 0 && yesCount > 0) {
      // Mixed answers with partial - consider as partially in place, but mark as not-in-place for now
      return 'not-in-place';
    } else {
      return 'not-in-place';
    }
  };

  // Build control status data
  const controlStatusData = useMemo(() => {
    const controlMap = new Map<string, ControlStatusData>();

    // Process assessment answers to group by control
    assessmentAnswers.forEach(answer => {
      const controlId = getControlIdFromQuestionId(answer.questionId);
      if (!controlId) return;

      if (!controlMap.has(controlId)) {
        const controlInfo = getControlInfo(controlId);
        const applicable = isControlApplicable(controlId);
        const status = applicable ? getControlStatus(controlId) : 'not-applicable';
        const advisory = controlInfo?.advisory || isControlAdvisory(controlId);

        controlMap.set(controlId, {
          control_id: controlId,
          control_name: controlInfo?.name || controlId,
          domain: controlInfo?.domain || 'Unknown',
          status,
          applicable,
          advisory
        });
      }
    });

    // Also include controls from the matrix that might not have answers yet
    if (controlApplicabilityMatrix && swiftArchitectureType) {
      controlApplicabilityMatrix.control_applicability_matrix?.forEach((domain: any) => {
        domain.controls?.forEach((control: any) => {
          const controlId = control.control_id;
          const mapping = control.mapping?.[swiftArchitectureType];
          const applicable = mapping?.is_applicable || false;

          if (!controlMap.has(controlId)) {
            const isEntireControlAdvisory = controlId.endsWith('A');
            const isCellAdvisory = !isEntireControlAdvisory && mapping?.advisory === true;
            const advisory = isEntireControlAdvisory || isCellAdvisory;

            controlMap.set(controlId, {
              control_id: controlId,
              control_name: control.control_name || controlId,
              domain: domain.domain || 'Unknown',
              status: applicable ? 'not-in-place' : 'not-applicable',
              applicable,
              advisory
            });
          }
        });
      });
    }

    // Sort by domain and control ID
    return Array.from(controlMap.values()).sort((a, b) => {
      if (a.domain !== b.domain) {
        return a.domain.localeCompare(b.domain);
      }
      return a.control_id.localeCompare(b.control_id);
    });
  }, [assessmentAnswers, swiftArchitectureType, controlApplicabilityMatrix]);

  // Group by domain
  const groupedByDomain = useMemo(() => {
    const groups: Record<string, ControlStatusData[]> = {};
    controlStatusData.forEach(control => {
      if (!groups[control.domain]) {
        groups[control.domain] = [];
      }
      groups[control.domain].push(control);
    });
    return groups;
  }, [controlStatusData]);

  // Statistics
  const stats = useMemo(() => {
    const mandatoryControls = controlStatusData.filter(c => !c.advisory);
    const advisoryControls = controlStatusData.filter(c => c.advisory);
    
    const inPlace = controlStatusData.filter(c => c.status === 'in-place').length;
    const notInPlace = controlStatusData.filter(c => c.status === 'not-in-place').length;
    const notApplicable = controlStatusData.filter(c => c.status === 'not-applicable').length;
    const total = controlStatusData.length;

    // Mandatory vs Advisory breakdown
    const mandatoryInPlace = mandatoryControls.filter(c => c.status === 'in-place').length;
    const mandatoryNotInPlace = mandatoryControls.filter(c => c.status === 'not-in-place').length;
    const advisoryInPlace = advisoryControls.filter(c => c.status === 'in-place').length;
    const advisoryNotInPlace = advisoryControls.filter(c => c.status === 'not-in-place').length;

    return { 
      inPlace, 
      notInPlace, 
      notApplicable, 
      total,
      mandatory: {
        total: mandatoryControls.length,
        inPlace: mandatoryInPlace,
        notInPlace: mandatoryNotInPlace
      },
      advisory: {
        total: advisoryControls.length,
        inPlace: advisoryInPlace,
        notInPlace: advisoryNotInPlace
      }
    };
  }, [controlStatusData]);

  const getStatusIcon = (status: ControlStatus) => {
    switch (status) {
      case 'in-place':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'not-in-place':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'not-applicable':
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ControlStatus) => {
    switch (status) {
      case 'in-place':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
            In Place
          </span>
        );
      case 'not-in-place':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
            Not In Place
          </span>
        );
      case 'not-applicable':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
            Not Applicable
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              Control Status Summary
            </h3>
            <p className="text-sm text-blue-700">
              Control compliance status based on assessment answers for Architecture {swiftArchitectureType}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg p-3 border-2 border-gray-200">
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Controls</div>
          </div>
          <div className="bg-white rounded-lg p-3 border-2 border-green-200">
            <div className="text-lg font-bold text-green-600">{stats.inPlace}</div>
            <div className="text-xs text-gray-600">In Place</div>
          </div>
          <div className="bg-white rounded-lg p-3 border-2 border-red-200">
            <div className="text-lg font-bold text-red-600">{stats.notInPlace}</div>
            <div className="text-xs text-gray-600">Not In Place</div>
          </div>
          <div className="bg-white rounded-lg p-3 border-2 border-gray-200">
            <div className="text-lg font-bold text-gray-600">{stats.notApplicable}</div>
            <div className="text-xs text-gray-600">Not Applicable</div>
          </div>
        </div>

        {/* Mandatory vs Advisory Breakdown */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-200">
          <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
            <h4 className="text-sm font-bold text-blue-900 mb-3">Mandatory Controls</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-lg font-bold text-gray-900">{stats.mandatory.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{stats.mandatory.inPlace}</div>
                <div className="text-xs text-gray-600">In Place</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{stats.mandatory.notInPlace}</div>
                <div className="text-xs text-gray-600">Not In Place</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Advisory Controls</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-lg font-bold text-gray-900">{stats.advisory.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{stats.advisory.inPlace}</div>
                <div className="text-xs text-gray-600">In Place</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{stats.advisory.notInPlace}</div>
                <div className="text-xs text-gray-600">Not In Place</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Status Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900 min-w-[200px]">
                  Control
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900 min-w-[300px]">
                  Control Name
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-900 min-w-[150px]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedByDomain).map(([domain, controls]) => (
                <React.Fragment key={domain}>
                  {/* Domain Header */}
                  <tr className="bg-gray-100">
                    <td
                      colSpan={3}
                      className="border border-gray-200 px-4 py-3 font-bold text-gray-900"
                    >
                      {domain}
                    </td>
                  </tr>
                  {/* Controls in Domain */}
                  {controls.map((control) => (
                    <tr
                      key={control.control_id}
                      className={`hover:bg-gray-50 transition-colors ${
                        control.advisory ? 'bg-gray-50' : ''
                      }`}
                    >
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Shield className={`w-4 h-4 ${control.advisory ? 'text-gray-500' : 'text-blue-600'}`} />
                          <span className={`font-mono font-semibold ${control.advisory ? 'text-gray-600' : 'text-gray-900'}`}>
                            {control.control_id}
                          </span>
                          {control.advisory && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                              Advisory
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <span className={`text-sm ${control.advisory ? 'text-gray-600' : 'text-gray-900'}`}>
                          {control.control_name}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(control.status)}
                          {getStatusBadge(control.status)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ControlStatusTable;
