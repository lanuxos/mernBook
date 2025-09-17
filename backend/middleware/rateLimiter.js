const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // per IP
    message: 'Too many requests from this IP, please try again later.'
});
