import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import AssessmentQuestions, { AssessmentAnswer } from '../components/AssessmentQuestions';
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

  return (
    <div className="min-h-full">
      <AssessmentQuestions
        framework={framework}
        onComplete={handleComplete}
        onBack={handleBack}
      />
    </div>
  );
};

export default AssessPage;
