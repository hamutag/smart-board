import React, { useState, useEffect, useMemo } from 'react';
import { RefuahShelema } from '@/api/entities';
import { Settings } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import { format } from 'date-fns';
import BackgroundImage from './BackgroundImage';

export default function RefuahBoard({ refuahList, loading, error }) {
  const [localRefuahList, setLocalRefuahList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState(null);
  const [slideSettings, setSlideSettings] = useState(null);
  const itemsPerPage = 12;

  useEffect(() => {
    if (refuahList && refuahList.length > 0) {
      setLocalRefuahList(refuahList.filter(item => item.active));
    } else if (!loading) {
      loadFreshData();
    }
  }, [refuahList, loading]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [generalSettings, slideData] = await Promise.all([
          Settings.list(),
          SlideSettings.filter({ slide_name: 'Refuah' })
        ]);
        if (generalSettings.length > 0) setSettings(generalSettings[0]);
        if (slideData.length > 0) setSlideSettings(slideData[0]);
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
    loadSettings();
  }, []);

  const loadFreshData = async () => {
    try {
      const data = await RefuahShelema.filter({ active: true }, 'priority');
      setLocalRefuahList(data);
    } catch (err) {
      console.error("Error loading Refuah Shelema data:", err);
    }
  };

  const totalPages = Math.ceil(localRefuahList.length / itemsPerPage);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // מעבר דף כל 10 שניות
  useEffect(() => {
    if (totalPages > 1) {
      const pageTimer = setInterval(() => {
        setCurrentPage(prev => (prev + 1) % totalPages);
      }, 10000);
      return () => clearInterval(pageTimer);
    }
  }, [totalPages]);

  const currentItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return localRefuahList.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, localRefuahList, itemsPerPage]);

  const getFullName = (item) => {
    if (!item.parent_name) return item.hebrew_name;
    const prefix = item.gender === 'male' ? 'בן' : 'בת';
    return `${item.hebrew_name} ${prefix} ${item.parent_name}`;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-transparent">
        <div className="spinner" />
      </div>
    );
  }

  const bgImage = slideSettings?.background_image;
  const bgOpacity = (slideSettings?.background_opacity ?? 100) / 100;
  const borderColor = slideSettings?.accent_color || settings?.border_color || '#FFD700';
  const borderWidth = settings?.border_width || 2;
  const fontFamily = slideSettings?.font_family || 'Frank Ruhl Libre';
  const blessingText = settings?.refuah_blessing_text || 'מי שברך אבותינו אברהם יצחק ויעקב, הוא יברך וירפא את החולים';

  return (
    <div className="refuah-board h-screen w-screen flex flex-col text-white overflow-hidden p-6 relative" style={{ fontFamily: `'${fontFamily}', serif` }}>
      {bgImage ? (
        <BackgroundImage 
          imageUrl={bgImage}
          opacity={bgOpacity}
          overlayColor="#000000"
          overlayOpacity={0.4}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900 to-cyan-900"></div>
      )}
       <div className="absolute top-4 left-4 z-50">
        <div className="flex items-baseline text-white ltr-direction">
          <span className="text-5xl font-bold tabular-nums drop-shadow-lg">{format(currentTime, 'HH:mm')}</span>
          <span className="text-3xl font-semibold tabular-nums text-amber-300 ml-2 -translate-y-px drop-shadow-lg">:{format(currentTime, 'ss')}</span>
        </div>
      </div>

      <h1 className="text-6xl font-bold text-cyan-200 mb-4 text-center drop-shadow-2xl relative z-10">רפואה שלמה</h1>
      
      {blessingText && (
        <div className="mb-6 relative z-10">
          <div 
            className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-2xl text-center"
            style={{
              border: `${borderWidth}px solid ${borderColor}`
            }}
          >
            <p className="text-2xl font-semibold text-white leading-relaxed">{blessingText}</p>
          </div>
        </div>
      )}
      
      <div className="flex-grow flex items-center justify-center relative z-10">
        {localRefuahList.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 w-full max-w-7xl">
            {currentItems.map((item, index) => (
               <div 
                 key={item.id || index} 
                 className="transition-all duration-300 bg-white/10 backdrop-blur-md p-4 rounded-xl text-center shadow-xl"
                 style={{
                   border: `${borderWidth}px solid ${borderColor}`
                 }}
               >
                <div className="text-3xl mb-2">🤲</div>
                <h3 className="text-2xl font-black text-white leading-tight drop-shadow-lg">
                  {getFullName(item)}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-4xl font-bold text-cyan-200">אין שמות לרפואה שלמה כרגע</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentPage ? 'bg-cyan-300' : 'bg-cyan-600/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}