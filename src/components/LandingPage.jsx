import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import logo from '../assets/logo.png';
import './LandingPage.css';

const HERO_WORDS = [
  'Intelligence',
  'Focus',
  'Potential',
  'Mastery',
  'Clarity',
];

const LandingPage = ({ onStartScan }) => {
  const containerRef = useRef(null);
  const ctaRef = useRef(null);
  const subTextRef = useRef(null);
  const wordRef = useRef(null);

  // Helper to generate the 13x13 (169 dots) grid
  const renderGrid = () => {
    return Array.from({ length: 169 }).map((_, i) => (
      <div key={i} className="grid-dot"></div>
    ));
  };

  useLayoutEffect(() => {
    const hasAnimated = sessionStorage.getItem('studivon_landing_animated');
    const isCoarsePointer =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches;

    let interfaceLayerEl = null;
    let ctaButtonEl = null;
    let pointerMoveHandler = null;

    // Using gsap.context for clean cleanup on mobile device orientation changes
    let ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (!hasAnimated) {
        tl.addLabel("start")
          .fromTo(".reveal-dot", 
            { scale: 0, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(2)" },
            "start"
          )
          .to(containerRef.current, {
            "--mask-size": "200%",
            duration: 2,
            ease: "expo.inOut",
            delay: 0.3,
            onComplete: () => {
              sessionStorage.setItem('studivon_landing_animated', 'true');
            }
          })
          .to(".reveal-dot", { opacity: 0, duration: 0.5 }, "-=1.5")
          .fromTo(".grid-dot", 
            { scale: 0, opacity: 0 },
            { 
              scale: 1, 
              opacity: 0.55, 
              duration: 1.2,
              stagger: { grid: [13, 13], from: "center", amount: 1.5 },
              ease: "power2.out" 
            }, "-=1.2")
          .fromTo(".content-fade", 
            { y: 30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" },
            "-=1"
          );
      } else {
        gsap.set(containerRef.current, { "--mask-size": "200%" });
        gsap.set(".reveal-dot", { opacity: 0 });
        gsap.set(".grid-dot", { scale: 1, opacity: 0.55 });
        gsap.set(".content-fade", { y: 0, opacity: 1 });
      }

      if (!isCoarsePointer) {
        interfaceLayerEl = document.querySelector('.interface-layer');
        ctaButtonEl = ctaRef.current;

        if (interfaceLayerEl && ctaButtonEl) {
          const radius = 220; // pixels around button center

          pointerMoveHandler = (e) => {
            const rect = ctaButtonEl.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const distance = Math.hypot(dx, dy);

            if (distance < radius) {
              const strength = 1 - distance / radius; // 0 at edge, 1 at center
              gsap.to(ctaButtonEl, {
                x: dx * 0.15 * strength,
                y: dy * 0.15 * strength,
                duration: 0.2,
                ease: 'sine.out',
                overwrite: 'auto',
              });
            } else {
              gsap.to(ctaButtonEl, {
                x: 0,
                y: 0,
                duration: 0.3,
                ease: 'sine.out',
                overwrite: 'auto',
              });
            }
          };

          interfaceLayerEl.addEventListener('mousemove', pointerMoveHandler);
        }
      }
    }, containerRef);

    return () => {
      if (interfaceLayerEl && pointerMoveHandler) {
        interfaceLayerEl.removeEventListener('mousemove', pointerMoveHandler);
      }
      if (ctaButtonEl) {
        gsap.set(ctaButtonEl, { x: 0, y: 0 });
      }
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const handleClick = (event) => {
      if (!subTextRef.current) return;

      const selection = window.getSelection?.();
      if (!selection || !selection.toString()) return;

      if (subTextRef.current.contains(event.target)) return;

      selection.removeAllRanges();
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    const target = wordRef.current;
    if (!target) return;

    let index = 0;

    const colors = [
      '#10b981', // Intelligence
      '#0ea5e9', // Focus
      '#22c55e', // Potential
      '#14b8a6', // Mastery
      '#38bdf8', // Clarity
    ];

    const applyColor = (i) => {
      const c = colors[i % colors.length];
      target.style.backgroundImage = 'none';
      target.style.webkitBackgroundClip = 'initial';
      target.style.backgroundClip = 'initial';
      target.style.color = c;
      target.style.textShadow = 'none';
    };

    applyColor(index);

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 4 });

    HERO_WORDS.forEach(() => {
      tl.to(target, {
        y: -4,
        opacity: 0,
        duration: 1.4,
        ease: 'sine.inOut',
        onComplete: () => {
          index = (index + 1) % HERO_WORDS.length;
          target.textContent = HERO_WORDS[index];
          applyColor(index);

          const dotColor = colors[index % colors.length];
          gsap.to('.grid-dot', {
            backgroundColor: dotColor,
            duration: 2.2,
            ease: 'sine.inOut',
            stagger: { grid: [13, 13], from: 'center', amount: 1.8 },
          });
        },
      })
        .to(target, {
          y: 0,
          opacity: 1,
          duration: 1.8,
          ease: 'sine.out',
        })
        .to(target, {
          duration: 3.2,
        });
    });

    return () => {
      tl.kill();
    };
  }, []);

  const handleTransition = () => {
    const exitTl = gsap.timeline({ onComplete: onStartScan });
    exitTl.to([".content-fade", ".grid-dot"], {
      opacity: 0,
      y: -20,
      duration: 0.5,
      stagger: 0.05,
      ease: "power2.in"
    })
    .to(containerRef.current, {
      "--mask-size": "0%", 
      duration: 1.2,
      ease: "expo.inOut"
    }, "-=0.3")
    .to(".reveal-dot", { opacity: 1, scale: 1, duration: 0.4 }, "-=0.5");
  };

  return (
    <div className="main-wrapper" ref={containerRef}>
      <div className="reveal-dot"></div>

      <div className="engine-layer">
        <div className="tech-grid"></div>
        <h2 className="bg-watermark">STUDIVON</h2>
      </div>

      <div className="interface-layer">
        <div className="neural-scan-line" />

        <div className="top-nav content-fade">
          <div className="nav-left">
            <img src={logo} alt="Studivon logo" className="nav-logo" />
            <span className="nav-brand">Studivon</span>
          </div>
          <button className="nav-login-btn">Login</button>
        </div>

        <div className="status-strip content-fade">
          <div className="status-strip-inner">
            <div className="status-marquee">
              <span>
                Focus Systems Online • Learning Engine Calibrated • Performance Tracking Active • Cognitive Load Balanced • Study Flow Optimized
              </span>
              <span>
                Focus Systems Online • Learning Engine Calibrated • Performance Tracking Active • Cognitive Load Balanced • Study Flow Optimized
              </span>
            </div>
          </div>
        </div>

        <div className="stagger-grid-container">
          {renderGrid()}
        </div>

        <div className="hero-content">
          <div className="badge content-fade">READY TO OPTIMIZE</div>
          <h1 className="main-title content-fade">
            Unfold Your <br />
            <span ref={wordRef}>Intelligence</span>
          </h1>
          <p ref={subTextRef} className="sub-title content-fade">
            Build focus. Reduce overload.<br className="hide-mobile" />
            Strengthen your weak areas.
          </p>
          <div className="btn-group content-fade">
            <button ref={ctaRef} className="btn-primary" onClick={handleTransition}>Initialize Scan</button>
            <button className="btn-secondary">Open Dossier</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;