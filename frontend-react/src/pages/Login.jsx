import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Integration logic will go here
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card glass-card">
        <h2 className="auth-title gold-gradient-text">Welcome Back</h2>
        <p className="auth-subtitle">Login to access your AI style profile</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
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
          <button type="submit" className="gold-button auth-submit">Login</button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="gold-gradient-text">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
