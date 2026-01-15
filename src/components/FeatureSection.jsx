import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './FeatureSection.css';

gsap.registerPlugin(ScrollTrigger);

const FeatureCard = ({ title, subtitle, description, iconColor }) => {
  return (
    <div className="feature-card">
      {/* Dynamic scan line element */}
      <div className="card-scanner"></div>
      
      <div className="card-content">
        <span className="system-badge">{subtitle}</span>
        <h3 className="feature-title">{title}</h3>
        <p className="feature-desc">{description}</p>
      </div>
      <div className="card-corner-accent" style={{ borderColor: iconColor }}></div>
      
      {/* Decorative HUD numbers */}
      <div className="card-id">ID: {Math.random().toString(36).substr(2, 5).toUpperCase()}</div>
    </div>
  );
};

const FeatureSection = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Header Protocol Text Animation (Typewriter effect)
      gsap.from(".section-label", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        x: -20,
        duration: 0.8
      });

      // 2. The "Crazy" Grid Transition
      const cards = gsap.utils.toArray(".feature-card");
      
      gsap.fromTo(cards, 
        { 
          opacity: 0,
          scale: 0.8,
          y: 100,
          rotationX: 45, // Tilt back in 3D space
          transformOrigin: "center top",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotationX: 0,
          stagger: {
            amount: 0.8,
            from: "start"
          },
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            end: "top 30%",
            scrub: 1, // Makes the transition tied to the scroll speed
          }
        }
      );

      // 3. Scanner Line Loop (Independent of scroll once triggered)
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(".card-scanner", {
            top: "100%",
            duration: 2,
            stagger: 0.2,
            repeat: -1,
            ease: "none"
          });
        }
      });
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-container">
      {/* Background decoration */}
      <div className="section-bg-grid"></div>
      
      <header className="section-header">
        <p className="section-label">PROTOCOL: SYSTEM_CAPABILITIES_REVEAL</p>
        <h2 className="section-title">
          Engineering Your <span>Neural Edge.</span>
        </h2>
      </header>

      <div ref={gridRef} className="feature-grid">
        <FeatureCard 
          subtitle="COGNITIVE SYNC"
          title="Adaptive Study Engine"
          description="Builds fluid, high-velocity schedules that recalibrate based on your real-time performance patterns."
          iconColor="#10b981"
        />
        <FeatureCard 
          subtitle="RETENTION CORE"
          title="Spaced Repetition System"
          description="Mathematical optimization of revision intervals, ensuring concepts are precision-locked into long-term neural memory."
          iconColor="#10b981"
        />
        <FeatureCard 
          subtitle="LOAD MONITOR"
          title="Burnout Detection"
          description="Biometric and performance tracking to preemptively identify cognitive overload before it impacts mastery."
          iconColor="#10b981"
        />
        <FeatureCard 
          subtitle="PRECISION FOCUS"
          title="Weak Subject Isolation"
          description="Deep-dive diagnostics that isolate friction points in your learning and prioritize high-impact problem areas."
          iconColor="#10b981"
        />
      </div>
    </section>
  );
};

export default FeatureSection;