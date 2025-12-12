import React, { useState, useEffect } from 'react';
import { Halacha } from '@/api/entities'; // שימוש ביישות 'הלכה'

export default function HalachaYomit({ 
  titleClassName = "text-xl font-bold text-amber-400 mb-2",
  contentClassName = "text-base leading-relaxed",
  sourceClassName = "text-sm text-blue-300 mt-2"
}) {
  const [currentHalacha, setCurrentHalacha] = useState(null);
  const [halachot, setHalachot] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadHalachot = async () => {
      try {
        const activeHalachot = await Halacha.filter({ active: true }, 'order');
        if (activeHalachot.length > 0) {
          setHalachot(activeHalachot);
          setCurrentHalacha(activeHalachot[0]);
          setCurrentIndex(0);
        } else {
          setCurrentHalacha({ title: "הלכה יומית", content: "אין הלכות פעילות להצגה.", source: "" });
        }
      } catch (err) {
        console.error("Error loading halachot:", err);
        setCurrentHalacha({ title: "שגיאה", content: "שגיאה בטעינת הלכה יומית.", source: "" });
      }
    };
    loadHalachot();
  }, []);

  useEffect(() => {
    if (halachot.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % halachot.length;
        setCurrentHalacha(halachot[nextIndex]);
        return nextIndex;
      });
    }, 24 * 60 * 60 * 1000); // החלפת הלכה כל 24 שעות

    return () => clearInterval(interval);
  }, [halachot]);

  if (!currentHalacha) {
    return (
      <div className="halacha-yomit-container p-3 bg-blue-800 bg-opacity-30 rounded-lg border border-blue-600/30">
        <p className={contentClassName}>טוען הלכה יומית...</p>
      </div>
    );
  }

  return (
    <div className="halacha-yomit-container p-3 bg-blue-800 bg-opacity-30 rounded-lg border border-blue-600/30">
      <h3 className={titleClassName}>{currentHalacha.title}</h3>
      <p className={contentClassName} style={{ whiteSpace: 'pre-line' }}>{currentHalacha.content}</p>
      {currentHalacha.source && (
        <p className={sourceClassName}>– {currentHalacha.source}</p>
      )}
      {halachot.length > 1 && (
        <div className="dots-container flex justify-center mt-2">
          {halachot.map((_, index) => (
            <span 
              key={index} 
              className={`dot ${index === currentIndex ? 'active-dot' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}