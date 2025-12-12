import React from 'react';

export default function DedicationDisplay({ dedication }) {
  if (!dedication) {
    return null;
  }
  
  return (
    <div className="dedication-display bg-black/30 text-white px-8 py-3 rounded-xl">
      <p className="text-2xl font-semibold">{dedication}</p>
    </div>
  );
}