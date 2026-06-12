import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { api } from '../api';
import './ScanRoom.css';

const ScanRoom = ({ onBackToLanding }) => {
  // UI and State Management
  const [tasks, setTasks] = useState([]);
  const [dossier, setDossier] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Modals & Action overlays
  const [activeModal, setActiveModal] = useState(null); // 'dossier' | 'add-task' | 'set-goal' | null
  const [taskToComplete, setTaskToComplete] = useState(null); // task object | null
  const [actualMinutes, setActualMinutes] = useState(60);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [goalText, setGoalText] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    difficulty: 3,
    deadline: '',
    estimatedMinutes: 60,
    taskType: 'Practice'
  });

  // AI Advice caching
  const [aiCoachAdvice, setAiCoachAdvice] = useState('');
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dossier-tab'); // dossier-tab | retention-tab | coach-tab

  // References for GSAP
  const containerRef = useRef(null);
  const modalRef = useRef(null);

  // Fetch all core telemetry from Express backend
  const fetchAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [tasksData, dossierData, weeklyData] = await Promise.all([
        api.fetchTasks(),
        api.fetchDossier(),
        api.fetchWeeklyReport()
      ]);
      setTasks(tasksData);
      setDossier(dossierData);
      setWeeklyReport(weeklyData);
      if (dossierData?.identity?.currentGoal) {
        setGoalText(dossierData.identity.currentGoal);
      }
      setOfflineMode(false);
    } catch (err) {
      console.warn("Backend API error, entering local offline mode:", err);
      setOfflineMode(true);
      // Fallback mocks if server is down or database disconnected
      setTasks([
        { _id: "mock1", title: "Train CNN Image Classification Model", subject: "Computer Science", difficulty: 5, estimatedMinutes: 120, deadline: new Date(Date.now() + 86400000).toISOString(), priorityScore: 225, goalAligned: true },
        { _id: "mock2", title: "Review Linear Algebra Projections", subject: "Calculus", difficulty: 3, estimatedMinutes: 45, deadline: new Date(Date.now() + 259200000).toISOString(), priorityScore: 108, goalAligned: false },
        { _id: "mock3", title: "Solve Physics Thermodynamics Practice Test", subject: "Physics", difficulty: 4, estimatedMinutes: 90, deadline: new Date(Date.now() + 432000000).toISOString(), priorityScore: 120, goalAligned: false }
      ]);
      setDossier({
        identity: {
          disciplineLevel: "High (Consistent)",
          efficiencyLevel: "High (Fast Learner)",
          context: "Your habit consistency is excellent. You are in a great position for a mastery sprint.",
          persona: "Night Owl Specialist"
        },
        cognitiveState: {
          mentalLoadIndex: 45,
          academicReadiness: "85%",
          mentalReadiness: "55%",
          status: "Optimal",
          burnoutRisk: "Low",
          reasonSummary: "Prime conditions detected. Workload is balanced and your energy recovery is stable."
        },
        academicSummary: {
          pendingTasksCount: 3,
          activeSubjectsCount: 3,
          weakestSubject: "Physics",
          acuteIntensity: 1
        },
        actionPlan: {
          next24Hours: {
            window: "Night Owl",
            schedule: "Peak Focus at Night Owl: 30m targeted review of Physics, then primary work sessions.",
            restRecommendation: "Standard: 15min recovery breaks."
          },
          weeklyStrategy: {
            objective: "Aggressive Mastery Sprint",
            pacing: "High-Velocity",
            focusSubject: "Physics"
          }
        }
      });
      setWeeklyReport({
        timeframe: "Last 7 Days",
        mastery: { strongest: "Computer Science", weakest: "Physics" },
        retentionHeatmap: [
          { subject: "Computer Science", retentionPercentage: 92, status: "Stable", daysSinceReview: 1 },
          { subject: "Calculus", retentionPercentage: 75, status: "Fading", daysSinceReview: 3 },
          { subject: "Physics", retentionPercentage: 54, status: "Critical", daysSinceReview: 5 }
        ],
        productivity: {
          focusWindow: "Night Owl",
          burnoutRisk: "Low",
          mentalLoadIndex: 45,
          tasksCompleted: 6
        },
        suggestions: [
          "Double down on Calculus during your peak Night Owl window.",
          "Memory Alert: Your Physics retention is critical (54%). Review now."
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Hardware Accelerated Scan Line Animation
    gsap.fromTo(".sweep-bar",
      { y: "-10vh" },
      {
        y: "110vh",
        duration: 5,
        repeat: -1,
        ease: "none",
        force3D: true
      }
    );
  }, []);

  // GSAP animations for modal overlay transition
  useEffect(() => {
    if (activeModal) {
      gsap.fromTo(".hologram-modal-overlay",
        { opacity: 0, backdropFilter: 'blur(0px)' },
        { opacity: 1, backdropFilter: 'blur(20px)', duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(".modal-content-panel",
        { scale: 0.9, y: 30, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.5, delay: 0.1, ease: "back.out(1.2)" }
      );
    }
  }, [activeModal]);

  // Request AI Coach advice from Gemini
  const fetchAICoachAdvice = async () => {
    if (offlineMode) {
      setAiCoachAdvice("AI Neural Coach is offline. Please start the backend and configure GOOGLE_API_KEY in the .env file to generate dynamic cognitive optimization strategies.");
      return;
    }
    setAiCoachLoading(true);
    try {
      // Structure parameters based on user's current metrics
      const payload = {
        strategy: {
          userDNA: dossier?.identity?.persona || "Night Owl",
          cognitiveStyle: dossier?.identity?.efficiencyLevel || "Kinetic",
          goal: goalText || dossier?.identity?.currentGoal || "Academic Excellence"
        },
        prediction: {
          forecast: dossier?.cognitiveState?.reasonSummary || "Stable"
        },
        trends: {
          efficiencySlope: weeklyReport?.productivity?.burnoutRisk === "Low" ? "+12%" : "-5%",
          status: weeklyReport?.productivity?.burnoutRisk === "Low" ? "Stable" : "Overworked",
          stability: dossier?.identity?.disciplineLevel || "High"
        }
      };

      const res = await api.fetchCoachAdvice(payload);
      setAiCoachAdvice(res.advice);
    } catch (err) {
      console.error("AI Coach request error:", err);
      setAiCoachAdvice("Failed to retrieve guidance. Neural core synchronization interrupted.");
    } finally {
      setAiCoachLoading(false);
    }
  };

  useEffect(() => {
    if (activeModal === 'dossier' && activeTab === 'coach-tab' && !aiCoachAdvice) {
      fetchAICoachAdvice();
    }
  }, [activeModal, activeTab]);

  // Show status feedback toasts
  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Complete a pending task
  const handleCompleteTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskToComplete) return;
    setSubmittingAction(true);
    try {
      const res = await api.completeTask(taskToComplete._id, actualMinutes);
      triggerToast(`✅ SUCCESS: Task '${taskToComplete.title}' completed! Efficiency score: ${res.efficiencyScore}. ${res.spacedRepetition}`);
      setTaskToComplete(null);
      await fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("❌ ERROR: Failed to log task completion.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Create a new smart task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.subject || !newTask.deadline) {
      triggerToast("⚠️ WARNING: Please fill all required fields.");
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await api.addSmartTask(newTask);
      triggerToast(`🎯 SMART ASSIGNMENT CALIBRATED: Priority Score is ${res.priorityScore}`);
      setNewTask({
        title: '',
        subject: '',
        difficulty: 3,
        deadline: '',
        estimatedMinutes: 60,
        taskType: 'Practice'
      });
      setActiveModal(null);
      await fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("❌ ERROR: Failed to create smart task.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Update active Goal
  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    if (!goalText) return;
    setSubmittingAction(true);
    try {
      const res = await api.setUserGoal(goalText);
      triggerToast(`🎯 NEURAL TARGET RECALIBRATED: Keywords derived: [${res.keywords.join(', ')}]`);
      setAiCoachAdvice(''); // reset cache so it pulls new advice based on the new goal
      setActiveModal(null);
      await fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("❌ ERROR: Goal calibration failed.");
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="scan-room-container" ref={containerRef}>
      {/* Dynamic Toast System */}
      {toast && (
        <div className="telemetry-toast">
          <div className="toast-scanner" />
          <span className="toast-symbol">&gt;&gt;</span> {toast}
        </div>
      )}

      {/* Exit Chambers */}
      <button className="exit-chamber" onClick={onBackToLanding}>
        ESC // ABORT SCAN
      </button>

      {/* Floating scanning overlays */}
      <div className="scan-grid"></div>
      <div className="sweep-bar"></div>

      {/* Main scanning viewport */}
      <div className="scroll-wrapper">
        <div className="chamber-layout">
          
          {/* Offline warning header */}
          {offlineMode && (
            <div className="offline-banner">
              <span className="flashing-dot"></span>
              ⚠️ OFFLINE DEMO MODE: Database link failed. Rendering simulated cache.
            </div>
          )}

          <header className="chamber-header">
            <p className="system-tag">[ NEURAL TELEMETRY ENVIRONMENT ]</p>
            <h1 className="chamber-title">
              Cognitive Scan <span className="emerald">Dashboard</span>
            </h1>

            {/* Goal panel */}
            <div className="active-goal-strip">
              <div className="goal-indicator-glowing"></div>
              <div className="goal-details">
                <span className="goal-label">ACTIVE NEURAL GOAL</span>
                <span className="goal-value">
                  "{dossier?.identity?.currentGoal || goalText || 'Master Academic subjects dynamically'}"
                </span>
              </div>
              <button className="goal-recalibrate-btn" onClick={() => setActiveModal('set-goal')}>
                RECALIBRATE
              </button>
            </div>
          </header>

          {/* Quick Telemetry Indicators */}
          {!loading && dossier && (
            <div className="telemetry-summary-row">
              <div className="telemetry-stat-card">
                <span className="stat-label">Cognitive Load Index</span>
                <span className={`stat-value ${dossier.cognitiveState.mentalLoadIndex > 75 ? 'danger-text' : 'emerald'}`}>
                  {dossier.cognitiveState.mentalLoadIndex}/100
                </span>
                <div className="stat-bar-outer">
                  <div 
                    className={`stat-bar-inner ${dossier.cognitiveState.mentalLoadIndex > 75 ? 'danger-bg' : ''}`}
                    style={{ width: `${dossier.cognitiveState.mentalLoadIndex}%` }}
                  ></div>
                </div>
                <span className="stat-desc">Risk: {dossier.cognitiveState.burnoutRisk}</span>
              </div>

              <div className="telemetry-stat-card">
                <span className="stat-label">Academic Readiness</span>
                <span className="stat-value text-white">{dossier.cognitiveState.academicReadiness}</span>
                <div className="stat-bar-outer">
                  <div className="stat-bar-inner bg-blue" style={{ width: dossier.cognitiveState.academicReadiness }}></div>
                </div>
                <span className="stat-desc">Performance Velocity</span>
              </div>

              <div className="telemetry-stat-card">
                <span className="stat-label">Forgetting Risk</span>
                <span className="stat-value text-amber">
                  {weeklyReport?.retentionHeatmap?.find(h => h.status === 'Critical') ? 'CRITICAL' : 'STABLE'}
                </span>
                <div className="stat-bar-outer">
                  <div 
                    className="stat-bar-inner bg-amber" 
                    style={{ width: `${weeklyReport?.retentionHeatmap?.find(h => h.status === 'Critical') ? 80 : 30}%` }}
                  ></div>
                </div>
                <span className="stat-desc">Weakest: {dossier.academicSummary.weakestSubject}</span>
              </div>

              <div className="telemetry-stat-card">
                <span className="stat-label">Focus Profile</span>
                <span className="stat-value text-purple" style={{ fontSize: '1.2rem', marginTop: '10px' }}>
                  {dossier.identity.persona.replace(" Specialist", "").replace(" Achiever", "")}
                </span>
                <div className="focus-avatar-strip">
                  <span className="avatar-chip">{dossier.identity.disciplineLevel.split(' ')[0]} Discipline</span>
                </div>
                <span className="stat-desc">Cognitive DNA</span>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading ? (
            <div className="quantum-loading">
              <div className="spinner-cube">
                <div className="cube-face front"></div>
                <div className="cube-face back"></div>
                <div className="cube-face left"></div>
                <div className="cube-face right"></div>
                <div className="cube-face top"></div>
                <div className="cube-face bottom"></div>
              </div>
              <p className="loading-text">Calibrating Synapses & Downloading Telemetry...</p>
            </div>
          ) : (
            <div className="dashboard-grid">
              
              {/* Primary Scanning Queue: Prioritized Tasks */}
              <div className="scan-queue-panel">
                <div className="panel-header-row">
                  <h2 className="panel-title">&gt;_ Prioritized Neural Queue</h2>
                  <button className="add-task-btn" onClick={() => setActiveModal('add-task')}>
                    + CALIBRATE NEW TASK
                  </button>
                </div>

                <div className="tasks-scroll-container">
                  {tasks.length === 0 ? (
                    <div className="empty-tasks-card">
                      <p>All neural queues fully synchronized. No pending tasks found.</p>
                      <button onClick={() => setActiveModal('add-task')} className="btn-action primary">Calibrate First Task</button>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task._id} className={`task-hologram-card ${task.goalAligned ? 'aligned-border' : ''}`}>
                        {task.goalAligned && (
                          <div className="goal-aligned-badge">
                            <span className="badge-pulse"></span>
                            GOAL MATCH
                          </div>
                        )}
                        <div className="task-body">
                          <div className="task-meta">
                            <span className="task-subject">{task.subject}</span>
                            <span className="task-type-badge">{task.taskType || 'Practice'}</span>
                            <span className="task-days-left">
                              Due: {new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                            </span>
                          </div>
                          
                          <h3 className="task-title-text">{task.title}</h3>
                          
                          <div className="task-parameters">
                            <div className="param-item">
                              <span className="param-lbl">EST. TIME</span>
                              <span className="param-val">{task.estimatedMinutes}m</span>
                            </div>
                            <div className="param-item">
                              <span className="param-lbl">DIFFICULTY</span>
                              <span className="param-val">{"★".repeat(task.difficulty)}{"☆".repeat(5-task.difficulty)}</span>
                            </div>
                            <div className="param-item">
                              <span className="param-lbl">PRIORITY</span>
                              <span className="param-val text-neon-emerald">{task.priorityScore}</span>
                            </div>
                          </div>
                        </div>

                        <div className="task-action-wrapper">
                          <button className="complete-action-btn" onClick={() => setTaskToComplete(task)}>
                            LOG COMPLETION
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar Quick Action & Recommendations */}
              <div className="dashboard-sidebar">
                <div className="recommendations-sidebar-card">
                  <h3 className="sidebar-card-title">[ TARGETED ACTION PLAN ]</h3>
                  <div className="action-details-box">
                    <div className="plan-section">
                      <span className="plan-label">Next 24h Window:</span>
                      <p className="plan-text">{dossier?.actionPlan?.next24Hours?.schedule || "Maintain current study distribution."}</p>
                    </div>
                    <div className="plan-section">
                      <span className="plan-label">Rest Recommendation:</span>
                      <p className="plan-text text-amber">{dossier?.actionPlan?.next24Hours?.restRecommendation || "Standard: 15min recovery breaks."}</p>
                    </div>
                    <div className="plan-section">
                      <span className="plan-label">Weekly Objective:</span>
                      <p className="plan-text text-purple font-weight-bold">{dossier?.actionPlan?.weeklyStrategy?.objective || "Recovery & Stabilization"}</p>
                    </div>
                  </div>
                  <button className="btn-action primary width-100 mt-1" onClick={() => setActiveModal('dossier')}>
                    OPEN FULL ANALYTICS
                  </button>
                </div>

                <div className="sidebar-decor-terminal">
                  <div className="terminal-top">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <div className="terminal-body font-mono">
                    <p>&gt; Syncing neural telemetry...</p>
                    <p>&gt; Active connections: 4 node nodes</p>
                    <p>&gt; Stability coefficient: 0.94</p>
                    <p>&gt; Spaced Repetition engine: ACTIVE</p>
                    <p className="text-emerald">&gt; System healthy. Scanning complete.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          <footer className="chamber-footer">
            <div className="cta-group">
              <button className="btn-action primary" onClick={() => setActiveModal('dossier')}>
                View My Dossier
              </button>
              <button className="btn-action outline" onClick={fetchAllData}>
                Sync Core Telemetry
              </button>
              <button className="btn-action text" onClick={onBackToLanding}>
                Return Home
              </button>
            </div>
          </footer>

        </div>
      </div>

      {/* TASK COMPLETION INPUT OVERLAY */}
      {taskToComplete && (
        <div className="hologram-modal-overlay">
          <div className="modal-content-panel small-modal">
            <div className="modal-accent-line"></div>
            <h2 className="modal-title">Log Study Telemetry</h2>
            <p className="modal-subtitle">Registering actual study metrics for task priority adjustments.</p>
            
            <form onSubmit={handleCompleteTaskSubmit} className="futuristic-form">
              <div className="form-info-box">
                <strong>Task:</strong> {taskToComplete.title}<br />
                <strong>Estimated Time:</strong> {taskToComplete.estimatedMinutes} minutes
              </div>

              <div className="form-group">
                <label className="form-label">Actual Study Duration (minutes)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={actualMinutes} 
                  onChange={(e) => setActualMinutes(e.target.value)}
                  min="5" 
                  max="600"
                  required
                />
                <span className="input-helper">We compare this to estimation to compute your cognitive efficiency slope.</span>
              </div>

              <div className="modal-action-row">
                <button type="button" className="btn-action outline" onClick={() => setTaskToComplete(null)}>
                  CANCEL
                </button>
                <button type="submit" className="btn-action primary" disabled={submittingAction}>
                  {submittingAction ? "LOGGING..." : "ARCHIVE & CALCULATE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SET GOAL MODAL */}
      {activeModal === 'set-goal' && (
        <div className="hologram-modal-overlay">
          <div className="modal-content-panel small-modal">
            <div className="modal-accent-line"></div>
            <h2 className="modal-title">Recalibrate Neural Core Goal</h2>
            <p className="modal-subtitle">Gemini AI will extract focus keywords from your goal to prioritize aligning assignments.</p>
            
            <form onSubmit={handleUpdateGoal} className="futuristic-form">
              <div className="form-group">
                <label className="form-label">Ultimate Goal / Examination Objective</label>
                <textarea 
                  className="form-input text-area" 
                  value={goalText} 
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="e.g. Master Machine Learning models and Calculus to pass my exam with high marks"
                  required
                />
              </div>

              <div className="modal-action-row">
                <button type="button" className="btn-action outline" onClick={() => setActiveModal(null)}>
                  CANCEL
                </button>
                <button type="submit" className="btn-action primary" disabled={submittingAction}>
                  {submittingAction ? "RECALIBRATING..." : "SUBMIT TO CORE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {activeModal === 'add-task' && (
        <div className="hologram-modal-overlay">
          <div className="modal-content-panel">
            <div className="modal-accent-line"></div>
            <h2 className="modal-title">Calibrate New Study Task</h2>
            <p className="modal-subtitle">Injecting dynamic assignments into the priority engine.</p>
            
            <form onSubmit={handleCreateTask} className="futuristic-form grid-form">
              <div className="form-group col-span-2">
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="e.g., Study Backpropagation Calculations"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newTask.subject} 
                  onChange={(e) => setNewTask({...newTask, subject: e.target.value})}
                  placeholder="e.g. Calculus"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Task Type</label>
                <select 
                  className="form-input" 
                  value={newTask.taskType} 
                  onChange={(e) => setNewTask({...newTask, taskType: e.target.value})}
                >
                  <option value="Practice">Practice (Applied Questions)</option>
                  <option value="Revision">Revision (Theoretical Review)</option>
                  <option value="First-time">First-time Study (Conceptual Intro)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty (1 - 5)</label>
                <input 
                  type="range" 
                  className="form-slider" 
                  min="1" 
                  max="5" 
                  value={newTask.difficulty}
                  onChange={(e) => setNewTask({...newTask, difficulty: Number(e.target.value)})}
                />
                <div className="slider-labels">
                  <span>Light (1)</span>
                  <span>Intense (5)</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Duration (minutes)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={newTask.estimatedMinutes}
                  onChange={(e) => setNewTask({...newTask, estimatedMinutes: Number(e.target.value)})}
                  min="10" 
                  required 
                />
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">Target Completion Deadline</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                  required 
                />
              </div>

              <div className="modal-action-row col-span-2">
                <button type="button" className="btn-action outline" onClick={() => setActiveModal(null)}>
                  CANCEL
                </button>
                <button type="submit" className="btn-action primary" disabled={submittingAction}>
                  {submittingAction ? "SCHEDULING..." : "INTEGRATE TASK"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL COGNITIVE DOSSIER / ANALYTICS MODAL */}
      {activeModal === 'dossier' && dossier && weeklyReport && (
        <div className="hologram-modal-overlay">
          <div className="modal-content-panel wide-modal">
            <div className="modal-accent-line"></div>
            
            <header className="dossier-modal-header">
              <h2 className="modal-title">Student Cognitive Dossier</h2>
              <button className="close-dossier-btn" onClick={() => setActiveModal(null)}>×</button>
            </header>

            <div className="dossier-layout-body">
              {/* Tab Navigation */}
              <div className="dossier-sidebar-tabs">
                <button 
                  className={`tab-nav-btn ${activeTab === 'dossier-tab' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dossier-tab')}
                >
                  🧬 Cognitive DNA
                </button>
                <button 
                  className={`tab-nav-btn ${activeTab === 'retention-tab' ? 'active' : ''}`}
                  onClick={() => setActiveTab('retention-tab')}
                >
                  📉 Retention Heatmap
                </button>
                <button 
                  className={`tab-nav-btn ${activeTab === 'coach-tab' ? 'active' : ''}`}
                  onClick={() => setActiveTab('coach-tab')}
                >
                  🧠 AI Core Mentor
                </button>
              </div>

              {/* Tab Contents */}
              <div className="dossier-main-content">
                
                {/* TAB 1: COGNITIVE DNA */}
                {activeTab === 'dossier-tab' && (
                  <div className="tab-pane-content">
                    <h3 className="pane-title">&gt; Biological Focus & Efficiency Mapping</h3>
                    
                    <div className="dna-summary-grid">
                      <div className="dna-stat">
                        <span className="dna-lbl">Peak Efficiency Window:</span>
                        <span className="dna-val text-white">{dossier.identity.persona}</span>
                      </div>
                      <div className="dna-stat">
                        <span className="dna-lbl">Cognitive Learning Style:</span>
                        <span className="dna-val text-white">{dossier.identity.cognitiveStyle}</span>
                      </div>
                      <div className="dna-stat">
                        <span className="dna-lbl">Habit Consistency:</span>
                        <span className="dna-val text-emerald">{dossier.identity.disciplineLevel}</span>
                      </div>
                      <div className="dna-stat">
                        <span className="dna-lbl">Overall Subject Mastery:</span>
                        <span className="dna-val text-emerald">{dossier.cognitiveState.academicReadiness}</span>
                      </div>
                    </div>

                    <div className="dossier-status-section">
                      <h4 className="section-subtitle">[ SYSTEM DIAGNOSIS ]</h4>
                      <p className="status-quote font-mono">"{dossier.identity.context}"</p>
                      <div className="reason-summary-panel">
                        <strong>State Reason:</strong> {dossier.cognitiveState.reasonSummary}
                      </div>
                    </div>

                    <div className="action-plan-summary">
                      <h4 className="section-subtitle">[ TACTICAL ADVICE ]</h4>
                      <ul>
                        <li><strong>Study Mode:</strong> {dossier.actionPlan.weeklyStrategy.objective}</li>
                        <li><strong>Next Action:</strong> {dossier.actionPlan.next24Hours.schedule}</li>
                        <li><strong>Weekly Pacing:</strong> {dossier.actionPlan.weeklyStrategy.pacing}</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB 2: RETENTION HEATMAP */}
                {activeTab === 'retention-tab' && (
                  <div className="tab-pane-content">
                    <h3 className="pane-title">&gt; Forgetting Curve Forgetting Rate Heatmap</h3>
                    <p className="pane-desc">We calculate the probability of retention ($R = e^{-t/S}$) where $t$ is days since review and $S$ is memory stability.</p>

                    <div className="heatmap-bars-container">
                      {weeklyReport.retentionHeatmap.length === 0 ? (
                        <p className="font-mono">Syncing retention scores. Complete a study session to initialize calculations.</p>
                      ) : (
                        weeklyReport.retentionHeatmap.map((heatmap, idx) => (
                          <div key={idx} className="heatmap-bar-row">
                            <div className="heatmap-row-meta">
                              <span className="heatmap-subj">{heatmap.subject}</span>
                              <span className={`heatmap-status-badge ${heatmap.status.toLowerCase()}`}>
                                {heatmap.status}
                              </span>
                            </div>
                            
                            <div className="heatmap-bar-track">
                              <div 
                                className={`heatmap-bar-fill ${heatmap.status.toLowerCase()}`}
                                style={{ width: `${heatmap.retentionPercentage}%` }}
                              >
                                <span className="heatmap-percent-lbl">{heatmap.retentionPercentage}%</span>
                              </div>
                            </div>
                            
                            <div className="heatmap-row-footer">
                              <span>Memory Stability: {heatmap.daysSinceReview}d since last review</span>
                              <span>Target review scheduled</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="retention-summary-stats font-mono mt-1">
                      <div>Strongest Core: {weeklyReport.mastery.strongest}</div>
                      <div>Weakest Link: {weeklyReport.mastery.weakest}</div>
                      <div>Completed Sessions (7d): {weeklyReport.productivity.tasksCompleted}</div>
                    </div>
                  </div>
                )}

                {/* TAB 3: AI CORE MENTOR */}
                {activeTab === 'coach-tab' && (
                  <div className="tab-pane-content">
                    <h3 className="pane-title">&gt; Synaptic AI Coach Recommendations</h3>
                    
                    <div className="ai-coach-terminal">
                      <div className="ai-coach-avatar">
                        <div className="avatar-pulse"></div>
                        <span className="avatar-letter">AI</span>
                      </div>

                      <div className="ai-speech-box">
                        {aiCoachLoading ? (
                          <div className="terminal-typing-simulation">
                            <span className="simulation-cursor"></span> Querying Gemini 3.5 Neural Core...
                          </div>
                        ) : (
                          <p className="ai-advice-text font-mono">
                            {aiCoachAdvice || "Click below to initialize high-level mentor advice."}
                          </p>
                        )}
                      </div>
                    </div>

                    {!aiCoachAdvice && !aiCoachLoading && (
                      <button className="btn-action primary mt-1" onClick={fetchAICoachAdvice}>
                        CALIBRATE AI GUIDANCE
                      </button>
                    )}

                    {aiCoachAdvice && !aiCoachLoading && (
                      <button className="btn-action outline mt-1" onClick={fetchAICoachAdvice}>
                        RE-SYNC COACH ADVICE
                      </button>
                    )}
                  </div>
                )}

              </div>
            </div>

            <footer className="dossier-modal-footer">
              <button className="btn-action outline" onClick={() => setActiveModal(null)}>
                EXIT DOSSIER
              </button>
            </footer>

          </div>
        </div>
      )}

    </div>
  );
};

export default ScanRoom;