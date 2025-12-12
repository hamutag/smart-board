import React, { useState, useEffect } from 'react';
import { Halacha } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowRight, 
  Edit, 
  Save, 
  Plus,
  Scale,
  GripVertical,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SortableList from '@/components/admin/SortableList';

export default function HalachotPage() {
  const navigate = useNavigate();
  const [halachot, setHalachot] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source: '',
    active: true,
    order: 10
  });

  useEffect(() => {
    loadHalachot();
  }, []);

  const loadHalachot = async () => {
    try {
      const data = await Halacha.list('order');
      setHalachot(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err) {
      console.error("שגיאה בטעינת הלכות:", err);
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

  const handleEdit = (halacha) => {
    setFormData({
      title: halacha.title || '',
      content: halacha.content || '',
      source: halacha.source || '',
      active: halacha.active ?? true,
      order: halacha.order || 10
    });
    setEditingId(halacha.id);
    setShowForm(true);
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      content: '',
      source: '',
      active: true,
      order: halachot.length + 1
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await Halacha.update(editingId, formData);
      } else {
        await Halacha.create(formData);
      }
      await loadHalachot();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error("שגיאה בשמירת הלכה:", err);
      alert("אירעה שגיאה בשמירת ההלכה");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק הלכה זו?')) return;
    try {
      await Halacha.delete(id);
      await loadHalachot();
    } catch (err) {
      console.error("Error deleting halacha:", err);
    }
  };

  const handleReorder = async (newItems) => {
    setHalachot(newItems);
    try {
      await Promise.all(newItems.map((item, index) => 
        Halacha.update(item.id, { order: index + 1 })
      ));
    } catch (err) {
      console.error("Error updating order:", err);
      loadHalachot();
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
    <div className="halachot-page min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-4 md:p-8 rtl">
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
            <Scale className="w-6 h-6 text-amber-400 ml-2" />
            <h1 className="text-2xl font-bold text-white">ניהול הלכות יומיות</h1>
          </div>
        </div>
        
        {!showForm ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-amber-400">רשימת הלכות - גרור לשינוי סדר</h2>
              <Button 
                onClick={handleCreate}
                className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold"
              >
                <Plus className="w-4 h-4 ml-2" />
                הלכה חדשה
              </Button>
            </div>
            
            {halachot.length > 0 ? (
              <SortableList
                items={halachot}
                onReorder={handleReorder}
                className="space-y-3"
                renderItem={(halacha, index, dragHandleProps) => (
                  <div className="bg-blue-800/40 p-4 rounded-xl border border-blue-700 flex items-center gap-4 hover:bg-blue-800/60 transition-colors">
                    <div 
                      {...dragHandleProps}
                      className="cursor-grab active:cursor-grabbing p-2 hover:bg-blue-700 rounded"
                    >
                      <GripVertical className="w-5 h-5 text-blue-300" />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="bg-blue-900/50 px-2 py-0.5 rounded text-xs text-blue-200">#{index + 1}</span>
                        <h3 className="font-bold text-lg text-white">{halacha.title}</h3>
                        {!halacha.active && <span className="text-red-400 text-xs border border-red-400 px-2 rounded-full">לא פעיל</span>}
                      </div>
                      <p className="text-blue-100 text-sm line-clamp-2">{halacha.content}</p>
                      {halacha.source && <p className="text-blue-300 text-xs mt-1">{halacha.source}</p>}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(halacha)}
                        className="text-amber-400 hover:bg-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(halacha.id)}
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
                <p className="text-blue-300 text-lg">אין הלכות עדיין. לחץ על "הלכה חדשה" כדי להתחיל.</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg border-2 border-blue-600">
            <h2 className="text-xl font-bold mb-6 text-amber-400">
              {editingId ? 'עריכת הלכה יומית' : 'הלכה יומית חדשה'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-white text-lg font-semibold">כותרת</Label>
                <Input 
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="הזן כותרת להלכה"
                  required
                  className="bg-blue-900 border-blue-600 text-white text-lg placeholder:text-blue-400"
                />
              </div>
              
              <div>
                <Label htmlFor="content" className="text-white text-lg font-semibold">תוכן ההלכה</Label>
                <Textarea 
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="הזן את תוכן ההלכה"
                  required
                  rows={4}
                  className="bg-blue-900 border-blue-600 text-white text-lg placeholder:text-blue-400"
                />
              </div>
              
              <div>
                <Label htmlFor="source" className="text-white text-lg font-semibold">מקור ההלכה</Label>
                <Input 
                  id="source"
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  placeholder="הזן את מקור ההלכה"
                  className="bg-blue-900 border-blue-600 text-white text-lg placeholder:text-blue-400"
                />
              </div>
              
              <div className="flex items-center h-10 mt-6">
                <Switch 
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange('active', checked)}
                  className="ml-2"
                />
                <Label className="text-white text-lg font-semibold">הלכה פעילה</Label>
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
                  {editingId ? 'עדכן הלכה' : 'צור הלכה'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}