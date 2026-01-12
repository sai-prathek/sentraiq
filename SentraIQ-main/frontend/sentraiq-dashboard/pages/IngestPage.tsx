import React from 'react';
import { useOutletContext } from 'react-router-dom';
import IngestTab from '../components/IngestTab';
import StatsDashboard from '../components/StatsDashboard';
import { DashboardOutletContext } from '../types';

const IngestPage: React.FC = () => {
  const { addToast } = useOutletContext<DashboardOutletContext>();
  
  return (
    <div className="space-y-6">
      {/* Stats Section - Only on Ingest Page */}
      <section>
        <StatsDashboard />
      </section>

      {/* Ingest Tab Content */}
      <IngestTab onToast={addToast} />
    </div>
  );
};

export default IngestPage;
