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
