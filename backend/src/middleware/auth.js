const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'studivon_neural_secret_key_2026';

module.exports = (req, res, next) => {
    try {
        // Extract Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ error: "Access Denied: Missing security clearance token." });
        }

        // Bearer token check
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ error: "Access Denied: Invalid security clearance token format." });
        }

        const token = parts[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ error: "Access Denied: Expired or invalid security clearance token." });
    }
};
