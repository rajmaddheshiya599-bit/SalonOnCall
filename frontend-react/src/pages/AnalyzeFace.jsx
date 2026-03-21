import React, { useState } from 'react';
import FaceCapture from '../components/FaceCapture';
import './AnalyzeFace.css';

const AnalyzeFace = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCapture = async (imageData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Could not connect to ML service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyze-container fade-in">
      <div className="analyze-header">
        <h1 className="gold-gradient-text">AI Face Analysis</h1>
        <p>Discover your face shape and get personalized hairstyle recommendations.</p>
      </div>

      <div className="analyze-content">
        <div className="capture-section">
          <FaceCapture onCapture={handleCapture} loading={loading} />
        </div>

        {analysisResult && (
          <div className="results-section glass-card fade-in">
            <h2 className="gold-gradient-text">Analysis Results</h2>
            <div className="result-main">
              <div className="shape-badge">{analysisResult.face_shape}</div>
              <p className="confidence">Confidence: {(analysisResult.confidence * 100).toFixed(1)}%</p>
            </div>
            
            <div className="recommendations">
              <h3>Recommended Hairstyles</h3>
              <div className="rec-grid">
                {analysisResult.recommendations?.map((rec, i) => (
                  <div key={i} className="rec-item glass-card">{rec}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-message glass-card">{error}</div>}
      </div>
    </div>
  );
};

export default AnalyzeFace;
