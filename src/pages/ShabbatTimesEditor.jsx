import React, { useState, useEffect } from 'react';
import { ShabbatTimes } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Calendar, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ShabbatTimesEditor() {
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    candle_lighting: '',
    shabbat_ends: '',
    shabbat_ends_rt: '',
    friday_mincha: '',
    friday_arvit: '',
    shabbat_tefila_start: '',
    shabbat_sunrise: '',
    shabbat_shacharit: '',
    shabbat_mincha_gedola: '',
    shabbat_shiur_2: '',
    shabbat_shiur_3: '',
    shabbat_mincha_ketana: '',
    shabbat_arvit: '',
    active: true
  });

  useEffect(() => {
    const getNextFriday = () => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilFriday = dayOfWeek === 5 ? 0 : (5 - dayOfWeek + 7) % 7;
      const nextFriday = new Date(today);
      nextFriday.setDate(today.getDate() + daysUntilFriday);
      return nextFriday.toISOString().split('T')[0];
    };
    setSelectedDate(getNextFriday());
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadShabbatTimes();
    }
  }, [selectedDate]);

  const loadShabbatTimes = async () => {
    setLoading(true);
    try {
      const records = await ShabbatTimes.filter({ date: selectedDate });
      if (records.length > 0) {
        const record = records[0];
        setCurrentRecord(record);
        setFormData({
          candle_lighting: record.candle_lighting || '',
          shabbat_ends: record.shabbat_ends || '',
          shabbat_ends_rt: record.shabbat_ends_rt || '',
          friday_mincha: record.friday_mincha || '',
          friday_arvit: record.friday_arvit || '',
          shabbat_tefila_start: record.shabbat_tefila_start || '',
          shabbat_sunrise: record.shabbat_sunrise || '',
          shabbat_shacharit: record.shabbat_shacharit || '',
          shabbat_mincha_gedola: record.shabbat_mincha_gedola || '',
          shabbat_shiur_2: record.shabbat_shiur_2 || '',
          shabbat_shiur_3: record.shabbat_shiur_3 || '',
          shabbat_mincha_ketana: record.shabbat_mincha_ketana || '',
          shabbat_arvit: record.shabbat_arvit || '',
          active: record.active !== false
        });
      } else {
        setCurrentRecord(null);
        setFormData({
          candle_lighting: '',
          shabbat_ends: '',
          shabbat_ends_rt: '',
          friday_mincha: '',
          friday_arvit: '',
          shabbat_tefila_start: '',
          shabbat_sunrise: '',
          shabbat_shacharit: '',
          shabbat_mincha_gedola: '',
          shabbat_shiur_2: '',
          shabbat_shiur_3: '',
          shabbat_mincha_ketana: '',
          shabbat_arvit: '',
          active: true
        });
      }
    } catch (err) {
      console.error("Error loading Shabbat times:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        date: selectedDate
      };

      if (currentRecord) {
        await ShabbatTimes.update(currentRecord.id, dataToSave);
      } else {
        await ShabbatTimes.create(dataToSave);
      }
      
      alert('זמני שבת נשמרו בהצלחה!');
      await loadShabbatTimes();
    } catch (err) {
      console.error("Error saving Shabbat times:", err);
      alert('שגיאה בשמירת זמני שבת');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="bg-blue-800 border-blue-600 hover:bg-blue-700 text-white">
              <ArrowRight className="w-5 h-5 ml-2" />
              חזרה לדשבורד
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-amber-400">עריכת זמני שבת</h1>
          <Button onClick={() => setShowPreview(true)} className="bg-green-600 hover:bg-green-700 text-white">
            <Eye className="w-5 h-5 ml-2" />
            תצוגה מקדימה
          </Button>
        </div>

        <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl mb-6">
          <Label className="text-white text-lg mb-2 block">בחר שבת</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-blue-900 border-blue-600 text-white text-lg max-w-xs"
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-amber-300 mb-6">זמני ערב שבת (יום שישי)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white text-lg">כניסת שבת</Label>
                  <Input
                    type="time"
                    name="candle_lighting"
                    value={formData.candle_lighting}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>

                <div>
                  <Label className="text-white text-lg">יציאת שבת</Label>
                  <Input
                    type="time"
                    name="shabbat_ends"
                    value={formData.shabbat_ends}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>

                <div>
                  <Label className="text-white text-lg">יציאת שבת לר"ת</Label>
                  <Input
                    type="time"
                    name="shabbat_ends_rt"
                    value={formData.shabbat_ends_rt}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>

                <div>
                  <Label className="text-white text-lg">תפילת מנחה</Label>
                  <Input
                    type="time"
                    name="friday_mincha"
                    value={formData.friday_mincha}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>

                <div>
                  <Label className="text-white text-lg">ערבית ערב שבת</Label>
                  <Input
                    type="time"
                    name="friday_arvit"
                    value={formData.friday_arvit}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-amber-300 mb-6">זמני יום שבת</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white text-lg">תחילת תפילה בנץ</Label>
                  <Input
                    type="time"
                    name="shabbat_tefila_start"
                    value={formData.shabbat_tefila_start}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>

                <div>
                  <Label className="text-white text-lg">זמן הנץ</Label>
                  <Input
                    type="time"
                    name="shabbat_sunrise"
                    value={formData.shabbat_sunrise}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>

                <div>
                  <Label className="text-white text-lg">תפילת שחרית ב</Label>
                  <Input
                    type="time"
                    name="shabbat_shacharit"
                    value={formData.shabbat_shacharit}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>

                <div>
                  <Label className="text-white text-lg">מנחה גדולה</Label>
                  <Input
                    type="time"
                    name="shabbat_mincha_gedola"
                    value={formData.shabbat_mincha_gedola}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>

                <div>
                  <Label className="text-white text-lg">שיעור 2</Label>
                  <Input
                    type="time"
                    name="shabbat_shiur_2"
                    value={formData.shabbat_shiur_2}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>

                <div>
                  <Label className="text-white text-lg">שיעור 3</Label>
                  <Input
                    type="time"
                    name="shabbat_shiur_3"
                    value={formData.shabbat_shiur_3}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>

                <div>
                  <Label className="text-white text-lg">מנחה קטנה</Label>
                  <Input
                    type="time"
                    name="shabbat_mincha_ketana"
                    value={formData.shabbat_mincha_ketana}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>

                <div>
                  <Label className="text-white text-lg">ערבית מוצ"ש</Label>
                  <Input
                    type="time"
                    name="shabbat_arvit"
                    value={formData.shabbat_arvit}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-6"
              >
                <Save className="w-5 h-5 ml-2" />
                {saving ? 'שומר...' : currentRecord ? 'עדכן זמני שבת' : 'צור זמני שבת'}
              </Button>
            </div>
          </form>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
              <Button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700"
              >
                סגור תצוגה מקדימה
              </Button>
              <div className="w-full h-full overflow-hidden rounded-xl">
                <iframe 
                  src={createPageUrl("ShabbatTimesPreview")}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}