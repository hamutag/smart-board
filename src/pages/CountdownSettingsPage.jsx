import React, { useState, useEffect } from 'react';
import { Settings } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Save, Eye, Plus, Trash2, Clock, Image as ImageIcon } from 'lucide-react';

export default function CountdownSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [weekdayMinutes, setWeekdayMinutes] = useState(40);
  const [shabbatMinutes, setShabbatMinutes] = useState(70);

  // רקע (גלובלי דרך Settings, אם קיים אצלך)
  const [countdownBackgroundImage, setCountdownBackgroundImage] = useState('');
  const [countdownBgOpacity, setCountdownBgOpacity] = useState(100);

  const [weekdayTimeline, setWeekdayTimeline] = useState([
    { name: 'תחילת תפילה', offset: 0 },
    { name: 'הודו', offset: 10 },
    { name: 'פסוקי דזמרה', offset: 10 },
    { name: 'ישתבח', offset: 10 },
    { name: 'עמידה', offset: 10 }
  ]);

  const [shabbatTimeline, setShabbatTimeline] = useState([
    { name: 'תחילת תפילה', offset: 0 },
    { name: 'הודו', offset: 20 },
    { name: 'ברוך שאמר', offset: 20 },
    { name: 'נשמת כל חי', offset: 13 },
    { name: 'קדי ברכו', offset: 7 },
    { name: 'שמע', offset: 5 },
    { name: 'עמידה', offset: 5 }
  ]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsList = await Settings.list();
      if (settingsList.length > 0) {
        const s = settingsList[0];
        setSettingsId(s.id);

        setWeekdayMinutes(s.sunrise_countdown_minutes || 40);
        setShabbatMinutes(s.shabbat_countdown_minutes || 70);

        // רקע (אם קיים ב DB)
        setCountdownBackgroundImage(s.countdown_background_image || '');
        setCountdownBgOpacity(
          typeof s.countdown_bg_opacity === 'number' ? s.countdown_bg_opacity : 100
        );

        if (s.weekday_timeline) {
          try { setWeekdayTimeline(JSON.parse(s.weekday_timeline)); } catch {}
        }
        if (s.shabbat_timeline) {
          try { setShabbatTimeline(JSON.parse(s.shabbat_timeline)); } catch {}
        }
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        sunrise_countdown_minutes: weekdayMinutes,
        shabbat_countdown_minutes: shabbatMinutes,
        weekday_timeline: JSON.stringify(weekdayTimeline),
        shabbat_timeline: JSON.stringify(shabbatTimeline),

        // רקע (גלובלי)
        countdown_background_image: countdownBackgroundImage,
        countdown_bg_opacity: countdownBgOpacity
      };

      if (settingsId) {
        await Settings.update(settingsId, data);
      } else {
        await Settings.create(data);
      }
      alert('ההגדרות נשמרו בהצלחה');
    } catch (err) {
      console.error("Error saving:", err);
      alert('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const addStage = (isShabbat) => {
    const setter = isShabbat ? setShabbatTimeline : setWeekdayTimeline;
    setter(prev => [...prev, { name: 'שלב חדש', offset: 5 }]);
  };

  const removeStage = (isShabbat, index) => {
    const setter = isShabbat ? setShabbatTimeline : setWeekdayTimeline;
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateStage = (isShabbat, index, field, value) => {
    const setter = isShabbat ? setShabbatTimeline : setWeekdayTimeline;
    setter(prev => prev.map((stage, i) => i === index ? { ...stage, [field]: value } : stage));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="bg-blue-800 border-blue-600 hover:bg-blue-700 text-white">
              <ArrowRight className="w-5 h-5 ml-2" />
              חזרה
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-amber-400 flex items-center gap-3">
            <Clock className="w-8 h-8" />
            הגדרות ספירה לאחור
          </h1>

          <Button onClick={() => setShowPreview(true)} className="bg-green-600 hover:bg-green-700">
            <Eye className="w-5 h-5 ml-2" />
            תצוגה מקדימה
          </Button>
        </div>

        <div className="space-y-6">
          {/* Duration Settings */}
          <div className="bg-blue-800/40 p-6 rounded-xl border-2 border-blue-600">
            <h2 className="text-xl font-bold text-amber-300 mb-4">זמני ספירה</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-white text-lg">יום חול (דקות לפני הנץ)</Label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={weekdayMinutes}
                  onChange={(e) => setWeekdayMinutes(parseInt(e.target.value) || 1)}
                  className="bg-blue-900 border-blue-600 text-white text-xl"
                />
              </div>
              <div>
                <Label className="text-white text-lg">שבת (דקות לפני הנץ)</Label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={shabbatMinutes}
                  onChange={(e) => setShabbatMinutes(parseInt(e.target.value) || 1)}
                  className="bg-blue-900 border-blue-600 text-white text-xl"
                />
              </div>
            </div>
          </div>

          {/* Background Settings (Global) */}
          <div className="bg-blue-800/40 p-6 rounded-xl border-2 border-blue-600">
            <h2 className="text-xl font-bold text-amber-300 mb-4 flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              רקע לספירה (גלובלי)
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-white text-lg">URL תמונת רקע</Label>
                <Input
                  value={countdownBackgroundImage}
                  onChange={(e) => setCountdownBackgroundImage(e.target.value)}
                  placeholder="https://..."
                  className="bg-blue-900 border-blue-600 text-white"
                />
                <div className="text-xs text-blue-200 mt-2">
                  אם הרקע מנוהל אצלך ב SlideSettings של Countdown, הוא ינצח גם אם תשנה פה.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-white text-lg">שקיפות רקע (0 עד 100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={countdownBgOpacity}
                    onChange={(e) => setCountdownBgOpacity(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="bg-blue-900 border-blue-600 text-white"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    className="bg-slate-700 hover:bg-slate-800 w-full"
                    onClick={() => {
                      console.log('settings.countdown_background_image:', countdownBackgroundImage);
                      console.log('settings.countdown_bg_opacity:', countdownBgOpacity);
                      alert('הודפס לקונסול');
                    }}
                  >
                    בדיקת ערכים בקונסול
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Editor */}
          <div className="bg-blue-800/40 p-6 rounded-xl border-2 border-blue-600">
            <h2 className="text-xl font-bold text-amber-300 mb-4">ציר זמן תפילה</h2>

            <Tabs defaultValue="weekday">
              <TabsList className="bg-blue-900 mb-4">
                <TabsTrigger value="weekday" className="text-white data-[state=active]:bg-amber-500 data-[state=active]:text-blue-900">
                  יום חול ({weekdayTimeline.reduce((s, t) => s + t.offset, 0)} דקות)
                </TabsTrigger>
                <TabsTrigger value="shabbat" className="text-white data-[state=active]:bg-amber-500 data-[state=active]:text-blue-900">
                  שבת ({shabbatTimeline.reduce((s, t) => s + t.offset, 0)} דקות)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="weekday">
                <div className="space-y-3">
                  {weekdayTimeline.map((stage, index) => (
                    <div key={index} className="flex items-center gap-3 bg-blue-900/50 p-3 rounded-lg">
                      <span className="text-amber-300 font-bold w-8">{index + 1}.</span>
                      <Input
                        value={stage.name}
                        onChange={(e) => updateStage(false, index, 'name', e.target.value)}
                        className="bg-blue-800 border-blue-600 text-white flex-grow"
                      />
                      <Input
                        type="number"
                        value={stage.offset}
                        onChange={(e) => updateStage(false, index, 'offset', parseInt(e.target.value) || 0)}
                        className="bg-blue-800 border-blue-600 text-white w-24"
                      />
                      <span className="text-blue-300">דקות</span>
                      {index > 0 && (
                        <Button onClick={() => removeStage(false, index)} size="icon" className="bg-red-600 hover:bg-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button onClick={() => addStage(false)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 ml-2" />
                    הוסף שלב
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="shabbat">
                <div className="space-y-3">
                  {shabbatTimeline.map((stage, index) => (
                    <div key={index} className="flex items-center gap-3 bg-blue-900/50 p-3 rounded-lg">
                      <span className="text-amber-300 font-bold w-8">{index + 1}.</span>
                      <Input
                        value={stage.name}
                        onChange={(e) => updateStage(true, index, 'name', e.target.value)}
                        className="bg-blue-800 border-blue-600 text-white flex-grow"
                      />
                      <Input
                        type="number"
                        value={stage.offset}
                        onChange={(e) => updateStage(true, index, 'offset', parseInt(e.target.value) || 0)}
                        className="bg-blue-800 border-blue-600 text-white w-24"
                      />
                      <span className="text-blue-300">דקות</span>
                      {index > 0 && (
                        <Button onClick={() => removeStage(true, index)} size="icon" className="bg-red-600 hover:bg-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button onClick={() => addStage(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 ml-2" />
                    הוסף שלב
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-amber-500 hover:bg-amber-600 text-blue-900 text-xl py-6">
            <Save className="w-6 h-6 ml-2" />
            {saving ? 'שומר...' : 'שמור הגדרות'}
          </Button>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
              <Button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700"
              >
                סגור
              </Button>
              <div className="w-full h-full overflow-hidden rounded-xl">
                <iframe
                  src={createPageUrl("CountdownPreview")}
                  className="w-full h-full border-0"
                  title="Countdown Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
