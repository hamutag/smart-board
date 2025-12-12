import React, { useEffect, useState, useRef } from 'react';

export default function BackgroundImage({ imageUrl, opacity = 1, overlayColor = '#000000', overlayOpacity = 0.3 }) {
  const [currentImage, setCurrentImage] = useState(null);
  const [prevImage, setPrevImage] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    if (!imageUrl) {
        setPrevImage(currentImage);
        setCurrentImage(null);
        return;
    }

    // Don't do anything if image hasn't changed
    if (imageUrl === currentImage) return;

    // Start loading new image
    const img = new Image();
    img.src = imageUrl;
    
    img.onload = () => {
      setPrevImage(currentImage);
      setCurrentImage(imageUrl);
      setIsLoaded(true);
      
      // After transition (e.g. 500ms), clear previous image
      setTimeout(() => {
        setPrevImage(null);
      }, 500);
    };
    
    img.onerror = () => {
       console.error("Failed to load background image:", imageUrl);
    };

  }, [imageUrl, currentImage]);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-br from-gray-900 to-black">
      {/* Previous Image (fading out) */}
      {prevImage && (
         <div 
           className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out"
           style={{
             backgroundImage: `url(${prevImage})`,
             opacity: 0, // Fade out
             zIndex: 1
           }}
         />
      )}
      
      {/* Current Image (fading in) */}
      {currentImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out"
          style={{
            backgroundImage: `url(${currentImage})`,
            opacity: opacity,
            zIndex: 2
          }}
        />
      )}
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 transition-all duration-500"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
          zIndex: 3
        }}
      />
    </div>
  );
}