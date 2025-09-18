const Booking = require('../models/Booking');
const Profile = require('../models/Profile');
const { publishBookingUpdate } = require('../utils/mqttClient');

// customer creates booking
exports.createBooking = async (req, res, next) => {
    try {
        const { electricianId, schedule, detail, location } = req.body;

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

        const topic = `bookings/electrician/${String(electrician._id)}`;
        const payload = {
            bookingId: booking._id.toString(),
            status: booking.status,
            message: '📩 You have a new booking request',
        };

        console.log("[MQTT][createBooking] Publish →", topic, payload);
        publishBookingUpdate(topic, payload);

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

        const bookings = await Booking.find({ customerId: user._id })
            .populate('electricianId', 'firstName lastName tel');
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};

// electrician gets incoming bookings
exports.getIncoming = async (req, res, next) => {
    try {
        if (req.user.role !== 'electrician') return res.status(403).json({ message: 'Only electricians use this endpoint' });

        const bookings = await Booking.find({ electricianId: req.user._id })
            .populate('customerId', 'firstName lastName tel');
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
            booking.status = action;
        }

        else {
            return res.status(403).json({ message: 'Role not allowed to update status' });
        }

        await booking.save();

        // --- Refined Notification Logic ---
        const actorRole = req.user.role;
        const { _id, status, customerId, electricianId } = booking;

        const messages = {
            confirmed: '✅ Your booking has been confirmed!',
            cancelled: '❌ Your booking has been cancelled.',
            pending: '⚠️ Your booking status was changed to pending.',
            deleted: '🗑️ A booking was deleted by an admin.'
        };

        // 1. Always notify admin
        const adminTopic = `bookings/admin`;
        const adminPayload = {
            bookingId: _id.toString(),
            status,
            message: `ℹ️ Booking ${_id} updated to ${status} by a ${actorRole}.`,
        };
        console.log("[MQTT][updateStatus] Publish →", adminTopic, adminPayload);
        publishBookingUpdate(adminTopic, adminPayload);

        // 2. Notify customer when electrician updates
        if (actorRole === 'electrician' && messages[status]) {
            const customerTopic = `bookings/customer/${String(customerId)}`;
            const customerPayload = {
                bookingId: _id.toString(),
                status,
                message: messages[status],
            };
            console.log("[MQTT][updateStatus] Publish →", customerTopic, customerPayload);
            publishBookingUpdate(customerTopic, customerPayload);
        }

        // 3. Notify electrician when customer cancels
        if (actorRole === 'customer' && status === 'cancelled') {
            const electricianTopic = `bookings/electrician/${String(electricianId)}`;
            const electricianPayload = {
                bookingId: _id.toString(),
                status,
                message: `❌ A booking was cancelled by the customer.`,
            };
            console.log("[MQTT][updateStatus] Publish →", electricianTopic, electricianPayload);
            publishBookingUpdate(electricianTopic, electricianPayload);
        }

        res.json(booking);

    } catch (err) {
        next(err);
    }
};

// admin can list all bookings
exports.listAll = async (req, res, next) => {
    try {
        const bookings = await Booking.find()
            .populate('customerId electricianId', 'firstName lastName tel role');
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};
