import React from 'react';
import { useOutletContext } from 'react-router-dom';
import GenerateTab from '../components/GenerateTab';
import { DashboardOutletContext } from '../types';

const GeneratePage: React.FC = () => {
  const {
    addToast,
    selectedEvidence,
    clearSelectedEvidence,
  } = useOutletContext<DashboardOutletContext>();
  
  return (
    <GenerateTab
      onToast={addToast}
      selectedEvidence={selectedEvidence}
      onClearSelectedEvidence={clearSelectedEvidence}
    />
  );
};

export default GeneratePage;
