import React, { useEffect } from 'react';

export default function PrayerTimeAlert({ alertType, onClose }) {
  const alertMessages = {
    mincha: {
      title: 'זמן מנחה גדולה מתקרב!',
      message: 'עוד 20 דקות עד זמן מנחה גדולה',
      color: 'from-amber-400 to-orange-500'
    },
    class: {
      title: 'זמן שיעור!',
      message: 'זמן שיעור גמרא התחיל כעת',
      color: 'from-blue-400 to-purple-500'
    },
    arvit: {
      title: 'זמן ערבית מתקרב!',
      message: 'עוד 5 דקות עד זמן תפילת ערבית',
      color: 'from-purple-400 to-indigo-500'
    }
  };

  const alert = alertMessages[alertType];

  useEffect(() => {
    const timer = setTimeout(onClose, 10000); // סגירה אוטומטית אחרי 10 שניות
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!alert) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className={`bg-gradient-to-r ${alert.color} rounded-2xl p-6 border-4 border-white/30 shadow-2xl text-center max-w-md`}>
        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
          {alert.title}
        </h3>
        <p className="text-lg text-white/90 mb-4 drop-shadow">
          {alert.message}
        </p>
        <button 
          onClick={onClose}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          סגור
        </button>
      </div>
    </div>
  );
}