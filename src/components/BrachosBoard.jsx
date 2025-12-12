import React, { useState, useEffect } from 'react';
import { Bracha } from '@/api/entities';
import { Settings } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import BackgroundImage from './BackgroundImage';

export default function BrachosBoard() {
  const [brachot, setBrachot] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [brachotPerPage, setBrachotPerPage] = useState(1);
  const [slideSettings, setSlideSettings] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [data, settingsList, slideData] = await Promise.all([
          Bracha.filter({ active: true }, 'order'),
          Settings.list(),
          SlideSettings.filter({ slide_name: 'Brachot' })
        ]);
        
        if (settingsList.length > 0 && settingsList[0].brachot_per_page) {
          setBrachotPerPage(settingsList[0].brachot_per_page);
        }
        
        if (slideData.length > 0) {
          setSlideSettings(slideData[0]);
        }
        
        if (data.length === 0) {
          setBrachot([
            {
              id: 'sample1',
              title: 'ברכת השכיבנו',
              hebrew_text: 'ברוך אתה ה\' אלוקינו מלך העולם\nהמפיל חבלי שינה על עיני\nותנומה על עפעפי',
              category: 'תפילות_קצרות',
              font_size: 'בינוני'
            },
            {
              id: 'sample2', 
              title: 'צלחת עם ישראל',
              hebrew_text: 'יהי רצון מלפניך ה\' אלוקינו ואלוקי אבותינו\nשתצליח את עמך ישראל בכל מעשה ידיהם\nותברך את ארץ ישראל בשלום ובשלוה',
              category: 'ברכות_כלליות',
              font_size: 'בינוני'
            }
          ]);
        } else {
          setBrachot(data);
        }
      } catch (err) {
        console.error("Error loading brachot:", err);
        setBrachot([{
          id: 'sample',
          title: 'ברכת השם',
          hebrew_text: 'ברוך השם לעולם אמן ואמן',
          category: 'ברכות_כלליות',
          font_size: 'בינוני'
        }]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalPages = Math.ceil(brachot.length / brachotPerPage);
  
  useEffect(() => {
    if (totalPages > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [totalPages]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-transparent text-white">
        <div className="spinner"></div>
      </div>
    );
  }

  if (brachot.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-transparent text-white">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-sky-300 mb-4">ברכות ותפילות</h2>
          <p className="text-2xl">אין ברכות להצגה כעת</p>
        </div>
      </div>
    );
  }

  const currentPageBrachot = brachot.slice(currentIndex * brachotPerPage, (currentIndex + 1) * brachotPerPage);
  
  const getFontSizeClass = (fontSize, perPage) => {
    const baseSize = perPage > 2 ? -1 : 0; // smaller for more items
    switch (fontSize) {
      case 'קטן': return perPage > 2 ? 'text-xl' : 'text-2xl md:text-3xl';
      case 'גדול': return perPage > 2 ? 'text-2xl' : 'text-4xl md:text-5xl';
      default: return perPage > 2 ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl';
    }
  };

  const getGridClass = () => {
    switch (brachotPerPage) {
      case 2: return 'grid-cols-2 gap-6';
      case 3: return 'grid-cols-3 gap-4';
      case 4: return 'grid-cols-2 grid-rows-2 gap-4';
      default: return 'grid-cols-1';
    }
  };

  const bgImage = slideSettings?.background_image;
  const bgOpacity = (slideSettings?.background_opacity ?? 100) / 100;
  const overlayOpacity = (slideSettings?.overlay_opacity ?? 30) / 100;
  const textColor = slideSettings?.text_color || '#ffffff';
  const accentColor = slideSettings?.accent_color || '#38bdf8';

  return (
    <div className="brachot-board h-screen w-screen flex flex-col text-white overflow-hidden relative">
      {bgImage ? (
        <BackgroundImage 
          imageUrl={bgImage}
          opacity={bgOpacity}
          overlayColor="#000000"
          overlayOpacity={overlayOpacity}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950 to-blue-900"></div>
      )}
      {/* Large Clock */}
      <div className="absolute top-4 left-4 z-50">
        <div className="clock-display flex items-baseline ltr-direction" style={{ color: textColor }}>
          <span className="text-6xl font-bold tabular-nums drop-shadow-lg">
            {currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-4xl font-semibold tabular-nums ml-2 drop-shadow-lg" style={{ color: accentColor }}>
            :{currentTime.getSeconds().toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center h-full p-4 pt-[4.25rem] relative z-10">
        <h1 className="text-4xl font-bold mb-6 hebrew-font text-center" style={{ color: accentColor }}>ברכות ותפילות</h1>
        
        <div className={`grid ${getGridClass()} max-w-6xl w-full flex-grow`}>
          {currentPageBrachot.map((bracha, idx) => (
            <div key={bracha.id || idx} className="backdrop-blur-md bg-white/10 p-6 rounded-2xl border-[3px] text-center shadow-2xl flex flex-col justify-center" style={{
              borderColor: accentColor
            }}>
              <h2 className={`font-bold mb-4 ${brachotPerPage > 2 ? 'text-xl' : 'text-3xl'}`} style={{ color: accentColor }}>
                {bracha.title}
              </h2>
              
              <div className={`leading-relaxed text-center ${getFontSizeClass(bracha.font_size, brachotPerPage)} font-semibold flex-grow flex items-center justify-center`} style={{ color: textColor }}>
                <div>
                  {bracha.hebrew_text.split('\n').map((line, index) => (
                    <div key={index} className="mb-2">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
              
              {bracha.category && (
                <div className={`mt-4 ${brachotPerPage > 2 ? 'text-xs' : 'text-base'}`} style={{ color: accentColor, opacity: 0.8 }}>
                  {bracha.category.replace(/_/g, ' ')}
                </div>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div 
                key={index} 
                className="w-3 h-3 rounded-full mx-1"
                style={{
                  backgroundColor: index === currentIndex ? accentColor : `${accentColor}80`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}