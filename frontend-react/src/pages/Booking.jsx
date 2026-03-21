import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Booking.css';

const Booking = () => {
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  const location = useLocation();
  const [preferredStyle, setPreferredStyle] = useState('');

  useEffect(() => {
    fetchBarbers();
    
    // Parse query params
    const params = new URLSearchParams(location.search);
    const styleParam = params.get('style');
    if (styleParam) {
      setPreferredStyle(decodeURIComponent(styleParam));
    }
  }, [location]);

  const fetchBarbers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/barbers');
      const data = await response.json();
      setBarbers(data);
    } catch (err) {
      console.error('Error fetching barbers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedBarber) return alert('Please select a barber');

    try {
      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: selectedBarber._id,
          date: bookingDate,
          time: bookingTime,
          style: preferredStyle,
          userId: 'guest_user' 
        })
      });
      const data = await response.json();
      if (data.message) {
        setMessage('Booking successful! We look forward to seeing you.');
      }
    } catch (err) {
      setMessage('Booking failed. Please try again.');
    }
  };

  return (
    <div className="booking-container fade-in">
      <div className="booking-header">
        <h1 className="gold-gradient-text">Book Your Session</h1>
        <p>Choose your favorite professional and reserve your spot.</p>
      </div>

      <div className="booking-content">
        <div className="barber-selection">
          <h3>Select a Barber</h3>
          <div className="barber-grid">
            {loading ? (
              <p>Loading barbers...</p>
            ) : (
              barbers.map(barber => (
                <div 
                  key={barber._id} 
                  className={`barber-card glass-card ${selectedBarber?._id === barber._id ? 'selected' : ''}`}
                  onClick={() => setSelectedBarber(barber)}
                >
                  <div className="barber-avatar">👤</div>
                  <h4>{barber.name}</h4>
                  <p className="specialty">{barber.specialty}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="booking-form-section glass-card">
          <form onSubmit={handleBooking} className="booking-form">
            <div className="input-group">
              <label>Selected Professional</label>
              <input type="text" value={selectedBarber ? selectedBarber.name : 'None selected'} readOnly />
            </div>

            {preferredStyle && (
              <div className="input-group preferred-style-group fade-in">
                <label>Chosen Hairstyle</label>
                <div className="style-badge-input">
                  <span className="style-icon">✂️</span>
                  <span>{preferredStyle}</span>
                  <button type="button" className="clear-style" onClick={() => setPreferredStyle('')}>✕</button>
                </div>
              </div>
            )}
            
            <div className="form-row">
              <div className="input-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Time</label>
                <input 
                  type="time" 
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="gold-button">Confirm Booking</button>
            {message && <p className="booking-message">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
