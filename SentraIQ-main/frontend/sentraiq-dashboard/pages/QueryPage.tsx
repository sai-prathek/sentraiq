import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import QueryTab from '../components/QueryTab';
import { DashboardOutletContext } from '../types';

const QueryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    addToast,
    selectedEvidence,
    addEvidenceToPack,
    removeEvidenceFromPack,
  } = useOutletContext<DashboardOutletContext>();
  
  // Check if assessment is completed (user came from assess step)
  const hasAssessmentAnswers = localStorage.getItem('assessmentAnswers') !== null;
  
  const handleContinueToGenerate = () => {
    navigate('/dashboard/generate');
  };
  
  return (
    <div className="space-y-6">
      <QueryTab
        onToast={addToast}
        selectedEvidence={selectedEvidence}
        onAddEvidenceToPack={addEvidenceToPack}
      />

      {/* Continue Button - Only show if assessment is completed */}
      {hasAssessmentAnswers && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to Generate Pack?</h3>
              <p className="text-sm text-gray-600">
                {selectedEvidence.length > 0 
                  ? `You have ${selectedEvidence.length} evidence item(s) selected. Proceed to generate your assurance pack.`
                  : 'You can add evidence items from the query results above, or proceed to generate the pack with existing evidence.'
                }
              </p>
            </div>
            <button
              onClick={handleContinueToGenerate}
              className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              Generate Assurance Pack
              <Package className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryPage;
