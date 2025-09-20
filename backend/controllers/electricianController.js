const Profile = require("../models/Profile");

// @desc    Get all electricians (with pagination)
// @route   GET /api/electricians
// @access  Public
exports.getElectricians = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const electricians = await Profile.find({
            role: "electrician",
            status: true,
        })
            .select("firstName lastName tel email role location isVerified createdAt")
            .skip(skip)
            .limit(limit);

        const total = await Profile.countDocuments({
            role: "electrician",
            status: true,
        });

        res.json({
            success: true,
            page,
            limit,
            total,
            electricians,
        });
    } catch (error) {
        console.error("Error fetching electricians:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching electricians",
        });
    }
};

// @desc    Get single electrician by ID
// @route   GET /api/electricians/:id
// @access  Public
exports.getElectricianById = async (req, res, next) => {
    try {
        const electrician = await Profile.findById(req.params.electricianId);

        if (!electrician || electrician.role !== 'electrician') {
            return res.status(404).json({ success: false, message: 'Electrician not found' });
        }

        // The .toJSON() method on the model will automatically be called, removing sensitive fields
        res.json({ success: true, electrician });

    } catch (error) {
        console.error(`Error fetching electrician by ID ${req.params.electricianId}:`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid electrician ID format' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
