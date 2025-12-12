import React, { useState, useEffect } from 'react';
import { BoardSchedule } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Save, Plus, Trash2, Calendar, GripVertical, Play } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SortableList from '@/components/admin/SortableList';
import { Toaster, toast } from 'sonner';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import BoardRotator from '@/components/BoardRotator';

const COMPONENT_NAMES = {
  zmanim: 'לוח זמני היום',
  shabbat: 'זמני שבת',
  niftarim: 'אזכרות (נפטרים)',
  refuah: 'רפואה שלמה',
  brachot: 'ברכות ותפילות',
  modaot: 'הודעות',
  halachot: 'הלכות יומיות',
  leiluy: 'לעילוי נשמת',
  community: 'קהילתינו',
  chizuk: 'חיזוק יומי'
};

export default function ScheduleAdmin() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await BoardSchedule.list();
      if (data.length === 0) {
        // Initialize default schedule if empty
        const defaults = [
          { name: 'זמני היום', component_key: 'zmanim', day_type: 'always', duration: 120, order: 1, active: true },
          { name: 'הלכות', component_key: 'halachot', day_type: 'always', duration: 60, order: 2, active: true },
          { name: 'מודעות', component_key: 'modaot', day_type: 'always', duration: 30, order: 3, active: true },
          { name: 'קהילה', component_key: 'community', day_type: 'always', duration: 30, order: 4, active: true },
          { name: 'ברכות', component_key: 'brachot', day_type: 'always', duration: 20, order: 5, active: true },
          { name: 'זמני שבת', component_key: 'shabbat', day_type: 'shabbat', duration: 60, order: 6, active: true },
        ];
        await Promise.all(defaults.map(d => BoardSchedule.create(d)));
        const newData = await BoardSchedule.list();
        setSchedule(newData.sort((a, b) => a.order - b.order));
      } else {
        setSchedule(data.sort((a, b) => a.order - b.order));
      }
    } catch (err) {
      console.error("Error loading schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (newItems) => {
    setSchedule(newItems);
    setIsDirty(true);
  };

  const handleUpdateItem = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
    setIsDirty(true);
  };

  const handleAddItem = () => {
    const newItem = {
      name: 'דף חדש',
      component_key: 'zmanim',
      day_type: 'always',
      duration: 30,
      order: schedule.length + 1,
      active: true
    };
    setSchedule([...schedule, newItem]); // Ideally create in DB first to get ID, but for UX we wait for save
    setIsDirty(true);
  };

  const handleDeleteItem = (index) => {
    if (!confirm('האם למחוק דף זה מהסבב?')) return;
    const newSchedule = [...schedule];
    newSchedule.splice(index, 1);
    setSchedule(newSchedule);
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      // Simplest approach: Delete all and recreate (or update existing, delete removed)
      // Since we don't have bulk update/delete easily exposed without IDs matching, let's iterate.
      
      // 1. Update existing & Create new
      const promises = schedule.map((item, index) => {
        const data = { ...item, order: index + 1 };
        if (item.id) {
          return BoardSchedule.update(item.id, data);
        } else {
          return BoardSchedule.create(data);
        }
      });

      // 2. Find deleted items
      const currentIds = schedule.filter(i => i.id).map(i => i.id);
      const allDbItems = await BoardSchedule.list();
      const itemsToDelete = allDbItems.filter(dbItem => !currentIds.includes(dbItem.id));
      
      await Promise.all([
        ...promises,
        ...itemsToDelete.map(item => BoardSchedule.delete(item.id))
      ]);

      toast.success('סדר התצוגה נשמר בהצלחה!');
      setIsDirty(false);
      loadSchedule(); // Reload to get fresh IDs
    } catch (err) {
      console.error("Error saving schedule:", err);
      toast.error('שגיאה בשמירה');
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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-8 rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <Link to={createPageUrl("Dashboard")}>
                <Button variant="outline" className="bg-blue-800 border-blue-600 hover:bg-blue-700 text-white">
                  <ArrowRight className="w-5 h-5 ml-2" />
                  חזרה
                </Button>
              </Link>
            <h1 className="text-3xl font-bold text-amber-400">ניהול סדר הדפים (Playlist)</h1>
          </div>
          <div className="flex gap-3">
             <Dialog open={showPreview} onOpenChange={setShowPreview}>
               <DialogTrigger asChild>
                 <Button className="bg-blue-600 hover:bg-blue-700 font-bold">
                   <Play className="w-5 h-5 ml-2" />
                   תצוגה מקדימה
                 </Button>
               </DialogTrigger>
               <DialogContent className="max-w-[95vw] h-[90vh] p-0 border-0 bg-black">
                  {showPreview && (
                    <div className="w-full h-full relative">
                       <Button 
                         onClick={() => setShowPreview(false)}
                         className="absolute top-4 right-4 z-[60] bg-red-600 hover:bg-red-700"
                       >
                         סגור
                       </Button>
                       <BoardRotator deviceType="desktop" previewSchedule={schedule} />
                    </div>
                  )}
               </DialogContent>
             </Dialog>

             <Button 
              onClick={handleSave} 
              disabled={!isDirty}
              className={`${isDirty ? 'bg-green-600 hover:bg-green-700 animate-pulse' : 'bg-gray-600'} font-bold`}
            >
              <Save className="w-5 h-5 ml-2" />
              שמור שינויים
            </Button>
          </div>
        </div>

        <div className="bg-blue-900/50 p-6 rounded-xl border border-blue-700 mb-6">
          <p className="text-blue-200 mb-4">
            כאן ניתן לקבוע איזה דפים יוצגו, באיזה סדר, למשך כמה זמן, ומתי (יום חול/שבת).
            <br/>
            גרור את הפריטים כדי לשנות את הסדר.
          </p>
          
          <Button onClick={handleAddItem} className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold mb-6">
            <Plus className="w-5 h-5 ml-2" />
            הוסף דף לסבב
          </Button>

          <div className="bg-blue-800/30 rounded-xl p-4">
             <div className="grid grid-cols-12 gap-4 mb-2 px-10 text-blue-300 text-sm font-bold">
               <div className="col-span-2">שם הדף</div>
               <div className="col-span-2">סוג תוכן</div>
               <div className="col-span-2">מתי להציג</div>
               <div className="col-span-2">משך (שניות)</div>
               <div className="col-span-1 text-center">פעיל</div>
               <div className="col-span-2 text-center">שעות (אופציונלי)</div>
               <div className="col-span-1"></div>
             </div>
             
             <SortableList
               items={schedule}
               onReorder={handleReorder}
               renderItem={(item, index, dragHandleProps) => (
                 <div className="grid grid-cols-12 gap-4 items-center bg-blue-900/80 p-3 rounded-lg border border-blue-700 mb-2 hover:border-amber-500/50 transition-colors">
                   <div className="col-span-2 flex items-center gap-2">
                      <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 hover:bg-blue-700 rounded text-blue-400">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <Input 
                        value={item.name} 
                        onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                        className="bg-blue-950 border-blue-800 h-8 text-white"
                      />
                   </div>
                   
                   <div className="col-span-2">
                     <Select 
                        value={item.component_key} 
                        onValueChange={(v) => handleUpdateItem(index, 'component_key', v)}
                      >
                        <SelectTrigger className="bg-blue-950 border-blue-800 h-8 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(COMPONENT_NAMES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                   </div>

                   <div className="col-span-2">
                      <Select 
                        value={item.day_type} 
                        onValueChange={(v) => handleUpdateItem(index, 'day_type', v)}
                      >
                        <SelectTrigger className="bg-blue-950 border-blue-800 h-8 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="always">תמיד</SelectItem>
                          <SelectItem value="weekday">יום חול בלבד</SelectItem>
                          <SelectItem value="shabbat">שבת בלבד</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>

                   <div className="col-span-2">
                     <Input 
                        type="number"
                        min="5"
                        value={item.duration} 
                        onChange={(e) => handleUpdateItem(index, 'duration', parseInt(e.target.value) || 10)}
                        className="bg-blue-950 border-blue-800 h-8 text-white"
                      />
                   </div>

                   <div className="col-span-1 flex justify-center">
                     <Switch 
                        checked={item.active}
                        onCheckedChange={(c) => handleUpdateItem(index, 'active', c)}
                     />
                   </div>

                   <div className="col-span-2 flex gap-1">
                      <Input 
                        placeholder="מ-"
                        value={item.start_time || ''} 
                        onChange={(e) => handleUpdateItem(index, 'start_time', e.target.value)}
                        className="bg-blue-950 border-blue-800 h-8 text-white text-xs px-1"
                      />
                      <Input 
                        placeholder="עד"
                        value={item.end_time || ''} 
                        onChange={(e) => handleUpdateItem(index, 'end_time', e.target.value)}
                        className="bg-blue-950 border-blue-800 h-8 text-white text-xs px-1"
                      />
                   </div>

                   <div className="col-span-1 flex justify-end">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteItem(index)}
                        className="text-red-400 hover:bg-red-900/30 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                 </div>
               )}
             />
          </div>
        </div>
      </div>
    </div>
  );
}