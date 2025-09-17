const bcrypt = require('bcryptjs');

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

async function comparePassword(password, hashed) {
    return bcrypt.compare(password, hashed);
}

module.exports = { hashPassword, comparePassword };
