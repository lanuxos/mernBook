const { verifyToken } = require('../utils/tokenUtils');
const Profile = require('../models/Profile');

async function auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'No token provided' });
        const parts = authHeader.split(' ');
        if (parts.length !== 2) return res.status(401).json({ message: 'Token error' });
        const token = parts[1];
        const decoded = verifyToken(token);
        const user = await Profile.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token', error: err.message });
    }
}

module.exports = auth;
