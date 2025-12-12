import React from 'react';
import { CalendarDays } from 'lucide-react';

export default function RoshChodeshDisplay({ roshChodesh }) {
  // Do not render the component if there's no Rosh Chodesh data
  if (!roshChodesh || roshChodesh.toLowerCase() === 'null' || roshChodesh.trim() === '') {
    return null;
  }

  return (
    <div className="rosh-chodesh-display bg-sky-800/70 border border-sky-500/50 rounded-lg px-3 py-1 flex items-center gap-2 text-white shadow-md">
      <CalendarDays className="w-4 h-4 text-sky-300" />
      <span className="text-sm font-semibold">{roshChodesh}</span>
    </div>
  );
}