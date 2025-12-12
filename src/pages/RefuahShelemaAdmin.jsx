import React, { useState, useEffect } from 'react';
import { RefuahShelema } from '@/api/entities';
import { Settings } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Plus, Trash2, Save, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function RefuahShelemaAdmin() {
  const [refuahList, setRefuahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    hebrew_name: '',
    gender: 'male',
    parent_name: '',
    notes: '',
    active: true,
    priority: 1
  });
  const [blessingText, setBlessingText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [data, settingsData] = await Promise.all([
        RefuahShelema.list(),
        Settings.list()
      ]);
      setRefuahList(data);
      if (settingsData.length > 0) {
        setSettings(settingsData[0]);
        setBlessingText(settingsData[0].refuah_blessing_text || '');
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await RefuahShelema.update(editingId, formData);
      } else {
        await RefuahShelema.create(formData);
      }
      resetForm();
      loadData();
    } catch (err) {
      console.error("Error saving:", err);
      alert('שגיאה בשמירה');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      hebrew_name: item.hebrew_name || '',
      gender: item.gender || 'male',
      parent_name: item.parent_name || '',
      notes: item.notes || '',
      active: item.active !== false,
      priority: item.priority || 1
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('האם למחוק את הרשומה?')) return;
    try {
      await RefuahShelema.delete(id);
      loadData();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      hebrew_name: '',
      gender: 'male',
      parent_name: '',
      notes: '',
      active: true,
      priority: 1
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSaveBlessing = async () => {
    try {
      if (settings) {
        await Settings.update(settings.id, { refuah_blessing_text: blessingText });
        alert('ברכה נשמרה בהצלחה!');
      }
    } catch (err) {
      console.error("Error saving blessing:", err);
      alert('שגיאה בשמירת הברכה');
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="bg-blue-800 border-blue-600 hover:bg-blue-700 text-white">
              <ArrowRight className="w-5 h-5 ml-2" />
              חזרה לדשבורד
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-amber-400">ניהול רפואה שלמה</h1>
          <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-5 h-5 ml-2" />
            הוסף שם
          </Button>
        </div>

        {/* Blessing Text Section */}
        <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-bold text-amber-300 mb-4">ברכה לרפואה שלמה</h2>
          <Textarea
            value={blessingText}
            onChange={(e) => setBlessingText(e.target.value)}
            className="bg-blue-900 border-blue-600 text-white mb-4 min-h-[120px]"
            placeholder="הזן ברכה לרפואה שלמה..."
          />
          <Button onClick={handleSaveBlessing} className="bg-amber-500 hover:bg-amber-600 text-blue-900">
            <Save className="w-5 h-5 ml-2" />
            שמור ברכה
          </Button>
        </div>

        {showForm && (
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl mb-6">
            <h2 className="text-2xl font-bold text-amber-300 mb-4">
              {editingId ? 'עריכת שם' : 'הוספת שם חדש'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">שם בעברית (שם פרטי בלבד)</Label>
                  <Input
                    value={formData.hebrew_name}
                    onChange={(e) => setFormData({ ...formData, hebrew_name: e.target.value })}
                    className="bg-blue-900 border-blue-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">מין</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                    <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-blue-800">
                      <SelectItem value="male" className="text-white">זכר (בן)</SelectItem>
                      <SelectItem value="female" className="text-white">נקבה (בת)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">שם ההורה</Label>
                  <Input
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    className="bg-blue-900 border-blue-600 text-white"
                    placeholder="שם האם (זכר) או האב (נקבה)"
                  />
                </div>
                <div>
                  <Label className="text-white">עדיפות</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="bg-blue-900 border-blue-600 text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white">הערות</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-blue-900 border-blue-600 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label className="text-white">פעיל</Label>
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-blue-900">
                  <Save className="w-5 h-5 ml-2" />
                  {editingId ? 'עדכן' : 'הוסף'}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline" className="bg-blue-700 border-blue-600 text-white">
                  ביטול
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-amber-300 mb-4">רשימת חולים ({refuahList.length})</h2>
          {refuahList.length > 0 ? (
            <div className="space-y-3">
              {refuahList.map((item) => (
                <div key={item.id} className="bg-blue-900/50 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-white">
                      {item.hebrew_name} {item.parent_name && `${item.gender === 'male' ? 'בן' : 'בת'} ${item.parent_name}`}
                    </p>
                    {item.notes && <p className="text-blue-300 text-sm">{item.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(item)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(item.id)} size="sm" className="bg-red-600 hover:bg-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-blue-300 text-center">אין שמות ברשימה</p>
          )}
        </div>
      </div>
    </div>
  );
}