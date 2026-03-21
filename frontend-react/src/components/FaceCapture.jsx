import React, { useRef, useState } from 'react';
import './FaceCapture.css';

const FaceCapture = ({ onCapture, loading }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onCapture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="face-capture glass-card">
      <div className="preview-area">
        {preview ? (
          <img src={preview} alt="Face Preview" className="face-preview" />
        ) : (
          <div className="placeholder">
            <span className="icon">📷</span>
            <p>Upload or Take a Photo</p>
          </div>
        )}
      </div>
      
      <div className="capture-controls">
        <input 
          type="file" 
          accept="image/*" 
          hidden 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
        <button 
          className="gold-button"
          onClick={() => fileInputRef.current.click()}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Choose Photo'}
        </button>
      </div>
    </div>
  );
};

export default FaceCapture;
