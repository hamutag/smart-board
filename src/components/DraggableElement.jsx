import React, { useState, useEffect, useRef } from 'react';

export default function DraggableElement({ 
  children, 
  isEditMode, 
  elementId, 
  onPositionChange,
  initialPosition 
}) {
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPosition(initialPosition || { x: 0, y: 0 });
  }, [initialPosition]);

  const handleMouseDown = (e) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    
    setIsDragging(true);
    startPosRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - startPosRef.current.x,
      y: e.clientY - startPosRef.current.y
    };
    
    setPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    if (onPositionChange) {
      onPositionChange(elementId, position);
    }
  };

  return (
    <div
      ref={dragRef}
      className={`${isEditMode ? 'cursor-move border-2 border-dashed border-yellow-400 p-2 rounded-lg' : ''} ${isDragging ? 'z-50' : ''}`}
      style={{
        position: 'relative',
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out'
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      {isEditMode && (
        <div className="absolute -top-7 left-1 bg-yellow-400 text-black px-2 py-0.5 text-xs rounded pointer-events-none">
          {elementId}
        </div>
      )}
    </div>
  );
}