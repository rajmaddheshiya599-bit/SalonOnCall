import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer glass-card">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="gold-gradient-text">SalonOnCall</h3>
          <p>Experience the future of grooming with AI-powered stylings and seamless bookings.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/analyze">AI Face Analysis</a></li>
            <li><a href="/booking">Book a Barber</a></li>
            <li><a href="/about">Our Story</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-links">
            <a href="#">Instagram</a>
            <a href="#">Twitter</a>
            <a href="#">Facebook</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 SalonOnCall. Elevating your style.</p>
      </div>
    </footer>
  );
};

export default Footer;
