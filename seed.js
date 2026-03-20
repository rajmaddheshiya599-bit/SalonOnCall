const mongoose = require('mongoose');
const { User, Barber, Booking } = require('./backend/models');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://localhost:27017/salon';

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Barber.deleteMany({});
    await Booking.deleteMany({});

    // Create Barbers
    const barbers = await Barber.insertMany([
        { name: 'Marco "The Blade" Rossi', specialty: 'Classic Fades & Beard Trims', isAvailable: true },
        { name: 'Elena Vance', specialty: 'Luxury Styling & Coloring', isAvailable: true },
        { name: 'Julian Thorne', specialty: 'Modern Undercuts & Texture', isAvailable: true },
        { name: 'Sophia Chen', specialty: 'Precision Scissors & Layers', isAvailable: true }
    ]);

    // Create Demo User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUser = new User({
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: hashedPassword,
        faceShape: 'Oval'
    });
    await demoUser.save();

    // Create 60+ Bookings for realistic rush prediction
    const bookings = [];
    const days = ['2026-03-18', '2026-03-19', '2026-03-20', '2026-03-21', '2026-03-22'];
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

    for (let i = 0; i < 60; i++) {
        const date = days[Math.floor(Math.random() * days.length)];
        const time = hours[Math.floor(Math.random() * hours.length)];
        const barber = barbers[Math.floor(Math.random() * barbers.length)];
        const status = Math.random() > 0.3 ? 'completed' : 'active';

        bookings.push({
            userId: demoUser._id,
            barberId: barber._id,
            slot: { date, time },
            status: status,
            rating: status === 'completed' ? Math.floor(Math.random() * 2) + 4 : undefined
        });
    }

    await Booking.insertMany(bookings);
    console.log(`Seeded ${bookings.length} bookings successfully.`);
    process.exit();
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
