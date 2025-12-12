
import React, { useState, useEffect } from 'react';

export default function NiftarimBoard({ niftarimList, loading, error }) {
  const [weeklyNiftarim, setWeeklyNiftarim] = useState([]);
  const [weekRangeDisplay, setWeekRangeDisplay] = useState(''); // New state for displaying the week range

  useEffect(() => {
    if (niftarimList && niftarimList.length > 0) {
      const today = new Date();
      const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)

      // Define the current week: Sunday 00:00:00 to Saturday 23:59:59
      // Note: While a Jewish week typically starts Friday evening,
      // this component currently calculates a standard Gregorian Sunday-Saturday week for simplicity.
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - currentDay);
      startOfWeek.setHours(0, 0, 0, 0); // Set to beginning of Sunday
      startOfWeek.setMinutes(0);
      startOfWeek.setSeconds(0);
      startOfWeek.setMilliseconds(0);

      const endOfWeekExclusive = new Date(startOfWeek);
      endOfWeekExclusive.setDate(startOfWeek.getDate() + 7); // This is the next Sunday 00:00:00

      const filtered = niftarimList.filter(n => {
        if (!n.yahrzeit_gregorian_date) return false;
        try {
          // The date from DB might be a string. Ensure it's a valid Date object.
          const yahrzeitDate = new Date(n.yahrzeit_gregorian_date);
          // Check if the yahrzeit date falls within the current week (inclusive start, exclusive end)
          return yahrzeitDate >= startOfWeek && yahrzeitDate < endOfWeekExclusive;
        } catch (e) {
          console.error("Invalid date format for niftar:", n.yahrzeit_gregorian_date, "Error:", e);
          return false;
        }
      });
      
      setWeeklyNiftarim(filtered);

      // Prepare date range for display
      const displayEndDate = new Date(endOfWeekExclusive);
      displayEndDate.setDate(displayEndDate.getDate() - 1); // Adjust to display Saturday's date

      const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      const formattedStartDate = startOfWeek.toLocaleDateString('he-IL', options);
      const formattedEndDate = displayEndDate.toLocaleDateString('he-IL', options);

      setWeekRangeDisplay(`${formattedStartDate} - ${formattedEndDate}`);
    } else {
        // Clear display states if niftarimList is empty or null
        setWeeklyNiftarim([]);
        setWeekRangeDisplay('');
    }
  }, [niftarimList]);
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900 text-white">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400">שגיאה</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (weeklyNiftarim.length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900 text-white p-8">
        <h1 className="text-5xl font-bold text-amber-400 mb-4 hebrew-font">לעילוי נשמת נפטרי השבוע</h1>
        {weekRangeDisplay && <p className="text-3xl font-bold text-amber-300 mb-8 hebrew-font">({weekRangeDisplay})</p>}
        <p className="text-2xl">אין יארצייט השבוע</p>
      </div>
    );
  }

  return (
    <div className="niftarim-board h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900 text-white p-8 overflow-y-auto">
      <h1 className="text-5xl font-bold text-amber-400 mb-4 hebrew-font">לעילוי נשמת נפטרי השבוע</h1>
      {weekRangeDisplay && <p className="text-3xl font-bold text-amber-300 mb-8 hebrew-font">({weekRangeDisplay})</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
        {weeklyNiftarim.map(niftar => (
          <div key={niftar.id} className="niftar-card bg-blue-900/50 p-6 rounded-2xl border-2 border-amber-500/40 flex items-center justify-center text-center">
            {/* Candle (Ner Neshama) CSS */}
            <div className="candle-container flex flex-col items-center mr-6 rtl:mr-0 rtl:ml-6">
              <div className="flame w-6 h-8 bg-gradient-to-b from-orange-400 to-yellow-300 rounded-t-full rounded-b-sm animate-pulse"></div>
              <div className="wick w-1 h-2 bg-gray-700"></div>
              <div className="candle-body w-8 h-16 bg-white rounded-t-md shadow-inner"></div>
            </div>
            <div>
              <h2 className="text-3xl font-bold">{niftar.hebrew_name}</h2>
              <p className="text-lg text-amber-200">יום השנה: {niftar.yahrzeit_hebrew_date}</p>
              {niftar.dedication_text && (
                <p className="text-md text-blue-200 mt-1">{niftar.dedication_text}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
