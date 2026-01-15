import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './FeatureSection.css';
import NeuralGrid from './NeuralGrid';
import TerminalTyping from './TerminalTyping';

gsap.registerPlugin(ScrollTrigger);

const FeatureCard = ({ title, subtitle, description, moduleId, status, meta }) => {
  return (
    <div className="feature-card">
      <div className="card-accent" />
      <div className="card-content">
        <div className="card-header-row">
          <div className="card-header-main">
            <span className="card-tag">{subtitle}</span>
            <div className="card-divider" />
          </div>
          {moduleId && <span className="module-id">{moduleId}</span>}
        </div>

        <h3 className="feature-title">{title}</h3>

        <p className="feature-desc">{description}</p>

        <div className="card-readout">
          {status && <span className="readout-line">{status}</span>}
          {meta && <span className="readout-line">{meta}</span>}
        </div>
      </div>
    </div>
  );
};

const FeatureSection = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 0. Neural Descent Scan: hero compresses, scan line sweeps, grid intensifies, features rise
      const neuralTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top center",
          scrub: true,
        },
      });

      neuralTl
        // Phase 1 – Compression: hero moves up and slightly scales down
        .to(
          ".hero-content",
          {
            y: -40,
            scale: 0.96,
            transformOrigin: "center top",
            ease: "none",
          },
          0
        )
        // Phase 2 – Scan Sweep: glowing line descends
        .fromTo(
          ".neural-scan-line",
          { yPercent: -60, opacity: 0 },
          { yPercent: 140, opacity: 1, ease: "none" },
          0.05
        )
        // Background dots / grid intensify slightly
        .fromTo(
          ".stagger-grid-container",
          { opacity: 0.75 },
          { opacity: 1, ease: "none" },
          0
        )
        // Phase 3 – System Activation: feature section rises in
        .fromTo(
          sectionRef.current,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, ease: "none" },
          0.25
        );

      // 1. Header Animation (clean fade + slight upward motion)
      gsap.from(".terminal-title", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
        opacity: 0,
        y: 16,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".section-title", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 18,
        duration: 0.8,
        delay: 0.1,
        ease: "power3.out",
      });

      // 2. Card Animation (system modules loading in sequence)
      const cards = gsap.utils.toArray(".feature-card");
      
      gsap.fromTo(cards, 
        { 
          opacity: 0,
          y: 40, 
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.9,
          ease: "power3.out", // Smooth, premium deceleration
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
          }
        }
      );
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-container">
      <NeuralGrid />
      <header className="section-header">
        <TerminalTyping />
        <h2 className="section-title">
          Engineering Your <span className="highlight">Neural Edge.</span>
        </h2>
      </header>

      <div ref={gridRef} className="feature-grid">
        <FeatureCard 
          subtitle="COGNITIVE SYNC"
          title="Adaptive Study Engine"
          description={
            <>
              Builds fluid, high-velocity schedules that recalibrate based on your
              {" "}
              <span className="feature-highlight">REAL-TIME</span>
              {" "}
              performance patterns.
            </>
          }
          moduleId="M-01"
          status="STATUS: ACTIVE"
          meta="MODE: ADAPTIVE"
        />
        <FeatureCard 
          subtitle="RETENTION CORE"
          title="Spaced Repetition"
          description={
            <>
              Mathematical optimization of revision intervals, ensuring concepts are precision-locked into
              {" "}
              <span className="feature-highlight">LONG-TERM</span>
              {" "}
              neural memory.
            </>
          }
          moduleId="M-02"
          status="STATUS: OPTIMAL"
          meta="MODE: SPACED"
        />
        <FeatureCard 
          subtitle="LOAD MONITOR"
          title="Burnout Detection"
          description={
            <>
              Biometric and performance tracking to preemptively identify
              {" "}
              <span className="feature-highlight">COGNITIVE</span>
              {" "}
              overload before it impacts mastery.
            </>
          }
          moduleId="M-03"
          status="STATUS: MONITORING"
          meta="RISK: LOW"
        />
        <FeatureCard 
          subtitle="PRECISION FOCUS"
          title="Weak Subject Isolation"
          description={
            <>
              Deep-dive diagnostics that isolate friction points in your learning and prioritize
              {" "}
              <span className="feature-highlight">HIGH-IMPACT</span>
              {" "}
              problem areas.
            </>
          }
          moduleId="M-04"
          status="STATUS: SCANNING"
          meta="PRIORITY: HIGH"
        />
        <FeatureCard 
          subtitle="NEURAL TELEMETRY"
          title="Real-time Bio-Feedback"
          description={
            <>
              Integrates with hardware sensors to monitor
              {" "}
              <span className="feature-highlight">FOCUS</span>
              {" "}
              levels and
              {" "}
              <span className="feature-highlight">HEART-RATE</span>
              {" "}
              variability, adjusting task difficulty dynamically.
            </>
          }
          moduleId="M-05"
          status="STATUS: STREAMING"
          meta="SIGNAL: STABLE"
        />
        <FeatureCard 
          subtitle="SYNAPTIC BRIDGING"
          title="Cross-Domain Synthesis"
          description={
            <>
              AI-driven mapping that identifies
              {" "}
              <span className="feature-highlight">CONCEPTUAL</span>
              {" "}
              links between unrelated subjects, accelerating
              {" "}
              <span className="feature-highlight">HOLISTIC</span>
              {" "}
              understanding.
            </>
          }
          moduleId="M-06"
          status="STATUS: LINKED"
          meta="COVERAGE: 82%"
        />
        <FeatureCard 
          subtitle="DATA DOSSIER"
          title="Predictive Mastery Analytics"
          description={
            <>
              Uses
              {" "}
              <span className="feature-highlight">TIME-SERIES</span>
              {" "}
              regression to forecast exam readiness and pinpoint exactly when you will achieve
              {" "}
              <span className="feature-highlight">PEAK</span>
              {" "}
              recall.
            </>
          }
          moduleId="M-07"
          status="STATUS: PREDICTING"
          meta="CONFIDENCE: 94%"
        />
        <FeatureCard 
          subtitle="CONTENT DISTILLATION"
          title="Automated Neural Summaries"
          description={
            <>
              Advanced NLP engines that compress
              {" "}
              <span className="feature-highlight">HIGH-DENSITY</span>
              {" "}
              textbooks into interactive,
              {" "}
              <span className="feature-highlight">HIGH-RETENTION</span>
              {" "}
              cognitive maps.
            </>
          }
          moduleId="M-08"
          status="STATUS: GENERATING"
          meta="DENSITY: COMPRESSED"
        />
      </div>
    </section>
  );
};

export default FeatureSection;