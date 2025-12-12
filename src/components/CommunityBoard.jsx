import React, { useState, useEffect } from 'react';
import { CommunityGallery } from '@/api/entities';
import { CommunityMessage } from '@/api/entities';
import { Announcement } from '@/api/entities';
import { Settings } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import { format } from 'date-fns';
import { Bell, Image as ImageIcon, MessageSquare } from 'lucide-react';
import BackgroundImage from './BackgroundImage';

export default function CommunityBoard({ onDurationOverride }) {
  const [images, setImages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [tickerMessages, setTickerMessages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [slideSettings, setSlideSettings] = useState(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [imagesData, messagesData, announcementsData, generalSettings, slideData] = await Promise.all([
          CommunityGallery.filter({ active: true }, 'order'),
          CommunityMessage.filter({ active: true }),
          Announcement.filter({ active: true }, '-priority'),
          Settings.list(),
          SlideSettings.filter({ slide_name: 'Community' })
        ]);
        
        setImages(imagesData);
        setTickerMessages(messagesData);
        setAnnouncements(announcementsData);
        if (generalSettings.length > 0) setSettings(generalSettings[0]);
        if (slideData.length > 0) setSlideSettings(slideData[0]);

        if (onDurationOverride) {
           const imagesDuration = imagesData.length > 0 ? imagesData.length * 10000 : 0;
           const announcementsDuration = announcementsData.length > 0 ? Math.ceil(announcementsData.length / 2) * 10000 : 0;
           const totalDuration = Math.max(imagesDuration, announcementsDuration, 30000);
           onDurationOverride(totalDuration);
        }

      } catch (err) {
        console.error("Error loading community board data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [onDurationOverride]);

  useEffect(() => {
    if (announcements.length > 2) {
      const interval = setInterval(() => {
        setCurrentAnnouncementIndex(prev => {
          const next = prev + 2;
          return next >= announcements.length ? 0 : next;
        });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-transparent"><div className="spinner" /></div>;
  const fontFamily = slideSettings?.font_family || 'Frank Ruhl Libre';
  const textColor = slideSettings?.text_color || '#1f2937';
  const accentColor = slideSettings?.accent_color || '#fbbf24';
  // Don't force a heavy remote default background – let the gradient show if nothing is set.
  const bgImage = slideSettings?.background_image;

  return (
    <div 
      className={`community-board h-screen w-screen flex flex-col text-white overflow-hidden p-8 relative ${!bgImage ? 'bg-gradient-to-br from-pink-200 via-pink-300 to-rose-300' : ''}`}
      style={{ fontFamily: `'${fontFamily}', serif` }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700;900&display=swap" rel="stylesheet" />

      {bgImage && (
        <BackgroundImage 
          imageUrl={bgImage}
          opacity={(slideSettings?.background_opacity ?? 100) / 100}
          overlayColor={slideSettings?.overlay_color || '#000000'}
          overlayOpacity={(slideSettings?.overlay_opacity ?? 30) / 100}
        />
      )}

      <div className="absolute top-4 left-4 z-50">
        <div className="flex items-baseline ltr-direction" style={{ color: textColor }}>
          <span className="text-5xl font-bold tabular-nums drop-shadow-lg">{format(currentTime, 'HH:mm')}</span>
          <span className="text-3xl font-semibold tabular-nums ml-2 -translate-y-px drop-shadow-lg" style={{ color: '#ec4899' }}>:{format(currentTime, 'ss')}</span>
        </div>
      </div>

      {settings?.logo_url && (
        <div className="absolute top-4 right-4 z-50">
          <img src={settings.logo_url} alt="Logo" style={{ width: `${settings.logo_size || 120}px` }} className="drop-shadow-2xl" />
        </div>
      )}

      <h1 className="text-6xl font-bold mb-6 text-center drop-shadow-2xl relative z-10" style={{ color: '#ec4899' }}>
        לוח המודעות - {settings?.location || 'הקהילה'}
      </h1>

      <div className="flex-grow flex gap-6 relative z-10">
        {/* גלריה */}
        <div className="w-2/3 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="w-8 h-8" style={{ color: accentColor }} />
            <h2 className="text-3xl font-bold" style={{ color: textColor }}>גלריית הקהילה</h2>
          </div>

          <div className="flex-grow bg-gradient-to-br from-blue-300/30 to-blue-400/30 backdrop-blur-md rounded-3xl border-4 border-blue-300/60 overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
            {images.length > 0 ? (
              <>
                <img 
                  src={images[currentImageIndex]?.image_url} 
                  alt="Community" 
                  className="w-full h-full object-cover"
                />
                {images[currentImageIndex]?.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-16">
                    <p className="text-white text-center font-bold text-2xl">{images[currentImageIndex].title}</p>
                  </div>
                )}
                <div className="absolute top-6 right-6 bg-black/60 px-4 py-2 rounded-full text-lg text-white backdrop-blur-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-2xl" style={{ color: textColor, opacity: 0.6 }}>אין תמונות</p>
              </div>
            )}
          </div>
        </div>

        {/* הודעות */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8" style={{ color: accentColor }} />
            <h2 className="text-3xl font-bold" style={{ color: textColor }}>הודעות</h2>
          </div>

          <div className="flex flex-col gap-4 flex-grow">
            {announcements.length > 0 ? (
              announcements.slice(currentAnnouncementIndex, currentAnnouncementIndex + 2).map((ann, idx) => {
                const gradients = [
                  'from-purple-300/30 to-purple-400/30 border-purple-300/60',
                  'from-blue-300/30 to-blue-400/30 border-blue-300/60',
                  'from-violet-300/30 to-violet-400/30 border-violet-300/60',
                  'from-sky-300/30 to-sky-400/30 border-sky-300/60'
                ];
                const gradientClass = gradients[idx % gradients.length];

                return (
                  <div 
                    key={ann.id || `${currentAnnouncementIndex}-${idx}`} 
                    className={`bg-gradient-to-br ${gradientClass} backdrop-blur-md p-6 rounded-3xl border-4 shadow-2xl flex-1 relative`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
                    <h3 className="text-2xl font-bold mb-3 relative z-10" style={{ color: accentColor }}>{ann.title}</h3>
                    <p className="text-lg leading-relaxed whitespace-pre-wrap relative z-10" style={{ color: textColor }}>{ann.content}</p>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-64 bg-white/10 backdrop-blur-md rounded-3xl border-4 border-white/20">
                <p className="text-xl" style={{ color: textColor, opacity: 0.6 }}>אין הודעות</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* פס עדכונים תחתון */}
      {tickerMessages.length > 0 && (
        <div 
          className="mt-6 h-16 relative overflow-hidden flex items-center rounded-2xl shadow-2xl z-20"
          style={{ backgroundColor: accentColor }}
        >
          <div className="flex items-center gap-3 px-6 font-bold text-white bg-black/20">
            <MessageSquare className="w-5 h-5" />
            עדכונים
          </div>
          <div className="whitespace-nowrap overflow-hidden flex-1">
            <div className="inline-block animate-marquee">
              {tickerMessages.map((msg, idx) => (
                <span key={idx} className="mx-8 text-xl font-bold inline-flex items-center" style={{ color: '#ec4899' }}>
                  <span className="w-2 h-2 rounded-full ml-3" style={{ backgroundColor: '#ec4899' }}></span>
                  {msg.content}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-marquee {
          animation: marquee ${Math.max(20, tickerMessages.length * 10)}s linear infinite;
        }
      `}</style>
    </div>
  );
  }