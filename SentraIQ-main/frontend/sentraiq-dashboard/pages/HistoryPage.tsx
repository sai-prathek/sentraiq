import React from 'react';
import { useOutletContext } from 'react-router-dom';
import PackHistory from '../components/PackHistory';
import { DashboardOutletContext } from '../types';

const HistoryPage: React.FC = () => {
  const { addToast } = useOutletContext<DashboardOutletContext>();
  
  return <PackHistory onToast={addToast} />;
};

export default HistoryPage;
