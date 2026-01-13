import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import ComplianceAssessment, { AssessmentAnswer } from '../components/ComplianceAssessment';
import { DashboardOutletContext } from '../types';

const AssessPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useOutletContext<DashboardOutletContext>();

  const handleComplete = (answers: AssessmentAnswer[]) => {
    // Store answers in context or localStorage for later use
    localStorage.setItem('assessmentAnswers', JSON.stringify(answers));
    addToast(`Assessment completed: ${answers.length} questions answered`, 'success');
    navigate('/dashboard/query');
  };

  const handleBack = () => {
    navigate('/dashboard/ingest');
  };

  // Get framework from localStorage or default to SWIFT_CSP
  const framework = localStorage.getItem('selectedFramework') || 'SWIFT_CSP';
  
  // Get framework name and version from objectiveSelection
  let frameworkName: string | undefined;
  let frameworkVersion: string | undefined;
  try {
    const objectiveSelection = localStorage.getItem('objectiveSelection');
    if (objectiveSelection) {
      const selection = JSON.parse(objectiveSelection);
      if (selection.frameworks && selection.frameworks.length > 0) {
        frameworkName = selection.frameworks[0].name;
        frameworkVersion = selection.frameworks[0].version;
      }
    }
  } catch (e) {
    console.warn('Failed to parse objective selection:', e);
  }

  return (
    <div className="min-h-full">
      <ComplianceAssessment
        framework={framework}
        frameworkName={frameworkName}
        frameworkVersion={frameworkVersion}
        onComplete={handleComplete}
        onBack={handleBack}
      />
    </div>
  );
};

export default AssessPage;
