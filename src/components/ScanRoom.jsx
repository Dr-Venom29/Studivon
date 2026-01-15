import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import './ScanRoom.css';

const ScanRoom = ({ onBackToLanding }) => {
  const modules = [
    { title: "Task Priority Engine", desc: "AI-driven sorting based on cognitive deadlines.", icon: "🎯" },
    { title: "Mental Load Index", desc: "Real-time quantification of your current brain strain.", icon: "🧠" },
    { title: "Burnout Forecast", desc: "Predictive modeling to flag exhaustion before it hits.", icon: "⚠️" },
    { title: "Cognitive DNA", desc: "Maps your peak focus hours and unique learning style.", icon: "🧬" },
    { title: "Spaced Repetition", desc: "Optimized review cycles for long-term retention.", icon: "🔄" }
  ];

  useEffect(() => {
    const tl = gsap.timeline();

    // Entrance Animation (Central orb animation removed)
    tl.fromTo(".scan-grid", { opacity: 0 }, { opacity: 0.15, duration: 1.5 })
      .fromTo(".system-module", 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power2.out" }, 
        "-=0.5"
      );

    // Hardware Accelerated Scan Line
    gsap.fromTo(".sweep-bar", 
      { y: "-10vh" }, 
      { 
        y: "110vh", 
        duration: 4, 
        repeat: -1, 
        ease: "none",
        force3D: true 
      }
    );
  }, []);

  return (
    <div className="scan-room-container">
      <button className="exit-chamber" onClick={onBackToLanding}>
        ESC // ABORT SCAN
      </button>
      <div className="scan-grid"></div>
      <div className="sweep-bar"></div>

      <div className="scroll-wrapper">
        <div className="chamber-layout">
          <header className="chamber-header">
            <p className="system-tag">[ SYSTEM EXPLANATION MODE ]</p>
            <h1 className="chamber-title">Core Intelligence <span className="emerald">Modules</span></h1>
          </header>

          <div className="modules-grid">
            {modules.map((mod, i) => (
              <div key={i} className="system-module">
                <div className="module-header">
                  <span className="module-icon">{mod.icon}</span>
                  <h3>{mod.title}</h3>
                </div>
                <p>{mod.desc}</p>
                <button className="mini-link">View Example</button>
              </div>
            ))}
          </div>

          <footer className="chamber-footer">
            {/* Central orb removed from here */}
            <div className="cta-group">
              <button className="btn-action primary">View My Dossier</button>
              <button className="btn-action outline">Try Demo</button>
              <button className="btn-action text" onClick={onBackToLanding}>Return Home</button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ScanRoom;