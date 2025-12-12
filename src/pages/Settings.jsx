import React, { useState, useEffect } from 'react';
import { Settings } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, Save, Settings as SettingsIcon, Eye, Plus, Trash2, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { compressImageFile } from '@/utils/imageCompression';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dedication: "",
    location: "",
    latitude: 32.6123,
    longitude: 35.2897,
    display_mode: "רגיל",
    shacharit_time: "",
    mincha_time: "",
    arvit_time: "",
    daily_class_time: "",
    daily_class_title: "",
    sunrise_countdown_minutes: 40,
    shabbat_countdown_minutes: 70,
    brachot_per_page: 1,
    logo_url: "",
    logo_position: "top-right",
    logo_size: 120,
    community_box_color: "rgba(30, 64, 175, 0.8)",
    theme_preset: "default",
    global_font_size: 100,
    board_transition_speed: 1
    });
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
  const [showCountdownPreview, setShowCountdownPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsList = await Settings.list();
        if (settingsList.length > 0) {
          const settings = settingsList[0];
          setFormData({
            dedication: settings.dedication || "",
            location: settings.location || "",
            latitude: settings.latitude || 32.6123,
            longitude: settings.longitude || 35.2897,
            display_mode: settings.display_mode || "רגיל",
            shacharit_time: settings.shacharit_time || "",
            mincha_time: settings.mincha_time || "",
            arvit_time: settings.arvit_time || "",
            daily_class_time: settings.daily_class_time || "",
            daily_class_title: settings.daily_class_title || "",
            sunrise_countdown_minutes: settings.sunrise_countdown_minutes || 40,
            shabbat_countdown_minutes: settings.shabbat_countdown_minutes || 70,
            brachot_per_page: settings.brachot_per_page || 1,
            logo_url: settings.logo_url || "",
            logo_position: settings.logo_position || "top-right",
            logo_size: settings.logo_size || 120,
            community_box_color: settings.community_box_color || "rgba(30, 64, 175, 0.8)",
            theme_preset: settings.theme_preset || "default",
            global_font_size: settings.global_font_size || 100,
            board_transition_speed: settings.board_transition_speed || 1
            });
          setSettingsId(settings.id);
          
          // Load timelines
          if (settings.weekday_timeline) {
            try { setWeekdayTimeline(JSON.parse(settings.weekday_timeline)); } catch {}
          }
          if (settings.shabbat_timeline) {
            try { setShabbatTimeline(JSON.parse(settings.shabbat_timeline)); } catch {}
          }
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const dataToSave = {
        ...formData,
        weekday_timeline: JSON.stringify(weekdayTimeline),
        shabbat_timeline: JSON.stringify(shabbatTimeline)
      };
      
      if (settingsId) {
        await Settings.update(settingsId, dataToSave);
      } else {
        await Settings.create(dataToSave);
      }
      toast.success("ההגדרות נשמרו בהצלחה!");
      setTimeout(() => navigate(createPageUrl("Dashboard")), 1000);
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error("אירעה שגיאה בשמירת ההגדרות");
    } finally {
      setSaving(false);
    }
  };

  const addTimelineStage = (isShabbat) => {
    const setter = isShabbat ? setShabbatTimeline : setWeekdayTimeline;
    setter(prev => [...prev, { name: 'שלב חדש', offset: 5 }]);
  };

  const removeTimelineStage = (isShabbat, index) => {
    const setter = isShabbat ? setShabbatTimeline : setWeekdayTimeline;
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateTimelineStage = (isShabbat, index, field, value) => {
    const setter = isShabbat ? setShabbatTimeline : setWeekdayTimeline;
    setter(prev => prev.map((stage, i) => i === index ? { ...stage, [field]: value } : stage));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      // Compress before upload (big data saver)
      const optimized = await compressImageFile(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.9,
        preserveAlpha: true,
        format: 'png',
      });

      const { file_url } = await base44.integrations.Core.UploadFile({ file: optimized });
      
      // Try to remove background using AI
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Remove the background from this image and make it transparent. Return only the URL of the processed image with transparent background.`,
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              processed_url: { type: "string" }
            }
          }
        });
        
        if (result?.processed_url) {
          handleInputChange('logo_url', result.processed_url);
        } else {
          // If AI processing fails, use original
          handleInputChange('logo_url', file_url);
        }
      } catch (aiErr) {
        console.error("AI background removal failed, using original:", aiErr);
        handleInputChange('logo_url', file_url);
      }
      
      toast.success("לוגו הועלה בהצלחה!");
    } catch (err) {
      console.error("Error uploading logo:", err);
      toast.error("שגיאה בהעלאת הלוגו");
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="settings-page min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-4 md:p-8 rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="bg-blue-800 border-blue-700 hover:bg-blue-700 text-white ml-2"
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </Button>
          <div className="flex items-center">
            <SettingsIcon className="w-6 h-6 text-amber-400 ml-2" />
            <h1 className="text-2xl font-bold text-white">הגדרות לוח חכם ארנון</h1>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg border-2 border-blue-600">
            <h2 className="text-xl font-bold mb-4 text-amber-400">מידע כללי</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dedication" className="text-white text-lg font-semibold">הקדשה</Label>
                <Input
                  id="dedication"
                  value={formData.dedication}
                  onChange={(e) => handleInputChange('dedication', e.target.value)}
                  placeholder="הזן הקדשה לתצוגה בלוח"
                  className="bg-blue-900 border-blue-600 text-white text-lg placeholder:text-blue-400"
                />
              </div>

              <div>
                <Label htmlFor="logo_url" className="text-white text-lg font-semibold">לוגו</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="logo_url"
                      value={formData.logo_url || ''}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      placeholder="הכנס קישור ללוגו או העלה קובץ"
                      className="bg-blue-900 border-blue-600 text-white text-lg placeholder:text-blue-400 flex-grow"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('logo-file-input').click()}
                      disabled={uploadingLogo}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {uploadingLogo ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 ml-2" />
                          העלה קובץ
                        </>
                      )}
                    </Button>
                    <input
                      id="logo-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                  {formData.logo_url && (
                    <div className="bg-blue-900/50 p-2 rounded">
                      <img src={formData.logo_url} alt="Logo Preview" className="h-20 w-auto" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logo_position" className="text-white text-lg font-semibold">מיקום לוגו</Label>
                  <Select
                    value={formData.logo_position || 'top-right'}
                    onValueChange={(value) => handleInputChange('logo_position', value)}
                  >
                    <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                      <SelectValue placeholder="בחר מיקום" />
                    </SelectTrigger>
                    <SelectContent className="bg-blue-800">
                      <SelectItem value="top-right" className="text-white">למעלה מימין</SelectItem>
                      <SelectItem value="top-left" className="text-white">למעלה משמאל</SelectItem>
                      <SelectItem value="top-center" className="text-white">למעלה באמצע</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="logo_size" className="text-white text-lg font-semibold">גודל לוגו (px)</Label>
                  <Input
                    id="logo_size"
                    type="number"
                    min="50"
                    max="300"
                    value={formData.logo_size || 120}
                    onChange={(e) => handleInputChange('logo_size', parseInt(e.target.value))}
                    className="bg-blue-900 border-blue-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="display_mode" className="text-white text-lg font-semibold">מצב תצוגה</Label>
                <Select
                  value={formData.display_mode}
                  onValueChange={(value) => handleInputChange('display_mode', value)}
                >
                  <SelectTrigger className="bg-blue-900 border-blue-600 text-white text-lg">
                    <SelectValue placeholder="בחר מצב תצוגה" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-800">
                    <SelectItem value="רגיל" className="text-white">רגיל</SelectItem>
                    <SelectItem value="שבת" className="text-white">שבת</SelectItem>
                    <SelectItem value="אבל" className="text-white">אבל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg border-2 border-blue-600">
            <h2 className="text-xl font-bold mb-4 text-amber-400">זמני תפילות קבועים</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shacharit_time" className="text-white text-lg font-semibold">שחרית</Label>
                  <Input
                    id="shacharit_time"
                    value={formData.shacharit_time}
                    onChange={(e) => handleInputChange('shacharit_time', e.target.value)}
                    placeholder="06:00"
                    className="bg-blue-900 border-blue-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="mincha_time" className="text-white text-lg font-semibold">מנחה</Label>
                  <Input
                    id="mincha_time"
                    value={formData.mincha_time}
                    onChange={(e) => handleInputChange('mincha_time', e.target.value)}
                    placeholder="13:30"
                    className="bg-blue-900 border-blue-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="arvit_time" className="text-white text-lg font-semibold">ערבית</Label>
                  <Input
                    id="arvit_time"
                    value={formData.arvit_time}
                    onChange={(e) => handleInputChange('arvit_time', e.target.value)}
                    placeholder="19:00"
                    className="bg-blue-900 border-blue-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="daily_class_time" className="text-white text-lg font-semibold">שיעור יומי</Label>
                  <Input
                    id="daily_class_time"
                    value={formData.daily_class_time}
                    onChange={(e) => handleInputChange('daily_class_time', e.target.value)}
                    placeholder="20:00"
                    className="bg-blue-900 border-blue-600 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="daily_class_title" className="text-white text-lg font-semibold">שם השיעור</Label>
                <Input
                  id="daily_class_title"
                  value={formData.daily_class_title}
                  onChange={(e) => handleInputChange('daily_class_title', e.target.value)}
                  placeholder="שיעור גמרא"
                  className="bg-blue-900 border-blue-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Community Settings */}
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg border-2 border-blue-600">
            <h2 className="text-xl font-bold mb-4 text-amber-400">הגדרות דף קהילה</h2>
            <div>
                <Label htmlFor="community_box_color" className="text-white text-lg font-semibold mb-2 block">צבע רקע לתיבת הטקסט</Label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    value={formData.community_box_color || '#1e40af'}
                    onChange={(e) => handleInputChange('community_box_color', e.target.value)}
                    className="w-16 h-12 rounded cursor-pointer border-2 border-white"
                  />
                  <Input
                    id="community_box_color"
                    value={formData.community_box_color}
                    onChange={(e) => handleInputChange('community_box_color', e.target.value)}
                    placeholder="rgba(30, 64, 175, 0.8)"
                    className="bg-blue-900 border-blue-600 text-white text-lg ltr"
                  />
                </div>
                <p className="text-sm text-blue-300 mt-2">
                  ניתן לבחור צבע רגיל, או להזין ערך RGBA לשקיפות (למשל: rgba(0,0,0,0.5))
                </p>
            </div>
          </div>

          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg border-2 border-blue-600">
            <h2 className="text-xl font-bold mb-4 text-amber-400">מיקום</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="location" className="text-white text-lg font-semibold">מיקום (עיר)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="למשל: עפולה"
                  className="bg-blue-900 border-blue-600 text-white text-lg placeholder:text-blue-400"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude" className="text-white text-base font-semibold">קו רוחב (Latitude)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                    className="bg-blue-900 border-blue-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="longitude" className="text-white text-base font-semibold">קו אורך (Longitude)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                    className="bg-blue-900 border-blue-600 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg border-2 border-blue-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-amber-400">הגדרות ספירה לאחור</h2>
              <Button
                type="button"
                onClick={() => setShowCountdownPreview(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Eye className="w-4 h-4 ml-2" />
                תצוגה מקדימה
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sunrise_countdown_minutes" className="text-white text-lg font-semibold">זמן ספירה - יום חול (בדקות)</Label>
                  <Input
                    id="sunrise_countdown_minutes"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.sunrise_countdown_minutes}
                    onChange={(e) => handleInputChange('sunrise_countdown_minutes', parseInt(e.target.value))}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="shabbat_countdown_minutes" className="text-white text-lg font-semibold">זמן ספירה - שבת (בדקות)</Label>
                  <Input
                    id="shabbat_countdown_minutes"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.shabbat_countdown_minutes}
                    onChange={(e) => handleInputChange('shabbat_countdown_minutes', parseInt(e.target.value))}
                    className="bg-blue-900 border-blue-600 text-white text-lg"
                  />
                </div>
              </div>

              {/* Timeline Editor */}
              <Tabs defaultValue="weekday" className="mt-6">
                <TabsList className="bg-blue-900">
                  <TabsTrigger value="weekday" className="text-white">ציר זמן יום חול</TabsTrigger>
                  <TabsTrigger value="shabbat" className="text-white">ציר זמן שבת</TabsTrigger>
                </TabsList>
                
                <TabsContent value="weekday" className="mt-4">
                  <div className="space-y-2">
                    {weekdayTimeline.map((stage, index) => (
                      <div key={index} className="flex items-center gap-2 bg-blue-900/50 p-2 rounded-lg">
                        <Input
                          value={stage.name}
                          onChange={(e) => updateTimelineStage(false, index, 'name', e.target.value)}
                          className="bg-blue-800 border-blue-600 text-white flex-grow"
                          placeholder="שם השלב"
                        />
                        <Input
                          type="number"
                          value={stage.offset}
                          onChange={(e) => updateTimelineStage(false, index, 'offset', parseInt(e.target.value) || 0)}
                          className="bg-blue-800 border-blue-600 text-white w-24"
                          placeholder="דקות"
                        />
                        <span className="text-blue-300 text-sm">דק׳</span>
                        {index > 0 && (
                          <Button
                            type="button"
                            onClick={() => removeTimelineStage(false, index)}
                            size="icon"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => addTimelineStage(false)}
                      className="bg-green-600 hover:bg-green-700 mt-2"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      הוסף שלב
                    </Button>
                    <p className="text-sm text-blue-300">סה״כ: {weekdayTimeline.reduce((sum, s) => sum + s.offset, 0)} דקות</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="shabbat" className="mt-4">
                  <div className="space-y-2">
                    {shabbatTimeline.map((stage, index) => (
                      <div key={index} className="flex items-center gap-2 bg-blue-900/50 p-2 rounded-lg">
                        <Input
                          value={stage.name}
                          onChange={(e) => updateTimelineStage(true, index, 'name', e.target.value)}
                          className="bg-blue-800 border-blue-600 text-white flex-grow"
                          placeholder="שם השלב"
                        />
                        <Input
                          type="number"
                          value={stage.offset}
                          onChange={(e) => updateTimelineStage(true, index, 'offset', parseInt(e.target.value) || 0)}
                          className="bg-blue-800 border-blue-600 text-white w-24"
                          placeholder="דקות"
                        />
                        <span className="text-blue-300 text-sm">דק׳</span>
                        {index > 0 && (
                          <Button
                            type="button"
                            onClick={() => removeTimelineStage(true, index)}
                            size="icon"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => addTimelineStage(true)}
                      className="bg-green-600 hover:bg-green-700 mt-2"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      הוסף שלב
                    </Button>
                    <p className="text-sm text-blue-300">סה״כ: {shabbatTimeline.reduce((sum, s) => sum + s.offset, 0)} דקות</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Brachot Settings */}
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg border-2 border-blue-600">
            <h2 className="text-xl font-bold mb-4 text-amber-400">הגדרות ברכות</h2>
            <div>
              <Label htmlFor="brachot_per_page" className="text-white text-lg font-semibold">כמות ברכות בעמוד</Label>
              <Select
                value={String(formData.brachot_per_page)}
                onValueChange={(value) => handleInputChange('brachot_per_page', parseInt(value))}
              >
                <SelectTrigger className="bg-blue-900 border-blue-600 text-white text-lg w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-800">
                  <SelectItem value="1" className="text-white">1 ברכה</SelectItem>
                  <SelectItem value="2" className="text-white">2 ברכות</SelectItem>
                  <SelectItem value="3" className="text-white">3 ברכות</SelectItem>
                  <SelectItem value="4" className="text-white">4 ברכות</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* תצוגה וחוויית משתמש */}
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg border-2 border-blue-600">
            <h2 className="text-xl font-bold mb-4 text-amber-400">התאמה אישית ותצוגה</h2>
            
            <div className="space-y-6">
              {/* ערכת נושא */}
              <div>
                <Label className="text-white text-lg font-semibold mb-2 block">ערכת נושא</Label>
                <Select value={formData.theme_preset || 'default'} onValueChange={(value) => handleInputChange('theme_preset', value)}>
                  <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                    <SelectValue placeholder="בחר ערכת נושא" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-800">
                    <SelectItem value="default" className="text-white">ברירת מחדל</SelectItem>
                    <SelectItem value="dark" className="text-white">כהה</SelectItem>
                    <SelectItem value="light" className="text-white">בהיר</SelectItem>
                    <SelectItem value="ocean" className="text-white">אוקיינוס</SelectItem>
                    <SelectItem value="sunset" className="text-white">שקיעה</SelectItem>
                    <SelectItem value="forest" className="text-white">יער</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-blue-300 mt-1">משפיע על צבעים וסגנון כללי של הלוחות</p>
              </div>

              {/* גודל פונט */}
              <div>
                <Label className="text-white text-lg font-semibold mb-3 block">
                  גודל פונט גלובלי: {formData.global_font_size || 100}%
                </Label>
                <Slider 
                  value={[formData.global_font_size || 100]}
                  onValueChange={(value) => handleInputChange('global_font_size', value[0])}
                  min={80}
                  max={150}
                  step={5}
                  className="mt-2"
                />
                <p className="text-sm text-blue-300 mt-2">התאם את גודל הטקסט בכל הלוחות</p>
              </div>

              {/* מהירות מעבר */}
              <div>
                <Label className="text-white text-lg font-semibold mb-3 block">
                  מהירות מעבר בין לוחות: {formData.board_transition_speed || 1} שניות
                </Label>
                <Slider 
                  value={[formData.board_transition_speed || 1]}
                  onValueChange={(value) => handleInputChange('board_transition_speed', value[0])}
                  min={0.3}
                  max={3}
                  step={0.1}
                  className="mt-2"
                />
                <p className="text-sm text-blue-300 mt-2">קובע את מהירות האנימציה בין דפים</p>
              </div>
            </div>
          </div>

          {/* Import/Export Settings */}
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg border-2 border-blue-600">
            <h2 className="text-xl font-bold mb-4 text-amber-400">גיבוי ושחזור הגדרות</h2>
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={async () => {
                  try {
                     const allSettings = await Settings.list();
                     const slideSettings = await base44.entities.SlideSettings.list();
                     const exportData = {
                       settings: allSettings[0],
                       slideSettings: slideSettings,
                       timestamp: new Date().toISOString()
                     };
                     const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = `settings_backup_${new Date().toISOString().split('T')[0]}.json`;
                     document.body.appendChild(a);
                     a.click();
                     document.body.removeChild(a);
                     URL.revokeObjectURL(url);
                  } catch (err) {
                     console.error(err);
                     alert('שגיאה בייצוא הגדרות');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 ml-2 rotate-180" />
                ייצוא הגדרות לקובץ
              </Button>

              <div className="relative">
                <Button
                   type="button"
                   onClick={() => document.getElementById('import-settings').click()}
                   className="bg-green-600 hover:bg-green-700"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  ייבוא הגדרות מקובץ
                </Button>
                <input
                  id="import-settings"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      try {
                        const data = JSON.parse(event.target.result);
                        if (confirm('האם אתה בטוח שברצונך לשחזר הגדרות? פעולה זו תדרוס את ההגדרות הקיימות.')) {
                           // Import Settings
                           if (data.settings) {
                             const existing = await Settings.list();
                             if (existing.length > 0) {
                                await Settings.update(existing[0].id, data.settings);
                             } else {
                                await Settings.create(data.settings);
                             }
                           }

                           // Import Slide Settings
                           if (data.slideSettings && Array.isArray(data.slideSettings)) {
                              const existingSlides = await base44.entities.SlideSettings.list();
                              for (const slide of data.slideSettings) {
                                 const existing = existingSlides.find(s => s.slide_name === slide.slide_name);
                                 if (existing) {
                                    await base44.entities.SlideSettings.update(existing.id, slide);
                                 } else {
                                    await base44.entities.SlideSettings.create(slide);
                                 }
                              }
                           }
                           alert('הגדרות שוחזרו בהצלחה! מרענן...');
                           window.location.reload();
                        }
                      } catch (err) {
                         console.error(err);
                         alert('שגיאה בייבוא הגדרות: קובץ לא תקין');
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="bg-blue-700 border-blue-600 hover:bg-blue-600 text-white font-semibold"
            >
              ביטול
            </Button>
            <Button 
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold"
            >
              <Save className="w-4 h-4 ml-2" />
              שמור הגדרות
            </Button>
          </div>
        </form>

        {/* Countdown Preview Modal */}
        {showCountdownPreview && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
              <Button
                onClick={() => setShowCountdownPreview(false)}
                className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700"
              >
                סגור תצוגה מקדימה
              </Button>
              <div className="w-full h-full overflow-hidden rounded-xl">
                <iframe 
                  src={createPageUrl("CountdownPreview")}
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