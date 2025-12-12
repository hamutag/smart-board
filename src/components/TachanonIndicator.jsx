
import React from 'react';

export default function TachanonIndicator() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const shouldSayTachanon = dayOfWeek !== 0 && dayOfWeek !== 6;
  
  return (
    <div className={`tachanon-indicator px-6 py-3 rounded-xl border-2 text-center ${
      shouldSayTachanon 
        ? 'bg-green-800 bg-opacity-50 border-green-400/50' 
        : 'bg-red-800 bg-opacity-50 border-red-400/50'
    }`}>
      <h3 className="text-xl font-bold text-amber-400 mb-1">תחנון</h3>
      <p className="text-2xl font-bold text-white">
        {shouldSayTachanon ? 'אומרים' : 'לא אומרים'}
      </p>
    </div>
  );
}
