import React, { useState } from 'react';
import { HAIRSTYLES } from '../constants/hairstyles';
import HairstyleModal from './HairstyleModal';
import './HairstyleGallery.css';

const HairstyleGallery = ({ isOpen, onClose, onSelect }) => {
  const [filter, setFilter] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState(null);

  if (!isOpen) return null;

  const categories = ['All', 'Short Hair', 'Medium Hair', 'Long Hair', 'Fade Styles'];

  const filteredStyles = filter === 'All' 
    ? HAIRSTYLES 
    : HAIRSTYLES.filter(s => s.category === filter || s.length === filter);

  return (
    <div className="gallery-overlay fade-in">
      <div className="gallery-container glass-card">
        <div className="gallery-header">
          <div className="gallery-nav-breadcrumb">
            <span>Home</span> › <span>Services</span> › <span className="active">Precision Haircut</span>
          </div>
          <button className="close-button" onClick={onClose}>Close ✕</button>
        </div>

        <h2 className="gallery-title gold-gradient-text text-center">Popular Men's Haircuts in India</h2>

        <div className="gallery-filters">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="gallery-grid">
          {filteredStyles.map(style => (
            <div 
              key={style.id} 
              className="style-card glass-card"
              onClick={() => setSelectedStyle(style)}
            >
              <div className="style-image-container">
                <img 
                  src={style.image} 
                  alt={style.name} 
                  className="style-image" 
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=400&fit=crop&q=80';
                    e.target.onerror = null; // Prevent infinite loop
                  }}
                />
              </div>
              <div className="style-info">
                <h3>{style.name}</h3>
                <p>{style.description}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedStyle && (
          <HairstyleModal 
            style={selectedStyle} 
            onClose={() => setSelectedStyle(null)}
            onSelect={(style) => {
              onSelect(style);
              setSelectedStyle(null);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default HairstyleGallery;
