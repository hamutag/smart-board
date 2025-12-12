import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Move, RotateCcw, Palette, Type, Settings } from 'lucide-react';

export default function AdvancedEditableElement({ 
  children, 
  isEditMode = false, 
  elementId = 'unknown', 
  onStyleChange,
  initialStyle = {}
}) {
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  const [style, setStyle] = useState({
    x: 0,
    y: 0,
    width: 'auto',
    height: 'auto',
    fontSize: '1rem',
    color: '#ffffff',
    backgroundColor: 'transparent',
    borderRadius: '0.75rem',
    padding: '1rem',
    textAlign: 'center',
    fontWeight: 'normal',
    ...initialStyle
  });

  const elementRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (onStyleChange && typeof onStyleChange === 'function') {
      onStyleChange(elementId, style);
    }
  }, [style, elementId, onStyleChange]);

  const handleMouseDown = (e, action = 'drag') => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsSelected(true);
    
    if (action === 'drag') {
      setIsDragging(true);
      startPosRef.current = {
        x: e.clientX - (style.x || 0),
        y: e.clientY - (style.y || 0)
      };
    } else if (action === 'resize') {
      setIsResizing(true);
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        startSizeRef.current = {
          width: rect.width,
          height: rect.height
        };
      }
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setStyle(prev => ({
        ...prev,
        x: e.clientX - startPosRef.current.x,
        y: e.clientY - startPosRef.current.y
      }));
    } else if (isResizing) {
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      
      setStyle(prev => ({
        ...prev,
        width: Math.max(50, startSizeRef.current.width + deltaX) + 'px',
        height: Math.max(30, startSizeRef.current.height + deltaY) + 'px'
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleStyleChange = (property, value) => {
    setStyle(prev => ({ ...prev, [property]: value }));
  };

  const handleReset = () => {
    setStyle({
      x: 0,
      y: 0,
      width: 'auto',
      height: 'auto',
      fontSize: '1rem',
      color: '#ffffff',
      backgroundColor: 'transparent',
      borderRadius: '0.75rem',
      padding: '1rem',
      textAlign: 'center',
      fontWeight: 'normal'
    });
  };

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (elementRef.current && !elementRef.current.contains(e.target)) {
        setIsSelected(false);
        setShowControls(false);
      }
    };

    if (isEditMode) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isEditMode]);

  return (
    <>
      <div
        ref={elementRef}
        className={`
          ${isEditMode ? 'cursor-move' : ''} 
          ${isSelected && isEditMode ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
          ${isDragging ? 'z-50' : ''}
          transition-all duration-200 ease-out
        `}
        style={{
          position: 'relative',
          transform: `translate(${style.x || 0}px, ${style.y || 0}px)`,
          width: style.width,
          height: style.height,
          fontSize: style.fontSize,
          color: style.color,
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
          padding: style.padding,
          textAlign: style.textAlign,
          fontWeight: style.fontWeight,
          transition: isDragging || isResizing ? 'none' : 'all 0.2s ease-out'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
        onClick={(e) => {
          if (isEditMode) {
            e.stopPropagation();
            setIsSelected(true);
          }
        }}
      >
        {children}
        
        {/* Edit Mode Indicators */}
        {isEditMode && isSelected && (
          <>
            {/* Element Label */}
            <div className="absolute -top-8 left-0 bg-yellow-400 text-black px-2 py-1 text-xs rounded pointer-events-none z-10">
              {elementId}
            </div>
            
            {/* Resize Handle */}
            <div
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow-400 border border-yellow-600 cursor-se-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'resize')}
            />
            
            {/* Controls Toggle */}
            <Button
              className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-blue-500 hover:bg-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                setShowControls(!showControls);
              }}
            >
              <Settings className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>

      {/* Controls Panel */}
      {isEditMode && isSelected && showControls && (
        <div className="fixed top-20 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl z-50 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">עריכת {elementId}</h3>
            <Button
              onClick={() => setShowControls(false)}
              className="w-6 h-6 p-0 bg-red-500 hover:bg-red-600"
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">מיקום X</Label>
                <Input
                  type="number"
                  value={style.x || 0}
                  onChange={(e) => handleStyleChange('x', parseInt(e.target.value) || 0)}
                  className="bg-gray-800 text-white"
                />
              </div>
              <div>
                <Label className="text-xs">מיקום Y</Label>
                <Input
                  type="number"
                  value={style.y || 0}
                  onChange={(e) => handleStyleChange('y', parseInt(e.target.value) || 0)}
                  className="bg-gray-800 text-white"
                />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">רוחב</Label>
                <Input
                  value={style.width}
                  onChange={(e) => handleStyleChange('width', e.target.value)}
                  placeholder="auto"
                  className="bg-gray-800 text-white"
                />
              </div>
              <div>
                <Label className="text-xs">גובה</Label>
                <Input
                  value={style.height}
                  onChange={(e) => handleStyleChange('height', e.target.value)}
                  placeholder="auto"
                  className="bg-gray-800 text-white"
                />
              </div>
            </div>

            {/* Font */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">גודל פונט</Label>
                <Select value={style.fontSize} onValueChange={(value) => handleStyleChange('fontSize', value)}>
                  <SelectTrigger className="bg-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800">
                    <SelectItem value="0.75rem">קטן מאוד</SelectItem>
                    <SelectItem value="1rem">קטן</SelectItem>
                    <SelectItem value="1.25rem">בינוני</SelectItem>
                    <SelectItem value="1.5rem">גדול</SelectItem>
                    <SelectItem value="2rem">גדול מאוד</SelectItem>
                    <SelectItem value="3rem">ענק</SelectItem>
                    <SelectItem value="4rem">ענק מאוד</SelectItem>
                    <SelectItem value="6rem">ענק ביותר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">עובי פונט</Label>
                <Select value={style.fontWeight} onValueChange={(value) => handleStyleChange('fontWeight', value)}>
                  <SelectTrigger className="bg-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800">
                    <SelectItem value="normal">רגיל</SelectItem>
                    <SelectItem value="bold">מודגש</SelectItem>
                    <SelectItem value="bolder">מודגש מאוד</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <Label className="text-xs">יישור טקסט</Label>
              <Select value={style.textAlign} onValueChange={(value) => handleStyleChange('textAlign', value)}>
                <SelectTrigger className="bg-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800">
                  <SelectItem value="right">ימין</SelectItem>
                  <SelectItem value="center">מרכז</SelectItem>
                  <SelectItem value="left">שמאל</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">צבע טקסט</Label>
                <Input
                  type="color"
                  value={style.color}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="bg-gray-800 h-10"
                />
              </div>
              <div>
                <Label className="text-xs">צבע רקע</Label>
                <Input
                  type="color"
                  value={style.backgroundColor === 'transparent' ? '#000000' : style.backgroundColor}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="bg-gray-800 h-10"
                />
              </div>
            </div>

            {/* Padding */}
            <div>
              <Label className="text-xs">ריווח פנימי</Label>
              <Select value={style.padding} onValueChange={(value) => handleStyleChange('padding', value)}>
                <SelectTrigger className="bg-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800">
                  <SelectItem value="0.25rem">קטן מאוד</SelectItem>
                  <SelectItem value="0.5rem">קטן</SelectItem>
                  <SelectItem value="1rem">בינוני</SelectItem>
                  <SelectItem value="1.5rem">גדול</SelectItem>
                  <SelectItem value="2rem">גדול מאוד</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            <Button
              onClick={handleReset}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              איפוס לברירת מחדל
            </Button>
          </div>
        </div>
      )}
    </>
  );
}