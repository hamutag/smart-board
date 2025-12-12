import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Settings } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import BackgroundImage from './BackgroundImage';

export default function FullScreenCountdown({ timeLeft, countdownMinutes, isShabbat = false, zmanimData }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [settings, setSettings] = useState(null);
  const [slideSettings, setSlideSettings] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [generalSettings, slideData] = await Promise.all([
          Settings.list(),
          SlideSettings.filter({ slide_name: 'Countdown' })
        ]);
        if (generalSettings.length > 0) setSettings(generalSettings[0]);
        if (slideData.length > 0) setSlideSettings(slideData[0]);
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const remainingSeconds = timeLeft.minutes * 60 + timeLeft.seconds;
    if (remainingSeconds === 0 && !showFinalMessage) {
      setShowFinalMessage(true);
      setTimeout(() => {
        setShowFinalMessage(false);
      }, 26000); // 26 שניות
    }
  }, [timeLeft, showFinalMessage]);

  const totalSeconds = countdownMinutes * 60;
  const remainingSeconds = timeLeft.minutes * 60 + timeLeft.seconds;
  const elapsedSeconds = totalSeconds - remainingSeconds;
  
  // ציר זמן לשבת (70 דקות)
  // תחילת תפילה -> +20 הודו -> +20 ברוך שאמר -> +13 נשמת -> +7 קדי ברכו -> +5 שמע -> +5 עמידה
  const shabbatStages = [
    { name: 'תחילת תפילה', time: 0, offset: 0 },
    { name: 'הודו', time: 20 * 60, offset: 20 },
    { name: 'ברוך שאמר', time: 40 * 60, offset: 20 },
    { name: 'נשמת כל חי', time: 53 * 60, offset: 13 },
    { name: 'קדי ברכו', time: 60 * 60, offset: 7 },
    { name: 'שמע', time: 65 * 60, offset: 5 },
    { name: 'עמידה', time: 70 * 60, offset: 5 }
  ];

  // ציר זמן ליום חול (40 דקות)
  const weekdayStages = [
    { name: 'תחילת תפילה', time: 0, offset: 0 },
    { name: 'הודו', time: 10 * 60, offset: 10 },
    { name: 'פסוקי דזמרה', time: 20 * 60, offset: 10 },
    { name: 'ישתבח', time: 30 * 60, offset: 10 },
    { name: 'עמידה', time: 40 * 60, offset: 10 }
  ];

  const stages = isShabbat ? shabbatStages : weekdayStages;
  
  // מצא את השלב הנוכחי
  let currentStageIndex = 0;
  for (let i = stages.length - 1; i >= 0; i--) {
    if (elapsedSeconds >= stages[i].time) {
      currentStageIndex = i;
      break;
    }
  }
  
  const stageText = stages[currentStageIndex].name;
  
  // חישוב אחוזי התקדמות - משמאל לימין (הפוך)
  const progressPercent = (elapsedSeconds / totalSeconds) * 100;
  
  // הבהוב 30 שניות לפני הסוף עם אנימציה מרהיבה
  const isFlashing = remainingSeconds <= 30 && remainingSeconds > 0;
  const isNetz = remainingSeconds === 0;
  const flashIntensity = isFlashing ? 1 - (remainingSeconds / 30) : 0; // 0-1 intensity

  if (showFinalMessage) {
    return (
      <div className="fullscreen-countdown h-screen w-screen flex flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600">
        <div className="absolute inset-0 animate-pulse opacity-40">
          <div className="w-full h-full bg-gradient-radial from-yellow-300 via-orange-400 to-transparent"></div>
        </div>

        <div className="text-center space-y-8">
          <div className="text-9xl animate-bounce">🙏</div>
          <h1 className="text-8xl font-black text-white drop-shadow-2xl leading-tight px-8 animate-pulse">
            תתקבלנה תפילתינו ברצון אמן
          </h1>
          <div className="text-9xl animate-bounce">🙏</div>
        </div>
      </div>
    );
  }

  const bgImage = slideSettings?.background_image || settings?.countdown_background_image;
  const bgOpacity = (slideSettings?.background_opacity ?? settings?.countdown_bg_opacity ?? 100) / 100;
  const fontFamily = slideSettings?.font_family || 'Frank Ruhl Libre';

  return (
    <div 
      className="fullscreen-countdown h-screen w-screen text-white flex flex-col items-center justify-center p-12 relative overflow-hidden transition-all duration-1000"
      style={{ fontFamily: `'${fontFamily}', serif` }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&display=swap" rel="stylesheet" />

      {bgImage && (
        <BackgroundImage 
          key={bgImage}
          imageUrl={bgImage}
          opacity={bgOpacity}
          overlayColor={null}
          overlayOpacity={0}
        />
      )}
      
      {!bgImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"></div>
      )}
      
      {/* Title at top */}
      <h1 className="absolute top-12 left-1/2 -translate-x-1/2 text-6xl md:text-7xl font-black z-20 whitespace-nowrap px-4" style={{
        color: '#ffffff',
        textShadow: `
          3px 3px 6px rgba(0,0,0,0.9),
          0 0 15px rgba(255,255,255,0.5),
          0 0 30px rgba(255,255,255,0.3)
        `,
        fontFamily: 'Frank Ruhl Libre, serif',
        letterSpacing: '0.02em'
      }}>
        ספירה לאחור לנץ החמה
      </h1>

      {/* Countdown Timer - 3D Golden Glass Numbers */}
      <div className="relative z-10 flex items-center justify-center px-4">
        <div className="countdown-glass-gold" style={{
          fontSize: 'clamp(8rem, 22vw, 20rem)',
          fontFamily: 'Arial Black, sans-serif',
          fontWeight: 900,
          color: 'transparent',
          position: 'relative',
          letterSpacing: '0.05em',
          // This simulates the glass fill and reflection
          background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,215,0,0.2) 45%, rgba(255,215,0,0.1) 50%, rgba(255,223,0,0.4) 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          // Multiple borders and shadows for 3D effect
          WebkitTextStroke: '2px #FFD700',
          filter: 'drop-shadow(0 15px 10px rgba(0,0,0,0.6))',
        }}>
          {/* Inner Shadow Layer for Depth */}
          <span style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1,
            width: '100%',
            height: '100%',
            color: 'transparent',
            WebkitTextStroke: '8px #B8860B',
            opacity: 0.7
          }}>
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
          {/* Main Text */}
          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </div>
      </div>

      <style>{`
        @keyframes glassShimmer {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
        .countdown-glass-gold {
          animation: glassShimmer 3s ease-in-out infinite;
          line-height: 1;
          display: inline-block;
        }
      `}</style>

      {/* Bottom text */}
      <h2 className="absolute bottom-32 left-1/2 -translate-x-1/2 text-5xl md:text-6xl font-black z-20 whitespace-nowrap px-4" style={{
        color: '#DAA520',
        textShadow: `
          3px 3px 6px rgba(0,0,0,0.9),
          0 0 20px rgba(218,165,32,0.6),
          0 0 40px rgba(218,165,32,0.4)
        `,
        fontFamily: 'Frank Ruhl Libre, serif',
        letterSpacing: '0.05em'
      }}>
        עורה כבודי אעירה השחר
      </h2>
      
      {/* Timeline Progress Bar - משמאל לימין */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-5xl z-10">
        <div className="relative h-6 bg-blue-900/50 rounded-full overflow-hidden border-2 border-blue-600 shadow-lg">
          {/* Progress fill - מתקדם משמאל לימין */}
          <div 
            className="absolute top-0 right-0 h-full bg-gradient-to-l from-amber-400 via-orange-500 to-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          ></div>
          
          {/* Markers */}
          {stages.map((stage, index) => {
            if (index === 0) return null;
            const percent = (stage.time / totalSeconds) * 100;
            return (
              <div 
                key={index}
                className="absolute top-0 h-full w-1 bg-white" 
                style={{ right: `${percent}%` }}
              ></div>
            );
          })}
        </div>
        
        {/* Timeline labels - מימין לשמאל */}
        <div className="relative flex justify-between mt-4 text-xl font-bold" style={{ direction: 'rtl' }}>
          {stages.map((stage, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full mb-2 ${
                elapsedSeconds >= stage.time 
                  ? (currentStageIndex === index ? 'bg-yellow-400 animate-pulse' : 'bg-green-400')
                  : 'bg-gray-400'
              }`}></div>
              <span className="text-amber-300 text-lg">{stage.name}</span>
              {index > 0 && (
                <span className="text-sm text-blue-200">+{stage.offset} דק׳</span>
              )}
            </div>
          ))}
        </div>
      </div>
      

    </div>
  );
}