# Studivon: Full-Stack Neural Intelligence Interface

Studivon is a high-end, proprietary AI terminal designed to track mental load, prevent burnout, and master complex subjects through adaptive neural analysis.  
This project combines a cinematic, high-performance frontend with a robust backend to provide real-time cognitive insights.

---

##  System Overview

Studivon operates as a digital **"Neural Core."**  
The application is structured as a stage-based state machine, transitioning users from a cold-boot sequence into a live scanning environment.

---

##  Frontend Architecture (The Interface)

The frontend is built for **visual impact and speed**, utilizing a **Terminal-First** aesthetic.

### Key Features

- **Cinematic Handshake** 
  Uses **GSAP** and **Anime.js** to orchestrate a 3D perspective reveal and radial mask expansion upon system boot.

Fluid Responsive Design: Implements CSS Clamp and Dynamic Viewport Units (dvh) to ensure massive desktop typography scales perfectly for mobile devices without layout breakage.

Protocol Modules: Feature sections are treated as technical dossiers, appearing via staggered scroll-triggers.

---

##  Backend Architecture (The Engine)

The backend serves as the **Cognitive Engine**, processing user performance data to generate adaptive study patterns.

### Core Components

- **API Layer**  
  RESTful architecture using **Node.js/Express** or **Python/FastAPI** for handling neural telemetry and user data.

- **Neural Analysis Logic**
  - **Adaptive Scheduling** – Recalibrates study intervals based on performance oscillations  
  - **Memory Optimization** – Server-side spaced repetition for long-term retention  

- **Database Schema**  
  Optimized for **time-series data** to track:
  - Mental Load  
  - Subject Mastery  

---

##  Tech Stack

### Frontend
- **Framework:** React (Vite)  
- **Animations:** GSAP, ScrollTrigger, Anime.js  
- **Styling:** Pure CSS3 (Flexbox/Grid)  
- **Typography:** JetBrains Mono  
- **API Client:** Native Fetch client (proxied to port 5000 in Vite config)

### Backend
- **Runtime:** Node.js / Express  
- **Database:** Local MongoDB (`mongodb://127.0.0.1:27017/studivon`)  
- **AI Core Engine:** Google Generative AI (Gemini 3.5 Flash) for personalized study coaching and goal alignment

---

##  Implemented Features

### Protocol: `SYSTEM_CAPABILITIES_REVEAL`
A cinematic GSAP transition that reveals key training vectors.

### Protocol: `DASHBOARD_TELEMETRY_SCAN`
Full integration of the React frontend dashboard with backend analytics:
- **Active Scanning Queue:** Displays pending tasks sorted dynamically by a multi-factor priority score.
- **Goal Recalibration:** Direct alignment of tasks with a core user goal, boosted using Gemini AI keyword extraction.
- **Task Logging Controls:** Interface to submit actual study times, recalculating cognitive efficiency in real-time.
- **Holographic Dossier Modal:** Displays detailed glassmorphic panels for:
  - *Cognitive DNA:* Focus windows (Night Owl/Early Bird), style mapping, and system load status.
  - *Retention Heatmap:* Shows forgetting curve calculations ($R = e^{-t/S}$) per subject.
  - *AI Coach advice:* Generates personalized strategies via real-time Gemini prompts.
- **Self-Healing Fallbacks:** Automated offline mode that uses cached mock state if the server is unreachable.

---

##  Deployment & Persistence

- **Stage Management**  
  `sessionStorage` tracks system boot status and animation loops to skip animations for returning sessions.

- **Global State**  
  React Hooks manage the current **Neural Stage**:
  - Boot  
  - Landing  

---
