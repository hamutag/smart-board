import React from 'react';
import ClockDisplay from '../ClockDisplay';
import HebrewDate from '../HebrewDate';
import PrayerTimes from '../PrayerTimes';
import ParashaDisplay from '../ParashaDisplay';
import TachanonIndicator from '../TachanonIndicator';
import SunriseCountdown from '../SunriseCountdown';
import DedicationDisplay from '../DedicationDisplay';

export default function DesktopLayout({ zmanim, dedication, isShabbat, onCountdownActive }) {
    const displayHebrewDate = zmanim?.hebrew_date || "טוען תאריך עברי...";
    const parasha = zmanim?.parasha || "טוען פרשה...";
    const today = new Date();
    const gregorianDate = today.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    return (
      <div className="main-board-layout h-screen w-screen flex flex-col justify-between p-8 bg-gradient-to-b from-blue-950 to-blue-900 text-white overflow-hidden">
        {/* Header Section */}
        <header className="flex flex-col items-center space-y-4 w-full">
          <h1 className="text-6xl text-amber-400 font-bold hebrew-font" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>לוח חכם ארנון</h1>
          <HebrewDate date={displayHebrewDate} className="text-amber-300 text-3xl" />
          <p className="text-blue-200 text-xl">{gregorianDate}</p>
          <div className="flex gap-8 mt-2">
            <ParashaDisplay parasha={parasha} />
            <TachanonIndicator />
          </div>
        </header>
        
        {/* Sunrise Countdown */}
        <div className="flex justify-center">
          <SunriseCountdown 
            sunriseTime={zmanim?.sunrise} 
            countdownMinutes={40}
            onCountdownActive={onCountdownActive}
          />
        </div>
        
        {/* Main Content: Prayer Times */}
        <main className="flex-grow flex items-center justify-center">
          <PrayerTimes 
            zmanimData={zmanim}
            isShabbat={isShabbat}
          />
        </main>
        
        {/* Footer: Dedication */}
        <footer className="text-center">
          <DedicationDisplay dedication={dedication} />
        </footer>
      </div>
    );
}