import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from '@/api/entities';
import { SlideSettings } from '@/api/entities';

export default function CountdownPreview() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isShabbat, setIsShabbat] = useState(false);
  const [countdownMinutes, setCountdownMinutes] = useState(40);
  const [simulatedTimeLeft, setSimulatedTimeLeft] = useState({ minutes: 1, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState(null);
  const [slideSettings, setSlideSettings] = useState(null);
  const [weekdayTimeline, setWeekdayTimeline] = useState([]);
  const [shabbatTimeline, setShabbatTimeline] = useState([]);

  // 1) כאן תחליף לרקע הזריחה בירושלים שנתת ל BASE44
  const JERUSALEM_SUNRISE_BG_URL = 'REPLACE_WITH_YOUR_JERUSALEM_SUNRISE_IMAGE_URL';

  // 2) אם תרצה שהזהב יהיה ממש "מרקם" תמונה בתוך הספרות, תשים כאן תמונת טקסטורה של זהב (אופציונלי)
  // אם תשאיר ריק, זה יעבוד עם גרדיאנט זהב מובנה
  const GOLD_TEXTURE_URL = ''; // למשל: 'https://....png'

  useEffect(() => {
    const loadSettings = async () => {
      const [settingsList, slideData] = await Promise.all([
        Settings.list(),
        SlideSettings.filter({ slide_name: 'Countdown' })
      ]);

      if (settingsList.length > 0) {
        const s = settingsList[0];
        setSettings(s);
        setCountdownMinutes(isShabbat ? (s.shabbat_countdown_minutes || 70) : (s.sunrise_countdown_minutes || 40));

        if (s.weekday_timeline) {
          try { setWeekdayTimeline(JSON.parse(s.weekday_timeline)); } catch { setWeekdayTimeline([]); }
        } else setWeekdayTimeline([]);

        if (s.shabbat_timeline) {
          try { setShabbatTimeline(JSON.parse(s.shabbat_timeline)); } catch { setShabbatTimeline([]); }
        } else setShabbatTimeline([]);
      } else {
        setSettings(null);
      }

      if (slideData.length > 0) setSlideSettings(slideData[0]);
      else setSlideSettings(null);
    };

    loadSettings();
  }, [isShabbat]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSimulatedTimeLeft(prev => {
        const totalSeconds = prev.minutes * 60 + prev.seconds;
        if (totalSeconds <= 0) {
          setIsRunning(false);
          return { minutes: 0, seconds: 0 };
        }
        const newTotal = totalSeconds - 1;
        return { minutes: Math.floor(newTotal / 60), seconds: newTotal % 60 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const startSimulation = (secondsBeforeEnd) => {
    const safe = Math.max(0, Number(secondsBeforeEnd) || 0);
    setSimulatedTimeLeft({
      minutes: Math.floor(safe / 60),
      seconds: safe % 60
    });
    setIsRunning(true);
  };

  const totalSeconds = Math.max(1, (Number(countdownMinutes) || 0) * 60);
  const remainingSeconds = Math.max(0, simulatedTimeLeft.minutes * 60 + simulatedTimeLeft.seconds);
  const elapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);

  const stages = isShabbat ? shabbatTimeline : weekdayTimeline;

  const computedStages = useMemo(() => {
    if (!Array.isArray(stages) || stages.length === 0) return [];
    let acc = 0;
    return stages.map((stage) => {
      const start = acc;
      const offMin = Number(stage?.offset || 0);
      acc += offMin * 60;
      return { ...stage, time: start };
    });
  }, [stages]);

  const currentStageIndex = useMemo(() => {
    if (computedStages.length === 0) return -1;
    for (let i = computedStages.length - 1; i >= 0; i--) {
      if (elapsedSeconds >= computedStages[i].time) return i;
    }
    return 0;
  }, [computedStages, elapsedSeconds]);

  const progressPercent = Math.max(0, Math.min(100, (elapsedSeconds / totalSeconds) * 100));
  const isFlashing = remainingSeconds <= 30 && remainingSeconds > 0;
  const isNetz = remainingSeconds === 0;

  // מאיפה הוא לוקח את הרקע
  // עדיפות: SlideSettings.background_image > Settings.countdown_background_image > JERUSALEM_SUNRISE_BG_URL > defaultBg
  const defaultBg = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cfca161c30a1349eddd330/2854425e5_Gemini_Generated_Image_fuct9ufuct9ufuct.png';

  const bgImage =
    slideSettings?.background_image ||
    settings?.countdown_background_image ||
    (JERUSALEM_SUNRISE_BG_URL !== 'REPLACE_WITH_YOUR_JERUSALEM_SUNRISE_IMAGE_URL' ? JERUSALEM_SUNRISE_BG_URL : '') ||
    defaultBg;

  const bgOpacity = (slideSettings?.background_opacity ?? settings?.countdown_bg_opacity ?? 100) / 100;

  // מסך סיום
  if (isNetz) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600">
        <div className="absolute inset-0 animate-pulse opacity-40">
          <div className="w-full h-full bg-gradient-radial from-yellow-300 via-orange-400 to-transparent"></div>
        </div>

        <div className="text-center space-y-8">
          <div className="text-9xl animate-bounce">🙏</div>
          <h1 className="text-8xl font-black text-white drop-shadow-2xl leading-tight px-8 animate-pulse">
            תתקבלנה תפילתינו ברצון אמן
          </h1>
          <div className="text-9xl animate-bounce">🙏</div>
        </div>

        <Button
          onClick={() => {
            setIsRunning(false);
            setSimulatedTimeLeft({ minutes: 1, seconds: 0 });
          }}
          className="absolute bottom-8 bg-blue-600 hover:bg-blue-700"
        >
          אפס סימולציה
        </Button>
      </div>
    );
  }

  const timeText = `${String(simulatedTimeLeft.minutes).padStart(2, '0')}:${String(simulatedTimeLeft.seconds).padStart(2, '0')}`;

  return (
    <div className="h-screen w-screen text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <style>{`
        .gold-3d {
          position: relative;
          display: inline-block;

          /* זהב "אמיתי" */
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;

          /* בורדר עדין כמו במסגרת מתכת */
          -webkit-text-stroke: 6px rgba(70, 35, 10, 0.50);

          /* עומק ותלת מימד */
          text-shadow:
            0 2px 0 rgba(255, 248, 200, 0.35),
            0 3px 0 rgba(240, 208, 110, 0.70),
            0 4px 0 rgba(218, 170, 55, 0.95),
            0 5px 0 rgba(186, 130, 25, 0.95),
            0 6px 0 rgba(150, 95, 15, 0.90),
            0 7px 0 rgba(120, 75, 12, 0.85),
            0 8px 0 rgba(95, 55, 10, 0.80),
            0 22px 24px rgba(0,0,0,0.45),
            0 40px 60px rgba(0,0,0,0.35);
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.65));
        }

        /* פס הברקה עליון כמו זכוכית */
        .gold-3d::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          -webkit-text-stroke: 0;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.55) 0%,
            rgba(255,255,255,0.20) 18%,
            rgba(255,255,255,0.00) 52%
          );
          -webkit-background-clip: text;
          background-clip: text;
          mix-blend-mode: screen;
          opacity: 0.85;
        }

        /* הברקה נקודתית באמצע כמו מתכת מלוטשת */
        .gold-3d::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            circle at 50% 38%,
            rgba(255,255,255,0.28) 0%,
            rgba(255,255,255,0.10) 22%,
            rgba(255,255,255,0.00) 52%
          );
          -webkit-background-clip: text;
          background-clip: text;
          mix-blend-mode: screen;
          opacity: 0.75;
        }

        /* רפלקציה מתחת */
        .gold-reflection {
          transform: translateX(-50%) scaleY(-1);
          opacity: 0.22;
          filter: blur(1px);
          pointer-events: none;
          user-select: none;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0));
          -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0));
        }
      `}</style>

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: bgOpacity
        }}
      ></div>

      {/* שכבת כהות עדינה כדי שהזהב תמיד יקפוץ, כמו בתמונה ששלחת */}
      <div className="absolute inset-0 bg-black/25"></div>

      {/* 30 seconds animation */}
      {isFlashing && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/50 via-transparent to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-400/40 rounded-full blur-3xl animate-ping"></div>
        </div>
      )}

      <link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&display=swap" rel="stylesheet" />

      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-50 bg-black/50 p-4 rounded-xl space-y-2 relative">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsShabbat(false)}
            className={`${!isShabbat ? 'bg-amber-500' : 'bg-blue-700'}`}
          >
            יום חול
          </Button>
          <Button
            onClick={() => setIsShabbat(true)}
            className={`${isShabbat ? 'bg-amber-500' : 'bg-blue-700'}`}
          >
            שבת
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => startSimulation(60)} className="bg-green-600 hover:bg-green-700 text-sm">
            דקה לפני הנץ
          </Button>
          <Button onClick={() => startSimulation(30)} className="bg-orange-600 hover:bg-orange-700 text-sm">
            30 שניות
          </Button>
          <Button onClick={() => startSimulation(totalSeconds)} className="bg-blue-600 hover:bg-blue-700 text-sm">
            התחל מההתחלה
          </Button>
        </div>

        <Button
          onClick={() => setIsRunning(!isRunning)}
          className={`w-full ${isRunning ? 'bg-red-600' : 'bg-green-600'}`}
        >
          {isRunning ? 'עצור' : 'הפעל'}
        </Button>

        {/* בדיקה מהירה: מאיפה נלקח הרקע בפועל */}
        <Button
          onClick={() => {
            console.log('slide bg:', slideSettings?.background_image);
            console.log('settings bg:', settings?.countdown_background_image);
            console.log('fallback bg:', JERUSALEM_SUNRISE_BG_URL);
            console.log('final bgImage:', bgImage);
            console.log('bgOpacity:', bgOpacity);
          }}
          className="w-full bg-slate-700 hover:bg-slate-800 text-sm"
        >
          הדפס מקור רקע לקונסול
        </Button>
      </div>

      {/* Title at top */}
      <h1
        className="absolute top-24 left-1/2 -translate-x-1/2 text-8xl font-black z-20"
        style={{
          color: '#ffffff',
          textShadow: `
            4px 4px 8px rgba(0,0,0,0.9),
            0 0 20px rgba(255,255,255,0.6)
          `,
          fontFamily: 'Frank Ruhl Libre, serif',
          letterSpacing: '0.05em'
        }}
      >
        ספירה לאחור לנץ החמה
      </h1>

      {/* Countdown Timer - 3D Gold Glass Numbers like your reference image */}
      <div className="relative z-10">
        <div
          className="text-[34rem] font-black tabular-nums leading-none tracking-wider gold-3d"
          style={{
            fontFamily: 'Arial Black, sans-serif',
            fontWeight: 900,
            backgroundImage: GOLD_TEXTURE_URL
              ? `url(${GOLD_TEXTURE_URL})`
              : `linear-gradient(
                  180deg,
                  #fff6c8 0%,
                  #ffe58a 10%,
                  #ffd95e 22%,
                  #ffd23a 32%,
                  #f0c64c 44%,
                  #d4af37 56%,
                  #b8860b 68%,
                  #8c6a12 84%,
                  #6e520c 100%
                )`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {timeText}
        </div>

        {/* Reflection */}
        <div className="absolute left-1/2 top-[96%] gold-reflection">
          <div
            className="text-[34rem] font-black tabular-nums leading-none tracking-wider gold-3d"
            style={{
              fontFamily: 'Arial Black, sans-serif',
              fontWeight: 900,
              backgroundImage: GOLD_TEXTURE_URL
                ? `url(${GOLD_TEXTURE_URL})`
                : `linear-gradient(
                    180deg,
                    #fff6c8 0%,
                    #ffe58a 10%,
                    #ffd95e 22%,
                    #ffd23a 32%,
                    #f0c64c 44%,
                    #d4af37 56%,
                    #b8860b 68%,
                    #8c6a12 84%,
                    #6e520c 100%
                  )`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {timeText}
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <h2
        className="absolute bottom-48 left-1/2 -translate-x-1/2 text-8xl font-black z-20"
        style={{
          color: '#FFD700',
          textShadow: `
            4px 4px 8px rgba(0,0,0,0.9),
            0 0 25px rgba(255,215,0,0.7),
            0 0 50px rgba(255,215,0,0.5)
          `,
          fontFamily: 'Frank Ruhl Libre, serif',
          letterSpacing: '0.08em'
        }}
      >
        עורה כבודי אעירה השחר
      </h2>

      {/* Timeline */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-5xl z-10">
        <div className="relative h-5 bg-blue-900/50 rounded-full overflow-hidden border-2 border-blue-600 shadow-lg">
          <div
            className="absolute top-0 right-0 h-full bg-gradient-to-l from-amber-400 via-orange-500 to-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          ></div>

          {computedStages.map((stage, index) => {
            if (index === 0) return null;
            const percent = Math.max(0, Math.min(100, (stage.time / totalSeconds) * 100));
            return (
              <div
                key={index}
                className="absolute top-0 h-full w-1 bg-white"
                style={{ right: `${percent}%` }}
              ></div>
            );
          })}
        </div>

        <div className="relative flex justify-between mt-3 text-lg font-bold" style={{ direction: 'rtl' }}>
          {computedStages.length === 0 ? (
            <div className="text-center w-full text-amber-200">אין טיימליין מוגדר</div>
          ) : (
            computedStages.map((stage, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full mb-1 ${
                    elapsedSeconds >= stage.time
                      ? (currentStageIndex === index ? 'bg-yellow-400 animate-pulse' : 'bg-green-400')
                      : 'bg-gray-400'
                  }`}
                ></div>
                <span className="text-amber-300 text-sm">{stage.name}</span>
                {index > 0 && (
                  <span className="text-xs text-blue-200">+{Number(stages[index]?.offset || 0)} דק׳</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
