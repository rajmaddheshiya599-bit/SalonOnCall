import React from 'react';
import { Link } from 'react-router-dom';
import BestTimeWidget from '../components/BestTimeWidget';
import HairstyleGallery from '../components/HairstyleGallery';
import './Home.css';

const Home = () => {
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);

  const handleSelectStyle = (style) => {
    // Redirect to booking with selected style
    window.location.href = `/booking?service=Haircut&style=${encodeURIComponent(style.name)}`;
  };

  return (
    <div className="home-container">
      <section className="hero fade-in">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Personal <span className="gold-gradient-text">AI Stylist</span> 
            <br />At Your Fingertips
          </h1>
          <p className="hero-subtitle">
            Perfect hairstyles matched to your face shape. Real-time predictions for the best time to visit. Unmatched grooming experience.
          </p>
          <div className="hero-actions">
            <Link to="/analyze" className="gold-button">Analyze My Face</Link>
            <Link to="/booking" className="gold-outline-button">Book Now</Link>
          </div>
          <div className="hero-widget">
            <BestTimeWidget />
          </div>
        </div>
        <div className="hero-stats glass-card">
          <div className="stat-item">
            <span className="stat-value gold-gradient-text">98%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat-item">
            <span className="stat-value gold-gradient-text">5k+</span>
            <span className="stat-label">Happy Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-value gold-gradient-text">15+</span>
            <span className="stat-label">Expert Barbers</span>
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Why <span className="gold-gradient-text">SalonOnCall</span>?</h2>
        <div className="feature-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon">👤</div>
            <h3>AI Face Analysis</h3>
            <p>Our advanced ML model analyzes your face shape to recommend the best hairstyles.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">⏰</div>
            <h3>Smart Rush Prediction</h3>
            <p>Know the best time to visit to avoid queues and save your precious time.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">💈</div>
            <h3>Premium Barbers</h3>
            <p>Book from a curated list of top-rated professionals in your area.</p>
          </div>
        </div>
      </section>

      <section className="services">
        <h2 className="section-title">Exclusive <span className="gold-gradient-text">Services</span></h2>
        <div className="service-grid">
          <div className="service-card glass-card fade-in" onClick={() => setIsGalleryOpen(true)}>
            <div className="service-badge">Popular</div>
            <div className="service-image-placeholder">✂️</div>
            <h3>Precision Haircut</h3>
            <p>Masterfully crafted cuts that define your unique style. Tap to explore our gallery.</p>
            <div className="service-footer">
              <span className="price gold-gradient-text">$40 - $60</span>
              <span className="action-link">Explore Styles →</span>
            </div>
          </div>
          {/* Add more services if needed */}
        </div>
      </section>

      <HairstyleGallery 
        isOpen={isGalleryOpen} 
        onClose={() => setIsGalleryOpen(false)}
        onSelect={handleSelectStyle}
      />
    </div>
  );
};

export default Home;
