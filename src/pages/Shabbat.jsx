import React, { useState, useEffect, useRef } from 'react';
import { Settings } from '@/api/entities';
import { Announcement } from '@/api/entities';
import { DailyZmanim } from '@/api/entities';
import { formatTime } from '../components/TimeUtils';
import ClockDisplay from '../components/ClockDisplay';
import SunriseCountdown from '../components/SunriseCountdown';
import Announcements from '../components/Announcements';
import HebrewDate from '../components/HebrewDate';
import HalachaYomit from '../components/HalachaYomit';
import DedicationDisplay from '../components/DedicationDisplay';
import { format as formatDateFns, parseISO } from 'date-fns';
import OmerCounter from '../components/OmerCounter';
import ChizukYomi from '../components/ChizukYomi';
import LayoutSelector from '../components/LayoutSelector';

export default function ShabbatPage() {
  const [settings, setSettings] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [zmanim, setZmanim] = useState({
    alot: null, sunrise: null, sunset: null, tzeit: null, tzeit_rt: null,
    hebrew_date: "טוען תאריך...", parasha: "טוען פרשה...", mincha: null,
    candleLighting: null, havdalah: null, class: null, arvit: null, source: 'initial',
    omer: null, 
    omer_day_today: null, 
    omer_day_tomorrow: null,
    mincha_gedola: null,
    mincha_ketana: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoDetectedDisplayMode, setAutoDetectedDisplayMode] = useState('desktop');
  const [selectedLayout, setSelectedLayout] = useState('auto');
  const [omerData, setOmerData] = useState({ omerText: null, nextOmerNumber: null });
  const lastCheckedDateRef = useRef(null);

  const getCurrentDate = () => {
    return new Date();
  };

  const formatDateForDB = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // חישוב זמן שחרית לשבת - שעה ו-10 דקות לפני הנץ
  const calculateShacharitShabbat = (sunriseTime) => {
    if (!sunriseTime) return null;
    
    try {
      const [hours, minutes] = sunriseTime.split(':').map(Number);
      const sunriseDate = new Date();
      sunriseDate.setHours(hours, minutes, 0, 0);
      
      const shacharitTime = new Date(sunriseDate.getTime() - 70 * 60 * 1000); // 1 שעה ו-10 דקות = 70 דקות
      
      return `${String(shacharitTime.getHours()).padStart(2, '0')}:${String(shacharitTime.getMinutes()).padStart(2, '0')}`;
    } catch (error) {
      console.error("Error calculating shacharit shabbat:", error);
      return null;
    }
  };

  // חישוב זמן ערבית מוצאי שבת - 10 דקות לפני צאת השבת
  const calculateArvitMotzei = (havdalahTime) => {
    if (!havdalahTime) return null;
    
    try {
      const [hours, minutes] = havdalahTime.split(':').map(Number);
      const havdalahDate = new Date();
      havdalahDate.setHours(hours, minutes, 0, 0);
      
      const arvitTime = new Date(havdalahDate.getTime() - 10 * 60 * 1000); // 10 דקות לפני
      
      return `${String(arvitTime.getHours()).padStart(2, '0')}:${String(arvitTime.getMinutes()).padStart(2, '0')}`;
    } catch (error) {
      console.error("Error calculating arvit motzei:", error);
      return null;
    }
  };

  const loadZmanimForShabbat = async () => {
    console.log("ShabbatPage: Starting Zmanim load process...");
    setLoading(true);
    setError(null);
    
    try {
      const today = getCurrentDate();
      const targetDate = formatDateForDB(today);

      const todayZmanimRecords = await DailyZmanim.filter({ date: targetDate });
      const todayZmanimData = todayZmanimRecords?.[0] || null;

      if (todayZmanimData) {
        setZmanim({
          alot: todayZmanimData.alot,
          sunrise: todayZmanimData.sunrise,
          sunset: todayZmanimData.sunset,
          tzeit: todayZmanimData.tzeit,
          tzeit_rt: todayZmanimData.tzeit_rt,
          hebrew_date: todayZmanimData.hebrew_date,
          parasha: todayZmanimData.parasha,
          mincha: todayZmanimData.mincha,
          class: todayZmanimData.class,
          arvit: todayZmanimData.arvit,
          candleLighting: todayZmanimData.candles,
          havdalah: todayZmanimData.havdalah,
          omer: todayZmanimData.omer,
          omer_day_today: todayZmanimData.omer_day_today,
          omer_day_tomorrow: todayZmanimData.omer_day_tomorrow,
          mincha_gedola: todayZmanimData.mincha_gedola_time || null,
          mincha_ketana: todayZmanimData.mincha_ketana_time || null,
          source: 'database'
        });

        setOmerData({
          omerText: todayZmanimData.omer,
          nextOmerNumber: todayZmanimData.omer_day_tomorrow
        });

      } else {
        console.error("ShabbatPage: No zmanim found for current date in database:", targetDate);
        setError(`לא נמצאו זמנים לתאריך ${targetDate} במסד הנתונים`);
      }
    } catch (err) {
      console.error("ShabbatPage: Error loading zmanim:", err);
      setError("שגיאה בטעינת זמנים: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZmanimForShabbat();
    const zmanimUpdateInterval = 30 * 60 * 1000; // 30 minutes
    const intervalId = setInterval(loadZmanimForShabbat, zmanimUpdateInterval);
    
    const dateCheckInterval = setInterval(() => {
      const currentDateString = formatDateForDB(getCurrentDate());
      if (lastCheckedDateRef.current !== currentDateString) {
        console.log("ShabbatPage: Date has changed. Reloading Zmanim...");
        lastCheckedDateRef.current = currentDateString;
        loadZmanimForShabbat();
      }
    }, 60 * 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(dateCheckInterval);
    };
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("ShabbatPage: Loading initial data (Settings, Announcements)...");
        const settingsList = await Settings.list();
        let currentSettings;
        if (settingsList.length > 0) {
          currentSettings = settingsList[0];
        } else {
          const defaultSettingsData = {
            dedication: "לעילוי נשמת מאיר בן מסעודה וברוריה בת סעדה",
            location: "עפולה",
            sunrise_countdown_minutes: 70, // שעה ו-10 דקות לשבת
            display_mode: "שבת"
          };
          currentSettings = await Settings.create(defaultSettingsData);
        }
        setSettings(currentSettings);

        const announcementsList = await Announcement.filter({ active: true });
        setAnnouncements(announcementsList);

        console.log("ShabbatPage: Initial data loaded successfully.");
      } catch (err) {
        console.error("ShabbatPage: Error loading initial data:", err);
        setError("שגיאה בטעינת נתונים ראשוניים");
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const checkDeviceType = () => {
      const isMobile = window.innerWidth <= 767;
      const isLandscape = window.innerWidth > window.innerHeight;
      
      if (isMobile && isLandscape) {
        setAutoDetectedDisplayMode('mobileHorizontal');
      } else if (isMobile) {
        setAutoDetectedDisplayMode('mobileVertical');
      } else {
        setAutoDetectedDisplayMode('desktop');
      }
    };
    
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  const currentDisplayMode = selectedLayout === 'auto' ? autoDetectedDisplayMode : selectedLayout;

  if (loading) {
    return (
      <div className="loading-screen flex flex-col items-center justify-center h-screen w-screen bg-blue-950">
        <div className="text-2xl font-bold text-amber-400 mb-4">טוען לוח שבת ארנון...</div>
        <div className="spinner"></div>
      </div>
    );
  }

  // פריסת Desktop או TV
  if (currentDisplayMode === 'desktop' || currentDisplayMode === 'tv') {
    const isTvLayout = currentDisplayMode === 'tv';
    
    const mainTimeFontSize = isTvLayout ? 'text-7xl' : 'text-6xl';
    const dateFontSize = isTvLayout ? 'text-3xl' : 'text-2xl';
    const hebrewDateFontSize = isTvLayout ? 'text-6xl' : 'text-5xl';
    const netzTimeSize = isTvLayout ? 'text-8xl' : 'text-7xl';
    const alotTimeSize = isTvLayout ? 'text-3xl' : 'text-2xl';
    const shacharitShabbatTimeSize = isTvLayout ? 'text-4xl' : 'text-3xl';
    const shacharitShabbatTitleSize = isTvLayout ? 'text-xl' : 'text-lg';
    const prayerSectionTitleSize = isTvLayout ? 'text-3xl' : 'text-2xl';
    const prayerBoxTitleSize = isTvLayout ? 'text-2xl' : 'text-xl';
    const prayerBoxTimeSize = isTvLayout ? 'text-6xl' : 'text-5xl';
    const shabbatTimesTitleSize = isTvLayout ? 'text-2xl' : 'text-xl';
    const shabbatTimesTimeSize = isTvLayout ? 'text-5xl' : 'text-4xl';
    const parashaTitleSize = isTvLayout ? 'text-3xl' : 'text-2xl';
    const parashaNameSize = isTvLayout ? 'text-4xl' : 'text-3xl';

    return (
      <div className={`main-board-shabbat h-screen w-screen flex flex-col p-4 overflow-hidden bg-gradient-to-b from-purple-950/40 to-blue-900/40 text-white relative`}>
        {(omerData.omerText || typeof omerData.nextOmerNumber === 'number') && ( 
          <div className="absolute top-4 left-20 z-20">
            <OmerCounter 
              omerText={omerData.omerText} 
              omerDayTomorrow={omerData.nextOmerNumber}
              isMedalStyle={true} 
            />
          </div>
        )}

        <div className="header-section flex flex-col items-center mb-2">
          <div className="text-right text-lg text-amber-400 w-full px-2">בס"ד</div>
          <div className="text-center">
            <h1 className={`text-4xl lg:text-5xl font-bold text-amber-500 hebrew-font mb-2 ${isTvLayout ? 'lg:text-6xl' : ''}`}>
              לוח שבת ארנון - {zmanim.parasha ? `שבת ${zmanim.parasha}` : 'שבת קודש'}
            </h1>
            <div className="dates-container mt-2 flex justify-center items-center space-x-6">
              <ClockDisplay useFixedDate={false} timeClassName={mainTimeFontSize} dateClassName={dateFontSize} />
              <span className={`text-amber-400 mx-3 ${isTvLayout ? 'text-4xl' : 'text-3xl'}`}>|</span>
              <HebrewDate date={zmanim.hebrew_date || "טוען תאריך..."} className={`text-amber-300 ${hebrewDateFontSize}`} />
            </div>
          </div>
        </div>
        
        {error && <div className="text-red-500 text-center mb-2 p-2 bg-red-900/50 rounded text-base" style={{whiteSpace: "pre-line"}}>{error}</div>}
        
        <div className="flex-grow grid grid-rows-[minmax(0,3fr)_minmax(0,1fr)] gap-4 min-h-0">
          <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,3.2fr)_minmax(0,2fr)] gap-4 min-h-0">
            <div className="sunrise-box bg-purple-900 bg-opacity-30 rounded-xl p-4 border-2 border-amber-500/40 flex flex-col justify-around min-h-0">
              <div>
                <h3 className={`font-bold text-amber-400 text-center ${isTvLayout ? 'text-3xl' : 'text-2xl'} mb-2`}>נץ החמה</h3>
                <div className={`flex justify-center items-center font-bold ${netzTimeSize} mb-2`}>
                  {zmanim.sunrise ? formatTime(zmanim.sunrise) : "--:--"}
                </div>
                <div className={`text-center font-semibold text-amber-300 ${alotTimeSize} mb-2`}>
                  עלות השחר: <span className="font-bold">{zmanim.alot ? formatTime(zmanim.alot) : "--:--"}</span>
                </div>
              </div>
              <div className={`shacharit-shabbat-box text-center bg-purple-800 bg-opacity-40 rounded-lg p-2 border border-amber-500/30`}>
                <h4 className={`font-bold text-amber-400 ${shacharitShabbatTitleSize}`}>שחרית שבת</h4>
                <p className={`font-bold ${shacharitShabbatTimeSize}`}>{calculateShacharitShabbat(zmanim.sunrise) || "--:--"}</p>
                <p className={`text-purple-300 ${isTvLayout ? 'text-sm' : 'text-xs'}`}>
                  (שעה ו-10 דקות לפני הנץ)
                </p>
              </div>
              <div className={`text-purple-300 text-center ${isTvLayout ? 'text-base' : 'text-sm'} mt-2`}>
                {settings?.location ? `זמן לפי ${settings.location}` : "זמן מקומי"}
              </div>
              <div className="flex items-center justify-center mt-2">
                <SunriseCountdown 
                  sunrise={zmanim.sunrise} 
                  countdownMinutes={70}
                />
              </div>
            </div>

            <div className="prayer-times-box bg-purple-900 bg-opacity-30 rounded-xl p-4 border-2 border-amber-500/40 min-h-0 flex flex-col">
              <h3 className={`font-bold text-amber-400 mb-4 text-center ${prayerSectionTitleSize}`}>
                זמני תפילות לשבת {zmanim.parasha || ""}
              </h3>
              <div className="grid grid-cols-2 gap-4 flex-1">
                {[
                  { title: "מנחה גדולה", time: zmanim.mincha_gedola },
                  { title: "מנחה קטנה", time: zmanim.mincha_ketana || zmanim.mincha },
                  { title: "שיעור", time: zmanim.class },
                  { title: "ערבית מוצ\"ש", time: calculateArvitMotzei(zmanim.havdalah), note: "(10 דק' לפני צאת השבת)" }
                ].map(item => (
                  <div key={item.title} className="prayer-time-box text-center bg-purple-800 bg-opacity-40 rounded-lg p-3 border border-amber-500/30 flex flex-col justify-center">
                    <h4 className={`font-semibold text-amber-400 mb-1 ${prayerBoxTitleSize}`}>{item.title}</h4>
                    <p className={`font-bold ${prayerBoxTimeSize}`}>{item.time ? formatTime(item.time) : "--:--"}</p>
                    {item.note && <p className={`text-purple-300 mt-1 ${isTvLayout ? 'text-sm' : 'text-xs'}`}>{item.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="daily-content-column-wrapper flex flex-col gap-4 min-h-0">
              <div className="halacha-box-container bg-purple-900 bg-opacity-30 rounded-xl p-4 border-2 border-amber-500/40 flex-grow-[2] flex flex-col min-h-[200px] overflow-y-auto">
                <HalachaYomit titleClassName="text-xl" contentClassName="text-base leading-relaxed" sourceClassName="text-sm" />
              </div>
              
              <div className="announcements-box-container bg-purple-900 bg-opacity-30 rounded-xl p-4 border-2 border-amber-500/40 flex-grow-[1] flex flex-col min-h-[150px] overflow-y-auto">
                {announcements.length > 0 ? (
                  <Announcements announcements={announcements} titleClassName="text-lg font-semibold" contentClassName="text-sm leading-relaxed" />
                ) : (
                  <div className="text-center text-sm text-gray-400 p-1 flex-grow flex items-center justify-center">אין הודעות להצגה</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)] gap-4 min-h-0">
             <div className="parasha-shabbat-section bg-purple-900 bg-opacity-30 rounded-xl p-3 border-2 border-amber-500/40 flex items-center justify-around min-h-0">
                <div className="text-center"> 
                  <h3 className={`font-bold text-amber-400 mb-1 ${parashaTitleSize}`}>פרשת השבוע</h3> 
                  <p className={`text-amber-400 text-center font-bold ${parashaNameSize}`}>
                    {zmanim.parasha || "טוען..."}
                  </p>
                </div>
                {[
                  { title: "כניסת שבת", time: zmanim.candleLighting },
                  { title: "צאת שבת", time: zmanim.havdalah },
                  { title: "צאת שבת ר\"ת", time: zmanim.tzeit_rt }
                ].map(item => (
                  <div key={item.title} className="shabbat-time-box bg-purple-800 bg-opacity-40 rounded-lg p-2 border border-amber-500/30 text-center">
                    <h4 className={`font-bold text-amber-400 mb-1 ${shabbatTimesTitleSize}`}>{item.title}</h4> 
                    <p className={`font-bold ${shabbatTimesTimeSize}`}>{item.time ? formatTime(item.time) : "--:--"}</p>
                  </div>
                ))}
            </div>

            <div className="chizuk-section bg-purple-900 bg-opacity-30 rounded-xl p-3 border-2 border-amber-500/40 flex flex-col justify-center items-center min-h-0">
              <ChizukYomi />
            </div>
          </div>
        </div>
        
        <div className="dedication-section mt-auto pt-1 pb-1">
          <DedicationDisplay dedication={settings?.dedication} className="text-lg font-semibold text-amber-200" />
        </div>
        
        <LayoutSelector currentLayout={selectedLayout} onLayoutChange={setSelectedLayout} />
      </div>
    );
  }

  // פריסת mobile (אופקי ואנכי) - כמו בדף הרגיל אבל עם הותאמות לשבת
  return (
    <div>
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-amber-400 mb-4">דף שבת ארנון</h1>
        <p>דף זה מיועד לתצוגה על מסך גדול בלבד</p>
        <LayoutSelector currentLayout={selectedLayout} onLayoutChange={setSelectedLayout} />
      </div>
    </div>
  );
}