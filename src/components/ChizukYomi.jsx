
import React, { useState, useEffect } from 'react';
import { ChizukYomi as ChizukEntity } from '@/api/entities';

export default function ChizukYomi() {
  const [currentChizuk, setCurrentChizuk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDailyChizuk = async () => {
      try {
        setLoading(true);
        
        // חישוב איזה חיזוק להציג על פי התאריך
        const today = new Date();
        const dayOfMonth = today.getDate();
        const chizukNumber = ((dayOfMonth - 1) % 30) + 1; // מחזוריות של 1-30
        
        console.log(`ChizukYomi: Loading chizuk for day ${dayOfMonth}, chizuk number ${chizukNumber}`);
        
        const chizukRecords = await ChizukEntity.filter({ 
          order: chizukNumber,
          active: true 
        });
        
        if (chizukRecords && chizukRecords.length > 0) {
          setCurrentChizuk(chizukRecords[0]);
        } else {
          // אם לא נמצא, נציג את הראשון
          const allChizukim = await ChizukEntity.filter({ active: true });
          if (allChizukim && allChizukim.length > 0) {
            setCurrentChizuk(allChizukim[0]);
          }
        }
      } catch (error) {
        console.error('Error loading daily chizuk:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDailyChizuk();
    
    // רענון כל יום בחצות
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimeout = setTimeout(() => {
      loadDailyChizuk();
      // אחרי חצות, רענון כל 24 שעות
      const dailyInterval = setInterval(loadDailyChizuk, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, []);

  if (loading) {
    return (
      <div className="chizuk-yomi">
        <h3 className="text-lg font-bold text-green-400 mb-2">טוען חיזוק יומי...</h3>
      </div>
    );
  }

  if (!currentChizuk) {
    return (
      <div className="chizuk-yomi">
        <h3 className="text-lg font-bold text-green-400 mb-2">חיזוק יומי</h3>
        <p className="text-base">אין חיזוק להיום</p>
      </div>
    );
  }

  return (
    <div className="chizuk-yomi">
      <h3 className="text-lg font-bold text-green-400 mb-2">חיזוק יומי</h3>
      <div className="bg-green-900 bg-opacity-30 p-3 rounded-lg border border-green-500/20">
        <p className="text-base mb-1 leading-relaxed">"{currentChizuk.content}"</p>
        {currentChizuk.source && (
          <p className="text-sm text-gray-300">— {currentChizuk.source}</p>
        )}
      </div>
    </div>
  );
}
