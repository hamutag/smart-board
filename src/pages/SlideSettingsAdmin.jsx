import React, { useState, useEffect } from 'react';
import { SlideSettings } from '@/api/entities';
import { DesignTemplate } from '@/api/entities';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Save, Upload, Image, Palette, Type, LayoutTemplate, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { compressImageFile } from '@/utils/imageCompression';

const SLIDE_NAMES = {
  WeekdayPrayerTimes: 'זמני תפילה - יום חול',
  Countdown: 'ספירה לאחור לנץ',
  ShabbatPrayerTimes: 'זמני תפילה - שבת',
  Community: 'קהילתינו היקרה',
  Brachot: 'ברכות ותפילות',
  Halachot: 'הלכות יומיות',
  AzkarahShavua: 'אזכרות השבוע',
  Refuah: 'רפואה שלמה',
  LeiluyNishmat: 'לעילוי נשמת',
  Modaot: 'הודעות ומודעות'
};

const DEFAULT_BACKGROUNDS = {
  WeekdayPrayerTimes: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cfca161c30a1349eddd330/cb7122786_Gemini_Generated_Image_yf3u9hyf3u9hyf3u.png',
  Countdown: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cfca161c30a1349eddd330/2854425e5_Gemini_Generated_Image_fuct9ufuct9ufuct.png',
  ShabbatPrayerTimes: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cfca161c30a1349eddd330/cea0045e5_Gemini_Generated_Image_fpiubofpiubofpiu1.png'
};

export default function SlideSettingsAdmin() {
  const [slides, setSlides] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSlide, setActiveSlide] = useState('ZmanimBoard');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);

  useEffect(() => {
    loadSettings();
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await DesignTemplate.list();
      setTemplates(data);
    } catch (err) {
      console.error("Error loading templates:", err);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await SlideSettings.list();
      const slidesMap = {};
      
      // Initialize all slides with defaults
      Object.keys(SLIDE_NAMES).forEach(name => {
        slidesMap[name] = {
          slide_name: name,
          background_image: DEFAULT_BACKGROUNDS[name] || '',
          background_opacity: 100,
          overlay_color: '#000000',
          overlay_opacity: 30,
          text_color: '#ffffff',
          accent_color: '#fbbf24',
          font_family: 'Rubik',
          active: true,
          // Additional design options
          border_width: 2,
          border_color: '#fbbf24',
          box_shadow: 'medium',
          text_shadow: 'medium'
        };
      });
      
      // Override with saved settings
      data.forEach(slide => {
        if (slide.slide_name) {
          slidesMap[slide.slide_name] = { ...slidesMap[slide.slide_name], ...slide };
        }
      });
      
      setSlides(slidesMap);
      
      // Force reload for cache busting
      setActiveSlide(prev => prev);
    } catch (err) {
      console.error("Error loading:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSlides(prev => ({
      ...prev,
      [activeSlide]: {
        ...prev[activeSlide],
        [field]: value
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      // Compress before upload (big data saver)
      const optimized = await compressImageFile(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.82,
        preserveAlpha: false,
        format: 'webp',
      });

      const { file_url } = await base44.integrations.Core.UploadFile({ file: optimized });
      handleChange('background_image', file_url);
      alert('תמונה הועלתה בהצלחה!');
    } catch (err) {
      console.error("Error uploading:", err);
      alert('שגיאה בהעלאת התמונה: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentSlide = slides[activeSlide];
      const existing = await SlideSettings.filter({ slide_name: activeSlide });
      
      if (existing.length > 0) {
        await SlideSettings.update(existing[0].id, currentSlide);
      } else {
        await SlideSettings.create(currentSlide);
      }
      alert('נשמר בהצלחה!');
    } catch (err) {
      console.error("Error saving:", err);
      alert('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const saveAsTemplate = async () => {
    if (!newTemplateName) return;
    try {
      const settingsToSave = { ...slides[activeSlide] };
      delete settingsToSave.id; 
      delete settingsToSave.slide_name;
      delete settingsToSave.active;
      
      await DesignTemplate.create({
        name: newTemplateName,
        settings: JSON.stringify(settingsToSave),
        description: `נוצר מתוך ${SLIDE_NAMES[activeSlide]}`
      });
      
      await loadTemplates();
      setNewTemplateName('');
      setShowSaveTemplateDialog(false);
      alert('תבנית נשמרה בהצלחה!');
    } catch (err) {
      console.error("Error saving template:", err);
      alert('שגיאה בשמירת התבנית');
    }
  };

  const applyTemplate = (template) => {
    try {
      const settings = JSON.parse(template.settings);
      setSlides(prev => ({
        ...prev,
        [activeSlide]: {
          ...prev[activeSlide],
          ...settings,
          slide_name: activeSlide // Keep the current slide name
        }
      }));
      alert(`תבנית "${template.name}" הוחלה בהצלחה! לחץ על "שמור" כדי לשמור את השינויים.`);
    } catch (err) {
      console.error("Error applying template:", err);
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm('האם למחוק תבנית זו?')) return;
    try {
      await DesignTemplate.delete(id);
      loadTemplates();
    } catch (err) {
      console.error("Error deleting template:", err);
    }
  };

  const currentSlide = slides[activeSlide] || {};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="bg-blue-800 border-blue-600 hover:bg-blue-700 text-white">
              <ArrowRight className="w-5 h-5 ml-2" />
              חזרה
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-amber-400">הגדרות עיצוב שקופיות</h1>
          <Button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-blue-900">
            <Save className="w-5 h-5 ml-2" />
            {saving ? 'שומר...' : 'שמור'}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Slide Selection */}
          <div className="col-span-1 bg-blue-800/40 rounded-xl p-4">
            <h3 className="text-lg font-bold text-amber-300 mb-4">בחר שקופית</h3>
            <div className="space-y-2">
              {Object.entries(SLIDE_NAMES).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => setActiveSlide(key)}
                  className={`w-full text-right p-3 rounded-lg transition-all ${
                    activeSlide === key 
                      ? 'bg-amber-500 text-blue-900 font-bold' 
                      : 'bg-blue-700/50 hover:bg-blue-700 text-white'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="col-span-3 space-y-6">
            {/* Preview */}
            <div className="bg-blue-800/40 rounded-xl p-4">
              <h3 className="text-lg font-bold text-amber-300 mb-4">תצוגה מקדימה</h3>
              <div 
                className="relative h-48 rounded-xl overflow-hidden"
                style={{
                  backgroundImage: currentSlide.background_image ? `url(${currentSlide.background_image})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: (currentSlide.background_opacity || 100) / 100
                }}
              >
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundColor: currentSlide.overlay_color || '#000000',
                    opacity: (currentSlide.overlay_opacity || 30) / 100
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <h2 
                      className="text-3xl font-bold mb-2"
                      style={{ 
                        color: currentSlide.accent_color || '#fbbf24',
                        fontFamily: `'${currentSlide.font_family || 'Rubik'}', sans-serif`
                      }}
                    >
                      {SLIDE_NAMES[activeSlide]}
                    </h2>
                    <p 
                      className="text-xl"
                      style={{ 
                        color: currentSlide.text_color || '#ffffff',
                        fontFamily: `'${currentSlide.font_family || 'Rubik'}', sans-serif`
                      }}
                    >
                      טקסט לדוגמה
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="background" className="w-full">
              <TabsList className="bg-blue-900 w-full">
                <TabsTrigger value="background" className="flex-1 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-blue-900">
                  <Image className="w-4 h-4 ml-2" />
                  רקע
                </TabsTrigger>
                <TabsTrigger value="colors" className="flex-1 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-blue-900">
                  <Palette className="w-4 h-4 ml-2" />
                  צבעים
                </TabsTrigger>
                <TabsTrigger value="typography" className="flex-1 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-blue-900">
                  <Type className="w-4 h-4 ml-2" />
                  טיפוגרפיה
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex-1 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-blue-900">
                  <LayoutTemplate className="w-4 h-4 ml-2" />
                  תבניות
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="bg-blue-800/40 rounded-xl p-6 mt-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">תבניות עיצוב</h3>
                  <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 ml-2" />
                        שמור עיצוב נוכחי כתבנית
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-blue-900 text-white border-blue-700">
                      <DialogHeader>
                        <DialogTitle>שמירת תבנית חדשה</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Label>שם התבנית</Label>
                        <Input 
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          className="bg-blue-800 border-blue-600 text-white"
                          placeholder="למשל: עיצוב זהב יוקרתי"
                        />
                        <Button onClick={saveAsTemplate} className="w-full bg-amber-500 text-blue-900 font-bold hover:bg-amber-600">
                          שמור תבנית
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.length > 0 ? (
                    templates.map(template => {
                      let parsedSettings = {};
                      try { parsedSettings = JSON.parse(template.settings); } catch {}
                      
                      return (
                        <div key={template.id} className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 flex gap-4 hover:border-amber-500 transition-colors">
                          <div 
                            className="w-20 h-20 rounded-md flex-shrink-0 border border-blue-600"
                            style={{
                              backgroundImage: parsedSettings.background_image ? `url(${parsedSettings.background_image})` : 'none',
                              backgroundColor: parsedSettings.overlay_color || '#000',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          ></div>
                          <div className="flex-grow">
                            <h4 className="font-bold text-amber-400 mb-1">{template.name}</h4>
                            <p className="text-xs text-blue-300 mb-3">{template.description}</p>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => applyTemplate(template)}
                                className="bg-blue-600 hover:bg-blue-700 text-xs h-8"
                              >
                                החל תבנית
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => deleteTemplate(template.id)}
                                className="text-red-400 hover:bg-red-900/20 h-8 w-8 p-0"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center p-8 text-blue-300 bg-blue-900/30 rounded-lg border border-dashed border-blue-700">
                      אין תבניות שמורות עדיין. עצב את השקופית ושמור אותה כתבנית לשימוש חוזר.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="background" className="bg-blue-800/40 rounded-xl p-6 mt-4">
                <div className="space-y-6">
                  <div>
                    <Label className="text-white text-lg mb-2 block">תמונת רקע</Label>
                    <div className="flex gap-4">
                      <Input
                        value={currentSlide.background_image || ''}
                        onChange={(e) => handleChange('background_image', e.target.value)}
                        className="bg-blue-900 border-blue-600 text-white flex-grow"
                        placeholder="URL של תמונה"
                      />
                      <Button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => document.getElementById('imageUpload').click()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="w-4 h-4 ml-2" />
                        {uploadingImage ? 'מעלה...' : 'העלה'}
                      </Button>
                      <input 
                        id="imageUpload"
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white text-lg mb-2 block">
                      שקיפות רקע: {currentSlide.background_opacity || 100}%
                    </Label>
                    <Slider
                      value={[currentSlide.background_opacity || 100]}
                      onValueChange={([v]) => handleChange('background_opacity', v)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-white text-lg mb-2 block">
                      שקיפות שכבת כיסוי: {currentSlide.overlay_opacity || 30}%
                    </Label>
                    <Slider
                      value={[currentSlide.overlay_opacity || 30]}
                      onValueChange={([v]) => handleChange('overlay_opacity', v)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-white text-lg mb-2 block">צבע שכבת כיסוי</Label>
                    <div className="flex gap-4 items-center">
                      <input
                        type="color"
                        value={currentSlide.overlay_color || '#000000'}
                        onChange={(e) => handleChange('overlay_color', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={currentSlide.overlay_color || '#000000'}
                        onChange={(e) => handleChange('overlay_color', e.target.value)}
                        className="bg-blue-900 border-blue-600 text-white w-32"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="colors" className="bg-blue-800/40 rounded-xl p-6 mt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white text-lg mb-2 block">צבע טקסט ראשי</Label>
                    <div className="flex gap-4 items-center">
                      <input
                        type="color"
                        value={currentSlide.text_color || '#ffffff'}
                        onChange={(e) => handleChange('text_color', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={currentSlide.text_color || '#ffffff'}
                        onChange={(e) => handleChange('text_color', e.target.value)}
                        className="bg-blue-900 border-blue-600 text-white w-32"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white text-lg mb-2 block">צבע הדגשה</Label>
                    <div className="flex gap-4 items-center">
                      <input
                        type="color"
                        value={currentSlide.accent_color || '#fbbf24'}
                        onChange={(e) => handleChange('accent_color', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={currentSlide.accent_color || '#fbbf24'}
                        onChange={(e) => handleChange('accent_color', e.target.value)}
                        className="bg-blue-900 border-blue-600 text-white w-32"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="typography" className="bg-blue-800/40 rounded-xl p-6 mt-4">
                <div className="space-y-6">
                  <div>
                    <Label className="text-white text-lg mb-2 block">פונט</Label>
                    <Select 
                      value={currentSlide.font_family || 'Rubik'} 
                      onValueChange={(v) => handleChange('font_family', v)}
                    >
                      <SelectTrigger className="bg-blue-900 border-blue-600 text-white w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-800">
                        <SelectItem value="Rubik" className="text-white">Rubik</SelectItem>
                        <SelectItem value="Frank Ruhl Libre" className="text-white">Frank Ruhl Libre</SelectItem>
                        <SelectItem value="Heebo" className="text-white">Heebo</SelectItem>
                        <SelectItem value="Assistant" className="text-white">Assistant</SelectItem>
                        <SelectItem value="David Libre" className="text-white">David Libre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-white text-lg mb-2 block">צל טקסט</Label>
                    <Select 
                      value={currentSlide.text_shadow || 'medium'} 
                      onValueChange={(v) => handleChange('text_shadow', v)}
                    >
                      <SelectTrigger className="bg-blue-900 border-blue-600 text-white w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-800">
                        <SelectItem value="none" className="text-white">ללא</SelectItem>
                        <SelectItem value="small" className="text-white">קטן</SelectItem>
                        <SelectItem value="medium" className="text-white">בינוני</SelectItem>
                        <SelectItem value="large" className="text-white">גדול</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-white text-lg mb-2 block">צל קופסאות</Label>
                    <Select 
                      value={currentSlide.box_shadow || 'medium'} 
                      onValueChange={(v) => handleChange('box_shadow', v)}
                    >
                      <SelectTrigger className="bg-blue-900 border-blue-600 text-white w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-800">
                        <SelectItem value="none" className="text-white">ללא</SelectItem>
                        <SelectItem value="small" className="text-white">קטן</SelectItem>
                        <SelectItem value="medium" className="text-white">בינוני</SelectItem>
                        <SelectItem value="large" className="text-white">גדול</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white text-lg mb-2 block">עובי מסגרות (px)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={currentSlide.border_width || 2}
                        onChange={(e) => handleChange('border_width', parseInt(e.target.value) || 0)}
                        className="bg-blue-900 border-blue-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-white text-lg mb-2 block">צבע מסגרות</Label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="color"
                          value={currentSlide.border_color || '#fbbf24'}
                          onChange={(e) => handleChange('border_color', e.target.value)}
                          className="w-16 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={currentSlide.border_color || '#fbbf24'}
                          onChange={(e) => handleChange('border_color', e.target.value)}
                          className="bg-blue-900 border-blue-600 text-white w-32"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}