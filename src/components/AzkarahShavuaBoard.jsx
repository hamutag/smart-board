import React, { useState, useEffect, useMemo } from 'react';
import { NiftarWeekly } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import BackgroundImage from './BackgroundImage';

export default function AzkarahShavuaBoard({ niftarimList, loading, error }) {
  const [localNiftarimList, setLocalNiftarimList] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(0);
  const [slideSettings, setSlideSettings] = useState(null);
  const itemsPerPage = 8;
  
  useEffect(() => {
    if (niftarimList && niftarimList.length > 0) {
      filterNiftarimForWeek(niftarimList.filter(item => item.active));
    } else if (!loading) {
      loadFreshData();
    }
    loadSlideSettings();
  }, [niftarimList, loading]);

  const loadSlideSettings = async () => {
    try {
      const data = await SlideSettings.filter({ slide_name: 'Niftarim' });
      if (data.length > 0) setSlideSettings(data[0]);
    } catch (err) {
      console.error("Error loading slide settings:", err);
    }
  };

  const loadFreshData = async () => {
    try {
      const data = await NiftarWeekly.filter({ active: true });
      filterNiftarimForWeek(data);
    } catch (err) {
      console.error("Error loading niftarim data:", err);
    }
  };

  const filterNiftarimForWeek = (data) => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // יום ראשון
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 }); // יום שבת
    
    const thisWeekNiftarim = data.filter(niftar => {
      if (!niftar.yahrzeit_gregorian_date) return false;
      try {
        const yahrzeitDate = parseISO(niftar.yahrzeit_gregorian_date);
        // בודקים אם התאריך הלועזי נמצא בשבוע הנוכחי
        return isWithinInterval(yahrzeitDate, { start: weekStart, end: weekEnd });
      } catch {
        return false;
      }
    });
    
    // אם אין נפטרים בשבוע - מציגים הכל
    setLocalNiftarimList(thisWeekNiftarim.length > 0 ? thisWeekNiftarim : data);
  };

  const totalPages = Math.ceil(localNiftarimList.length / itemsPerPage);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const pageTurnTimer = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % (totalPages || 1));
    }, 15000);
    
    return () => {
      clearInterval(timer);
      clearInterval(pageTurnTimer);
    };
  }, [totalPages]);

  const currentNiftarim = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return localNiftarimList.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, localNiftarimList, itemsPerPage]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-transparent"><div className="spinner" /></div>
    );
  }

  // Avoid forcing a heavy remote default background.
  const bgImage = slideSettings?.background_image;
  const bgOpacity = (slideSettings?.background_opacity ?? 100) / 100;
  const overlayColor = slideSettings?.overlay_color || '#000000';
  const overlayOpacity = (slideSettings?.overlay_opacity ?? 30) / 100;
  const fontFamily = slideSettings?.font_family || 'Rubik';

  return (
    <div className="azkarah-board h-screen w-screen flex flex-col text-white overflow-hidden p-8 relative" style={{ fontFamily: `'${fontFamily}', serif` }}>
      {bgImage ? (
        <BackgroundImage 
          imageUrl={bgImage}
          opacity={bgOpacity}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-gray-800"></div>
      )}
      <div className="absolute top-4 left-4 z-20">
        <div className="flex items-baseline text-white ltr-direction">
          <span className="text-6xl font-bold tabular-nums drop-shadow-lg">{format(currentTime, 'HH:mm')}</span>
          <span className="text-4xl font-semibold tabular-nums text-amber-300 ml-2 -translate-y-px drop-shadow-lg">:{format(currentTime, 'ss')}</span>
        </div>
      </div>

      <h1 className="text-7xl font-bold text-slate-300 mb-8 hebrew-font text-center drop-shadow-lg relative z-10">אזכרה השבוע</h1>
      
      <div className="flex-grow overflow-hidden relative z-10">
        {localNiftarimList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentNiftarim.map((niftar, index) => {
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
                <div key={niftar.id || index} className={`bg-gradient-to-br ${gradientClass} backdrop-blur-md p-6 rounded-3xl border-4 text-center shadow-2xl transition-all duration-500 relative`}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
                  <div className="yahrzeit-candle text-5xl mb-3 relative z-10">🕯️</div>
                  <h3 className="text-4xl font-black text-white mb-3 leading-tight drop-shadow-lg relative z-10">
                    {niftar.hebrew_name}
                  </h3>
                  <p className="text-2xl font-bold text-amber-300 mb-2 drop-shadow-lg relative z-10">
                    {niftar.yahrzeit_hebrew_date}
                  </p>
                  {niftar.dedication_text && (
                    <p className="text-xl font-semibold text-white leading-relaxed drop-shadow-sm relative z-10">{niftar.dedication_text}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-4xl font-bold text-slate-400">אין אזכרות השבוע</p>
          </div>
        )}
      </div>
      
       {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-colors ${
                index === currentPage ? 'bg-slate-400' : 'bg-slate-600/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}