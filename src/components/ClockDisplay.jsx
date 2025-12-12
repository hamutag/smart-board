import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function ClockDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="clock-display flex items-baseline text-white ltr-direction">
      <span className="text-9xl font-bold tabular-nums drop-shadow-2xl">
        {format(currentTime, 'HH:mm')}
      </span>
      <span className="text-7xl font-semibold tabular-nums text-amber-300 ml-3 -translate-y-px drop-shadow-2xl">
        :{format(currentTime, 'ss')}
      </span>
    </div>
  );
}