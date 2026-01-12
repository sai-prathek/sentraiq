import React from 'react';
import { useOutletContext } from 'react-router-dom';
import IngestTab from '../components/IngestTab';
import { DashboardOutletContext } from '../types';

const IngestPage: React.FC = () => {
  const { addToast } = useOutletContext<DashboardOutletContext>();
  
  return <IngestTab onToast={addToast} />;
};

export default IngestPage;
