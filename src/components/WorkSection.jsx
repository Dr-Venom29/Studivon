import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './WorkSection.css';
import NeuralGrid from './NeuralGrid';

gsap.registerPlugin(ScrollTrigger);

const GlitchText = ({ text }) => {
  return (
    <span className="glitch-wrapper">
      <span className="glitch-text">{text}</span>
      <span className="glitch-layer layer-1" aria-hidden="true">{text}</span>
      <span className="glitch-layer layer-2" aria-hidden="true">{text}</span>
    </span>
  );
};

const Connector = () => {
  return (
    <div className="connector-wrapper">
      <div className="connector-line">
        <div className="data-packet"></div>
      </div>
    </div>
  );
};

const SystemCard = ({ title, items, isEngine = false, cardRef }) => {
  return (
    <div ref={cardRef} className={`card-node ${isEngine ? 'engine-node' : ''}`}>
      <div className="system-card">
        {/* Scanline & Accents */}
        <div className="scanline-overlay"></div>
        <div className="corner-accent corner-tl-w"></div>
        <div className="corner-accent corner-tl-h"></div>
        <div className="corner-accent corner-br-w"></div>
        <div className="corner-accent corner-br-h"></div>

        {isEngine && <div className="engine-pulse"></div>}

        <div className="card-header">
          <div className="header-icon"></div>
          <h3 className="card-title">{title}</h3>
        </div>

        <ul className="card-items">
          {items.map((item, idx) => (
            <li key={idx}>
              <span className="bullet">&gt;</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const WorkSection = () => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(".main-title",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power4.out" }
      )
        .fromTo(".card-node",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "back.out(1.2)" },
          "-=0.6"
        )
        .fromTo(".connector-wrapper",
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          "-=0.8"
        );

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="work-section">
      <NeuralGrid />

      <div className="work-container">
        {/* Header */}
        <header className="section-header">
          <div className="system-badge">
            <span className="status-dot"></span>
            <span className="badge-text">System Intelligence Flow</span>
          </div>
          <h2 className="main-title">
            <span className="title-white">How Your Cognitive</span>
            <GlitchText text="Profile Is Engineered" />
          </h2>
        </header>

        {/* Pipeline */}
        <div className="pipeline-layout">
          <SystemCard
            title="Input Signals"
            items={[
              "Study behavior analysis",
              "Temporal pattern mapping",
              "Subject performance velocity",
              "Focus consistency scoring"
            ]}
          />

          <Connector />

          <SystemCard
            isEngine={true}
            title="Neural Core"
            items={[
              "Adaptive scheduling algorithms",
              "Cognitive load analysis",
              "Burnout prediction modeling",
              "Model calibration & weighting"
            ]}
          />

          <Connector />

          <SystemCard
            title="Optimized Output"
            items={[
              "Dynamic study plans",
              "Weak topic isolation",
              "Recovery protocol alerts",
              "Long-term retention boost"
            ]}
          />
        </div>

        {/* Footer */}
        <div className="section-footer">
          <p className="footer-text">
            No Guesses. No Generic Plans. Only <span className="glow-span">Adaptive Intelligence</span>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WorkSection;