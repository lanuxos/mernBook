const Profile = require('../models/Profile');

// get unverified electricians
exports.listUnverified = async (req, res, next) => {
    try {
        const list = await Profile.find({ role: 'electrician', isVerified: false });
        res.json(list);
    } catch (err) {
        next(err);
    }
};

// verify electrician
exports.verifyElectrician = async (req, res, next) => {
    try {
        const { electricianId } = req.params;
        const electrician = await Profile.findById(electricianId);
        if (!electrician || electrician.role !== 'electrician') return res.status(404).json({ message: 'Electrician not found' });
        electrician.isVerified = true;
        await electrician.save();
        res.json({ message: 'Electrician verified', electrician });
    } catch (err) {
        next(err);
    }
};
