import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ControlVersioningTab from '../components/ControlVersioningTab';
import { DashboardOutletContext } from '../types';

const ControlVersioningPage: React.FC = () => {
  const { addToast } = useOutletContext<DashboardOutletContext>();
  
  return (
    <ControlVersioningTab onToast={addToast} />
  );
};

export default ControlVersioningPage;
