import React, { useState, useEffect } from 'react';
import './BestTimeWidget.css';

const BestTimeWidget = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching from ML service/Analytics
    setTimeout(() => {
      setPrediction({
        best_time: '2:30 PM',
        rush_probability: 'Low',
        wait_time_est: '5-10 mins'
      });
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) return <div className="best-time-widget loading glass-card">Loading Smart Prediction...</div>;

  return (
    <div className="best-time-widget glass-card fade-in">
      <div className="widget-icon">⚡</div>
      <div className="widget-info">
        <h4>Best Time to Visit Today</h4>
        <div className="prediction-main">
          <span className="time gold-gradient-text">{prediction.best_time}</span>
          <span className="rush-tag low">{prediction.rush_probability} Rush</span>
        </div>
        <p className="est-wait">Estimated wait: {prediction.wait_time_est}</p>
      </div>
      <button className="gold-button small">Plan My Visit</button>
    </div>
  );
};

export default BestTimeWidget;
