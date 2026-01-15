import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import './HeroMask.css';

const HeroMask = ({ onComplete }) => {
  useEffect(() => {
    const bootTl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    bootTl
      .fromTo(".boot-content", { opacity: 0 }, { opacity: 1, duration: 0.6 })
      .to(".boot-text", { 
        textShadow: "0 0 15px #10b981", 
        repeat: 3, 
        yoyo: true, 
        duration: 0.1 
      })
      .to(".boot-bar-inner", { 
        width: "100%", 
        duration: 1.6, 
        ease: "power2.inOut" 
      })
      .to(".boot-status", { 
        opacity: 0.4, 
        repeat: 2, 
        yoyo: true, 
        duration: 0.3 
      })
      .to(".boot-screen", { 
        opacity: 0, 
        duration: 0.6, 
        delay: 0.2 
      });
  }, [onComplete]);

  return (
    <div className="boot-container">
      <div className="boot-screen">
        <div className="boot-content">
          <h1 className="boot-text">STUDIVON</h1>
          <p className="boot-sub">COGNITIVE ENGINE v1.0</p>
          <div className="boot-bar">
            <div className="boot-bar-inner"></div>
          </div>
          <p className="boot-status">[ SYSTEM INITIALIZING... ]</p>
        </div>
      </div>
    </div>
  );
};

export default HeroMask;