import React, { useState } from 'react';
import { DailyZmanim } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save } from 'lucide-react';

export default function QuickZmanimEditor({ dailyZmanim, onClose }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    sunrise: dailyZmanim?.sunrise || '',
    sunset: dailyZmanim?.sunset || '',
    tzeit: dailyZmanim?.tzeit || '',
    zman_talit: dailyZmanim?.zman_talit || '',
    mincha_gedola: dailyZmanim?.mincha_gedola || '',
    arvit: dailyZmanim?.arvit || '',
    candles: dailyZmanim?.candles || '',
    havdalah: dailyZmanim?.havdalah || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!dailyZmanim?.id) {
      alert('לא נמצאה רשומה לעריכה');
      return;
    }

    setSaving(true);
    try {
      await DailyZmanim.update(dailyZmanim.id, formData);
      alert('הנתונים עודכנו בהצלחה!');
      window.location.reload();
    } catch (err) {
      console.error('Error saving:', err);
      alert('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-blue-900 border-4 border-blue-600 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-amber-400">עריכה מהירה - {dailyZmanim?.date}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:text-red-400">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-white text-lg font-semibold">הנץ החמה</Label>
            <Input 
              name="sunrise" 
              value={formData.sunrise} 
              onChange={handleChange} 
              className="bg-blue-800 border-blue-600 text-white text-xl" 
              placeholder="06:30" 
            />
          </div>

          <div>
            <Label className="text-white text-lg font-semibold">זמן טלית ותפילין</Label>
            <Input 
              name="zman_talit" 
              value={formData.zman_talit} 
              onChange={handleChange} 
              className="bg-blue-800 border-blue-600 text-white text-xl" 
              placeholder="05:45" 
            />
          </div>

          <div>
            <Label className="text-white text-lg font-semibold">מנחה גדולה</Label>
            <Input 
              name="mincha_gedola" 
              value={formData.mincha_gedola} 
              onChange={handleChange} 
              className="bg-blue-800 border-blue-600 text-white text-xl" 
              placeholder="12:30" 
            />
          </div>

          <div>
            <Label className="text-white text-lg font-semibold">שקיעה</Label>
            <Input 
              name="sunset" 
              value={formData.sunset} 
              onChange={handleChange} 
              className="bg-blue-800 border-blue-600 text-white text-xl" 
              placeholder="17:15" 
            />
          </div>

          <div>
            <Label className="text-white text-lg font-semibold">צאת הכוכבים</Label>
            <Input 
              name="tzeit" 
              value={formData.tzeit} 
              onChange={handleChange} 
              className="bg-blue-800 border-blue-600 text-white text-xl" 
              placeholder="17:45" 
            />
          </div>

          <div>
            <Label className="text-white text-lg font-semibold">ערבית</Label>
            <Input 
              name="arvit" 
              value={formData.arvit} 
              onChange={handleChange} 
              className="bg-blue-800 border-blue-600 text-white text-xl" 
              placeholder="19:00" 
            />
          </div>

          <div>
            <Label className="text-white text-lg font-semibold">הדלקת נרות</Label>
            <Input 
              name="candles" 
              value={formData.candles} 
              onChange={handleChange} 
              className="bg-blue-800 border-blue-600 text-white text-xl" 
              placeholder="17:00" 
            />
          </div>

          <div>
            <Label className="text-white text-lg font-semibold">הבדלה</Label>
            <Input 
              name="havdalah" 
              value={formData.havdalah} 
              onChange={handleChange} 
              className="bg-blue-800 border-blue-600 text-white text-xl" 
              placeholder="18:15" 
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button onClick={onClose} variant="outline" className="bg-blue-700 border-blue-600 hover:bg-blue-600 text-white font-semibold">
            ביטול
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white font-bold">
            <Save className="w-5 h-5 ml-2" />
            {saving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </div>
      </div>
    </div>
  );
}