import React, { useState, useEffect } from 'react';
import { formatTime } from './TimeUtils';
import { Sunrise, Sunset, Clock, BookOpen, Sun, Moon, Star } from 'lucide-react';

const calculateShacharitTime = (sunriseTime, minutesBefore) => {
    if (!sunriseTime) return null;
    try {
        const [hours, minutes] = sunriseTime.split(':').map(Number);
        const sunriseDate = new Date();
        sunriseDate.setHours(hours, minutes, 0, 0);
        const shacharitDate = new Date(sunriseDate.getTime() - minutesBefore * 60 * 1000);
        return `${String(shacharitDate.getHours()).padStart(2, '0')}:${String(shacharitDate.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
        console.error("Error calculating Shacharit time:", e);
        return null;
    }
};

const calculateMinchaTime = (sunsetTime) => {
    if (!sunsetTime) return null;
    try {
        const [hours, minutes] = sunsetTime.split(':').map(Number);
        const sunsetDate = new Date();
        sunsetDate.setHours(hours, minutes, 0, 0);
        const minchaDate = new Date(sunsetDate.getTime() - 15 * 60 * 1000); // Changed to 15 minutes
        return `${String(minchaDate.getHours()).padStart(2, '0')}:${String(minchaDate.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
        console.error("Error calculating Mincha time:", e);
        return null;
    }
};

const calculateShiurTime = (tzeitTime) => {
    if (!tzeitTime) return null;
    try {
        const [hours, minutes] = tzeitTime.split(':').map(Number);
        const tzeitDate = new Date();
        tzeitDate.setHours(hours, minutes, 0, 0);
        const shiurDate = new Date(tzeitDate.getTime() + 15 * 60 * 1000);
        return `${String(shiurDate.getHours()).padStart(2, '0')}:${String(shiurDate.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
        console.error("Error calculating Shiur time:", e);
        return null;
    }
};

export default function PrayerTimes({ zmanimData, isShabbat, isFridayEvening }) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const minchaTime = calculateMinchaTime(zmanimData?.sunset);
  const shiurTime = calculateShiurTime(zmanimData?.tzeit);
  const shacharitTime = calculateShacharitTime(zmanimData?.sunrise, isShabbat ? 70 : 40);

  const getIcon = (title) => {
    if (title.includes('הנץ') || title.includes('זריחה')) return <Sunrise className="w-8 h-8" />;
    if (title.includes('שקיעה')) return <Sunset className="w-8 h-8" />;
    if (title.includes('שחרית') || title.includes('תפילת')) return <Sun className="w-8 h-8" />;
    if (title.includes('ערבית') || title.includes('מוצ')) return <Moon className="w-8 h-8" />;
    if (title.includes('מנחה')) return <Clock className="w-8 h-8" />;
    if (title.includes('שיעור')) return <BookOpen className="w-8 h-8" />;
    if (title.includes('טלית')) return <Star className="w-8 h-8" />;
    return <Clock className="w-8 h-8" />;
  };

  // Friday evening mode - show only Mincha and Arvit
  const prayers = isFridayEvening ? [
    { title: 'מנחה - כניסת שבת', time: zmanimData?.candles || '--:--' },
    { title: 'ערבית של שבת', time: zmanimData?.tzeit || '--:--' }
  ] : isShabbat ? [
    // Shabbat prayer times - fixed times
    { title: 'תפילת הנץ', time: '05:00' },
    { title: 'הנץ החמה', time: zmanimData?.sunrise || '--:--' },
    { title: 'שחרית', time: '08:00' },
    { title: 'מנחה גדולה', time: '12:30' },
    { title: 'שיעור 2', time: '13:00' },
    { title: 'שיעור 3', time: '14:30' },
    { title: 'מנחה קטנה', time: '15:45' },
    { title: 'ערבית מוצ"ש', time: '17:00' }
  ] : [
    // Weekday prayer times
    { title: 'זמן טלית ותפילין', time: zmanimData?.zman_talit || '--:--' },
    { title: 'שחרית', time: shacharitTime || '--:--' },
    { title: 'הנץ החמה', time: zmanimData?.sunrise || '--:--' },
    { title: 'מנחה גדולה', time: zmanimData?.mincha_gedola || '--:--' },
    { title: 'שיעור', time: shiurTime || '--:--' },
    { title: 'מנחה קטנה', time: minchaTime || '--:--' },
    { title: 'שקיעה', time: zmanimData?.sunset || '--:--' },
    { title: 'ערבית', time: zmanimData?.arvit || '--:--' }
  ];

  // Cycling highlight effect every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightedIndex(prev => (prev + 1) % prayers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [prayers.length]);

  const boxColors = [
    "bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 border-indigo-300",
    "bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 border-emerald-300", 
    "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 border-amber-300",
    "bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700 border-purple-300",
    "bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 border-teal-300",
    "bg-gradient-to-br from-pink-500 via-pink-600 to-rose-700 border-pink-300",
    "bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 border-rose-300",
    "bg-gradient-to-br from-slate-500 via-slate-600 to-gray-700 border-slate-300"
  ];

  return (
    <div className={`prayer-times-grid grid ${isFridayEvening ? 'grid-cols-2' : 'grid-cols-4'} gap-8 w-full max-w-screen-xl mx-auto`}>
      {prayers.map((prayer, index) => {
        const isHighlighted = index === highlightedIndex;
        return (
          <div 
            key={index} 
            className={`prayer-time-box relative p-6 rounded-3xl text-center shadow-2xl transition-all duration-500 flex flex-col justify-center items-center min-h-[240px] overflow-hidden ${boxColors[index % boxColors.length]} ${isHighlighted ? 'scale-110 shadow-amber-300/80 ring-4 ring-amber-300/60' : 'hover:scale-105'}`}
            style={{
              boxShadow: isHighlighted 
                ? '0 0 60px rgba(251, 191, 36, 0.8), 0 0 90px rgba(251, 191, 36, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.2)' 
                : '0 10px 40px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1)',
              border: '3px solid rgba(212, 175, 55, 0.6)'
            }}
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
            
            {/* Gold border glow */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
              boxShadow: 'inset 0 0 15px rgba(212, 175, 55, 0.3)'
            }}></div>
            
            {/* Sparkle effect */}
            <div className={`absolute top-2 right-2 w-3 h-3 bg-white rounded-full ${isHighlighted ? 'animate-ping' : 'opacity-60'}`}></div>
            <div className={`absolute bottom-4 left-4 w-2 h-2 bg-white rounded-full ${isHighlighted ? 'animate-pulse' : 'opacity-40'}`}></div>
            
            {/* Content with Icon */}
            <div className="text-amber-300 mb-2 relative z-10">
              {getIcon(prayer.title)}
            </div>
            <h3 className="text-3xl font-bold text-amber-300 mb-4 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] relative z-10">{prayer.title}</h3>
            <p className="text-6xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] relative z-10" style={{
              textShadow: isHighlighted ? '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.4)' : '0 4px 12px rgba(0,0,0,0.9)'
            }}>{formatTime(prayer.time) || "--:--"}</p>
          </div>
        );
      })}
    </div>
  );
}