require('dotenv').config();
const connectDB = require('../config/db');
const Profile = require('../models/Profile');

async function init() {
    try {
        await connectDB();

        // --- Admin ---
        let admin = await Profile.findOne({ role: 'admin' });
        if (admin) {
            console.log('Admin already exists:', admin.tel || admin.email);
        } else {
            admin = new Profile({
                firstName: 'Admin',
                lastName: 'Electrically',
                tel: process.env.INIT_ADMIN_TEL || '2012345678',
                email: process.env.INIT_ADMIN_EMAIL || 'admin@electrically.local',
                password: process.env.INIT_ADMIN_PASSWORD || 'AdminPass123!',
                role: 'admin',
                isVerified: true
            });
            await admin.save();
            console.log('Admin created:', admin.tel);
        }

        // --- Electrician for testing ---
        let electrician = await Profile.findOne({ role: 'electrician' });
        if (electrician) {
            console.log('Electrician already exists:', electrician.tel || electrician.email);
        } else {
            electrician = new Profile({
                firstName: 'Test',
                lastName: 'Electrician',
                tel: process.env.INIT_ELEC_TEL || '2098765432',
                email: process.env.INIT_ELEC_EMAIL || 'electrician@electrically.local',
                password: process.env.INIT_ELEC_PASSWORD || 'ElecPass123!',
                role: 'electrician',
                isVerified: true,
                location: { type: 'Point', coordinates: [102.57, 17.95] }
            });
            await electrician.save();
            console.log('Electrician created for testing:', electrician.tel);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

init();
