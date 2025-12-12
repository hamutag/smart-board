import React, { useState, useEffect } from 'react';

export default function SunriseCountdown({ sunrise, countdownMinutes = 40 }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!sunrise) return;

    const interval = setInterval(() => {
      try {
        const now = new Date();
        const [hours, minutes] = sunrise.split(':').map(Number);
        
        const sunriseToday = new Date();
        sunriseToday.setHours(hours, minutes, 0, 0);
        
        const sunriseTime = sunriseToday < now 
          ? new Date(sunriseToday.getTime() + 24 * 60 * 60 * 1000) 
          : sunriseToday;

        const timeDiff = sunriseTime.getTime() - now.getTime();
        const shouldShowCountdown = timeDiff > 0 && timeDiff <= countdownMinutes * 60 * 1000;

        if (shouldShowCountdown) {
          setIsActive(true);
          const totalSecondsLeft = Math.floor(timeDiff / 1000);
          const minutesLeft = Math.floor(totalSecondsLeft / 60);
          const secondsLeft = totalSecondsLeft % 60;
          setTimeLeft({ minutes: minutesLeft, seconds: secondsLeft });
        } else {
          setIsActive(false);
          setTimeLeft(null);
        }
      } catch (error) {
        console.error('Error in countdown calculation:', error);
        setIsActive(false);
        setTimeLeft(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sunrise, countdownMinutes]);

  if (!isActive || !timeLeft) {
    return null;
  }

  return (
    <div className="sunrise-countdown bg-amber-500/20 border-2 border-amber-400 rounded-lg p-3">
      <div className="text-center">
        <p className="text-lg font-semibold text-amber-300 mb-1">ספירה לאחור לנץ</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-white tabular-nums">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-2xl text-amber-300">:</span>
          <span className="text-4xl font-bold text-white tabular-nums">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}