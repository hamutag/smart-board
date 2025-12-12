import React from 'react';

export default function OmerCounter({ omerText, omerDayTomorrow, isMedalStyle = false }) {
  const showOmerText = omerText && omerText.trim() !== '';
  const showNextDayNumber = typeof omerDayTomorrow === 'number' && omerDayTomorrow > 0 && omerDayTomorrow <= 49;

  // אם אין שום מידע להציג, אל תרנדר כלום
  if (!showOmerText && !showNextDayNumber) {
    return null;
  }

  if (isMedalStyle) {
    return (
      <div className="omer-medal-style bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900 p-3 rounded-full shadow-lg w-auto min-w-[160px] max-w-[240px] h-auto min-h-[160px] flex flex-col items-center justify-center transform transition-all hover:scale-105 text-center">
        <h3 className="text-lg font-bold mb-1">ספירת העומר</h3>
        {showOmerText && (
          <div className="omer-text text-xs font-medium leading-tight mb-1 px-1">
            {omerText}
          </div>
        )}
        {showNextDayNumber && (
          <div className="next-omer-text text-xs font-normal mt-2 pt-2 border-t border-blue-800/30 bg-red-600 text-white p-2 rounded-md shadow-md">
            הלילה נספור: <span className="font-semibold">{omerDayTomorrow}</span>
          </div>
        )}
      </div>
    );
  }
  
  // Fallback for non-medal style
  return (
    <div className="omer-counter bg-purple-900 bg-opacity-30 rounded-lg p-2 border border-purple-500/20">
      <h3 className="text-base font-bold text-purple-400 mb-1">ספירת העומר</h3>
      {showOmerText && (
        <div className="omer-text text-xs text-white mb-1">
          {omerText}
        </div>
      )}
      {showNextDayNumber && (
        <div className="next-omer-text text-xs text-purple-200 mt-1 bg-red-700 text-white p-1 rounded">
          הלילה נספור: <span className="font-semibold">{omerDayTomorrow}</span>
        </div>
      )}
    </div>
  );
}