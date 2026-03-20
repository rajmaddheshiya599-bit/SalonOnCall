const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    faceShape: String,
    preferences: [String]
});

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
    slot: {
        date: { type: String, required: true }, // YYYY-MM-DD
        time: { type: String, required: true }  // HH:MM
    },
    status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
    rating: { type: Number, min: 1, max: 5 }
});

const BarberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    isAvailable: { type: Boolean, default: true }
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Booking: mongoose.model('Booking', BookingSchema),
    Barber: mongoose.model('Barber', BarberSchema)
};
