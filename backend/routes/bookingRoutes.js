const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const { permit } = require('../middleware/role');

// create booking (customer)
router.post('/', auth, permit('customer'), bookingController.createBooking);

// customer list own bookings
router.get('/me', auth, permit('customer'), bookingController.getMyBookings);

// electrician incoming
router.get('/incoming', auth, permit('electrician'), bookingController.getIncoming);

// electrician update status
router.patch('/:bookingId/status', auth, permit('electrician', 'customer', 'admin'), bookingController.updateStatus);

module.exports = router;
