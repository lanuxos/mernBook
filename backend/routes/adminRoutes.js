const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const { permit } = require('../middleware/role');

// admin endpoints (protected)
router.get('/electricians/unverified', auth, permit('admin'), adminController.listUnverified);
router.post('/electricians/:electricianId/verify', auth, permit('admin'), adminController.verifyElectrician);

// admin list all bookings
router.get('/bookings', auth, permit('admin'), bookingController.listAll);

module.exports = router;
