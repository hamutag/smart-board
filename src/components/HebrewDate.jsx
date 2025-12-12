import React from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function HebrewDate({ date }) {
  const gregorianDate = format(new Date(), "EEEE, d MMMM yyyy", { locale: he });

  return (
    <div className="hebrew-date text-center">
      <p className="text-3xl font-bold text-amber-200">{date || 'טוען תאריך...'}</p>
      <p className="text-xl text-blue-200 opacity-80">{gregorianDate}</p>
    </div>
  );
}