import React, { useState, useEffect } from 'react';
import { CommunityGallery } from '@/api/entities';
import { CommunityMessage } from '@/api/entities';
import { Announcement } from '@/api/entities';
import { SlideSettings } from '@/api/entities';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Plus, Trash2, Save, Image, Eye, GripVertical, Edit, Upload, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SortableList from '@/components/admin/SortableList';
import { compressImageFile } from '@/utils/imageCompression';

export default function CommunityAdmin() {
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [messageId, setMessageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // Design Settings
  const [designSettings, setDesignSettings] = useState(null);
  const [designSaving, setDesignSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [imagesData, messagesData, slideSettingsData] = await Promise.all([
        CommunityGallery.filter({ active: true }, 'order'),
        CommunityMessage.list(),
        SlideSettings.filter({ slide_name: 'Community' })
      ]);
      
      setImages(imagesData.sort((a, b) => (a.order || 0) - (b.order || 0)));
      if (messagesData.length > 0) {
        setMessage(messagesData[0].content);
        setMessageId(messagesData[0].id);
      }
      
      if (slideSettingsData.length > 0) {
        setDesignSettings(slideSettingsData[0]);
      } else {
        // Initialize if not exists
        setDesignSettings({
          slide_name: 'Community',
          background_image: '',
          text_color: '#ffffff',
          accent_color: '#fbbf24',
          box_color: 'rgba(30, 41, 59, 0.6)',
          overlay_opacity: 0,
          overlay_color: '#000000',
          font_family: 'Rubik'
        });
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMessage = async () => {
    setSaving(true);
    try {
      if (messageId) {
        await CommunityMessage.update(messageId, { content: message });
      } else {
        await CommunityMessage.create({ content: message, active: true });
      }
      alert('ההודעה נשמרה בהצלחה!');
      loadData();
    } catch (err) {
      console.error("Error saving message:", err);
      alert('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl) {
      alert('נא להזין קישור לתמונה');
      return;
    }
    try {
      await CommunityGallery.create({
        image_url: newImageUrl,
        title: newImageTitle,
        order: images.length + 1,
        active: true
      });
      setNewImageUrl('');
      setNewImageTitle('');
      loadData();
    } catch (err) {
      console.error("Error adding image:", err);
      alert('שגיאה בהוספת תמונה');
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const optimized = await compressImageFile(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.82,
        preserveAlpha: false,
        format: 'webp',
      });

      const { file_url } = await base44.integrations.Core.UploadFile({ file: optimized });
      setNewImageUrl(file_url);
    } catch (err) {
      console.error("Error uploading image:", err);
      alert('שגיאה בהעלאת תמונה');
    }
  };

  const handleDeleteImage = async (id) => {
    if (!confirm('האם למחוק את התמונה?')) return;
    try {
      await CommunityGallery.delete(id);
      loadData();
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  const handleReorder = async (newItems) => {
    setImages(newItems); // Optimistic update
    try {
      // Update order in DB
      await Promise.all(newItems.map((item, index) => 
        CommunityGallery.update(item.id, { order: index + 1 })
      ));
    } catch (err) {
      console.error("Error updating order:", err);
      loadData(); // Revert on error
    }
  };

  // Design Handlers
  const handleDesignChange = (field, value) => {
    setDesignSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDesign = async () => {
    setDesignSaving(true);
    try {
      if (designSettings.id) {
        await SlideSettings.update(designSettings.id, designSettings);
      } else {
        await SlideSettings.create(designSettings);
      }
      alert('הגדרות עיצוב נשמרו בהצלחה!');
      // Reload to ensure we have the ID
      loadData();
    } catch (err) {
      console.error("Error saving design:", err);
      alert('שגיאה בשמירת עיצוב');
    } finally {
      setDesignSaving(false);
    }
  };

  const handleUploadBg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const optimized = await compressImageFile(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.82,
        preserveAlpha: false,
        format: 'webp',
      });

      const { file_url } = await base44.integrations.Core.UploadFile({ file: optimized });
      handleDesignChange('background_image', file_url);
    } catch (err) {
      console.error("Error uploading bg:", err);
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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="bg-blue-800 border-blue-600 hover:bg-blue-700 text-white">
              <ArrowRight className="w-5 h-5 ml-2" />
              חזרה לדשבורד
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-amber-400">ניהול עמוד קהילה</h1>
          <Button onClick={() => setShowPreview(true)} className="bg-green-600 hover:bg-green-700">
            <Eye className="w-5 h-5 ml-2" />
            תצוגה מקדימה
          </Button>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="bg-blue-800 w-full mb-6">
            <TabsTrigger value="content" className="flex-1 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-blue-900">
                <Image className="w-4 h-4 ml-2" />
                ניהול תוכן וגלריה
            </TabsTrigger>
            <TabsTrigger value="design" className="flex-1 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-blue-900">
                <Palette className="w-4 h-4 ml-2" />
                עיצוב וצבעים
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex-1 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-blue-900">
                <Edit className="w-4 h-4 ml-2" />
                ניהול מודעות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                     {/* Images Gallery with Drag and Drop */}
                    <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl border border-blue-700">
                    <h2 className="text-2xl font-bold text-amber-300 mb-4">גלריית תמונות ({images.length})</h2>
                    <p className="text-sm text-blue-300 mb-4">גרור את התמונות לשינוי סדר ההצגה</p>
                    {images.length > 0 ? (
                        <SortableList
                        items={images}
                        onReorder={handleReorder}
                        direction="horizontal"
                        className="grid grid-cols-2 md:grid-cols-3 gap-4"
                        renderItem={(img, index, dragHandleProps) => (
                            <div className="relative group bg-blue-900/50 rounded-lg overflow-hidden border border-blue-700 h-full">
                            <div 
                                {...dragHandleProps}
                                className="absolute top-2 left-2 z-10 p-1 bg-black/50 rounded cursor-grab active:cursor-grabbing hover:bg-black/70"
                            >
                                <GripVertical className="w-4 h-4 text-white" />
                            </div>
                            <img 
                                src={img.image_url} 
                                alt={img.title || 'תמונה'}
                                className="w-full h-32 object-cover"
                            />
                            <div className="p-2">
                                <p className="text-sm text-center text-blue-200 truncate">{img.title || `תמונה ${index + 1}`}</p>
                            </div>
                            <Button
                                onClick={() => handleDeleteImage(img.id)}
                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                size="icon"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            </div>
                        )}
                        />
                    ) : (
                        <p className="text-blue-300 text-center py-8 bg-blue-900/20 rounded-lg">אין תמונות בגלריה</p>
                    )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Add Image Section */}
                    <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl border border-blue-700">
                        <h2 className="text-xl font-bold text-amber-300 mb-4">הוספת תמונה</h2>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-white">קובץ תמונה</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUploadImage}
                                    className="bg-blue-900 border-blue-600 text-white mt-1"
                                />
                            </div>
                            <div className="text-center text-sm text-blue-300">- או -</div>
                            <div>
                                <Label className="text-white">קישור לתמונה</Label>
                                <Input
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    className="bg-blue-900 border-blue-600 text-white mt-1"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <Label className="text-white">כותרת (אופציונלי)</Label>
                                <Input
                                    value={newImageTitle}
                                    onChange={(e) => setNewImageTitle(e.target.value)}
                                    className="bg-blue-900 border-blue-600 text-white mt-1"
                                    placeholder="כותרת התמונה..."
                                />
                            </div>
                            <Button onClick={handleAddImage} className="w-full bg-green-600 hover:bg-green-700 mt-2">
                                <Plus className="w-5 h-5 ml-2" />
                                הוסף לגלריה
                            </Button>
                        </div>
                    </div>

                    {/* Ticker Message Section */}
                    <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl border border-blue-700">
                        <h2 className="text-xl font-bold text-amber-300 mb-4">הודעות רצות (פס תחתון)</h2>
                        <Label className="text-white mb-2 block">תוכן ההודעה</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-blue-900 border-blue-600 text-white text-lg mb-4"
                            placeholder="הזן הודעה לפס הרץ..."
                            rows={3}
                        />
                        <Button onClick={handleSaveMessage} disabled={saving} className="w-full bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold">
                            <Save className="w-5 h-5 ml-2" />
                            {saving ? 'שומר...' : 'עדכן פס רץ'}
                        </Button>
                    </div>
                </div>
            </div>
          </TabsContent>

          <TabsContent value="design">
            {designSettings ? (
                <div className="bg-blue-800 bg-opacity-40 p-8 rounded-xl border border-blue-700 max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-amber-300">עיצוב העמוד</h2>
                        <Button onClick={handleSaveDesign} disabled={designSaving} className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold">
                            <Save className="w-5 h-5 ml-2" />
                            {designSaving ? 'שומר...' : 'שמור שינויים'}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <Label className="text-lg mb-2 block">תמונת רקע</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={designSettings.background_image || ''}
                                        onChange={(e) => handleDesignChange('background_image', e.target.value)}
                                        className="bg-blue-900 border-blue-600 text-white"
                                        placeholder="URL של תמונה"
                                    />
                                    <Button type="button" onClick={() => document.getElementById('bg-upload').click()} className="bg-blue-700 hover:bg-blue-600">
                                        <Upload className="w-4 h-4" />
                                    </Button>
                                    <input id="bg-upload" type="file" accept="image/*" onChange={handleUploadBg} className="hidden" />
                                </div>
                                {designSettings.background_image && (
                                    <div className="mt-2 h-20 rounded bg-cover bg-center border border-blue-500" style={{ backgroundImage: `url(${designSettings.background_image})` }}></div>
                                )}
                            </div>

                            <div>
                                <Label className="text-lg mb-2 block">צבע טקסט ראשי</Label>
                                <div className="flex gap-4 items-center">
                                    <input 
                                        type="color" 
                                        value={designSettings.text_color || '#ffffff'}
                                        onChange={(e) => handleDesignChange('text_color', e.target.value)}
                                        className="w-12 h-12 rounded cursor-pointer"
                                    />
                                    <Input 
                                        value={designSettings.text_color || '#ffffff'} 
                                        onChange={(e) => handleDesignChange('text_color', e.target.value)}
                                        className="bg-blue-900 border-blue-600 text-white" 
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-lg mb-2 block">צבע הדגשה (כותרות ואייקונים)</Label>
                                <div className="flex gap-4 items-center">
                                    <input 
                                        type="color" 
                                        value={designSettings.accent_color || '#fbbf24'}
                                        onChange={(e) => handleDesignChange('accent_color', e.target.value)}
                                        className="w-12 h-12 rounded cursor-pointer"
                                    />
                                    <Input 
                                        value={designSettings.accent_color || '#fbbf24'} 
                                        onChange={(e) => handleDesignChange('accent_color', e.target.value)}
                                        className="bg-blue-900 border-blue-600 text-white" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                             <div>
                                <Label className="text-lg mb-2 block">צבע רקע תיבות (Box Color)</Label>
                                <div className="flex gap-4 items-center">
                                    <input 
                                        type="color" 
                                        value={designSettings.box_color?.startsWith('#') ? designSettings.box_color : '#1e293b'}
                                        onChange={(e) => handleDesignChange('box_color', e.target.value)}
                                        className="w-12 h-12 rounded cursor-pointer"
                                    />
                                    <Input 
                                        value={designSettings.box_color || 'rgba(30, 41, 59, 0.6)'} 
                                        onChange={(e) => handleDesignChange('box_color', e.target.value)}
                                        className="bg-blue-900 border-blue-600 text-white dir-ltr" 
                                    />
                                </div>
                                <p className="text-sm text-blue-300 mt-1">מומלץ להשתמש ב-RGBA לשקיפות (למשל rgba(0,0,0,0.5))</p>
                            </div>

                             <div>
                                <Label className="text-lg mb-2 block">שכבת כיסוי כהה על הרקע (%)</Label>
                                <Input 
                                    type="number" 
                                    min="0" max="100"
                                    value={designSettings.overlay_opacity || 0} 
                                    onChange={(e) => handleDesignChange('overlay_opacity', parseInt(e.target.value))}
                                    className="bg-blue-900 border-blue-600 text-white" 
                                />
                            </div>

                            <div>
                                <Label className="text-lg mb-2 block">פונט</Label>
                                <select 
                                    value={designSettings.font_family || 'Rubik'}
                                    onChange={(e) => handleDesignChange('font_family', e.target.value)}
                                    className="w-full bg-blue-900 border border-blue-600 text-white rounded p-2"
                                >
                                    <option value="Rubik">Rubik</option>
                                    <option value="Frank Ruhl Libre">Frank Ruhl Libre</option>
                                    <option value="Heebo">Heebo</option>
                                    <option value="Assistant">Assistant</option>
                                    <option value="David Libre">David Libre</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center p-10">טוען הגדרות עיצוב...</div>
            )}
          </TabsContent>
          
          <TabsContent value="announcements">
              <div className="bg-blue-800 bg-opacity-40 p-8 rounded-xl border border-blue-700 text-center">
                  <h2 className="text-2xl font-bold text-amber-300 mb-6">ניהול מודעות הקהילה</h2>
                  <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
                      מודעות הקהילה מנוהלות בממשק נפרד המאפשר שליטה מלאה על תאריכי תפוגה, תעדופים ועוד.
                  </p>
                  <Link to={createPageUrl("Announcements")}>
                      <Button className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold text-lg px-8 py-6">
                          מעבר לניהול המודעות
                          <ArrowRight className="w-6 h-6 mr-2" />
                      </Button>
                  </Link>
              </div>
          </TabsContent>
        </Tabs>
      </div>

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
                src={createPageUrl("CommunityPreview")}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}