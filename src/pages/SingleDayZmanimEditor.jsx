import React, { useState, useEffect } from 'react';
import { DailyZmanim } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Calendar, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function SingleDayZmanimEditor() {
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    alot: '',
    sunrise: '',
    sunset: '',
    tzeit: '',
    tzeit_rt: '',
    parasha: '',
    rosh_chodesh: '',
    candles: '',
    havdalah: '',
    mincha: '',
    class: '',
    zman_talit: '',
    mincha_gedola: '',
    molad: '',
    arvit: '',
    hebrew_date: '',
    omer: ''
  });

  const loadDate = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    try {
      const records = await DailyZmanim.filter({ date: selectedDate });
      if (records.length > 0) {
        setRecord(records[0]);
        setFormData({
          date: records[0].date || '',
          alot: records[0].alot || '',
          sunrise: records[0].sunrise || '',
          sunset: records[0].sunset || '',
          tzeit: records[0].tzeit || '',
          tzeit_rt: records[0].tzeit_rt || '',
          parasha: records[0].parasha || '',
          rosh_chodesh: records[0].rosh_chodesh || '',
          candles: records[0].candles || '',
          havdalah: records[0].havdalah || '',
          mincha: records[0].mincha || '',
          class: records[0].class || '',
          zman_talit: records[0].zman_talit || '',
          mincha_gedola: records[0].mincha_gedola || '',
          molad: records[0].molad || '',
          arvit: records[0].arvit || '',
          hebrew_date: records[0].hebrew_date || '',
          omer: records[0].omer || ''
        });
      } else {
        setRecord(null);
        setFormData({
          date: selectedDate,
          alot: '',
          sunrise: '',
          sunset: '',
          tzeit: '',
          tzeit_rt: '',
          parasha: '',
          rosh_chodesh: '',
          candles: '',
          havdalah: '',
          mincha: '',
          class: '',
          zman_talit: '',
          mincha_gedola: '',
          molad: '',
          arvit: '',
          hebrew_date: '',
          omer: ''
        });
      }
    } catch (err) {
      console.error("Error loading date:", err);
      alert("שגיאה בטעינת התאריך");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.date) {
      alert("חובה להזין תאריך");
      return;
    }

    setSaving(true);
    try {
      if (record) {
        await DailyZmanim.update(record.id, formData);
        alert("הנתונים עודכנו בהצלחה!");
      } else {
        await DailyZmanim.create(formData);
        alert("רשומה חדשה נוצרה בהצלחה!");
      }
      await loadDate();
    } catch (err) {
      console.error("Error saving:", err);
      alert("שגיאה בשמירת הנתונים");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="bg-blue-800 border-blue-600 hover:bg-blue-700 text-white">
              <ArrowRight className="w-5 h-5 ml-2" />
              חזרה לדשבורד
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-amber-400">עריכת יום בודד</h1>
        </div>

        {/* Date Selector */}
        <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl mb-6">
          <Label className="text-white text-lg mb-2">בחר תאריך לעריכה</Label>
          <div className="flex gap-4 mt-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-blue-900 border-blue-600 text-white flex-1"
            />
            <Button onClick={loadDate} disabled={!selectedDate || loading} className="bg-amber-500 hover:bg-amber-600 text-blue-900">
              <Calendar className="w-5 h-5 ml-2" />
              {loading ? 'טוען...' : 'טען תאריך'}
            </Button>
          </div>
        </div>

        {/* Form */}
        {selectedDate && (
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-amber-300 mb-6">
              {record ? `עריכת תאריך: ${formData.date}` : `יצירת רשומה חדשה: ${selectedDate}`}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white">תאריך עברי</Label>
                <Input name="hebrew_date" value={formData.hebrew_date} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="כ״ג כסלו תשפ״ה" />
              </div>

              <div>
                <Label className="text-white">פרשת השבוע</Label>
                <Input name="parasha" value={formData.parasha} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="בראשית" />
              </div>

              <div>
                <Label className="text-white">עלות השחר</Label>
                <Input name="alot" value={formData.alot} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="05:15" />
              </div>

              <div>
                <Label className="text-white">זמן טלית ותפילין</Label>
                <Input name="zman_talit" value={formData.zman_talit} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="05:45" />
              </div>

              <div>
                <Label className="text-white">הנץ החמה</Label>
                <Input name="sunrise" value={formData.sunrise} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="06:30" />
              </div>

              <div>
                <Label className="text-white">מנחה גדולה</Label>
                <Input name="mincha_gedola" value={formData.mincha_gedola} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="12:30" />
              </div>

              <div>
                <Label className="text-white">מנחה</Label>
                <Input name="mincha" value={formData.mincha} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="16:45" />
              </div>

              <div>
                <Label className="text-white">שקיעה</Label>
                <Input name="sunset" value={formData.sunset} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="17:15" />
              </div>

              <div>
                <Label className="text-white">צאת הכוכבים</Label>
                <Input name="tzeit" value={formData.tzeit} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="17:45" />
              </div>

              <div>
                <Label className="text-white">צאת הכוכבים (רבנו תם)</Label>
                <Input name="tzeit_rt" value={formData.tzeit_rt} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="18:30" />
              </div>

              <div>
                <Label className="text-white">ערבית</Label>
                <Input name="arvit" value={formData.arvit} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="19:00" />
              </div>

              <div>
                <Label className="text-white">שיעור</Label>
                <Input name="class" value={formData.class} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="20:00" />
              </div>

              <div>
                <Label className="text-white">הדלקת נרות</Label>
                <Input name="candles" value={formData.candles} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="17:00" />
              </div>

              <div>
                <Label className="text-white">הבדלה</Label>
                <Input name="havdalah" value={formData.havdalah} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="18:15" />
              </div>

              <div className="md:col-span-2">
                <Label className="text-white">ראש חודש</Label>
                <Input name="rosh_chodesh" value={formData.rosh_chodesh} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="ראש חודש כסלו" />
              </div>

              <div className="md:col-span-2">
                <Label className="text-white">מולד</Label>
                <Input name="molad" value={formData.molad} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="יום רביעי בשעה 14:30" />
              </div>

              <div className="md:col-span-2">
                <Label className="text-white">ספירת העומר</Label>
                <Textarea name="omer" value={formData.omer} onChange={handleInputChange} className="bg-blue-900 border-blue-600 text-white" placeholder="היום עשרים יום לעומר..." rows={3} />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                <Save className="w-5 h-5 ml-2" />
                {saving ? 'שומר...' : record ? 'עדכן' : 'צור'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}