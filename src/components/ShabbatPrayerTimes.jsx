import React, { useState, useEffect } from 'react';
import { ShabbatTimes } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import { formatTime } from './TimeUtils';
import { format } from 'date-fns';
import { Sunrise, Sunset, Clock, BookOpen, Sun, Moon, Flame, Star } from 'lucide-react';
import BackgroundImage from './BackgroundImage';

export default function ShabbatPrayerTimes() {
  const [shabbatData, setShabbatData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [slideSettings, setSlideSettings] = useState(null);

  const dayOfWeek = new Date().getDay();
  const isFriday = dayOfWeek === 5;
  const isShabbat = dayOfWeek === 6;

  useEffect(() => {
    const loadShabbatTimes = async () => {
      try {
        // מוצא את השבת הקרובה
        const today = new Date();
        let fridayDate = new Date(today);
        
        if (isFriday) {
          // היום יום שישי
        } else if (isShabbat) {
          // היום שבת - לוקחים את יום שישי של אתמול
          fridayDate.setDate(fridayDate.getDate() - 1);
        } else {
          // יום אחר - מוצאים את יום שישי הקרוב
          const daysUntilFriday = (5 - today.getDay() + 7) % 7;
          fridayDate.setDate(today.getDate() + daysUntilFriday);
        }
        
        const dateStr = fridayDate.toISOString().split('T')[0];
        const [records, slideData] = await Promise.all([
          ShabbatTimes.filter({ date: dateStr }),
          SlideSettings.filter({ slide_name: 'ShabbatPrayerTimes' })
        ]);
        
        if (records.length > 0) {
          setShabbatData(records[0]);
        }
        if (slideData.length > 0) {
          setSlideSettings(slideData[0]);
        }
      } catch (err) {
        console.error("Error loading Shabbat times:", err);
      } finally {
        setLoading(false);
      }
    };
    loadShabbatTimes();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getIcon = (title) => {
    if (title.includes('כניסת') || title.includes('נרות')) return <Flame className="w-6 h-6" />;
    if (title.includes('הנץ') || title.includes('נץ') || title.includes('זריחה')) return <Sunrise className="w-6 h-6" />;
    if (title.includes('שקיעה')) return <Sunset className="w-6 h-6" />;
    if (title.includes('שחרית')) return <Sun className="w-6 h-6" />;
    if (title.includes('ערבית') || title.includes('מוצ')) return <Moon className="w-6 h-6" />;
    if (title.includes('מנחה')) return <Clock className="w-6 h-6" />;
    if (title.includes('שיעור')) return <BookOpen className="w-6 h-6" />;
    return <Star className="w-6 h-6" />;
  };

  // Calculate times
  const calculateShabbatBeginsTime = (sunriseTime) => {
    if (!sunriseTime) return null;
    try {
      const [hours, minutes] = sunriseTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes - 75;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    } catch { return null; }
  };

  const calculateMinchaGedola = () => {
    const now = new Date();
    const month = now.getMonth();
    const isDST = month >= 2 && month <= 9; // March-October
    return isDST ? '13:30' : '12:30';
  };

  const subtractMinutes = (timeStr, mins) => {
    if (!timeStr) return null;
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes - mins;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    } catch { return null; }
  };

  // זמני שבת מלאים - דף אחד
  const shabbatTimes = shabbatData ? [
    { title: 'מנחה ערב שבת', time: shabbatData.friday_mincha || '--:--' },
    { title: 'ערבית ערב שבת', time: shabbatData.friday_arvit || '--:--' },
    { title: 'שחרית בנץ', time: calculateShabbatBeginsTime(shabbatData.shabbat_sunrise) || '--:--' },
    { title: 'שחרית', time: '08:00' },
    { title: 'מנחה גדולה', time: calculateMinchaGedola() },
    { title: 'שיעור ב׳', time: '13:00' },
    { title: 'שיעור ג׳', time: '14:30' },
    { title: 'מנחה קטנה', time: '15:30' },
    { title: 'ערבית מוצ״ש', time: subtractMinutes(shabbatData.shabbat_ends, 10) || '--:--' }
  ] : [];

  useEffect(() => {
    if (shabbatTimes.length > 0) {
      const interval = setInterval(() => {
        setHighlightedIndex(prev => (prev + 1) % shabbatTimes.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [shabbatTimes.length]);

  const boxColors = [
    "bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 border-indigo-300",
    "bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 border-emerald-300", 
    "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 border-amber-300",
    "bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700 border-purple-300",
    "bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 border-teal-300",
    "bg-gradient-to-br from-pink-500 via-pink-600 to-rose-700 border-pink-300",
    "bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 border-rose-300"
  ];

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-transparent">
        <div className="spinner" />
      </div>
    );
  }

  const bgImage = slideSettings?.background_image;
  const bgOpacity = (slideSettings?.background_opacity ?? 100) / 100;
  const overlayColor = slideSettings?.overlay_color || '#000000';
  const overlayOpacity = (slideSettings?.overlay_opacity ?? 30) / 100;
  const fontFamily = slideSettings?.font_family || 'Frank Ruhl Libre';

  return (
    <div 
      className="shabbat-times h-screen w-screen flex flex-col text-white overflow-hidden p-8 relative"
      style={{ fontFamily: `'${fontFamily}', serif` }}
    >
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
      
      {/* Google Fonts - Frank Ruhl Libre */}
      <link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700;900&display=swap" rel="stylesheet" />
      
      {/* Clock */}
      <div className="absolute top-4 left-4 z-50">
        <div className="flex items-baseline text-white ltr-direction">
          <span className="text-5xl font-bold tabular-nums drop-shadow-lg">{format(currentTime, 'HH:mm')}</span>
          <span className="text-3xl font-semibold tabular-nums text-amber-300 ml-2 -translate-y-px drop-shadow-lg">:{format(currentTime, 'ss')}</span>
        </div>
      </div>

      {/* Top Row - Main Shabbat Times */}
      <div className="grid grid-cols-3 gap-8 mb-8 relative z-10">
        <div className="bg-gradient-to-br from-amber-500/30 to-amber-600/30 backdrop-blur-md p-8 rounded-3xl border-4 border-amber-400/60 text-center shadow-2xl">
          <Flame className="w-12 h-12 mx-auto mb-3 text-amber-300" />
          <h2 className="text-3xl font-bold text-amber-300 mb-4" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>כניסת שבת</h2>
          <p className="text-6xl font-black text-white" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>{formatTime(shabbatData?.candle_lighting) || '--:--'}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/30 backdrop-blur-md p-8 rounded-3xl border-4 border-blue-400/60 text-center shadow-2xl">
          <Moon className="w-12 h-12 mx-auto mb-3 text-blue-300" />
          <h2 className="text-3xl font-bold text-blue-300 mb-4" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>יציאת שבת</h2>
          <p className="text-6xl font-black text-white" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>{formatTime(shabbatData?.shabbat_ends) || '--:--'}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/30 to-purple-600/30 backdrop-blur-md p-8 rounded-3xl border-4 border-purple-400/60 text-center shadow-2xl">
          <Star className="w-12 h-12 mx-auto mb-3 text-purple-300" />
          <h2 className="text-3xl font-bold text-purple-300 mb-4" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>רבינו תם</h2>
          <p className="text-6xl font-black text-white" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>{formatTime(shabbatData?.shabbat_ends_rt) || '--:--'}</p>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-5xl font-bold text-amber-400 mb-6 text-center drop-shadow-2xl relative z-10" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
        זמני תפילות שבת
      </h1>

      {/* Prayer Times Grid */}
      <div className="flex-grow flex items-center justify-center relative z-10">
        <div className="grid grid-cols-5 gap-4 w-full max-w-7xl">
          {shabbatTimes.map((prayer, index) => {
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
              'from-cyan-500/30 to-cyan-600/30 border-cyan-400/60',
              'from-orange-500/30 to-orange-600/30 border-orange-400/60'
            ];
            const gradientClass = gradients[index % gradients.length];
            
            return (
              <div 
                key={index} 
                className={`bg-gradient-to-br ${gradientClass} backdrop-blur-md p-5 rounded-3xl border-4 text-center shadow-2xl transition-all duration-500 flex flex-col justify-center items-center relative ${isHighlighted ? 'scale-105 ring-4 ring-amber-300/60' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
                <div className="text-amber-300 mb-2 relative z-10">{getIcon(prayer.title)}</div>
                <h3 className="text-xl font-bold text-amber-300 mb-2 drop-shadow-lg relative z-10" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>{prayer.title}</h3>
                <p className="text-4xl font-bold text-white drop-shadow-lg relative z-10" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>{formatTime(prayer.time) || "--:--"}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}