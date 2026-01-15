import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './FeatureSection.css';
import NeuralGrid from './NeuralGrid';

gsap.registerPlugin(ScrollTrigger);

const FeatureCard = ({ title, subtitle, description }) => {
  return (
    <div className="feature-card">
      <div className="card-content">
        <span className="system-badge">{subtitle}</span>
        <h3 className="feature-title">{title}</h3>
        <p className="feature-desc">{description}</p>
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

      // 1. Header Animation
      gsap.from(".section-label", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power2.out"
      });

      gsap.from(".section-title", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.1,
        ease: "power2.out"
      });

      // 2. Card Animation (Fade + Slight Y Movement + Stagger)
      // No bouncy effects, no scaling, just clean reveal
      const cards = gsap.utils.toArray(".feature-card");
      
      gsap.fromTo(cards, 
        { 
          opacity: 0,
          y: 60, 
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1,
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
        <p className="section-label">[ SYSTEM CAPABILITIES ]</p>
        <h2 className="section-title">
          Engineering Your <span className="highlight">Neural Edge.</span>
        </h2>
      </header>

      <div ref={gridRef} className="feature-grid">
        <FeatureCard 
          subtitle="COGNITIVE SYNC"
          title="Adaptive Study Engine"
          description="Builds fluid, high-velocity schedules that recalibrate based on your real-time performance patterns."
        />
        <FeatureCard 
          subtitle="RETENTION CORE"
          title="Spaced Repetition"
          description="Mathematical optimization of revision intervals, ensuring concepts are precision-locked into long-term neural memory."
        />
        <FeatureCard 
          subtitle="LOAD MONITOR"
          title="Burnout Detection"
          description="Biometric and performance tracking to preemptively identify cognitive overload before it impacts mastery."
        />
        <FeatureCard 
          subtitle="PRECISION FOCUS"
          title="Weak Subject Isolation"
          description="Deep-dive diagnostics that isolate friction points in your learning and prioritize high-impact problem areas."
        />
      </div>
    </section>
  );
};

export default FeatureSection;