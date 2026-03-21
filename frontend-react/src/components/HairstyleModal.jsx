import React from 'react';
import './HairstyleModal.css';

const HairstyleModal = ({ style, onClose, onSelect }) => {
  if (!style) return null;

  return (
    <div className="style-modal-overlay fade-in" onClick={onClose}>
      <div className="style-modal-container glass-card scale-up" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        <div className="modal-content">
          <div className="modal-image-section">
            <img 
              src={style.image} 
              alt={style.name} 
              className="modal-image" 
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=400&fit=crop&q=80';
                e.target.onerror = null;
              }}
            />
          </div>
          
          <div className="modal-info-section">
            <div className="badge">{style.category}</div>
            <h2 className="modal-title gold-gradient-text">{style.name}</h2>
            <p className="modal-description">{style.description}</p>
            
            <div className="modal-features">
              <div className="feature">
                <span className="icon">✓</span>
                <span>Premium Cut</span>
              </div>
              <div className="feature">
                <span className="icon">✓</span>
                <span>Includes Wash</span>
              </div>
              <div className="feature">
                <span className="icon">✓</span>
                <span>Expert Styling</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="gold-button" onClick={() => onSelect(style)}>Select This Style</button>
              <button className="gold-outline-button" onClick={onClose}>Keep Browsing</button>
            </div>
            
            <button className="book-style-btn" onClick={() => onSelect(style)}>
              Book This Style
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HairstyleModal;
