import React, { useState, useEffect } from 'react';
import BoardRotator from '../components/BoardRotator';
import { Maximize } from 'lucide-react';

export default function BoardPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop');

  const detectDeviceType = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width <= 768 && height > width) {
      setDeviceType('mobilePortrait');
    } else if (height <= 480 && width > height) {
      setDeviceType('mobileLandscape');
    } else if (width <= 1024) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  };

  useEffect(() => {
    detectDeviceType();
    window.addEventListener('resize', detectDeviceType);
    return () => window.removeEventListener('resize', detectDeviceType);
  }, []);

  useEffect(() => {
    const checkFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', checkFullscreen);
    return () => document.removeEventListener('fullscreenchange', checkFullscreen);
  }, []);

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`שגיאה בכניסה למסך מלא: ${err.message}`);
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    const keyHandler = (e) => {
      if (e.key === 'f' || e.key === 'F' || e.keyCode === 70) {
        handleFullScreen();
      }
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, []);

  return (
    <div 
      className="board-page bg-gradient-to-b from-blue-950 to-blue-900 text-white overflow-hidden relative"
      style={{ height: '100vh', width: '100vw', margin: 0, padding: 0 }}
    >
      <BoardRotator deviceType={deviceType} />
      
      <button 
        onClick={handleFullScreen}
        className="absolute top-2 left-2 bg-blue-800 bg-opacity-50 hover:bg-blue-700 rounded-full p-2 z-50"
        title={isFullscreen ? "צא ממסך מלא" : "הפעל מסך מלא"}
      >
        <Maximize className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}