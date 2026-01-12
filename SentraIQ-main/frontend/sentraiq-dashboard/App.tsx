import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [demoMode, setDemoMode] = useState(false);

  const handleEnter = (mode: 'empty' | 'demo') => {
    // If demo mode is selected, we could potentially seed data here
    // or pass the flag to the dashboard to show specific toasts/states
    setDemoMode(mode === 'demo');
    setView('dashboard');
  };

  const handleHome = () => {
    setView('landing');
    setDemoMode(false);
  };

  return (
    <>
      {view === 'landing' ? (
        <LandingPage onEnter={handleEnter} />
      ) : (
        <Dashboard demoMode={demoMode} onHome={handleHome} />
      )}
    </>
  );
};

export default App;