import React from 'react';

/**
 * Simple wrapper that adds only overlay, assumes background is handled by parent
 */
export default function BackgroundWrapper({ overlayColor = '#000000', overlayOpacity = 0.3, children }) {
  return (
    <div className="relative h-full w-full">
      {/* Overlay Layer */}
      {overlayColor && overlayOpacity > 0 && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            backgroundColor: overlayColor,
            opacity: overlayOpacity 
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}