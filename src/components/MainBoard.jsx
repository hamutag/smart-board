
import React from 'react';
import ClockDisplay from './ClockDisplay';
import HebrewDate from './HebrewDate';
import DedicationDisplay from './DedicationDisplay';

// This is the new, simple Main Board (מסך ראשי)
export default function MainBoard({ settings, dailyZmanim, loading }) {
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900 text-white">
        <div className="spinner"></div>
        <p className="mt-4 text-lg">טוען נתונים...</p>
      </div>
    );
  }

  return (
    <div className="main-board-simple h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900 text-white p-8">
      <div className="text-center mb-8">
        <div className="text-right text-2xl text-amber-400 w-full px-4">בס"ד</div>
        <h1 className="text-6xl font-bold text-amber-500 hebrew-font my-4">
          לוח חכם ארנון
        </h1>
      </div>

      <div className="my-8">
        <ClockDisplay 
          useFixedDate={false} 
          timeClassName="text-9xl font-bold text-amber-400" 
          dateClassName="text-4xl text-amber-300"
        />
      </div>

      <div className="my-8">
        <HebrewDate 
          date={dailyZmanim?.hebrew_date || "טוען תאריך..."} 
          className="text-5xl font-bold text-amber-300" 
        />
        {dailyZmanim?.parasha && (
            <div className="text-3xl text-green-300 mt-2 text-center">
              פרשת {dailyZmanim.parasha}
            </div>
        )}
      </div>

      {dailyZmanim && (
        <div className="my-8 text-center w-full max-w-lg">
          <h3 className="text-4xl font-bold text-amber-400 mb-4">זמני היום</h3>
          <div className="flex flex-col gap-2 text-3xl font-semibold text-blue-300">
            {dailyZmanim.alotHaShachar && (
              <div className="flex justify-between items-baseline">
                <span>עלות השחר:</span>
                <span className="text-amber-300 text-4xl">{dailyZmanim.alotHaShachar}</span>
              </div>
            )}
            {dailyZmanim.netzHaChama && (
              <div className="flex justify-between items-baseline">
                <span>נץ החמה:</span>
                <span className="text-amber-300 text-4xl">{dailyZmanim.netzHaChama}</span>
              </div>
            )}
            {dailyZmanim.sofZmanKriyatShema && (
              <div className="flex justify-between items-baseline">
                <span>סוף זמן ק"ש:</span>
                <span className="text-amber-300 text-4xl">{dailyZmanim.sofZmanKriyatShema}</span>
              </div>
            )}
            {dailyZmanim.sofZmanTefila && (
              <div className="flex justify-between items-baseline">
                <span>סוף זמן תפילה:</span>
                <span className="text-amber-300 text-4xl">{dailyZmanim.sofZmanTefila}</span>
              </div>
            )}
            {dailyZmanim.chatzot && (
              <div className="flex justify-between items-baseline">
                <span>חצות:</span>
                <span className="text-amber-300 text-4xl">{dailyZmanim.chatzot}</span>
              </div>
            )}
            {dailyZmanim.minchaGedola && (
              <div className="flex justify-between items-baseline">
                <span>מנחה גדולה:</span>
                <span className="text-amber-300 text-4xl">{dailyZmanim.minchaGedola}</span>
              </div>
            )}
            {dailyZmanim.minchaKetana && (
              <div className="flex justify-between items-baseline">
                <span>מנחה קטנה:</span>
                <span className="text-amber-300 text-4xl">{dailyZmanim.minchaKetana}</span>
              </div>
            )}
            {dailyZmanim.plagHaMincha && (
              <div className="flex justify-between items-baseline">
                <span>פלג המנחה:</span>
                <span className="text-amber-300 text-4xl">{dailyZmanim.plagHaMincha}</span>
              </div>
            )}
            {dailyZmanim.shkiya && (
              <div className="flex justify-between items-baseline">
                <span>שקיעה:</span>
                <span className="text-amber-300 text-4xl">{dailyZmanim.shkiya}</span>
              </div>
            )}
            {dailyZmanim.tzeitHaKochavim && (
              <div className="flex justify-between items-baseline">
                <span>צאת הכוכבים:</span>
                <span className="text-amber-300 text-4xl">{dailyZmanim.tzeitHaKochavim}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <DedicationDisplay 
          dedication={settings?.dedication} 
          className="text-2xl font-semibold text-amber-200" 
        />
      </div>
    </div>
  );
}
