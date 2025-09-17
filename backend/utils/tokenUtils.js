const jwt = require('jsonwebtoken');

function signAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET || 'CHANGE_ME', { expiresIn: process.env.JWT_EXPIRES || '1h' });
}

function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'CHANGE_ME');
}

module.exports = { signAccessToken, verifyToken };
