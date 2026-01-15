import React, { useState } from 'react';
import HeroMask from './components/HeroMask';
import LandingPage from './components/LandingPage';
import FeatureSection from './components/FeatureSection'; // New Import
import ScanRoom from './components/ScanRoom';
import './App.css';

function App() {
  const [stage, setStage] = useState(() => {
    const savedStage = sessionStorage.getItem('studivon_current_stage');
    const hasBooted = sessionStorage.getItem('studivon_booted');
    
    if (savedStage === 'scan') return 'scan';
    if (hasBooted) return 'landing';
    return 'boot';
  });

  const handleBootComplete = () => {
    sessionStorage.setItem('studivon_booted', 'true');
    sessionStorage.setItem('studivon_current_stage', 'landing');
    setStage('landing');
  };

  const handleStartScan = () => {
    sessionStorage.setItem('studivon_current_stage', 'scan');
    setStage('scan');
  };

  const handleBackToLanding = () => {
    sessionStorage.setItem('studivon_current_stage', 'landing');
    setStage('landing');
  };

  return (
    <main className="antialiased">
      {stage === 'boot' && <HeroMask onComplete={handleBootComplete} />}
      
      {stage === 'landing' && (
        <>
          <LandingPage onStartScan={handleStartScan} />
          <FeatureSection /> {/* Rendered as a scrollable part of Landing */}
        </>
      )}

      {stage === 'scan' && <ScanRoom onBackToLanding={handleBackToLanding} />}
    </main>
  );
}

export default App;