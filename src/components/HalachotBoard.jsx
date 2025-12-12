import React, { useState, useEffect } from 'react';
import { Halacha } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import { format } from 'date-fns';
import BackgroundImage from './BackgroundImage';

export default function HalachotBoard({ allHalachot, loading, error }) {
  const [localHalachot, setLocalHalachot] = useState([]);
  const [dailyIndex, setDailyIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [slideSettings, setSlideSettings] = useState(null);

  useEffect(() => {
    if (allHalachot && allHalachot.length > 0) {
      setLocalHalachot(allHalachot.filter(h => h.active));
    } else if (!loading) {
      loadFreshData();
    }
  }, [allHalachot, loading]);

  const loadFreshData = async () => {
    try {
      const data = await Halacha.filter({ active: true }, 'order');
      setLocalHalachot(data);
    } catch (err) {
      console.error("Error loading halachot data:", err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadSlideSettings = async () => {
      try {
        const data = await SlideSettings.filter({ slide_name: 'Halachot' });
        if (data.length > 0) setSlideSettings(data[0]);
      } catch (err) {
        console.error("Error loading slide settings:", err);
      }
    };
    loadSlideSettings();
  }, []);

  // סבב יומי - מתחלף בחצות
  useEffect(() => {
    if (localHalachot.length > 0) {
      // חישוב אינדקס לפי היום בשנה
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const diff = now - startOfYear;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      // כל יום מציגים 2 הלכות, אז מחשבים אינדקס כפול 2
      const baseIndex = (dayOfYear * 2) % localHalachot.length;
      setDailyIndex(baseIndex);
    }
  }, [localHalachot.length]);

  const getHalachotForDisplay = () => {
    if (localHalachot.length === 0) return [];
    
    const halachot = [];
    for (let i = 0; i < 2 && i < localHalachot.length; i++) {
      const index = (dailyIndex + i) % localHalachot.length;
      halachot.push(localHalachot[index]);
    }
    return halachot;
  };

  const displayHalachot = getHalachotForDisplay();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-transparent"><div className="spinner" /></div>
    );
  }

  // NOTE: Do not force a heavy remote default background (saves a lot of data on first load).
  // If you want a background – set it via SlideSettings in the admin.
  const bgImage = slideSettings?.background_image;
  const bgOpacity = (slideSettings?.background_opacity ?? 100) / 100;
  const overlayColor = slideSettings?.overlay_color || '#000000';
  const overlayOpacity = (slideSettings?.overlay_opacity ?? 30) / 100;
  const fontFamily = slideSettings?.font_family || 'Frank Ruhl Libre';

  return (
    <div className="halachot-board h-screen w-screen flex flex-col text-white overflow-hidden p-8 relative" style={{ fontFamily: `'${fontFamily}', serif` }}>
      <link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700;900&display=swap" rel="stylesheet" />
      
      {bgImage ? (
        <BackgroundImage 
          imageUrl={bgImage}
          opacity={bgOpacity}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950 to-blue-900"></div>
      )}
      <div className="absolute top-4 left-4 z-20">
        <div className="flex items-baseline text-white ltr-direction">
          <span className="text-6xl font-bold tabular-nums drop-shadow-lg">{format(currentTime, 'HH:mm')}</span>
          <span className="text-4xl font-semibold tabular-nums text-amber-300 ml-2 -translate-y-px drop-shadow-lg">:{format(currentTime, 'ss')}</span>
        </div>
      </div>
      
      <h1 className="text-7xl font-bold text-amber-400 mb-8 hebrew-font text-center drop-shadow-lg relative z-10">הלכה יומית</h1>
      
      <div className="flex-grow flex items-center justify-center relative z-10">
        {displayHalachot.length > 0 ? (
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-2 gap-6">
              {displayHalachot.map((halacha, index) => (
                <div key={`${halacha.id}-${index}`} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border-4 border-amber-500 shadow-2xl">
                  <h3 className="text-4xl font-black text-amber-400 mb-4 drop-shadow-md">
                    {halacha.title}
                  </h3>
                  <p className="text-3xl font-bold text-white leading-relaxed mb-3 drop-shadow-sm">
                    {halacha.content}
                  </p>
                  {halacha.source && (
                    <p className="text-2xl font-semibold text-amber-300 opacity-90 mt-4">
                      מקור: {halacha.source}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-200">אין הלכות להצגה כרגע</p>
          </div>
        )}
      </div>
    </div>
  );
}