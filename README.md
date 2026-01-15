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

- **Fluid Responsive Design**  
  Implements **CSS Clamp** and **Dynamic Viewport Units (dvh)** to ensure massive desktop typography scales perfectly for mobile devices without layout breakage.

- **Protocol Modules**  
  Feature sections are treated as technical dossiers, appearing via staggered scroll-trigger animations.

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

### Backend (Proposed / Current)
- **Runtime:** Node.js / Express  
- **Database:** PostgreSQL or MongoDB  
- **Authentication:** JWT-based *Security Clearance* protocols  

---

##  Implemented Features

### Protocol: `SYSTEM_CAPABILITIES_REVEAL`

A cinematic transition that unfolds the following modules:

- **Adaptive Study Engine** – Real-time performance-based scheduling  
- **Spaced Repetition** – Mathematical optimization of revision intervals  
- **Burnout Detection** – Identifies cognitive overload early  
- **Weak Subject Isolation** – Prioritizes high-impact learning gaps  

---

##  Deployment & Persistence

- **Stage Management**  
  `sessionStorage` tracks system boot status to skip re-initialization for returning users.

- **Global State**  
  React Hooks manage the current **Neural Stage**:
  - Boot  
  - Landing  
  - Scan  

---
