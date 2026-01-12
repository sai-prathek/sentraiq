import React from 'react';
import { useOutletContext } from 'react-router-dom';
import QueryTab from '../components/QueryTab';
import { DashboardOutletContext } from '../types';

const QueryPage: React.FC = () => {
  const {
    addToast,
    selectedEvidence,
    addEvidenceToPack,
    removeEvidenceFromPack,
  } = useOutletContext<DashboardOutletContext>();

  return (
    <QueryTab
      onToast={addToast}
      selectedEvidence={selectedEvidence}
      onAddEvidenceToPack={addEvidenceToPack}
    />
  );
};

export default QueryPage;
