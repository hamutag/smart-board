import React, { useState, useEffect } from 'react';
import { Announcement } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowRight, 
  Bell, 
  Edit, 
  Save, 
  Trash2, 
  Plus,
  CalendarRange,
  GripVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import SortableList from '@/components/admin/SortableList';

export default function AnnouncementsPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 1,
    active: true,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      // Fetch sorted by priority (which we use as order now)
      // Note: priority implies 1 is first.
      const data = await Announcement.list();
      setAnnouncements(data.sort((a, b) => (a.priority || 0) - (b.priority || 0)));
    } catch (err) {
      console.error("Error loading announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title || '',
      content: announcement.content || '',
      priority: announcement.priority || 1,
      active: announcement.active ?? true,
      start_date: announcement.start_date || '',
      end_date: announcement.end_date || ''
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      content: '',
      priority: announcements.length + 1,
      active: true,
      start_date: '',
      end_date: ''
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await Announcement.update(editingId, formData);
      } else {
        await Announcement.create(formData);
      }
      await loadAnnouncements();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error("Error saving announcement:", err);
      alert("אירעה שגיאה בשמירת ההודעה");
    }
  };

  const handleDelete = async (id) => {
      if (!confirm('האם למחוק את ההודעה?')) return;
      try {
          await Announcement.delete(id);
          loadAnnouncements();
      } catch (err) {
          console.error("Error deleting announcement", err);
      }
  }

  const handleReorder = async (newItems) => {
    setAnnouncements(newItems);
    try {
      await Promise.all(newItems.map((item, index) => 
        Announcement.update(item.id, { priority: index + 1 })
      ));
    } catch (err) {
      console.error("Error updating priority:", err);
      loadAnnouncements();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: he });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="announcements-page min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-4 md:p-8 rtl">
      <div className="max-w-6xl mx-auto">
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
            <Bell className="w-6 h-6 text-amber-400 ml-2" />
            <h1 className="text-2xl font-bold text-white">ניהול הודעות</h1>
          </div>
        </div>
        
        {!showForm ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-amber-400">רשימת הודעות - גרור לשינוי סדר</h2>
              <Button 
                onClick={handleCreate}
                className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold"
              >
                <Plus className="w-4 h-4 ml-2" />
                הודעה חדשה
              </Button>
            </div>
            
            {announcements.length > 0 ? (
              <SortableList
                items={announcements}
                onReorder={handleReorder}
                className="space-y-3"
                renderItem={(item, index, dragHandleProps) => (
                  <div className="bg-blue-800/40 p-4 rounded-xl border border-blue-700 flex items-center gap-4 hover:bg-blue-800/60 transition-colors">
                    <div 
                      {...dragHandleProps}
                      className="cursor-grab active:cursor-grabbing p-2 hover:bg-blue-700 rounded"
                    >
                      <GripVertical className="w-5 h-5 text-blue-300" />
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="bg-blue-900/50 px-2 py-0.5 rounded text-xs text-blue-200">#{index + 1}</span>
                        <h3 className="font-bold text-lg text-white truncate">{item.title}</h3>
                        {!item.active && <span className="text-red-400 text-xs border border-red-400 px-2 rounded-full flex-shrink-0">לא פעיל</span>}
                        {(item.start_date || item.end_date) && (
                           <span className="text-xs text-blue-300 bg-blue-900/30 px-2 rounded flex items-center gap-1 flex-shrink-0">
                             <CalendarRange className="w-3 h-3" />
                             {formatDate(item.start_date)} - {formatDate(item.end_date)}
                           </span>
                        )}
                      </div>
                      <p className="text-blue-100 text-sm line-clamp-2">{item.content}</p>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        className="text-amber-400 hover:bg-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              />
            ) : (
              <div className="text-center p-12 bg-blue-800/20 rounded-xl border border-blue-700">
                <p className="text-blue-300 text-lg">אין הודעות עדיין.</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg border-2 border-blue-600">
            <h2 className="text-xl font-bold mb-6 text-amber-400">
              {editingId ? 'עריכת הודעה' : 'הודעה חדשה'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-white text-lg font-semibold">כותרת</Label>
                <Input 
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="הזן כותרת להודעה"
                  required
                  className="bg-blue-900 border-blue-600 text-white text-lg placeholder:text-blue-400"
                />
              </div>
              
              <div>
                <Label htmlFor="content" className="text-white text-lg font-semibold">תוכן</Label>
                <Textarea 
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="הזן את תוכן ההודעה"
                  required
                  rows={4}
                  className="bg-blue-900 border-blue-600 text-white text-lg placeholder:text-blue-400"
                />
              </div>
              
              <div className="flex items-center h-10">
                <Switch 
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange('active', checked)}
                  className="ml-2"
                />
                <Label className="text-white text-lg font-semibold">הודעה פעילה</Label>
              </div>
              
              <div className="border-t border-blue-700 pt-6">
                <div className="flex items-center mb-4">
                  <CalendarRange className="w-5 h-5 text-amber-400 ml-2" />
                  <h3 className="text-lg font-semibold text-white">הגבלת תאריכים (אופציונלי)</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="start_date" className="text-white text-base">תאריך התחלה</Label>
                    <Input 
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className="bg-blue-900 border-blue-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end_date" className="text-white text-base">תאריך סיום</Label>
                    <Input 
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className="bg-blue-900 border-blue-600 text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="bg-blue-700 border-blue-600 hover:bg-blue-600 text-white font-semibold"
                >
                  ביטול
                </Button>
                <Button 
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {editingId ? 'עדכן הודעה' : 'צור הודעה'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}