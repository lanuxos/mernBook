const { validationResult } = require('express-validator');
const Profile = require('../models/Profile');
const { comparePassword } = require('../utils/passwordUtils');
const { signAccessToken } = require('../utils/tokenUtils');

exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        const { firstName, lastName, email, tel, password, role, location } = req.body;

        // If registering electrician, default isVerified false (admin must approve)
        const user = new Profile({
            firstName, lastName, email, tel, password,
            role: role || 'customer',
            isVerified: role === 'electrician' ? false : true,
            location: location || undefined
        });

        await user.save();
        return res.status(201).json({ message: 'Registration successful. Please login.', user: user.toJSON() });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key', key: err.keyValue });
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { tel, password } = req.body;
        const user = await Profile.findOne({ tel });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        // If electrician not verified yet, deny login
        if (user.role === 'electrician' && !user.isVerified) {
            return res.status(403).json({ message: 'Electrician account requires admin verification' });
        }

        const ok = await comparePassword(password, user.password);
        if (!ok) {
            await user.incLoginAttempts();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        await user.resetLoginAttempts();
        user.lastLogin = new Date();
        await user.save();

        const token = signAccessToken({ id: user._id, role: user.role });

        res.json({ user: user.toJSON(), token });
    } catch (err) {
        next(err);
    }
};
