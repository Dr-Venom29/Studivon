const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'studivon_neural_secret_key_2026';

exports.register = async (req, res) => {
    try {
        const db = getDb();
        const { username, password, goal } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        // 1. Check if user already exists
        const existingUser = await db.collection('users').findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: "Security clearance profile already exists for this username." });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Setup default cognitive DNA profile
        const newUser = {
            username: username.toLowerCase(),
            password: hashedPassword,
            currentGoal: goal || "Master Neural Networks and Machine Learning",
            goalKeywords: ["neural", "network", "machine", "learning", "ai", "model"], // default baseline keywords
            userDNA: "Night Owl Specialist",
            cognitiveStyle: "Kinetic Learner (Stronger at Practice than Theory)",
            disciplineLevel: "Developing (Varied)",
            efficiencyLevel: "Normal (Deep Diver)",
            createdAt: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);
        const token = jwt.sign({ userId: result.insertedId }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: "Clearance profile created.",
            token,
            user: {
                id: result.insertedId,
                username: newUser.username,
                goal: newUser.currentGoal
            }
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Failed to establish clearance profile." });
    }
};

exports.login = async (req, res) => {
    try {
        const db = getDb();
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        // 1. Find user
        const user = await db.collection('users').findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: "Access Denied: Invalid security credentials." });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Access Denied: Invalid security credentials." });
        }

        // 3. Sign Token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: "Clearance level verified.",
            token,
            user: {
                id: user._id,
                username: user.username,
                goal: user.currentGoal
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal security link failure." });
    }
};
