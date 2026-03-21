import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Integration logic will go here
    console.log('Signup attempt:', { name, email, password });
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card glass-card">
        <h2 className="auth-title gold-gradient-text">Join SalonOnCall</h2>
        <p className="auth-subtitle">Start your personalized styling journey</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="gold-button auth-submit">Create Account</button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="gold-gradient-text">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
