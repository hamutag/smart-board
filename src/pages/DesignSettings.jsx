import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Monitor, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DesignSettings() {
  const navigate = useNavigate();
  
  // הגדרות עיצוב שניתן לשנות
  const [designSettings, setDesignSettings] = useState({
    // יחסי גריד
    topRowHeight: '3fr',
    bottomRowHeight: '1fr',
    leftColumnWidth: '2fr',
    middleColumnWidth: '3fr',
    rightColumnWidth: '2fr',
    
    // גדלי פונטים
    sunriseFontSize: 'text-6xl',
    prayerTimeFontSize: 'text-5xl',
    prayerTitleFontSize: 'text-2xl',
    shacharitFontSize: 'text-3xl',
    
    // רווחים
    mainPadding: 'p-6',
    prayerBoxPadding: 'p-6',
    prayerBoxGap: 'gap-6',
    prayerBoxMargin: 'mb-6',
    
    // גבהים ורוחבים מותאמים אישית
    customTopRowHeight: 75, // באחוזים
    customBottomRowHeight: 25, // באחוזים
  });

  const handleChange = (field, value) => {
    setDesignSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCSS = () => {
    return `
/* עיצוב מותאם אישית ללוח */
.main-board-desktop .grid-rows-custom {
  grid-template-rows: ${designSettings.customTopRowHeight}% ${designSettings.customBottomRowHeight}%;
}

.sunrise-font-custom {
  font-size: ${designSettings.sunriseFontSize === 'text-6xl' ? '3.75rem' : 
               designSettings.sunriseFontSize === 'text-5xl' ? '3rem' : 
               designSettings.sunriseFontSize === 'text-4xl' ? '2.25rem' : '3.75rem'};
}

.prayer-time-font-custom {
  font-size: ${designSettings.prayerTimeFontSize === 'text-6xl' ? '3.75rem' :
               designSettings.prayerTimeFontSize === 'text-5xl' ? '3rem' :
               designSettings.prayerTimeFontSize === 'text-4xl' ? '2.25rem' : '3rem'};
}

.prayer-title-font-custom {
  font-size: ${designSettings.prayerTitleFontSize === 'text-3xl' ? '1.875rem' :
               designSettings.prayerTitleFontSize === 'text-2xl' ? '1.5rem' :
               designSettings.prayerTitleFontSize === 'text-xl' ? '1.25rem' : '1.5rem'};
}
    `;
  };

  const applySettings = () => {
    // יצירת או עדכון של style tag
    let styleTag = document.getElementById('design-settings-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'design-settings-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = generateCSS();
    
    alert('העיצוב הוחל בהצלחה! עבור ללוח כדי לראות את השינויים.');
  };

  return (
    <div className="design-settings min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-4 md:p-8 rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="bg-blue-800 border-blue-700 hover:bg-blue-700 ml-2"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex items-center">
            <Monitor className="w-6 h-6 text-amber-400 ml-2" />
            <h1 className="text-2xl font-bold">הגדרות עיצוב מתקדמות</h1>
          </div>
        </div>

        <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg mb-6">
          <h2 className="text-xl font-bold text-amber-400 mb-4">יחסי גריד ופריסה</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="topRowHeight">גובה שורה עליונה (%)</Label>
              <Input
                id="topRowHeight"
                type="number"
                min="50"
                max="90"
                value={designSettings.customTopRowHeight}
                onChange={(e) => handleChange('customTopRowHeight', parseInt(e.target.value))}
                className="bg-blue-700 bg-opacity-50 border-blue-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="bottomRowHeight">גובה שורה תחתונה (%)</Label>
              <Input
                id="bottomRowHeight"
                type="number"
                min="10"
                max="50"
                value={designSettings.customBottomRowHeight}
                onChange={(e) => handleChange('customBottomRowHeight', parseInt(e.target.value))}
                className="bg-blue-700 bg-opacity-50 border-blue-600 text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg mb-6">
          <h2 className="text-xl font-bold text-amber-400 mb-4">גדלי פונטים</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sunriseFontSize">גודל פונט נץ החמה</Label>
              <select
                id="sunriseFontSize"
                value={designSettings.sunriseFontSize}
                onChange={(e) => handleChange('sunriseFontSize', e.target.value)}
                className="w-full p-2 bg-blue-700 bg-opacity-50 border border-blue-600 rounded text-white"
              >
                <option value="text-4xl">בינוני (4xl)</option>
                <option value="text-5xl">גדול (5xl)</option>
                <option value="text-6xl">מאוד גדול (6xl)</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="prayerTimeFontSize">גודל פונט זמני תפילה</Label>
              <select
                id="prayerTimeFontSize"
                value={designSettings.prayerTimeFontSize}
                onChange={(e) => handleChange('prayerTimeFontSize', e.target.value)}
                className="w-full p-2 bg-blue-700 bg-opacity-50 border border-blue-600 rounded text-white"
              >
                <option value="text-4xl">בינוני (4xl)</option>
                <option value="text-5xl">גדול (5xl)</option>
                <option value="text-6xl">מאוד גדול (6xl)</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="prayerTitleFontSize">גודל פונט כותרות תפילה</Label>
              <select
                id="prayerTitleFontSize"
                value={designSettings.prayerTitleFontSize}
                onChange={(e) => handleChange('prayerTitleFontSize', e.target.value)}
                className="w-full p-2 bg-blue-700 bg-opacity-50 border border-blue-600 rounded text-white"
              >
                <option value="text-xl">קטן (xl)</option>
                <option value="text-2xl">בינוני (2xl)</option>
                <option value="text-3xl">גדול (3xl)</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="shacharitFontSize">גודל פונט שחרית בנץ</Label>
              <select
                id="shacharitFontSize"
                value={designSettings.shacharitFontSize}
                onChange={(e) => handleChange('shacharitFontSize', e.target.value)}
                className="w-full p-2 bg-blue-700 bg-opacity-50 border border-blue-600 rounded text-white"
              >
                <option value="text-2xl">קטן (2xl)</option>
                <option value="text-3xl">בינוני (3xl)</option>
                <option value="text-4xl">גדול (4xl)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-amber-900 bg-opacity-30 p-4 rounded-lg border border-amber-500 mb-6">
          <h3 className="text-lg font-bold text-amber-300 mb-2">הוראות שימוש</h3>
          <ul className="text-amber-200 space-y-1 text-sm">
            <li>• שנה את ההגדרות לפי הצורך</li>
            <li>• לחץ על "החל הגדרות" כדי לראות את השינויים</li>
            <li>• עבור ללוח כדי לראות את התוצאה</li>
            <li>• ההגדרות נשמרות רק לסשן הנוכחי</li>
          </ul>
        </div>

        <div className="flex justify-center gap-4">
          <Button 
            onClick={applySettings}
            className="bg-amber-500 hover:bg-amber-600 text-blue-900"
          >
            <Save className="w-4 h-4 ml-2" />
            החל הגדרות
          </Button>
          
          <Button 
            onClick={() => navigate(createPageUrl("Board"))}
            variant="outline"
            className="bg-blue-800 border-blue-700 hover:bg-blue-700"
          >
            <Monitor className="w-4 h-4 ml-2" />
            עבור ללוח
          </Button>
        </div>
      </div>
    </div>
  );
}