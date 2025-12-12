import React, { useState, useEffect } from 'react';

export default function ShabbatTimer() {
  const [timeToShabbat, setTimeToShabbat] = useState(null);
  const [showShabbatPage, setShowShabbatPage] = useState(false);

  useEffect(() => {
    const checkShabbatTime = () => {
      // שימוש ב-API של הדפדפן כדי לקבל את הזמן המקומי בירושלים
      // זה יפתור את בעיית אזור הזמן של השרת
      const israel_time_str = new Date().toLocaleString("en-US", {timeZone: "Asia/Jerusalem"});
      const now = new Date(israel_time_str);
      
      const dayOfWeek = now.getDay(); // 0 = ראשון, 1 = שני... 6 = שבת
      const currentHour = now.getHours();
      
      const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
      console.log(`ShabbatTimer (Jerusalem Time): Day: ${dayOfWeek} (${dayNames[dayOfWeek]}), Hour: ${currentHour}`);
      
      // אם זה יום שישי (5) משעה 9:00 בבוקר או שזה כל יום שבת (6)
      if ((dayOfWeek === 5 && currentHour >= 9) || dayOfWeek === 6) {
        console.log("ShabbatTimer: It is Shabbat time, showing Shabbat page.");
        setShowShabbatPage(true);
      } else {
        console.log("ShabbatTimer: Not Shabbat time, showing regular page.");
        setShowShabbatPage(false);
      }
    };

    checkShabbatTime();
    const interval = setInterval(checkShabbatTime, 60 * 1000); // בדיקה כל דקה

    return () => clearInterval(interval);
  }, []);

  return { showShabbatPage, timeToShabbat };
}