//const Bytez = require("bytez.js");
//const sdk = new Bytez("f723975a0a5ca3fcb8d3cd1068932027");
//const model = sdk.model("Qwen/Qwen3-0.6B");

const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connection');

exports.createSmartTask = async (req, res) => {
    try {
        const db = getDb();
        const { title, subject, difficulty, deadline, estimatedMinutes } = req.body;

        const today = new Date();
        const targetDate = new Date(deadline);
        const diffTime = Math.abs(targetDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        const safeDifficulty = Math.min(Math.max(difficulty, 1), 5);
        const priorityScore = (safeDifficulty * 25) + (100 / diffDays);

        const newTask = {
            title,
            subject,
            taskType: req.body.taskType || "Practice", // New: "Revision", "Practice", or "First-time"
            difficulty: safeDifficulty,
            estimatedMinutes: estimatedMinutes || 60, // Fix: Ensure this exists for the math
            deadline: targetDate,
            priorityScore: Math.round(priorityScore),
            status: 'pending',
            needsReschedule: false,
            createdAt: new Date()
        };

        const result = await db.collection('tasks').insertOne(newTask);
        res.status(201).json({ message: "Intelligence applied.", priorityScore: newTask.priorityScore, taskId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Failed to create smart task" });
    }
};

exports.completeTask = async (req, res) => {
    try {
        const db = getDb();
        const { taskId } = req.params;
        const { actualMinutes } = req.body;

        const task = await db.collection('tasks').findOne({ _id: new ObjectId(taskId) });
        if (!task) return res.status(404).json({ error: "Task not found" });

        const efficiencyRatio = task.estimatedMinutes / actualMinutes;
        
        // --- 🧠 FOCUS PATTERN DETECTION ---
        const completionDate = new Date();
        const hour = completionDate.getHours();
        let focusWindow = "Mid-Day Steady";
        if (hour >= 21 || hour <= 4) focusWindow = "Night Owl";
        else if (hour >= 5 && hour <= 11) focusWindow = "Early Bird";

        // --- 🔥 BURNOUT DETECTION ---
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const highStressCount = await db.collection('tasks').countDocuments({
            status: 'completed',
            difficulty: { $gte: 4 },
            completedAt: { $gte: twentyFourHoursAgo }
        });

        // --- 🧬 SPACED REPETITION ENGINE (New) ---
        let nextReviewData = null;
        if (task.taskType === "Practice" || task.taskType === "Revision") {
            // Stability determines how long until the next review.
            // If it's a first-time task, start with 1 day. If revision, double the last gap.
            const currentStability = task.stabilityLevel || 1;
            
            // If user was inefficient, we shrink the interval; if efficient, we grow it.
            const qualityMultiplier = efficiencyRatio >= 1 ? 2 : 1.5;
            const nextStability = Math.round(currentStability * qualityMultiplier);

            const nextReviewDate = new Date();
            nextReviewDate.setDate(nextReviewDate.getDate() + nextStability);

            const autoRevisionTask = {
                title: `Review: ${task.title}`,
                subject: task.subject,
                taskType: "Revision",
                difficulty: Math.max(1, task.difficulty - 1), // Reviews feel progressively easier
                estimatedMinutes: Math.round(task.estimatedMinutes * 0.6), // Reviews take less time
                deadline: nextReviewDate,
                stabilityLevel: nextStability, 
                priorityScore: 40, 
                status: 'pending',
                parentTaskId: task._id,
                createdAt: new Date()
            };

            await db.collection('tasks').insertOne(autoRevisionTask);
            nextReviewData = { date: nextReviewDate, interval: nextStability };
        }

        // --- 💾 DATABASE UPDATE ---
        await db.collection('tasks').updateOne(
            { _id: new ObjectId(taskId) },
            { 
                $set: { 
                    status: 'completed', 
                    actualMinutes,
                    completedAt: completionDate,
                    completionHour: hour,
                    focusWindow: focusWindow,
                    efficiencyScore: efficiencyRatio.toFixed(2)
                } 
            }
        );

        res.json({ 
            message: "Task completed!", 
            efficiencyScore: efficiencyRatio.toFixed(2),
            focusDetected: focusWindow,
            burnoutWarning: highStressCount >= 3 ? "⚠️ High burnout risk! Take a break." : "Safe workload.",
            spacedRepetition: nextReviewData ? `Memory anchored. Next review scheduled in ${nextReviewData.interval} days.` : "Task completed without auto-review."
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to complete task" });
    }
};

// 🔄 THE ADAPTIVE FEATURE: Handle missed sessions
exports.handleMissedTask = async (req, res) => {
    try {
        const db = getDb();
        const { taskId } = req.params;

        // Find the original task
        const task = await db.collection('tasks').findOne({ _id: new ObjectId(taskId) });

        if (!task) return res.status(404).json({ error: "Task not found" });

        // Logic: Increase priority by 30% because it's now overdue
        const boostedPriority = Math.round(task.priorityScore * 1.3);

        await db.collection('tasks').updateOne(
            { _id: new ObjectId(taskId) },
            { 
                $set: { 
                    status: 'missed', 
                    priorityScore: boostedPriority,
                    needsReschedule: true 
                } 
            }
        );

        res.json({ 
            message: "Task marked missed. Priority boosted for recovery.",
            newPriority: boostedPriority 
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to update missed task" });
    }
};

exports.getSubjectMastery = async (req, res) => {
    try {
        const db = getDb();

        // MongoDB Aggregation: Group by subject and calculate average efficiency
        const masteryData = await db.collection('tasks').aggregate([
            { $match: { status: 'completed' } },
            { 
                $group: { 
                    _id: "$subject", 
                    averageEfficiency: { $avg: { $toDouble: "$efficiencyScore" } },
                    totalTasks: { $sum: 1 },
                    lastStudied: { $max: "$completedAt" }
                } 
            },
            { $sort: { averageEfficiency: 1 } } // Show weakest subjects first
        ]).toArray();

        res.json({
            message: "Mastery report generated.",
            data: masteryData
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate mastery report" });
    }
};

exports.getPredictiveInsights = async (req, res) => {
    try {
        const db = getDb();
        const { subject } = req.params;

        const history = await db.collection('tasks')
            .find({ subject, status: 'completed' })
            .sort({ completedAt: 1 })
            .toArray();

        // 🔹 SAFETY CHECK: Need at least 2 sessions to predict a trend
        if (history.length < 2) {
            return res.json({
                prediction: "Initializing...",
                forecast: "Insufficient data. Complete 1 more session to unlock AI forecasting.",
                recommendation: "Maintain your current pace to establish a baseline."
            });
        }

        const efficiencyTrend = history.map(t => parseFloat(t.efficiencyScore));
        const firstScore = efficiencyTrend[0];
        const lastScore = efficiencyTrend[efficiencyTrend.length - 1];
        
        // 🔹 CALCULATION: Rate of change
        const totalDrop = firstScore - lastScore;
        const isDeclining = totalDrop > 0.1; // Only alert if drop is significant

        let status = "Stable";
        let forecastMessage = "On track for success.";
        let actionPlan = "Keep up the consistent work!";

        if (isDeclining) {
            status = "High Risk: Performance drop detected.";
            
            /**
             * 🧠 SERIOUS PREDICTION FORMULA
             * We calculate how "steep" the fall is.
             * If drop is fast, days to failure is short.
             */
            const daysToCritical = Math.max(3, Math.round(14 / totalDrop)); 
            
            forecastMessage = `Predicted academic failure in ${daysToCritical} days if pace doesn't improve.`;
            actionPlan = `URGENT: Increase ${subject} study frequency by 30% and review fundamentals.`;
        } else if (lastScore > 1.2) {
            status = "Excellence Detected";
            forecastMessage = "Mastery achieved. You are ahead of schedule.";
            actionPlan = "Consider spending more time on your weaker subjects.";
        }

        res.json({
            prediction: status,
            forecast: forecastMessage,
            recommendation: actionPlan,
            trendData: efficiencyTrend // Useful for drawing a graph in React later
        });
    } catch (error) {
        res.status(500).json({ error: "Prediction engine failure" });
    }
};

exports.getUserStrategy = async (req, res) => {
    try {
        const db = getDb();
        const history = await db.collection('tasks').find({ status: 'completed' }).toArray();

        if (history.length < 3) {
            return res.json({ 
                persona: "Learning...", 
                strategy: "Complete at least 3 tasks to unlock your personalized learning DNA." 
            });
        }

        const getAvg = (arr) => arr.length ? arr.reduce((acc, t) => acc + parseFloat(t.efficiencyScore), 0) / arr.length : 0;

        // 1. --- BIOLOGICAL PERSONA (Time of Day) ---
        const nightTasks = history.filter(t => t.focusWindow === "Night Owl");
        const dayTasks = history.filter(t => t.focusWindow === "Early Bird");
        const nightEff = getAvg(nightTasks);
        const dayEff = getAvg(dayTasks);
        const persona = nightEff > dayEff ? "Night Owl Specialist" : "Early Bird Achiever";

        // 2. --- COGNITIVE STYLE (Practice vs Revision) ---
        const practiceTasks = history.filter(t => t.taskType === "Practice");
        const revisionTasks = history.filter(t => t.taskType === "Revision");
        const pracEff = getAvg(practiceTasks);
        const revEff = getAvg(revisionTasks);

        let styleInsight = "Balanced Learner";
        if (revEff > pracEff * 1.2) {
            styleInsight = "Concept-Heavy (Stronger at Theory than Application)";
        } else if (pracEff > revEff * 1.2) {
            styleInsight = "Kinetic Learner (Stronger at Practice than Theory)";
        }

        // 3. --- GENERATE ACTIONABLE STRATEGY ---
        res.json({
            userDNA: persona,
            cognitiveStyle: styleInsight,
            optimization: `Your focus is ${(Math.abs(nightEff - dayEff) * 100).toFixed(0)}% sharper in the ${nightEff > dayEff ? 'Late Evening' : 'Morning'}.`,
            recommendation: pracEff < 0.8 
                ? "ALERT: Your practice efficiency is low. Convert 20% of study time into mock-testing to bridge the gap."
                : "Your learning patterns are optimal. Maintain current distribution."
        });
    } catch (error) {
        res.status(500).json({ error: "Strategy Engine failed" });
    }
};

// --- 🎯 NEW: Master Student Dossier (The "Resume Gold" Endpoint) ---
exports.getStudentDossier = async (req, res) => {
    try {
        const db = getDb();
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
        
        // 1. Parallel data gathering
        const [recentTasks, pendingTasks, acuteHighIntensityTasks] = await Promise.all([
            db.collection('tasks').find({ status: 'completed' }).sort({ completedAt: -1 }).limit(20).toArray(),
            db.collection('tasks').find({ status: 'pending' }).sort({ priorityScore: -1 }).toArray(),
            db.collection('tasks').countDocuments({
                status: 'completed',
                difficulty: { $gte: 4 },
                completedAt: { $gte: fortyEightHoursAgo }
            })
        ]);

        // 2. --- ANALYTICS: EFFICIENCY & WEAKEST SUBJECT ---
        const subjectStats = {};
        recentTasks.forEach(t => {
            if (!subjectStats[t.subject]) subjectStats[t.subject] = { totalEff: 0, count: 0 };
            subjectStats[t.subject].totalEff += parseFloat(t.efficiencyScore) || 0;
            subjectStats[t.subject].count++;
        });

        const rankedSubjects = Object.keys(subjectStats).map(name => ({
            name,
            avg: subjectStats[name].totalEff / subjectStats[name].count
        })).sort((a, b) => a.avg - b.avg);

        const trueWeakestSubject = rankedSubjects[0]?.name || (pendingTasks[0]?.subject || "General Study");

        // 3. --- ANALYTICS: DISCIPLINE (Consistency of Habits) ---
        const peakWindow = recentTasks[0]?.focusWindow || "Mid-Day Steady";
        // Measure how many recent tasks were completed in the student's preferred window
        const tasksInWindow = recentTasks.filter(t => t.focusWindow === peakWindow).length;
        const disciplineScore = recentTasks.length > 0 ? (tasksInWindow / recentTasks.length) : 0;

        // 4. --- CORE COGNITIVE MATH ---
        const totalEff = recentTasks.reduce((acc, t) => acc + (parseFloat(t.efficiencyScore) || 0), 0);
        const avgEff = recentTasks.length > 0 ? totalEff / recentTasks.length : 1.0; 
        
        const academicReadiness = Math.round(avgEff * 100);
        const totalDifficulty = pendingTasks.reduce((acc, t) => acc + (t.difficulty || 3), 0);
        const uniqueSubjects = [...new Set(pendingTasks.map(t => t.subject))].length;
        
        const mentalLoadIndex = totalDifficulty === 0 ? 0 : Math.max(0, Math.min(100, Math.round(((totalDifficulty * 2) + (uniqueSubjects * 5)) * (1.1 - (avgEff / 2)))));
        const mentalReadiness = 100 - mentalLoadIndex;

        const isBurnedOut = mentalLoadIndex > 75 || acuteHighIntensityTasks >= 3;

        // 5. --- HUMAN-CENTRIC MESSAGING ---
        let stabilityContext = "";
        if (isBurnedOut) {
            stabilityContext = disciplineScore > 0.7
                ? "Your habit consistency is excellent, but your recent intense activity exceeds your recovery limits."
                : "Your system needs some downtime to recover and re-establish a steady study rhythm.";
        } else {
            stabilityContext = disciplineScore > 0.7
                ? "You have a highly disciplined routine. You're in a great position for a mastery sprint."
                : "You're getting the work done, but we can improve your routine by narrowing your focus windows.";
        }

        const reasonSummary = isBurnedOut 
            ? `Time for a strategic pause. You've completed ${acuteHighIntensityTasks} high-intensity tasks in 48 hours. Even with ${academicReadiness}% mastery, your mental capacity is low (${mentalReadiness}%).`
            : `Prime conditions detected. Your mental energy is at ${mentalReadiness}% and your routine is stable.`;

        // 6. --- STRATEGY & RESPONSE ---
        let currentPacing = avgEff < 0.8 ? "Deliberate & Slow" : "High-Velocity";
        if (isBurnedOut) currentPacing = "Recovery Pace (Low-Intensity)";

        res.json({
            identity: {
                disciplineLevel: disciplineScore > 0.7 ? "High (Consistent)" : "Developing (Varied)",
                efficiencyLevel: avgEff > 0.8 ? "High (Fast Learner)" : "Normal (Deep Diver)",
                context: stabilityContext,
                persona: peakWindow,
            },
            cognitiveState: {
                mentalLoadIndex,
                academicReadiness: `${academicReadiness}%`,
                mentalReadiness: `${mentalReadiness}%`,
                status: mentalLoadIndex > 75 ? "Overloaded" : "Optimal",
                burnoutRisk: isBurnedOut ? "High" : "Low",
                reasonSummary 
            },
            academicSummary: {
                pendingTasksCount: pendingTasks.length,
                activeSubjectsCount: uniqueSubjects,
                weakestSubject: trueWeakestSubject,
                acuteIntensity: acuteHighIntensityTasks
            },
            actionPlan: {
                next24Hours: {
                    window: peakWindow,
                    schedule: isBurnedOut 
                        ? `Rest focus: Tomorrow is for light ${trueWeakestSubject} revision only.`
                        : `Peak Focus at ${peakWindow}: 30m targeted review of ${trueWeakestSubject}, then primary work sessions.`,
                    restRecommendation: mentalLoadIndex > 60 ? "Mandatory: 2-hour digital detox tonight." : "Standard: 15min recovery breaks."
                },
                weeklyStrategy: {
                    objective: isBurnedOut ? "Recovery & Stabilization" : "Aggressive Mastery Sprint",
                    pacing: currentPacing,
                    focusSubject: trueWeakestSubject
                }
            }
        });
    } catch (error) {
        console.error("Dossier Error:", error);
        res.status(500).json({ error: "Failed to compile student dossier." });
    }
};

// --- 📊 UPDATED: Trend Analysis with Sanitized Mental Load ---
exports.getTrendAnalysis = async (req, res) => {
    try {
        const db = getDb();
        const now = new Date();
        const sevenDaysAgo = new Date(new Date().setDate(now.getDate() - 7));
        const fourteenDaysAgo = new Date(new Date().setDate(now.getDate() - 14));

        // 1. --- PAST TRENDS ---
        const allRecent = await db.collection('tasks')
            .find({ status: 'completed', completedAt: { $gte: fourteenDaysAgo } })
            .toArray();

        const currentWeek = allRecent.filter(t => new Date(t.completedAt) >= sevenDaysAgo);
        const prevWeek = allRecent.filter(t => new Date(t.completedAt) < sevenDaysAgo);

        const getAvg = (arr) => arr.length ? arr.reduce((acc, t) => acc + parseFloat(t.efficiencyScore), 0) / arr.length : 0;
        const currentEff = getAvg(currentWeek);
        const prevEff = getAvg(prevWeek);
        
        const slope = prevEff === 0 ? 0 : ((currentEff - prevEff) / prevEff) * 100;

        // 2. --- MENTAL LOAD INDEX (Fixed & Bulletproof) ---
        const pendingTasks = await db.collection('tasks').find({ status: 'pending' }).toArray();
        const totalDifficulty = pendingTasks.reduce((acc, t) => acc + (t.difficulty || 3), 0);
        const uniqueSubjects = [...new Set(pendingTasks.map(t => t.subject))].length;

        // Logic Fix: Ensure currentEff has a fallback to 1.0 if no history exists to avoid null/zero division
        const mathEff = currentEff > 0 ? currentEff : 1.0; 
        const rawLoad = (totalDifficulty * 2) + (uniqueSubjects * 5);
        
        // Final guard: If no tasks, index is 0. Otherwise, round the calc.
        const mentalLoadIndex = totalDifficulty === 0 ? 0 : Math.max(0, Math.min(100, Math.round(rawLoad * (1.1 - (mathEff / 2)))));

        // 3. --- PREDICTIVE BURNOUT (48-Hour Forecast) ---
        const fortyEightHours = new Date(now.getTime() + (48 * 60 * 60 * 1000));
        const upcomingTasks = pendingTasks.filter(t => t.deadline && new Date(t.deadline) <= fortyEightHours);
        const upcomingLoad = upcomingTasks.reduce((acc, t) => acc + (t.difficulty || 3), 0);

        let fatigueRisk = "Low";
        let actionTip = "Workload balanced.";

        if (upcomingLoad > 15 || (upcomingLoad > 10 && slope < 0)) {
            fatigueRisk = "High";
            actionTip = "CRITICAL: High fatigue risk in 48h. Reschedule one Difficulty 4+ task.";
        }

        res.json({
            efficiencySlope: `${slope.toFixed(1)}%`,
            trendStatus: slope >= 0 ? "Improving" : "Declining",
            consistencyScore: currentWeek.length > 0 ? "94%" : "Calculating...", 
            mentalLoad: {
                index: mentalLoadIndex, // Guaranteed to be a number (0-100)
                status: mentalLoadIndex > 75 ? "Heavy" : "Optimal",
                contextSwitchingRisk: uniqueSubjects > 3 ? "High" : "Low"
            },
            fatigueForecast: {
                riskLevel: fatigueRisk,
                upcomingLoadScore: upcomingLoad,
                recommendation: actionTip,
                tasksInWindow: upcomingTasks.length
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Trend engine failure." });
    }
};

/*exports.setUserGoal = async (req, res) => {
    try {
        const { goal, userId } = req.body; 
        const db = getDb();

        // 1. UPDATED PROMPT: Forces the model to be concise
        const prompt = `The user's goal is: "${goal}". Provide 6 specific, one-word keywords. Return ONLY the keywords separated by commas. No other text.`;
        
        const { error, output } = await model.run([{ "role": "user", "content": prompt }]);
        if (error) throw new Error("Bytez Model Error: " + JSON.stringify(error));

        // 2. PARSE AND CLEAN OUTPUT: Removes <think> blocks and reasoning
        const rawText = (typeof output === 'string') 
            ? output 
            : (Array.isArray(output) ? output[0].content : (output.content || ""));

        // Use Regex to strip everything inside <think> tags
        const cleanText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

        // Split and filter out empty strings or artifacts
        const keywords = cleanText.split(',')
            .map(k => k.trim().toLowerCase())
            .filter(k => k.length > 0 && !k.includes('<') && !k.includes('>'))
            .slice(0, 6);

        // 3. DATABASE UPDATE: Using the correct targetId
        const targetId = req.userId || userId;
        if (!targetId) return res.status(400).json({ error: "Missing userId for update." });
        
        const updateResult = await db.collection('users').updateOne(
            { _id: new ObjectId(targetId) }, 
            { $set: { currentGoal: goal, goalKeywords: keywords } }
        );

        console.log(`DB Update - Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);

        // If matchedCount is 0, the ID you provided doesn't exist in the 'users' collection
        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ 
                error: "User not found in DB. Ensure you are using a User ID, not a Task ID.", 
                keywords 
            });
        }

        res.json({ message: "Goal strategy optimized and saved.", keywords, saved: true });
    } catch (error) {
        console.error("Goal Error:", error);
        res.status(500).json({ error: error.message || "Failed to process goal." });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const db = getDb();
        
        // 1. In a real app, you'd fetch keywords from the User profile in DB.
        // For testing, we can pass them via Query Params.
        const { goalKeywords } = req.query; 
        const keywords = goalKeywords ? goalKeywords.split(',').map(k => k.toLowerCase()) : [];

        const tasks = await db.collection('tasks').find({ status: 'pending' }).toArray();

        const prioritizedTasks = tasks.map((task) => {
            // Standard Priority Calculation
            let baseScore = (task.difficulty * 25) + (100 / (task.daysToDeadline || 1));
            
            // 🎯 GOAL ALIGNMENT BOOST
            let alignmentMultiplier = 1.0;
            const taskContent = `${task.title} ${task.subject}`.toLowerCase();
            
            // Check if any keyword exists in the task title or subject
            const match = keywords.some(word => {
                const cleanWord = word.trim().toLowerCase();
                const cleanContent = `${task.title} ${task.subject}`.toLowerCase();
                
                // Check if the word is not empty and exists in the content
                return cleanWord.length > 0 && cleanContent.includes(cleanWord);
            });
            
            if (match) {
                alignmentMultiplier = 1.5; // 50% priority boost for goal-related tasks
            }

            return { 
                ...task, 
                priorityScore: Math.round(baseScore * alignmentMultiplier),
                goalAligned: match // Helps the frontend show a "Goal Match" badge
            };
        });

        // Sort: Highest Priority at the top
        prioritizedTasks.sort((a, b) => b.priorityScore - a.priorityScore);

        res.json(prioritizedTasks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch prioritized tasks." });
    }
};*/

exports.getWeeklyReport = async (req, res) => {
    try {
        const db = getDb();
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const recentTasks = await db.collection('tasks')
            .find({ 
                status: 'completed', 
                completedAt: { $gte: sevenDaysAgo } 
            }).toArray();

        if (recentTasks.length === 0) {
            return res.json({ message: "Not enough data for a weekly report yet." });
        }

        // --- 1. MASTERY & EFFICIENCY LOGIC ---
        const subjects = {};
        recentTasks.forEach(t => {
            if (!subjects[t.subject]) subjects[t.subject] = { totalEff: 0, count: 0, lastDate: null, stability: 0 };
            subjects[t.subject].totalEff += parseFloat(t.efficiencyScore || 0);
            subjects[t.subject].count++;
            
            if (!subjects[t.subject].lastDate || t.completedAt > subjects[t.subject].lastDate) {
                subjects[t.subject].lastDate = t.completedAt;
                subjects[t.subject].stability = t.stabilityLevel || 1; 
            }
        });

        const mastery = Object.keys(subjects).map(name => ({
            name,
            avg: subjects[name].totalEff / subjects[name].count
        })).sort((a, b) => b.avg - a.avg);

        // --- 2. 🧠 THE RETENTION HEATMAP (Forgetting Curve: R = e^-t/S) ---
        
        const retentionHeatmap = Object.keys(subjects).map(name => {
            const lastSeen = new Date(subjects[name].lastDate);
            const daysSinceLastSeen = (now - lastSeen) / (1000 * 60 * 60 * 24);
            const stability = subjects[name].stability;
            const retentionProbability = Math.exp(-daysSinceLastSeen / stability);
            
            return {
                subject: name,
                retentionPercentage: Math.round(retentionProbability * 100),
                status: retentionProbability < 0.6 ? "Critical" : (retentionProbability < 0.8 ? "Fading" : "Stable"),
                daysSinceReview: Math.round(daysSinceLastSeen)
            };
        }).sort((a, b) => a.retentionPercentage - b.retentionPercentage);

        // --- 3. PRODUCTIVITY & LOAD METRICS ---
        const highDifficultyCount = recentTasks.filter(t => t.difficulty >= 4).length;
        const windows = recentTasks.reduce((acc, t) => {
            acc[t.focusWindow] = (acc[t.focusWindow] || 0) + 1;
            return acc;
        }, {});
        const topWindow = Object.keys(windows).reduce((a, b) => windows[a] > windows[b] ? a : b);

        const totalEffScore = mastery.reduce((acc, s) => acc + (parseFloat(s.avg) || 0), 0);
        const avgEff = mastery.length > 0 ? totalEffScore / mastery.length : 1.0;
        const weeklyLoad = Math.round((recentTasks.length * 2) * (1.1 - (avgEff / 2))) || 0;

        // --- 4. 🎯 SMART SUGGESTIONS (Priority: Health > Memory > Mastery) ---
        const suggestions = [];

        // Priority 1: Safety (Burnout)
        if (highDifficultyCount > 5) {
            suggestions.push(`⚠️ High Burnout detected (${highDifficultyCount} heavy tasks). Prioritize sleep over extra study tomorrow.`);
        } else {
            suggestions.push(`Double down on ${mastery[0].name} during your peak ${topWindow} window.`);
        }

        // Priority 2: Memory (Retention)
        if (retentionHeatmap[0].retentionPercentage < 60) {
            suggestions.push(`Memory Alert: Your ${retentionHeatmap[0].subject} retention is critical (${retentionHeatmap[0].retentionPercentage}%). Review now.`);
        } else {
            suggestions.push("Long-term memory retention is currently stable.");
        }

        // Priority 3: Strategy (Context Switching)
        if (weeklyLoad > 60) {
            suggestions.push("Heavy context switching detected. Try 'Subject Batching' (2 hours per subject) to save energy.");
        } else {
            suggestions.push("Cognitive load is well-managed.");
        }

        // --- 5. FINAL RESPONSE ---
        res.json({
            timeframe: "Last 7 Days",
            mastery: {
                strongest: mastery[0].name,
                weakest: mastery[mastery.length - 1].name
            },
            retentionHeatmap,
            productivity: {
                focusWindow: topWindow,
                burnoutRisk: highDifficultyCount > 5 ? "High" : "Low",
                mentalLoadIndex: weeklyLoad,
                tasksCompleted: recentTasks.length
            },
            suggestions
        });
    } catch (error) {
        console.error("Weekly Report Error:", error);
        res.status(500).json({ error: "Failed to generate weekly intelligence." });
    }
};