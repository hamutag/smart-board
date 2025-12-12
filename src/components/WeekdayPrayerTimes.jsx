import React, { useState, useEffect } from 'react';
import { DailyZmanim } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import { Settings } from '@/api/entities';
import { format } from 'date-fns';
import { Sunrise, Sunset, Clock, Moon, Star, Sun } from 'lucide-react';
import BackgroundImage from './BackgroundImage';

export default function WeekdayPrayerTimes() {
  const [zmanimData, setZmanimData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [slideSettings, setSlideSettings] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const [zmanimRecords, slideData, generalSettings] = await Promise.all([
          DailyZmanim.filter({ date: formattedDate }),
          SlideSettings.filter({ slide_name: 'WeekdayPrayerTimes' }),
          Settings.list()
        ]);
        
        if (zmanimRecords.length > 0) setZmanimData(zmanimRecords[0]);
        if (slideData.length > 0) setSlideSettings(slideData[0]);
        if (generalSettings.length > 0) setSettings(generalSettings[0]);
      } catch (err) {
        console.error("Error loading weekday zmanim:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightedIndex(prev => (prev + 1) % 9); // Cycle through 9 items
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (title) => {
    if (title.includes('נץ') || title.includes('זריחה')) return <Sunrise className="w-12 h-12" />;
    if (title.includes('שקיעה')) return <Sunset className="w-12 h-12" />;
    if (title.includes('עלות')) return <Star className="w-12 h-12" />;
    if (title.includes('צאת')) return <Moon className="w-12 h-12" />;
    if (title.includes('טלית')) return <Sun className="w-12 h-12" />;
    return <Clock className="w-12 h-12" />;
  };

  const addMinutes = (timeStr, minutes) => {
    if (!timeStr) return null;
    try {
      const [hours, mins] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(mins + minutes);
      return format(date, 'HH:mm');
    } catch (e) { return null; }
  };

  const formatTime = (time) => {
    if (!time) return '';
    try {
      if (time.length > 5) return time.substring(0, 5);
      return time;
    } catch (e) { return time; }
  };

  const calculatedMincha = addMinutes(zmanimData?.sunset, -20);
  const calculatedShiur = addMinutes(zmanimData?.tzeit, 15);

  const prayerTimes = [
    { title: 'עלות השחר', time: zmanimData?.alot },
    { title: 'זמן טלית ותפילין', time: zmanimData?.zman_talit },
    { title: 'נץ החמה', time: zmanimData?.sunrise },
    { title: 'תפילת שחרית', time: settings?.shacharit_time },
    { title: 'מנחה גדולה', time: zmanimData?.mincha_gedola },
    { title: 'תפילת מנחה', time: settings?.mincha_time || calculatedMincha || zmanimData?.mincha },
    { title: 'שקיעה', time: zmanimData?.sunset },
    { title: 'ערבית וצאת הכוכבים', time: settings?.arvit_time || zmanimData?.tzeit },
    { title: settings?.daily_class_title || 'שיעור', time: settings?.daily_class_time || calculatedShiur }
  ];

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-transparent"><div className="spinner" /></div>;
  }

  const fontFamily = 'Frank Ruhl Libre';
  const textColor = slideSettings?.text_color || '#ffffff';
  const accentColor = slideSettings?.accent_color || '#fbbf24';
  
  // Generic background logic: if no image in settings, use this specific gradient
  const bgImage = slideSettings?.background_image;
  // Fallback gradient if no image (Blue theme)
  const fallbackGradientClass = "bg-gradient-to-br from-blue-900 to-slate-900";

  return (
    <div className={`weekday-times h-screen w-screen flex flex-col text-white overflow-hidden p-8 relative ${!bgImage ? fallbackGradientClass : ''}`} style={{ fontFamily: `'${fontFamily}', serif` }}>
      {/* Google Fonts - Frank Ruhl Libre */}
      <link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700;900&display=swap" rel="stylesheet" />
      
      {/* If there is an image, BackgroundImage handles it. If not, the div class handles the gradient. 
          Actually, BackgroundImage (fixed) is great, let's use it for image only. */}
      {bgImage && (
        <BackgroundImage 
          imageUrl={bgImage}
          opacity={(slideSettings?.background_opacity ?? 100) / 100}
          overlayColor={slideSettings?.overlay_color || '#000000'}
          overlayOpacity={(slideSettings?.overlay_opacity ?? 30) / 100}
        />
      )}

      <div className="absolute top-4 left-4 z-50">
        <div className="flex items-baseline text-white ltr-direction">
          <span className="text-5xl font-bold tabular-nums drop-shadow-lg">{format(currentTime, 'HH:mm')}</span>
          <span className="text-3xl font-semibold tabular-nums ml-2 -translate-y-px drop-shadow-lg" style={{ color: accentColor }}>:{format(currentTime, 'ss')}</span>
        </div>
      </div>

      {settings?.logo_url && (
        <div className="absolute top-4 right-4 z-50">
          <img src={settings.logo_url} alt="Logo" style={{ width: `${settings.logo_size || 120}px` }} className="drop-shadow-2xl" />
        </div>
      )}

      <h1 className="text-6xl font-bold mb-6 text-center drop-shadow-2xl relative z-10" style={{ color: accentColor, fontFamily: "'Frank Ruhl Libre', serif" }}>
      זמני התפילה להיום
      </h1>

      <div className="flex-grow flex items-center justify-center relative z-10">
        <div className="grid grid-cols-4 gap-6 w-full max-w-7xl">
          {prayerTimes.filter(p => p.time).map((prayer, index) => {
            const isHighlighted = index === highlightedIndex;
            
            // Gradient colors for variety
            const gradients = [
              'from-indigo-500/30 to-indigo-600/30 border-indigo-400/60',
              'from-emerald-500/30 to-emerald-600/30 border-emerald-400/60',
              'from-amber-500/30 to-amber-600/30 border-amber-400/60',
              'from-purple-500/30 to-purple-600/30 border-purple-400/60',
              'from-teal-500/30 to-teal-600/30 border-teal-400/60',
              'from-pink-500/30 to-pink-600/30 border-pink-400/60',
              'from-rose-500/30 to-rose-600/30 border-rose-400/60',
              'from-blue-500/30 to-blue-600/30 border-blue-400/60',
              'from-cyan-500/30 to-cyan-600/30 border-cyan-400/60'
            ];
            const gradientClass = gradients[index % gradients.length];
            
            return (
              <div 
                key={index}
                className={`bg-gradient-to-br ${gradientClass} backdrop-blur-md p-6 rounded-3xl border-4 text-center shadow-2xl transition-all duration-500 relative
                  ${isHighlighted ? 'scale-105 ring-4 ring-amber-300/60' : ''}
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
                <div style={{ color: accentColor }} className="mb-3 relative z-10 drop-shadow-lg flex justify-center">{getIcon(prayer.title)}</div>
                <h3 className="text-2xl font-bold mb-3 drop-shadow-lg relative z-10" style={{ color: accentColor, fontFamily: "'Frank Ruhl Libre', serif" }}>{prayer.title}</h3>
                <p className="text-5xl font-bold drop-shadow-lg relative z-10" style={{ color: textColor, fontFamily: "'Frank Ruhl Libre', serif" }}>{formatTime(prayer.time)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}