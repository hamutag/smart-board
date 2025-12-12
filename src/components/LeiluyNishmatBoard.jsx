import React, { useState, useEffect, useMemo } from 'react';
import { LeiluyNishmat } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import { format } from 'date-fns';
import BackgroundImage from './BackgroundImage';

export default function LeiluyNishmatBoard() {
  const [men, setMen] = useState([]);
  const [women, setWomen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [slideSettings, setSlideSettings] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [data, slideData] = await Promise.all([
          LeiluyNishmat.list('order'),
          SlideSettings.filter({ slide_name: 'LeiluyNishmat' })
        ]);
        const activeData = data.filter(item => item.active !== false);
        setMen(activeData.filter(item => item.gender === 'male'));
        setWomen(activeData.filter(item => item.gender === 'female'));
        if (slideData.length > 0) setSlideSettings(slideData[0]);
      } catch (err) {
        console.error("Error loading Leiluy Nishmat data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPages = Math.ceil(Math.max(men.length, women.length) / (itemsPerPage / 2));

  useEffect(() => {
    if (totalPages > 1) {
      const pageTurnTimer = setTimeout(() => {
        setCurrentPage(prev => (prev + 1) % totalPages);
      }, 15000);
      return () => clearTimeout(pageTurnTimer);
    }
  }, [currentPage, totalPages]);
  
  const getCurrentPageItems = (items) => {
    const startIndex = currentPage * (itemsPerPage / 2);
    return items.slice(startIndex, startIndex + (itemsPerPage / 2));
  };
  
  const currentMen = useMemo(() => getCurrentPageItems(men), [men, currentPage]);
  const currentWomen = useMemo(() => getCurrentPageItems(women), [women, currentPage]);

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

  const MemoriamCard = ({ item, isHighlighted, cardIndex }) => {
    const gradientClass = gradients[cardIndex % gradients.length];
    
    return (
      <div className={`bg-gradient-to-br ${gradientClass} backdrop-blur-md p-4 rounded-3xl border-4 text-center shadow-2xl transition-all duration-500 ${isHighlighted ? 'scale-110 ring-4 ring-amber-300/60' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
        <div className="ner-neshama text-5xl mb-2 relative z-10">🕯️</div>
        <p className="text-3xl font-bold text-white leading-tight mb-1 drop-shadow-lg relative z-10">{item.name}</p>
        <p className="text-xl font-bold text-amber-300 drop-shadow-lg relative z-10">{item.hebrew_date || 'ללא תאריך'}</p>
        {item.description && (
          <p className="text-base font-semibold text-white mt-2 drop-shadow-sm relative z-10">{item.description}</p>
        )}
      </div>
    );
  };

  const [highlightedIndex, setHighlightedIndex] = useState(0);
   useEffect(() => {
    const totalItemsOnPage = currentMen.length + currentWomen.length;
    if (totalItemsOnPage > 0) {
       const highlightTimer = setInterval(() => {
        setHighlightedIndex(prev => (prev + 1) % totalItemsOnPage);
      }, 5000);
      return () => clearInterval(highlightTimer);
    }
  }, [currentMen.length, currentWomen.length]);

  if (loading) {
     return <div className="h-screen w-screen flex items-center justify-center bg-transparent"><div className="spinner" /></div>;
  }

  const bgImage = slideSettings?.background_image;
  const bgOpacity = (slideSettings?.background_opacity ?? 100) / 100;
  const overlayColor = slideSettings?.overlay_color || '#000000';
  const overlayOpacity = (slideSettings?.overlay_opacity ?? 30) / 100;
  const fontFamily = slideSettings?.font_family || 'Rubik';

  return (
    <div className="leiluy-nishmat-board h-screen w-screen flex flex-col text-white overflow-hidden p-8 relative" style={{ fontFamily: `'${fontFamily}', serif` }}>
      {bgImage ? (
        <BackgroundImage 
          imageUrl={bgImage}
          opacity={bgOpacity}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950 to-indigo-900"></div>
      )}
       <div className="absolute top-4 left-4 z-20">
        <div className="flex items-baseline text-white ltr-direction">
          <span className="text-6xl font-bold tabular-nums drop-shadow-lg">{format(currentTime, 'HH:mm')}</span>
          <span className="text-4xl font-semibold tabular-nums text-amber-300 ml-2 -translate-y-px drop-shadow-lg">:{format(currentTime, 'ss')}</span>
        </div>
      </div>

      <h1 className="text-7xl font-bold text-indigo-300 mb-8 hebrew-font text-center drop-shadow-lg relative z-10">לעילוי נשמת</h1>
      
      <div className="flex-grow grid grid-cols-2 gap-x-12 min-h-0 relative z-10">
        <div className="flex flex-col">
          <h2 className="text-5xl text-center text-blue-300 mb-6 font-bold">גברים</h2>
          <div className="grid grid-cols-2 gap-6 h-full content-start">
            {currentMen.length > 0 ? currentMen.map((item, index) => <MemoriamCard key={item.id} item={item} isHighlighted={index === highlightedIndex} cardIndex={index} />) : <div className="col-span-2 flex items-center justify-center text-2xl text-gray-400">אין מונצחים להצגה</div>}
          </div>
        </div>
        
        <div className="flex flex-col">
          <h2 className="text-5xl text-center text-pink-300 mb-6 font-bold">נשים</h2>
          <div className="grid grid-cols-2 gap-6 h-full content-start">
            {currentWomen.length > 0 ? currentWomen.map((item, index) => <MemoriamCard key={item.id} item={item} isHighlighted={(currentMen.length + index) === highlightedIndex} cardIndex={currentMen.length + index} />) : <div className="col-span-2 flex items-center justify-center text-2xl text-gray-400">אין מונצחות להצגה</div>}
          </div>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-colors ${
                index === currentPage ? 'bg-indigo-400' : 'bg-indigo-600/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}