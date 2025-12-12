import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ZmanimBoard from './ZmanimBoard';
import WeekdayPrayerTimes from './WeekdayPrayerTimes';
import AzkarahShavuaBoard from './AzkarahShavuaBoard';
import RefuahBoard from './RefuahBoard';
import BrachosBoard from './BrachosBoard';
import ModaotBoard from './ModaotBoard';
import HalachotBoard from './HalachotBoard';
import LeiluyNishmatBoard from './LeiluyNishmatBoard';
import CommunityBoard from './CommunityBoard';
import ShabbatPrayerTimes from './ShabbatPrayerTimes';
import { NiftarWeekly } from '@/api/entities';
import { RefuahShelema } from '@/api/entities';
import { Announcement } from '@/api/entities';
import { Halacha } from '@/api/entities';
import { Settings } from '@/api/entities';
import { DailyZmanim } from '@/api/entities';
import { ChizukYomi } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import { BoardSchedule } from '@/api/entities';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 
import { AnimatePresence, motion } from 'framer-motion';

// IMPORTANT:
// Remote default images (e.g. Unsplash) can be *very heavy* and burn mobile data.
// We intentionally keep defaults empty and rely on the CSS gradient fallback.
// If you want backgrounds – set them via SlideSettings in the admin.
const DEFAULT_BACKGROUNDS = {};

export default function BoardRotator({ deviceType, previewSchedule }) {
  const [currentBoardIndex, setCurrentBoardIndex] = useState(0);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownTimeLeft, setCountdownTimeLeft] = useState(null);
  const [communityBoardDuration, setCommunityBoardDuration] = useState(null);
  const [backgroundsLoaded, setBackgroundsLoaded] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(null);
  const [currentOverlay, setCurrentOverlay] = useState({ color: '#000000', opacity: 0.3 });
  const [currentBgOpacity, setCurrentBgOpacity] = useState(1);
  const [previousBackground, setPreviousBackground] = useState(null);
  const [isBgLoading, setIsBgLoading] = useState(false);
  
  const [allData, setAllData] = useState({
    niftarimList: [],
    refuahList: [],
    announcements: [],
    halachot: [],
    settings: null,
    dailyZmanim: null,
    chizukYomi: null,
    slideSettings: [],
    boardSchedule: [],
    loading: true,
    error: null
  });

  const timerRef = useRef(null);
  
  // Use global cache instead of loading data repeatedly
  useEffect(() => {
    const loadFromCache = async () => {
      const { dataCache } = await import('@/components/DataCacheManager');
      
      // Ensure cache is loaded
      await dataCache.ensureLoaded();
      
      const cache = dataCache.getCache();
      
      setAllData({
        niftarimList: cache.niftarim || [],
        refuahList: cache.refuah || [],
        announcements: cache.announcements || [],
        halachot: cache.halachot || [],
        settings: cache.settings?.[0] || null,
        dailyZmanim: cache.dailyZmanim?.[0] || null,
        chizukYomi: cache.chizukYomi?.[0] || null,
        slideSettings: cache.slideSettings || [],
        boardSchedule: cache.boardSchedule || [],
        loading: false,
        error: null
      });
      
      // Subscribe to cache updates
      const unsubscribe = dataCache.subscribe((updatedCache) => {
        setAllData({
          niftarimList: updatedCache.niftarim || [],
          refuahList: updatedCache.refuah || [],
          announcements: updatedCache.announcements || [],
          halachot: updatedCache.halachot || [],
          settings: updatedCache.settings?.[0] || null,
          dailyZmanim: updatedCache.dailyZmanim?.[0] || null,
          chizukYomi: updatedCache.chizukYomi?.[0] || null,
          slideSettings: updatedCache.slideSettings || [],
          boardSchedule: updatedCache.boardSchedule || [],
          loading: false,
          error: null
        });
      });
      
      return unsubscribe;
    };
    
    const unsubscribePromise = loadFromCache();
    
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);

  // Preload all backgrounds aggressively
  useEffect(() => {
    if (allData.loading || backgroundsLoaded) return;
    
    const imagesToPreload = [];
    
    // Collect all background images
    allData.slideSettings.forEach(s => {
      if (s.background_image) imagesToPreload.push(s.background_image);
    });
    
    if (allData.settings?.countdown_background_image) {
      imagesToPreload.push(allData.settings.countdown_background_image);
    }
    
    if (imagesToPreload.length === 0) {
      setBackgroundsLoaded(true);
      return;
    }
    
    // Preload all images
    let loadedCount = 0;
    const totalImages = imagesToPreload.length;
    
    imagesToPreload.forEach(url => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setBackgroundsLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setBackgroundsLoaded(true);
        }
      };
      img.src = url;
    });
  }, [allData.slideSettings, allData.settings, allData.loading, backgroundsLoaded]);

  // Global Countdown Check
  useEffect(() => {
    if (!allData.dailyZmanim?.sunrise || !allData.settings) return;

    const checkCountdown = () => {
      try {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const isShabbat = dayOfWeek === 6;
        const countdownMinutes = isShabbat 
          ? (allData.settings.shabbat_countdown_minutes || 70) 
          : (allData.settings.sunrise_countdown_minutes || 40);

        const [hours, minutes] = allData.dailyZmanim.sunrise.split(':').map(Number);
        
        const sunriseToday = new Date();
        sunriseToday.setHours(hours, minutes, 0, 0);
        
        // If sunrise passed today, check for tomorrow (approximate with today's time)
        const sunriseTime = sunriseToday < now ? new Date(sunriseToday.getTime() + 24 * 60 * 60 * 1000) : sunriseToday;

        const timeDiff = sunriseTime.getTime() - now.getTime();
        const countdownIsOn = timeDiff > 0 && timeDiff <= countdownMinutes * 60 * 1000;

        if (countdownIsOn) {
          if (!isCountdownActive) {
            setIsCountdownActive(true);
          }
          const totalSecondsLeft = Math.floor(timeDiff / 1000);
          const minutesLeft = Math.floor(totalSecondsLeft / 60);
          const secondsLeft = totalSecondsLeft % 60;
          setCountdownTimeLeft({ minutes: minutesLeft, seconds: secondsLeft });
        } else {
          // Countdown finished or not in range
          if (isCountdownActive) {
            console.log('[Countdown] Finished - resetting to normal boards');
            setIsCountdownActive(false);
            setCountdownTimeLeft(null);
            // Force reset to first board
            setCurrentBoardIndex(0);
          }
        }
      } catch (error) {
        console.error('Error in global countdown calculation:', error);
      }
    };

    const timer = setInterval(checkCountdown, 1000);
    checkCountdown(); // Run immediately

    return () => clearInterval(timer);
  }, [allData.dailyZmanim, allData.settings]);

  const handleCountdownStateChange = useCallback((isActive) => {
    setIsCountdownActive(isActive);
  }, []);

  const now = new Date();
  const dayOfWeek = now.getDay();
  const isShabbat = dayOfWeek === 6;

  // Determine effective schedule: use preview if provided, otherwise DB data, fallback to defaults
  const scheduleToUse = useMemo(() => {
    if (previewSchedule) return previewSchedule;
    if (allData.boardSchedule && allData.boardSchedule.length > 0) return allData.boardSchedule;
    
    // Fallback if DB is empty
    return [
      { component_key: 'zmanim', name: 'זמני היום', duration: 120, order: 1, active: true, day_type: 'always' },
      { component_key: 'shabbat', name: 'זמני שבת', duration: 30, order: 2, active: true, day_type: 'shabbat' },
      { component_key: 'halachot', name: 'הלכות', duration: 60, order: 3, active: true, day_type: 'always' }
    ];
  }, [previewSchedule, allData.boardSchedule]);

  const boards = useMemo(() => {
    const sortedSchedule = [...scheduleToUse].sort((a, b) => a.order - b.order);
    const activeBoards = [];
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    sortedSchedule.forEach(item => {
      if (!item.active) return;

      if (item.start_time || item.end_time) {
        const currentHour = now.getHours() + now.getMinutes() / 60;
        if (item.start_time) {
          const [sh, sm] = item.start_time.split(':').map(Number);
          if (currentHour < sh + sm / 60) return;
        }
        if (item.end_time) {
          const [eh, em] = item.end_time.split(':').map(Number);
          if (currentHour > eh + em / 60) return;
        }
      }

      switch (item.component_key) {
        case 'zmanim':
          if ((currentDay === 5 && currentHour >= 8) || (currentDay === 6 && currentHour <= 20)) {
            return;
          }
          activeBoards.push({
            component: WeekdayPrayerTimes,
            name: item.name,
            duration: item.duration * 1000,
            slideKey: 'WeekdayPrayerTimes',
            props: {}
          });
          break;

        case 'shabbat':
          if ((currentDay === 5 && currentHour >= 8) || (currentDay === 6 && currentHour <= 20)) {
            activeBoards.push({
              component: ShabbatPrayerTimes,
              name: item.name,
              duration: item.duration * 1000,
              slideKey: 'ShabbatTimes',
              props: {}
            });
          }
          break;

        case 'niftarim':
          activeBoards.push({
            component: AzkarahShavuaBoard,
            name: item.name,
            duration: item.duration * 1000,
            slideKey: 'Niftarim',
            props: { niftarimList: allData.niftarimList, loading: allData.loading, error: allData.error }
          });
          break;

        case 'refuah':
          activeBoards.push({
            component: RefuahBoard,
            name: item.name,
            duration: item.duration * 1000,
            slideKey: 'Refuah',
            props: { refuahList: allData.refuahList, loading: allData.loading, error: allData.error }
          });
          break;

        case 'brachot':
          activeBoards.push({
            component: BrachosBoard,
            name: item.name,
            duration: item.duration * 1000,
            slideKey: 'Brachot',
            props: {}
          });
          break;
        
        case 'modaot':
          activeBoards.push({
            component: ModaotBoard,
            name: item.name,
            duration: item.duration * 1000,
            slideKey: 'Modaot',
            props: { announcements: allData.announcements, loading: allData.loading, error: allData.error }
          });
          break;

        case 'halachot':
           activeBoards.push({
            component: HalachotBoard,
            name: item.name,
            duration: item.duration * 1000,
            slideKey: 'Halachot',
            props: { allHalachot: allData.halachot, loading: allData.loading, error: allData.error }
          });
          break;

        case 'leiluy':
          activeBoards.push({
            component: LeiluyNishmatBoard,
            name: item.name,
            duration: item.duration * 1000,
            slideKey: 'LeiluyNishmat',
            props: {}
          });
          break;

        case 'community':
        activeBoards.push({
        component: CommunityBoard,
        name: item.name,
        duration: communityBoardDuration || (item.duration * 1000),
        slideKey: 'Community',
        props: {
        onDurationOverride: (duration) => setCommunityBoardDuration(duration),
        settings: allData.settings,
        slideSettings: allData.slideSettings.find(s => s.slide_name === 'Community')
        }
        });
        break;
          
        case 'chizuk':
           break;
      }
    });

    // Always add Countdown/ZmanimBoard as special item if countdown is active
    if (isCountdownActive) {
      activeBoards.push({ 
        component: ZmanimBoard, 
        name: 'ספירה לאחור', 
        duration: 0,
        slideKey: 'Countdown',
        props: { 
          deviceType, 
          dailyZmanim: allData.dailyZmanim,
          settings: allData.settings,
          loading: allData.loading,
          error: allData.error,
          onCountdownStateChange: handleCountdownStateChange,
          externalTimeLeft: countdownTimeLeft,
          forceCountdownMode: isCountdownActive
        } 
      });
    }

    return activeBoards;
  }, [allData, deviceType, handleCountdownStateChange, scheduleToUse, countdownTimeLeft, isCountdownActive, communityBoardDuration]);


  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // If countdown is active, pause the board rotation
    if (isCountdownActive) {
      // Ensure the ZmanimBoard (Countdown) is the one showing
      const countdownBoardIndex = boards.findIndex(b => b.name === 'ספירה לאחור');
      if (countdownBoardIndex !== -1 && currentBoardIndex !== countdownBoardIndex) {
        setCurrentBoardIndex(countdownBoardIndex);
      }
      return; // Exit and don't set a timer
    }

    // Make sure we have boards to display
    if (!boards || boards.length === 0) {
      console.log('[BoardRotator] No boards available');
      return;
    }

    const currentBoard = boards[currentBoardIndex];
    if (currentBoard) {
        timerRef.current = setTimeout(() => {
          setCurrentBoardIndex(prevIndex => (prevIndex + 1) % boards.length);
        }, currentBoard.duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentBoardIndex, boards, isCountdownActive]);


  const goToNextBoard = () => {
    setCurrentBoardIndex(prevIndex => (prevIndex + 1) % boards.length);
  };

  const goToPrevBoard = () => {
    setCurrentBoardIndex(prevIndex => (prevIndex - 1 + boards.length) % boards.length);
  };

  // Helper to get background URL for a specific board
  const getBoardBackground = (board) => {
    if (!board) return null;
    let bg = null;
    
    // Check specific settings first
    if (board.slideKey === 'Countdown' && allData.settings?.countdown_background_image) {
      bg = allData.settings.countdown_background_image;
    } else if (board.slideKey) {
      const sSettings = allData.slideSettings.find(s => s.slide_name === board.slideKey);
      if (sSettings?.background_image) {
        bg = sSettings.background_image;
      }
    }
    
    // Fallback
    if (!bg && board.slideKey && DEFAULT_BACKGROUNDS[board.slideKey]) {
      bg = DEFAULT_BACKGROUNDS[board.slideKey];
    }
    
    return bg;
  };

  // Preload Next Background Effect - more aggressive preloading
  useEffect(() => {
    if (boards.length <= 1) return;
    
    // Preload next 2 backgrounds
    for (let i = 1; i <= 2; i++) {
      const nextIndex = (currentBoardIndex + i) % boards.length;
      const nextBoard = boards[nextIndex];
      const nextBg = getBoardBackground(nextBoard);
      
      if (nextBg) {
        const img = new Image();
        img.src = nextBg;
      }
    }
  }, [currentBoardIndex, boards, allData.slideSettings, allData.settings]);

  if (!boards[currentBoardIndex] || !backgroundsLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="spinner mb-4" />
          <p className="text-white text-lg">{!backgroundsLoaded ? 'טוען רקעים...' : 'טוען...'}</p>
        </div>
      </div>
    );
  }

  // Apply theme preset
  const themePresets = {
    default: {},
    dark: { overlayColor: '#000000', overlayOpacity: 0.5 },
    light: { overlayColor: '#ffffff', overlayOpacity: 0.3 },
    ocean: { overlayColor: '#0ea5e9', overlayOpacity: 0.2 },
    sunset: { overlayColor: '#f97316', overlayOpacity: 0.25 },
    forest: { overlayColor: '#16a34a', overlayOpacity: 0.3 }
  };

  const currentTheme = themePresets[allData.settings?.theme_preset || 'default'] || {};
  const globalFontSize = (allData.settings?.global_font_size || 100) / 100;
  const transitionSpeed = (allData.settings?.board_transition_speed || 1) * 1000;
  const contentTransitionSec = (allData.settings?.board_transition_speed || 1);

  // Update background when board changes
  useEffect(() => {
    const currentBoard = boards[currentBoardIndex];
    if (!currentBoard) return;
    
    // Find the background and settings for this board using slideKey
    let bgImage = null;
    let overlayColor = '#000000';
    let overlayOpacity = 0.3;
    let bgOpacity = 1;
    
    if (currentBoard.slideKey === 'Countdown' && allData.settings?.countdown_background_image) {
      bgImage = allData.settings.countdown_background_image;
      overlayOpacity = (allData.settings.countdown_bg_opacity !== undefined ? allData.settings.countdown_bg_opacity : 100) / 100;
    } else if (currentBoard.slideKey) {
      // Find the first matching setting
      const slideSettings = allData.slideSettings.find(s => s.slide_name === currentBoard.slideKey);
      
      if (slideSettings) {
        if (slideSettings.background_image) {
          bgImage = slideSettings.background_image;
        }
        
        if (slideSettings.overlay_color) overlayColor = slideSettings.overlay_color;
        if (slideSettings.overlay_opacity !== undefined) overlayOpacity = slideSettings.overlay_opacity / 100;
        if (slideSettings.background_opacity !== undefined) bgOpacity = slideSettings.background_opacity / 100;
        
        // Apply theme preset overrides
        if (currentTheme.overlayColor) overlayColor = currentTheme.overlayColor;
        if (currentTheme.overlayOpacity !== undefined) overlayOpacity = currentTheme.overlayOpacity;
      }
    }

    // Fallback to default if no image found in settings or empty string
    if (!bgImage && currentBoard.slideKey) {
      // If it's one of the "Blue" slides, we prefer the CSS fallback (Blue Gradient) over a default image
      // unless we specifically want a default image. 
      // User asked to change to "Thchelet", so we might want to skip the default image if it was dark,
      // but let's keep the default image logic if it exists, assuming the CSS fallback covers the "loading" or "missing" state.
      bgImage = DEFAULT_BACKGROUNDS[currentBoard.slideKey];
    }
    
    // Logic for Seamless Preload + Crossfade
    if (bgImage && bgImage !== currentBackground) {
        // Keep previous bg visible while loading new one
        const img = new Image();
        img.src = bgImage;
        
        if (img.complete && img.naturalWidth > 0) {
            // Image already cached - instant switch with crossfade
            setPreviousBackground(currentBackground);
            setCurrentBackground(bgImage);
            setCurrentOverlay({ color: overlayColor, opacity: overlayOpacity });
            setCurrentBgOpacity(bgOpacity);
            setTimeout(() => setPreviousBackground(null), 800);
        } else {
            // Load new image while keeping old one visible
            img.onload = () => {
                setPreviousBackground(currentBackground);
                setCurrentBackground(bgImage);
                setCurrentOverlay({ color: overlayColor, opacity: overlayOpacity });
                setCurrentBgOpacity(bgOpacity);
                
                // Clear previous after smooth transition
                setTimeout(() => {
                    setPreviousBackground(null);
                }, 800);
            };
            img.onerror = () => {
                 console.error("Failed to load background:", bgImage);
                 // Fallback gracefully
                 setPreviousBackground(currentBackground);
                 setCurrentBackground(null);
                 setCurrentOverlay({ color: overlayColor, opacity: overlayOpacity });
                 setCurrentBgOpacity(bgOpacity);
                 setTimeout(() => setPreviousBackground(null), 800);
            };
        }
    } else if (!bgImage) {
        // Fade out to no image
        setPreviousBackground(currentBackground);
        setCurrentBackground(null);
        setCurrentOverlay({ color: overlayColor, opacity: overlayOpacity });
        setCurrentBgOpacity(bgOpacity);
        setTimeout(() => setPreviousBackground(null), 800);
    } else {
        // Same image, just update overlay
        setCurrentOverlay({ color: overlayColor, opacity: overlayOpacity });
        setCurrentBgOpacity(bgOpacity);
    }
  }, [currentBoardIndex, boards, allData.slideSettings, allData.settings]);

  const CurrentBoard = boards[currentBoardIndex].component;
  const currentProps = boards[currentBoardIndex].props;
  
  // Determine fallback background class based on slide type
  // User requested "Thchelet" (Light Blue) for Community and WeekdayPrayerTimes
  // We've moved the specific background logic into the components themselves for better customization
  const bgClass = "bg-gradient-to-br from-slate-900 to-slate-800";

  return (
    <div className={`board-rotator h-screen w-screen relative group ${bgClass}`} style={{ fontSize: `${globalFontSize}em` }}>
      {/* Global background layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Previous Background (for crossfade) - stays visible during transition */}
        {previousBackground && (
             <div 
              className="absolute inset-0 bg-cover bg-center transition-opacity ease-out"
              style={{ 
                backgroundImage: `url(${previousBackground})`,
                opacity: currentBackground ? 0 : currentBgOpacity,
                transitionDuration: `${transitionSpeed}ms`,
                zIndex: 1
              }}
            />
        )}

        {/* Current Background (fading in) */}
        {currentBackground && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity ease-in"
            style={{ 
                backgroundImage: `url(${currentBackground})`,
                opacity: currentBgOpacity,
                transitionDuration: `${transitionSpeed}ms`,
                zIndex: 2
            }}
          />
        )}
        
        {/* Fallback gradient if no backgrounds */}
        {!currentBackground && !previousBackground && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-0" />
        )}
        
        {/* Overlay Layer */}
        <div 
            className="absolute inset-0 transition-all duration-500"
            style={{ 
            backgroundColor: currentOverlay.color,
            opacity: currentOverlay.opacity,
            zIndex: 3
            }}
        />
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-black bg-opacity-50 rounded-lg px-3 py-1">
        <span className="text-white text-sm">
          {boards[currentBoardIndex].name} ({currentBoardIndex + 1}/{boards.length})
        </span>
      </div>
      
      <button 
        onClick={goToPrevBoard}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 rounded-full p-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
        title="הלוח הקודם"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button 
        onClick={goToNextBoard}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 rounded-full p-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
        title="הלוח הבא"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex space-x-2">
        {boards.map((_, index) => (
          <div 
            key={index} 
            className={`w-3 h-3 rounded-full ${
              index === currentBoardIndex ? 'bg-amber-400' : 'bg-white bg-opacity-30'
            }`}
          />
        ))}
      </div>
      
      <div className="h-full w-full absolute inset-0 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentBoardIndex}-${boards[currentBoardIndex]?.slideKey || boards[currentBoardIndex]?.name || 'slide'}`}
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: contentTransitionSec, ease: 'easeInOut' }}
          >
            <CurrentBoard {...currentProps} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}