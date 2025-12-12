import React, { useState, useEffect, useMemo } from 'react';
import { Announcement } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import BackgroundImage from './BackgroundImage';

export default function ModaotBoard({ announcements, loading, error }) {
  const [localAnnouncements, setLocalAnnouncements] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(0);
  const [slideSettings, setSlideSettings] = useState(null);
  const itemsPerPage = 4;

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      setLocalAnnouncements(announcements);
    } else {
      loadFreshData();
    }
    loadSlideSettings();
  }, [announcements]);

  const loadSlideSettings = async () => {
    try {
      const data = await SlideSettings.filter({ slide_name: 'Modaot' });
      if (data.length > 0) setSlideSettings(data[0]);
    } catch (err) {
      console.error("Error loading slide settings:", err);
    }
  };

  const loadFreshData = async () => {
    try {
      const data = await Announcement.filter({ active: true }, '-priority');
      setLocalAnnouncements(data);
    } catch (err) {
      console.error("Error loading announcements data:", err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPages = Math.ceil(localAnnouncements.length / itemsPerPage);

  // מעבר דף כל 20 שניות
  useEffect(() => {
    if (totalPages > 1) {
      const interval = setInterval(() => {
        setCurrentPage(prev => (prev + 1) % totalPages);
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [totalPages]);

  const currentItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return localAnnouncements.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, localAnnouncements, itemsPerPage]);

  if (loading) {
    return (
      <div className="modaot-board h-screen w-screen flex items-center justify-center bg-transparent">
        <div className="text-2xl font-bold text-amber-400">טוען הודעות...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modaot-board h-screen w-screen flex items-center justify-center bg-transparent">
        <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  const bgImage = slideSettings?.background_image;
  const bgOpacity = (slideSettings?.background_opacity ?? 100) / 100;
  const overlayColor = slideSettings?.overlay_color || '#000000';
  const overlayOpacity = (slideSettings?.overlay_opacity ?? 30) / 100;
  const fontFamily = slideSettings?.font_family || 'Rubik';

  return (
    <div className="modaot-board h-screen w-screen flex flex-col text-white overflow-hidden relative" style={{ fontFamily: `'${fontFamily}', serif` }}>
      {bgImage ? (
        <BackgroundImage 
          imageUrl={bgImage}
          opacity={bgOpacity}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 to-indigo-800"></div>
      )}
      {/* Large Clock */}
      <div className="absolute top-4 left-4 z-20">
        <div className="clock-display flex items-baseline text-white ltr-direction">
          <span className="text-6xl font-bold tabular-nums drop-shadow-lg">
            {currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-4xl font-semibold tabular-nums text-amber-300 ml-2 drop-shadow-lg">
            :{currentTime.getSeconds().toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex flex-col p-6 pt-16 h-full relative z-10">
        <h1 className="text-6xl font-bold text-amber-400 mb-6 hebrew-font text-center">הודעות ומודעות</h1>
        
        <div className="flex-grow flex items-center justify-center relative z-10">
          {localAnnouncements.length > 0 ? (
            <div className="w-full max-w-6xl space-y-4">
              {currentItems.map((announcement, index) => (
                <div key={announcement.id || index} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-xl">
                  <h2 className="text-4xl font-bold text-amber-300 mb-3">
                    {announcement.title}
                  </h2>
                  <p className="text-2xl text-white leading-relaxed">
                    {announcement.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-3xl text-purple-200">אין הודעות להצגה כרגע</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentPage ? 'bg-amber-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}