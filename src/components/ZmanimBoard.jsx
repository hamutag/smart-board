import React, { useState, useEffect } from 'react';
import { Monitor, Settings, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { SmartMessage } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import ClockDisplay from './ClockDisplay';
import PrayerTimes from './PrayerTimes';
import ParashaDisplay from './ParashaDisplay';
import RoshChodeshDisplay from './RoshChodeshDisplay';
import HebrewDate from './HebrewDate';
import DedicationDisplay from './DedicationDisplay';
import { Button } from '@/components/ui/button';
import FullScreenCountdown from './FullScreenCountdown';
import QuickZmanimEditor from './QuickZmanimEditor';
import BackgroundImage from './BackgroundImage';

export default function ZmanimBoard({ dailyZmanim, settings, loading, error, onCountdownStateChange, externalTimeLeft, forceCountdownMode }) {
  const [resolution, setResolution] = useState('fullhd');
  const [showResolutionSelector, setShowResolutionSelector] = useState(false);
  const [showQuickEditor, setShowQuickEditor] = useState(false);
  
  const [countdownTimeLeft, setCountdownTimeLeft] = useState(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [isFridayEvening, setIsFridayEvening] = useState(false);

  // Sync with external props if provided
  useEffect(() => {
    if (forceCountdownMode !== undefined) {
      setIsCountdownActive(forceCountdownMode);
    }
    if (externalTimeLeft !== undefined) {
      setCountdownTimeLeft(externalTimeLeft);
    }
  }, [forceCountdownMode, externalTimeLeft]);
  
  const [smartMessages, setSmartMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  const [slideSettings, setSlideSettings] = useState(null);

  const dayOfWeek = new Date().getDay();
  const isShabbat = dayOfWeek === 6;
  const isFriday = dayOfWeek === 5;
  const countdownMinutes = isShabbat ? (settings?.shabbat_countdown_minutes || 70) : (settings?.sunrise_countdown_minutes || 40);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [messages, slideData] = await Promise.all([
          SmartMessage.filter({ active: true }, 'order'),
          SlideSettings.filter({ slide_name: 'ZmanimBoard' })
        ]);
        
        if (messages.length > 0) {
          setSmartMessages(messages);
        } else {
          setSmartMessages([{ content: 'שלום וברכה • זמני התפילות מעודכנים • מוזמנים להצטרף לשיעורי תורה • שבת שלום לכולם' }]);
        }
        
        if (slideData.length > 0) {
          setSlideSettings(slideData[0]);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setSmartMessages([{ content: 'שלום וברכה • זמני התפילות מעודכנים • מוזמנים להצטרף לשיעורי תורה • שבת שלום לכולם' }]);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (smartMessages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessageIndex(prev => (prev + 1) % smartMessages.length);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [smartMessages.length]);

  useEffect(() => {
    const checkFridayEvening = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const hour = now.getHours();
      setIsFridayEvening(dayOfWeek === 5 && hour >= 16);
    };

    checkFridayEvening();
    const interval = setInterval(checkFridayEvening, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedResolution = localStorage.getItem('boardResolution');
    if (savedResolution) {
      setResolution(savedResolution);
    } else {
      const detectResolution = () => {
        const width = window.innerWidth;
        if (width <= 1366) {
          setResolution('hd');
        } else {
          setResolution('fullhd');
        }
      };
      detectResolution();
    }
  }, []);

  // Legacy internal calculation - only runs if external props NOT provided (fallback)
  useEffect(() => {
    if (forceCountdownMode !== undefined) return; // Skip if controlled externally
    if (!dailyZmanim?.sunrise) return;

    const checkCountdown = () => {
      try {
        const now = new Date();
        const [hours, minutes] = dailyZmanim.sunrise.split(':').map(Number);
        const sunriseToday = new Date();
        sunriseToday.setHours(hours, minutes, 0, 0);
        const sunriseTime = sunriseToday < now ? new Date(sunriseToday.getTime() + 24 * 60 * 60 * 1000) : sunriseToday;
        const timeDiff = sunriseTime.getTime() - now.getTime();
        const countdownIsOn = timeDiff > 0 && timeDiff <= countdownMinutes * 60 * 1000;

        if (countdownIsOn) {
          if (!isCountdownActive) {
            setIsCountdownActive(true);
            if (onCountdownStateChange) onCountdownStateChange(true);
          }
          const totalSecondsLeft = Math.floor(timeDiff / 1000);
          setCountdownTimeLeft({ minutes: Math.floor(totalSecondsLeft / 60), seconds: totalSecondsLeft % 60 });
        } else {
          if (isCountdownActive) {
            setIsCountdownActive(false);
            if (onCountdownStateChange) onCountdownStateChange(false);
            setCountdownTimeLeft(null);
          }
        }
      } catch (e) {}
    };
    const interval = setInterval(checkCountdown, 1000);
    return () => clearInterval(interval);
  }, [dailyZmanim?.sunrise, countdownMinutes, isCountdownActive, onCountdownStateChange, forceCountdownMode]);

  const scaleClass = resolution === 'hd' ? 'scale-[0.85] origin-top' : 'scale-100';

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-blue-950"><div className="spinner" /></div>;
  }
  if (error) {
    return <div className="h-screen w-screen flex items-center justify-center bg-blue-950 text-red-400">{error}</div>;
  }
  
  if (isCountdownActive && countdownTimeLeft) {
    return <FullScreenCountdown timeLeft={countdownTimeLeft} countdownMinutes={countdownMinutes} isShabbat={isShabbat} zmanimData={dailyZmanim} />;
  }

  // Don't force a heavy remote default background.
  // If you want a background, set it in SlideSettings (admin).
  const bgImage = slideSettings?.background_image;
  const bgOpacity = (slideSettings?.background_opacity ?? 100) / 100;
  const overlayColor = slideSettings?.overlay_color || '#000000';
  const overlayOpacity = (slideSettings?.overlay_opacity ?? 30) / 100;
  const fontFamily = slideSettings?.font_family || 'Rubik';

  return (
    <div 
      className={`zmanim-board h-screen w-screen text-white p-8 flex flex-col ${scaleClass} transition-transform duration-500 relative`}
      style={{ fontFamily: `'${fontFamily}', sans-serif` }}
    >
      {/* Background using component for preload */}
      <BackgroundImage 
        imageUrl={bgImage}
        opacity={bgOpacity}
        overlayColor={overlayColor}
        overlayOpacity={overlayOpacity}
      />
      
      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 relative">
        <Link to={createPageUrl("Dashboard")}>
          <Button
            variant="outline"
            size="icon"
            className="bg-blue-800/70 border-blue-600 hover:bg-blue-700 text-white backdrop-blur-sm"
            title="הגדרות"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </Link>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowQuickEditor(true)}
          className="bg-blue-800/70 border-blue-600 hover:bg-blue-700 text-white backdrop-blur-sm"
          title="עריכה מהירה"
        >
          <Edit className="w-5 h-5" />
        </Button>
      </div>

      {/* Resolution Selector */}
      <div 
        className="absolute top-4 right-36 z-50"
        onMouseEnter={() => setShowResolutionSelector(true)}
        onMouseLeave={() => setShowResolutionSelector(false)}
      >
        <Button
          variant="outline"
          size="icon"
          className="bg-blue-800/70 border-blue-600 hover:bg-blue-700 text-white backdrop-blur-sm"
        >
          <Monitor className="w-5 h-5" />
        </Button>
        
        {showResolutionSelector && (
          <div className="absolute top-12 right-0 bg-blue-800 border border-blue-600 rounded-lg p-2 shadow-lg">
            <div className="text-sm text-blue-200 mb-2">רזולוציה:</div>
            <Button variant={resolution === 'hd' ? 'default' : 'outline'} size="sm" onClick={() => { setResolution('hd'); localStorage.setItem('boardResolution', 'hd'); }} className="mb-1 w-full">HD</Button>
            <Button variant={resolution === 'fullhd' ? 'default' : 'outline'} size="sm" onClick={() => { setResolution('fullhd'); localStorage.setItem('boardResolution', 'fullhd'); }} className="w-full">Full HD</Button>
          </div>
        )}
      </div>

      {/* Quick Editor Modal */}
      {showQuickEditor && (
        <QuickZmanimEditor 
          dailyZmanim={dailyZmanim} 
          onClose={() => setShowQuickEditor(false)} 
        />
      )}

      {/* Header */}
      <header className="grid grid-cols-3 items-center gap-4 mb-4 relative z-10">
        <div className="flex flex-col items-start justify-center gap-3">
          <RoshChodeshDisplay roshChodesh={dailyZmanim?.rosh_chodesh} />
          <ParashaDisplay parasha={dailyZmanim?.parasha} />
        </div>

        <div className="flex flex-col items-center text-center gap-2">
           <h1 className="text-7xl font-bold text-amber-400" style={{ fontFamily: `'${fontFamily}', serif` }}>לוח חכם</h1>
           <ClockDisplay fontFamily={fontFamily} />
           <HebrewDate date={dailyZmanim?.hebrew_date} fontFamily={fontFamily} />
        </div>

        <div className="flex items-start justify-end">
          {settings?.logo_url && (
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              style={{ 
                width: `${settings.logo_size || 120}px`,
                height: 'auto'
              }}
              className="drop-shadow-2xl"
            />
          )}
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center relative z-10">
        <PrayerTimes 
          zmanimData={dailyZmanim} 
          isShabbat={isShabbat}
          isFridayEvening={isFridayEvening}
        />
      </main>

      <footer className="text-center pt-4 relative z-10">
        <DedicationDisplay dedication={settings?.dedication} />
        
        {/* Smart News Ticker */}
        <div className="mt-4 bg-gradient-to-r from-blue-800/50 via-blue-700/50 to-blue-800/50 py-3 px-6 rounded-full border-2 border-blue-600/60 shadow-xl overflow-hidden">
          <div className="flex items-center gap-4">
            <span className="text-amber-400 font-bold text-xl flex-shrink-0">📢</span>
            <div className="marquee-container flex-grow overflow-hidden">
              <div className="marquee-content animate-marquee whitespace-nowrap inline-block">
                <span className="text-white text-xl font-semibold">
                  {smartMessages[currentMessageIndex]?.content || 'שלום וברכה'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .marquee-content {
          display: inline-block;
          padding-left: 100%;
        }
      `}</style>
    </div>
  );
}