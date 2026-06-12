import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { api } from '../api';
import './LoginPortal.css';

const LoginPortal = ({ onClose, onAuthSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Animation states
  const [clearanceStep, setClearanceStep] = useState('input'); // input | verifying | success | error
  
  const portalRef = useRef(null);
  const lockRef = useRef(null);

  useEffect(() => {
    // Reveal portal
    gsap.fromTo(portalRef.current,
      { scale: 0.9, y: 30, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.4)" }
    );
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage("CLEARANCE DENIED: Required parameters missing.");
      return;
    }
    setLoading(true);
    setErrorMessage('');
    setClearanceStep('verifying');
    
    // Aesthetic pause for cinematic simulation
    await new Promise(r => setTimeout(r, 1200));

    try {
      const data = await api.register(username, password, goal);
      triggerSuccess(data);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "REGISTRATION FAILURE: Could not write node.");
      setClearanceStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage("CLEARANCE DENIED: Required parameters missing.");
      return;
    }
    setLoading(true);
    setErrorMessage('');
    setClearanceStep('verifying');

    // Aesthetic pause for cinematic simulation
    await new Promise(r => setTimeout(r, 1200));

    try {
      const data = await api.login(username, password);
      triggerSuccess(data);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "CLEARANCE DENIED: Invalid core credentials.");
      setClearanceStep('error');
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccess = (authData) => {
    setClearanceStep('success');
    // Lock animation transition: Red locked -> Green unlocked
    gsap.to(lockRef.current, {
      borderColor: '#10b981',
      color: '#10b981',
      boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
      duration: 0.4,
      onComplete: () => {
        // Exit animation after success reveal
        gsap.to(portalRef.current, {
          scale: 0.95,
          y: -20,
          opacity: 0,
          duration: 0.4,
          delay: 0.6,
          onComplete: () => {
            onAuthSuccess(authData.token, authData.user);
          }
        });
      }
    });
  };

  return (
    <div className="portal-overlay">
      <div className="portal-glass-panel" ref={portalRef}>
        <div className="scanner-line"></div>
        <button className="portal-close-btn" onClick={onClose} disabled={clearanceStep === 'verifying' || clearanceStep === 'success'}>
          ×
        </button>

        {/* Cinematic Lock Badge */}
        <div 
          className={`clearance-badge-circle ${
            clearanceStep === 'success' ? 'success' : 
            clearanceStep === 'error' ? 'error' : 
            clearanceStep === 'verifying' ? 'pulsing' : ''
          }`} 
          ref={lockRef}
        >
          {clearanceStep === 'success' ? '🔓' : '🔒'}
        </div>

        <header className="portal-header">
          <span className="portal-badge">SECURITY PROTOCOL 109</span>
          <h2 className="portal-title">
            {clearanceStep === 'verifying' ? 'Verifying Clearance...' : 
             clearanceStep === 'success' ? 'Clearance Level Verified' : 
             isRegisterMode ? 'Initiate Neural Core Profile' : 'Access Core clearance'}
          </h2>
          <p className="portal-subtitle font-mono">
            {clearanceStep === 'verifying' ? 'Running cryptographic checks...' :
             clearanceStep === 'success' ? 'Authentication successful. Redirecting...' :
             isRegisterMode ? 'Create credential nodes' : 'Input signed credentials to begin scan'}
          </p>
        </header>

        {clearanceStep === 'verifying' && (
          <div className="verifying-simulation">
            <div className="progress-bar-container">
              <div className="progress-bar-scan"></div>
            </div>
            <div className="terminal-readout font-mono">
              <p>&gt; Accessing user DB...</p>
              <p>&gt; Comparing hashes...</p>
              <p>&gt; Validating token signatures...</p>
            </div>
          </div>
        )}

        {clearanceStep === 'success' && (
          <div className="success-simulation">
            <div className="glowing-success-icon">ACCESS GRANTED</div>
            <p className="font-mono success-desc">&gt; Clearance Level: Alpha Core<br />&gt; Tasks parsed and goals mapped successfully.</p>
          </div>
        )}

        {(clearanceStep === 'input' || clearanceStep === 'error') && (
          <>
            {/* Tabs */}
            <div className="portal-tabs">
              <button 
                className={`portal-tab-btn ${!isRegisterMode ? 'active' : ''}`}
                onClick={() => { setIsRegisterMode(false); setErrorMessage(''); }}
              >
                ACCESS GRANTED (LOGIN)
              </button>
              <button 
                className={`portal-tab-btn ${isRegisterMode ? 'active' : ''}`}
                onClick={() => { setIsRegisterMode(true); setErrorMessage(''); }}
              >
                INITIALIZE CORE (REGISTER)
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="portal-error-terminal font-mono">
                <span className="error-alert">ALERT: </span>
                {errorMessage}
              </div>
            )}

            {/* Forms */}
            <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="portal-form">
              <div className="form-group">
                <label className="form-label">Username Node ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. neuro_pilot"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password Key</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required 
                />
              </div>

              {isRegisterMode && (
                <div className="form-group">
                  <label className="form-label">Core Objective / Study Goal (Optional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={goal} 
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Pass Calculus and master Neural Networks"
                  />
                  <span className="input-helper">We use this to extract goal-related keywords.</span>
                </div>
              )}

              <button type="submit" className="portal-submit-btn">
                {isRegisterMode ? 'INITIALIZE USER PROFILE' : 'VERIFY SECURITY CLEARANCE'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPortal;
