const Booking = require('../models/Booking');
const Profile = require('../models/Profile');
const { publishBookingUpdate } = require('../utils/mqttClient');

// customer creates booking
exports.createBooking = async (req, res, next) => {
    try {
        // only customers can book (but business could allow admin create)
        // if (req.user.role !== 'customer') return res.status(403).json({ message: 'Only customers can create bookings' });

        const { electricianId, schedule, detail, location } = req.body;

        // check electrician exists and isVerified
        const electrician = await Profile.findById(electricianId);
        if (!electrician || electrician.role !== 'electrician' || !electrician.isVerified) {
            return res.status(400).json({ message: 'Invalid electrician (not found / not verified)' });
        }

        const booking = new Booking({
            customerId: req.user._id,
            electricianId,
            schedule: schedule || Date.now(),
            detail,
            location: location || req.user.location
        });

        await booking.save();

        publishBookingUpdate(`bookings/electrician/${electrician._id}`, {
            bookingId: booking._id,
            status: booking.status,
            message: '📩 You have a new booking request',
        });

        res.status(201).json(booking);
    } catch (err) {
        next(err);
    }
};

// get bookings for customer (only their own)
exports.getMyBookings = async (req, res, next) => {
    try {
        const user = req.user;
        if (user.role !== 'customer') return res.status(403).json({ message: 'Only customers use this endpoint' });

        const bookings = await Booking.find({ customerId: user._id }).populate('electricianId', 'firstName lastName tel');
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};

// electrician gets incoming bookings
exports.getIncoming = async (req, res, next) => {
    try {
        if (req.user.role !== 'electrician') return res.status(403).json({ message: 'Only electricians use this endpoint' });

        const bookings = await Booking.find({ electricianId: req.user._id }).populate('customerId', 'firstName lastName tel');
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};

// update status (electrician, customer, admin)
exports.updateStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { action } = req.body; // 'confirm' | 'cancel' | 'delete'

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // role-based permissions
        if (req.user.role === 'electrician') {
            if (!['confirmed', 'pending', 'cancelled'].includes(action)) {
                return res.status(400).json({ message: 'Invalid action for electrician' });
            }
            if (!booking.electricianId.equals(req.user._id)) {
                return res.status(403).json({ message: 'Not your booking' });
            }
            booking.status = action;
        }

        else if (req.user.role === 'customer') {
            // Customers can only cancel bookings that are not yet confirmed
            if (action !== 'cancelled') {
                return res.status(400).json({ message: 'Invalid action for customer' });
            }
            if (!booking.customerId.equals(req.user._id)) {
                return res.status(403).json({ message: 'Not your booking' });
            }
            booking.status = 'cancelled';
        }

        else if (req.user.role === 'admin') {
            if (!['deleted', 'pending'].includes(action)) {
                return res.status(400).json({ message: 'Invalid action for admin' });
            }
            booking.status = action; // soft delete or pending
        }

        else {
            return res.status(403).json({ message: 'Role not allowed to update status' });
        }

        await booking.save();

        // --- Refined Notification Logic ---
        const actorRole = req.user.role;
        const { status, customerId, electricianId } = booking;

        // Define messages for different statuses
        const messages = {
            confirmed: '✅ Your booking has been confirmed!',
            cancelled: '❌ Your booking has been cancelled.',
            pending: '⚠️ Your booking status was changed to pending.',
            deleted: '🗑️ A booking was deleted by an admin.'
        };

        // 1. Always notify the admin of any change
        publishBookingUpdate('bookings/admin', {
            bookingId,
            status,
            message: `ℹ️ Booking ${bookingId} updated to ${status} by a ${actorRole}.`,
        });

        // 2. Notify the customer about changes made by the electrician
        if (actorRole === 'electrician' && messages[status]) {
            publishBookingUpdate(`bookings/customer/${customerId}`, {
                bookingId,
                status,
                message: messages[status],
            });
        }

        // 3. Notify the electrician about changes made by the customer
        if (actorRole === 'customer' && status === 'cancelled') {
            publishBookingUpdate(`bookings/electrician/${electricianId}`, {
                bookingId,
                status,
                message: `❌ A booking was cancelled by the customer.`,
            });
        }

        res.json(booking);

    } catch (err) {
        next(err);
    }
};


// admin can list all bookings
exports.listAll = async (req, res, next) => {
    try {
        const bookings = await Booking.find().populate('customerId electricianId', 'firstName lastName tel role');
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};
