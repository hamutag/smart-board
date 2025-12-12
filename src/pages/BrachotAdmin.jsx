import React, { useState, useEffect } from 'react';
import { Bracha } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Plus, Trash2, Save, Edit2, Eye } from 'lucide-react';

export default function BrachotAdmin() {
  const [brachot, setBrachot] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    hebrew_text: '',
    category: 'ברכות_כלליות',
    order: 10,
    active: true,
    font_size: 'בינוני'
  });

  useEffect(() => {
    loadBrachot();
  }, []);

  const loadBrachot = async () => {
    try {
      const data = await Bracha.list('order');
      setBrachot(data);
    } catch (err) {
      console.error("Error loading brachot:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await Bracha.update(editingId, formData);
      } else {
        await Bracha.create(formData);
      }
      await loadBrachot();
      resetForm();
    } catch (err) {
      console.error("Error saving bracha:", err);
    }
  };

  const handleEdit = (bracha) => {
    setFormData({
      title: bracha.title,
      hebrew_text: bracha.hebrew_text,
      category: bracha.category || 'ברכות_כלליות',
      order: bracha.order || 10,
      active: bracha.active !== false,
      font_size: bracha.font_size || 'בינוני'
    });
    setEditingId(bracha.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('האם אתה בטוח שברצונך למחוק ברכה זו?')) {
      await Bracha.delete(id);
      await loadBrachot();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      hebrew_text: '',
      category: 'ברכות_כלליות',
      order: 10,
      active: true,
      font_size: 'בינוני'
    });
    setEditingId(null);
    setShowForm(false);
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
          <h1 className="text-4xl font-bold text-amber-400">ניהול ברכות ותפילות</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowPreview(true)} className="bg-green-600 hover:bg-green-700">
              <Eye className="w-5 h-5 ml-2" />
              תצוגה מקדימה
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-amber-500 hover:bg-amber-600 text-blue-900">
              <Plus className="w-5 h-5 ml-2" />
              הוסף ברכה
            </Button>
          </div>
        </div>

        {/* Brachot List */}
        <div className="bg-blue-800 bg-opacity-40 rounded-xl p-6">
          <table className="w-full">
            <thead>
              <tr className="text-amber-300 text-right border-b border-blue-600">
                <th className="py-3 px-4">כותרת</th>
                <th className="py-3 px-4">קטגוריה</th>
                <th className="py-3 px-4">סדר</th>
                <th className="py-3 px-4">גודל פונט</th>
                <th className="py-3 px-4">פעיל</th>
                <th className="py-3 px-4">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {brachot.map((bracha) => (
                <tr key={bracha.id} className="border-b border-blue-700/50 hover:bg-blue-700/30">
                  <td className="py-3 px-4 font-semibold">{bracha.title}</td>
                  <td className="py-3 px-4 text-blue-300">{bracha.category?.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4">{bracha.order}</td>
                  <td className="py-3 px-4">{bracha.font_size}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded ${bracha.active ? 'bg-green-600' : 'bg-red-600'}`}>
                      {bracha.active ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(bracha)} className="bg-blue-600 hover:bg-blue-700">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleDelete(bracha.id)} className="bg-red-600 hover:bg-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {brachot.length === 0 && (
            <p className="text-center text-blue-300 py-8">אין ברכות להצגה. הוסף ברכה חדשה.</p>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-blue-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-amber-400 mb-6">
                {editingId ? 'עריכת ברכה' : 'הוספת ברכה חדשה'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-white">כותרת הברכה</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-blue-800 border-blue-600 text-white"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">טקסט הברכה</Label>
                  <Textarea
                    value={formData.hebrew_text}
                    onChange={(e) => setFormData({...formData, hebrew_text: e.target.value})}
                    className="bg-blue-800 border-blue-600 text-white min-h-[150px]"
                    placeholder="הזן את טקסט הברכה (השתמש ב-Enter לשורות חדשות)"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">קטגוריה</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-800">
                        <SelectItem value="ברכות_השחר" className="text-white">ברכות השחר</SelectItem>
                        <SelectItem value="תפילות_קצרות" className="text-white">תפילות קצרות</SelectItem>
                        <SelectItem value="פסוקי_תהילים" className="text-white">פסוקי תהילים</SelectItem>
                        <SelectItem value="ברכות_כלליות" className="text-white">ברכות כלליות</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">גודל פונט</Label>
                    <Select value={formData.font_size} onValueChange={(v) => setFormData({...formData, font_size: v})}>
                      <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-800">
                        <SelectItem value="קטן" className="text-white">קטן</SelectItem>
                        <SelectItem value="בינוני" className="text-white">בינוני</SelectItem>
                        <SelectItem value="גדול" className="text-white">גדול</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">סדר הצגה</Label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                      className="bg-blue-800 border-blue-600 text-white"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(v) => setFormData({...formData, active: v})}
                    />
                    <Label className="text-white">ברכה פעילה</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="bg-blue-700 border-blue-600 text-white">
                    ביטול
                  </Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-blue-900">
                    <Save className="w-4 h-4 ml-2" />
                    שמור
                  </Button>
                </div>
              </form>
            </div>
          </div>
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
                  src={createPageUrl("BrachosBoard")}
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