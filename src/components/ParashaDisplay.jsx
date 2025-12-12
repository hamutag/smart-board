import React from 'react';

export default function ParashaDisplay({ parasha }) {
  return (
    <div className="parasha-display bg-purple-800 bg-opacity-50 px-6 py-3 rounded-xl border-2 border-amber-400/50 text-center">
      <h3 className="text-xl font-bold text-amber-400 mb-1">פרשת השבוע</h3>
      <p className="text-2xl font-bold text-white">{parasha || "טוען..."}</p>
    </div>
  );
}