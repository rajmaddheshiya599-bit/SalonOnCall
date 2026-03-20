const axios = require('axios');
const { Booking, Barber } = require('./models');

exports.createBooking = async (req, res) => {
    try {
        const { userId, date, time } = req.body;

        // Double-booking prevention
        const existingBooking = await Booking.findOne({ userId, 'slot.date': date, 'slot.time': time });
        if (existingBooking) {
            return res.status(400).json({ error: "You already have a booking at this time." });
        }

        // Smart Queue: Find barber with least active appointments at this slot
        const barbers = await Barber.find({ isAvailable: true });
        if (barbers.length === 0) {
            return res.status(400).json({ error: "No barbers available." });
        }

        let bestBarber = null;
        let minAppointments = Infinity;

        for (const barber of barbers) {
            const count = await Booking.countDocuments({ 
                barberId: barber._id, 
                'slot.date': date, 
                'slot.time': time,
                status: { $in: ['pending', 'active'] }
            });
            if (count < minAppointments) {
                minAppointments = count;
                bestBarber = barber;
            }
        }

        const booking = new Booking({
            userId,
            barberId: bestBarber._id,
            slot: { date, time }
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const activeQueue = await Booking.find({ status: 'active' }).populate('barberId userId');
        
        // Call ML service for rush prediction for the next 24 hours
        // For simplicity, we just return the active queue and some dummy stats
        res.status(200).json({
            totalBookings,
            activeQueue,
            revenue: totalBookings * 50, // Dummy pricing
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
