import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import IngestPage from './pages/IngestPage';
import QueryPage from './pages/QueryPage';
import GeneratePage from './pages/GeneratePage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Dashboard Routes with Layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/ingest" replace />} />
          <Route path="ingest" element={<IngestPage />} />
          <Route path="query" element={<QueryPage />} />
          <Route path="generate" element={<GeneratePage />} />
        </Route>

        {/* Legacy routes for backward compatibility */}
        <Route path="/ingest" element={<Navigate to="/dashboard/ingest" replace />} />
        <Route path="/query" element={<Navigate to="/dashboard/query" replace />} />
        <Route path="/generate" element={<Navigate to="/dashboard/generate" replace />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;