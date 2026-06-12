import React, { useState } from 'react';
import HeroMask from './components/HeroMask';
import LandingPage from './components/LandingPage';
import FeatureSection from './components/FeatureSection'; 
import ScanRoom from './components/ScanRoom';
import WorkSection from './components/WorkSection';
import LoginPortal from './components/LoginPortal';
import { api } from './api';
import './App.css';

function App() {
  const [stage, setStage] = useState(() => {
    const savedStage = sessionStorage.getItem('studivon_current_stage');
    const hasBooted = sessionStorage.getItem('studivon_booted');
    const token = localStorage.getItem('studivon_token');
    
    if (savedStage === 'scan' && token) return 'scan';
    if (hasBooted) return 'landing';
    return 'boot';
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('studivon_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLogin, setShowLogin] = useState(false);

  const handleBootComplete = () => {
    sessionStorage.setItem('studivon_booted', 'true');
    sessionStorage.setItem('studivon_current_stage', 'landing');
    setStage('landing');
  };

  const handleStartScan = () => {
    if (!localStorage.getItem('studivon_token')) {
      setShowLogin(true);
      return;
    }
    sessionStorage.setItem('studivon_current_stage', 'scan');
    setStage('scan');
  };

  const handleBackToLanding = () => {
    sessionStorage.setItem('studivon_current_stage', 'landing');
    setStage('landing');
  };

  const handleAuthSuccess = (token, authenticatedUser) => {
    setUser(authenticatedUser);
    setShowLogin(false);
    
    // Auto enter scan room upon login/register
    sessionStorage.setItem('studivon_current_stage', 'scan');
    setStage('scan');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    handleBackToLanding();
  };

  return (
    <main className="antialiased">
      {stage === 'boot' && <HeroMask onComplete={handleBootComplete} />}
      
      {stage === 'landing' && (
        <>
          <LandingPage 
            onStartScan={handleStartScan} 
            user={user} 
            onLogout={handleLogout}
            onOpenLogin={() => setShowLogin(true)}
          />
          <FeatureSection /> 
          <WorkSection />
        </>
      )}

      {stage === 'scan' && (
        <ScanRoom 
          onBackToLanding={handleBackToLanding} 
          user={user}
          onLogout={handleLogout}
        />
      )}

      {showLogin && (
        <LoginPortal 
          onClose={() => setShowLogin(false)} 
          onAuthSuccess={handleAuthSuccess} 
        />
      )}
    </main>
  );
}

export default App;