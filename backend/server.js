const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { User, Barber, Booking } = require('./models');
const bookingController = require('./booking_controller');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/salon';
const JWT_SECRET = process.env.JWT_SECRET || 'salon_secret';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        res.json({ token, user: { id: user._id, name: user.name, faceShape: user.faceShape } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Booking Routes
app.post('/api/bookings', bookingController.createBooking);
app.get('/api/analytics', bookingController.getAnalytics);

// User Profile Update (e.g. after face analysis)
app.put('/api/users/profile', async (req, res) => {
    try {
        const { userId, faceShape, preferences } = req.body;
        await User.findByIdAndUpdate(userId, { faceShape, preferences });
        res.json({ message: "Profile updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/barbers', async (req, res) => {
    const barbers = await Barber.find();
    res.json(barbers);
});

app.get('/api/haircuts', async (req, res) => {
    const staticHaircuts = [
        {
            name: "Fade Cut",
            price: 200,
            image: "https://images.unsplash.com/photo-1621605815841-aa8ae6504a9d?q=80&w=2070&auto=format&fit=crop",
            category: "Premium"
        },
        {
            name: "Executive Taper",
            price: 850,
            image: "https://images.unsplash.com/photo-1599351431247-f577f5d48102?q=80&w=1887&auto=format&fit=crop",
            category: "Premium"
        },
        {
            name: "Classic Pompadour",
            price: 1200,
            image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
            category: "Premium"
        }
    ];

    try {
        const { category } = req.query;
        const filter = category ? { category } : {};
        const { Haircut } = require('./models');
        let haircuts = await Haircut.find(filter);
        
        if (haircuts.length === 0) {
            haircuts = staticHaircuts;
        }
        res.json(haircuts);
    } catch (err) {
        console.error("API Error:", err.message);
        res.json(staticHaircuts);
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
