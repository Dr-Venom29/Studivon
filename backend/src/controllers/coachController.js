const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini 3 Flash with API key from environment
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.warn("[Studivon] GOOGLE_API_KEY is not set. Gemini coach routes will fail until it is configured in your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.getCoachAdvice = async (req, res) => {
    // Destructure strategy (now including goal), prediction, and trends
    const { strategy, prediction, trends } = req.body;
    
    // 🎯 Goal-Driven Prompt Engineering
    const prompt = `
    You are the Studivon AI Coach. Your tone is warm, professional, and supportive.
    Your mission is to align the user's daily actions with their ultimate goal: "${strategy.goal || 'Academic Excellence'}".
    
    Follow this structure:
    1. VISION: Briefly link their current trend to their goal (e.g., "To stay on track for your ${strategy.goal}...").
    2. CONTEXT: Gently mention the rhythm change (${trends.status}) as a helpful observation.
    3. GUIDANCE: Suggest one 'small win' task that specifically serves their "${strategy.goal}" objective.
    4. ASSURE: Remind them how their ${strategy.userDNA} DNA helps them reach this specific goal.
    
    DATA: 
    - Goal: ${strategy.goal}
    - Trend: ${trends.efficiencySlope} ${trends.status}
    - Stability: ${trends.stability}
    - Forecast: ${prediction.forecast}
    
    STRICT RULES: Max 3 sentences. No "failure/danger" words. Use supportive language like "realigning" or "bridge the gap."
    `;

    let attempts = 0;
    while (attempts < 3) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return res.json({ advice: response.text() });

        } catch (err) {
            if (err.status === 429) {
                attempts++;
                const waitTime = attempts * 2000;
                console.log(`⚠️ Quota hit. Retrying in ${waitTime/1000}s...`);
                await delay(waitTime); 
            } else {
                console.error("Gemini Error:", err);
                return res.status(500).json({ error: "Coach connection failed." });
            }
        }
    }

    res.json({ 
        advice: `I'm currently optimizing your path toward ${strategy.goal || 'your goal'}. Let's keep moving forward!` 
    });
};

exports.getStrategyCoachAdvice = async (req, res) => {
    // Collect all the data from your existing 'Calculated' endpoints
    const { strategy, prediction, trends, goal } = req.body;
    
    const prompt = `
    You are the Studivon Strategy Mentor. 
    Act as a high-level academic advisor for a student aiming for: "${goal || 'Academic Excellence'}".

    USER PROFILE DATA:
    - Biological DNA: ${strategy.userDNA} (Peak efficiency in ${strategy.optimization}).
    - Cognitive Style: ${strategy.cognitiveStyle}.
    - Current Trend: ${trends.trendStatus} (${trends.efficiencySlope} slope).
    - Burnout Risk: ${trends.stressTrajectory} (Stability: ${trends.consistencyScore}).
    - Forecast: ${prediction.forecast}.

    YOUR MISSION:
    Generate a "3-Day Recovery & Re-alignment Strategy" to protect their goal.
    
    STRICT STRUCTURE:
    1. THE DIAGNOSIS: 1 sentence explaining why their current rhythm is/isn't working for their "${goal}".
    2. THE 3-DAY PLAN: 
       - Day 1: A low-friction task type matching their ${strategy.cognitiveStyle}.
       - Day 2: One high-impact goal task during their ${strategy.userDNA} window.
       - Day 3: A standard workload with a specific tip to improve their ${trends.stability} stability.
    3. THE MENTOR NUDGE: 1 supportive sentence using "Micro-Mentor" tone.

    RULES: No generic advice. Reference the specific data provided. Max 150 words.
    `;

    try {
        const result = await model.generateContent(prompt);
        const advice = result.response.text();
        res.json({ strategyAdvice: advice });
    } catch (err) {
        console.error("Strategy Coach Error:", err);
        res.status(500).json({ error: "Strategy session interrupted." });
    }
};