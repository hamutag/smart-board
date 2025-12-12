import React, { useState, useEffect } from 'react';

export default function Announcements({ 
  announcements = [],
  titleClassName = "text-xl font-bold text-amber-400 mb-2",
  contentClassName = "text-base leading-relaxed"
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (!announcements.length) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [announcements]);
  
  if (!announcements.length) return null;
  
  const currentAnnouncement = announcements[currentIndex];
  
  return (
    <div className="announcement-container">
      <div className="announcement-title">
        <h3 className={titleClassName}>{currentAnnouncement.title}</h3>
      </div>
      <div className="announcement-content bg-opacity-30 bg-blue-900 p-3 rounded-lg">
        <p className={contentClassName} style={{ whiteSpace: 'pre-line' }}>{currentAnnouncement.content}</p>
      </div>
      {announcements.length > 1 && (
        <div className="dots-container flex justify-center mt-2">
          {announcements.map((_, index) => (
            <span 
              key={index} 
              className={`dot ${index === currentIndex ? 'active-dot' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}