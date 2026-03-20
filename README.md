# AI Smart Salon (SalonOnCall) - Execution Guide

Follow these steps to get the full-stack system running on your machine.

## Prerequisites
- **Docker & Docker Compose**: Installed and running.
- **Node.js**: (Optional, for seeding data locally).

## Step 1: Start the Services
Open a terminal in the project root directory and run:
```bash
docker-compose up --build
```
This will start:
- **MongoDB**: Database on `localhost:27017`
- **Backend**: API on `localhost:3000`
- **ML Service**: Python/Flask on `localhost:5000`

## Step 2: Seed the Database
To see the "Rush Prediction" and "Smart Queue" in action, you need sample data.
In a new terminal window:
```bash
# Navigate to backend to install dependencies if not done
cd backend && npm install
cd ..

# Run the seed script
node seed.js
```
*Note: Ensure your local MongoDB connection string in `seed.js` matches if you run it outside Docker.*

## Step 3: Launch the Frontend
The frontend is a pure Vanilla JS SPA. You can open it directly:
- Open `frontend/index.html` in any modern web browser.

## Using the Features
1. **Face Analysis**: Go to the "Face Analysis" tab, upload a clear photo of a face, and wait for the AI landmarks and shape classification.
2. **Smart Booking**: Go to "Book Slot". The "Best Time" badges are powered by the ML prediction model.
3. **Admin Dashboard**: Check the "Admin" tab to see real-time queue status and revenue analytics.

---
### Troubleshooting
- **ML Service Error**: Ensure your firewall allows communication between containers on port 5000.
- **Connection Refused**: Wait a few seconds for MongoDB to fully initialize before running the seed script.
