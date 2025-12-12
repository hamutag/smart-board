import React, { useState, useEffect } from 'react';
import { NiftarWeekly } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Plus, Trash2, Save, Edit2, Eye, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function NiftarimAdmin() {
  const [niftarim, setNiftarim] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    hebrew_name: '',
    yahrzeit_hebrew_date: '',
    yahrzeit_gregorian_date: '',
    dedication_text: '',
    active: true,
    family_email: '',
    family_name: '',
    send_reminder: false
  });

  useEffect(() => {
    loadNiftarim();
  }, []);

  const loadNiftarim = async () => {
    try {
      const data = await NiftarWeekly.list('yahrzeit_gregorian_date');
      setNiftarim(data);
    } catch (err) {
      console.error("Error loading niftarim:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await NiftarWeekly.update(editingId, formData);
      } else {
        await NiftarWeekly.create(formData);
      }
      resetForm();
      loadNiftarim();
    } catch (err) {
      console.error("Error saving niftar:", err);
      alert('שגיאה בשמירה');
    }
  };

  const handleEdit = (niftar) => {
    setFormData({
      hebrew_name: niftar.hebrew_name || '',
      yahrzeit_hebrew_date: niftar.yahrzeit_hebrew_date || '',
      yahrzeit_gregorian_date: niftar.yahrzeit_gregorian_date || '',
      dedication_text: niftar.dedication_text || '',
      active: niftar.active !== false,
      family_email: niftar.family_email || '',
      family_name: niftar.family_name || '',
      send_reminder: niftar.send_reminder || false
    });
    setEditingId(niftar.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('האם למחוק את הרשומה?')) return;
    try {
      await NiftarWeekly.delete(id);
      loadNiftarim();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      hebrew_name: '',
      yahrzeit_hebrew_date: '',
      yahrzeit_gregorian_date: '',
      dedication_text: '',
      active: true,
      family_email: '',
      family_name: '',
      send_reminder: false
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="bg-blue-800 border-blue-600 hover:bg-blue-700 text-white">
              <ArrowRight className="w-5 h-5 ml-2" />
              חזרה לדשבורד
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-amber-400">ניהול אזכרות השבוע</h1>
          <div className="flex gap-2">
            <Link to={createPageUrl("SendYahrzeitReminders")}>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Mail className="w-5 h-5 ml-2" />
                שלח תזכורות
              </Button>
            </Link>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-5 h-5 ml-2" />
              הוסף נפטר
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl mb-6">
            <h2 className="text-2xl font-bold text-amber-300 mb-4">
              {editingId ? 'עריכת נפטר' : 'הוספת נפטר חדש'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">שם בעברית</Label>
                  <Input
                    value={formData.hebrew_name}
                    onChange={(e) => setFormData({ ...formData, hebrew_name: e.target.value })}
                    className="bg-blue-900 border-blue-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">תאריך עברי</Label>
                  <Input
                    value={formData.yahrzeit_hebrew_date}
                    onChange={(e) => setFormData({ ...formData, yahrzeit_hebrew_date: e.target.value })}
                    className="bg-blue-900 border-blue-600 text-white"
                    placeholder="י״ב בתמוז"
                  />
                </div>
                <div>
                  <Label className="text-white">תאריך לועזי</Label>
                  <Input
                    type="date"
                    value={formData.yahrzeit_gregorian_date}
                    onChange={(e) => setFormData({ ...formData, yahrzeit_gregorian_date: e.target.value })}
                    className="bg-blue-900 border-blue-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">הקדשה (אופציונלי)</Label>
                  <Input
                    value={formData.dedication_text}
                    onChange={(e) => setFormData({ ...formData, dedication_text: e.target.value })}
                    className="bg-blue-900 border-blue-600 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label className="text-white">פעיל</Label>
              </div>

              {/* Email Reminder Section */}
              <div className="bg-blue-900/50 p-4 rounded-lg mt-4">
                <h3 className="text-xl font-bold text-amber-300 mb-3">שליחת תזכורת למשפחה</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label className="text-white">שם המשפחה</Label>
                    <Input
                      value={formData.family_name}
                      onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                      className="bg-blue-900 border-blue-600 text-white"
                      placeholder="משפחת כהן"
                    />
                  </div>
                  <div>
                    <Label className="text-white">כתובת מייל</Label>
                    <Input
                      type="email"
                      value={formData.family_email}
                      onChange={(e) => setFormData({ ...formData, family_email: e.target.value })}
                      className="bg-blue-900 border-blue-600 text-white"
                      placeholder="family@example.com"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.send_reminder}
                    onCheckedChange={(checked) => setFormData({ ...formData, send_reminder: checked })}
                  />
                  <Label className="text-white">שלח תזכורת שבוע לפני האזכרה</Label>
                </div>
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
          <h2 className="text-2xl font-bold text-amber-300 mb-4">רשימת נפטרים ({niftarim.length})</h2>
          {niftarim.length > 0 ? (
            <div className="space-y-3">
              {niftarim.map((niftar) => (
                <div key={niftar.id} className="bg-blue-900/50 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-white">{niftar.hebrew_name}</p>
                    <p className="text-blue-300">{niftar.yahrzeit_hebrew_date} | {niftar.yahrzeit_gregorian_date}</p>
                    {niftar.dedication_text && <p className="text-blue-400 text-sm">{niftar.dedication_text}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(niftar)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(niftar.id)} size="sm" className="bg-red-600 hover:bg-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-blue-300 text-center">אין נפטרים ברשימה</p>
          )}
        </div>
      </div>
    </div>
  );
}