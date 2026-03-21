import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar glass-card">
      <div className="nav-container">
        <Link to="/" className="nav-logo gold-gradient-text">
          SalonOnCall
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/analyze" className="nav-link">AI Analysis</Link>
          <Link to="/booking" className="nav-link">Book Now</Link>
          <Link to="/login" className="gold-outline-button">Login</Link>
          <Link to="/signup" className="gold-button">Join Now</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
