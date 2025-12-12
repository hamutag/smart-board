import React, { useState, useEffect } from 'react';
import { LeiluyNishmat } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LeiluyNishmatAdmin() {
  const [monzachim, setMonzachim] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hebrew_date: '',
    gender: 'male',
    order: 1
  });

  const loadData = async () => {
    try {
      const data = await LeiluyNishmat.list('order');
      setMonzachim(data);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, gender: value }));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || '',
      hebrew_date: item.hebrew_date || '',
      gender: item.gender,
      order: item.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) return;
    try {
      await LeiluyNishmat.delete(id);
      await loadData();
    } catch (err) {
      console.error("Error deleting:", err);
      alert("שגיאה במחיקה");
    }
  };

  const handleNewEntry = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      hebrew_date: '',
      gender: 'male',
      order: monzachim.length + 1
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await LeiluyNishmat.update(editingId, formData);
      } else {
        await LeiluyNishmat.create(formData);
      }
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (err) {
      console.error("Error saving:", err);
      alert("שגיאה בשמירה");
    }
  };

  const getDisplayName = (item) => {
    const parentPrefix = item.gender === 'male' ? 'בן' : 'בת';
    if (item.name.includes(parentPrefix)) {
      return item.name;
    }
    // For backward compatibility - if name doesn't include parent name
    return item.name;
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
          <h1 className="text-4xl font-bold text-amber-400">ניהול לעילוי נשמת</h1>
        </div>

        {!showForm ? (
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-300">רשימת מונצחים</h2>
              <Button onClick={handleNewEntry} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-5 h-5 ml-2" />
                הוסף מונצח
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-blue-900 bg-opacity-60">
                    <th className="p-3 border border-blue-700 text-amber-300">סדר</th>
                    <th className="p-3 border border-blue-700 text-amber-300">שם</th>
                    <th className="p-3 border border-blue-700 text-amber-300">מין</th>
                    <th className="p-3 border border-blue-700 text-amber-300">תאריך עברי</th>
                    <th className="p-3 border border-blue-700 text-amber-300">תיאור</th>
                    <th className="p-3 border border-blue-700 text-amber-300">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {monzachim.map((item) => (
                    <tr key={item.id} className="bg-blue-900 bg-opacity-30 hover:bg-blue-800 hover:bg-opacity-40">
                      <td className="p-3 border border-blue-700 text-white">{item.order}</td>
                      <td className="p-3 border border-blue-700 text-white font-bold">{getDisplayName(item)}</td>
                      <td className="p-3 border border-blue-700 text-white">
                        {item.gender === 'male' ? 'זכר' : 'נקבה'}
                      </td>
                      <td className="p-3 border border-blue-700 text-white">{item.hebrew_date || '-'}</td>
                      <td className="p-3 border border-blue-700 text-white">{item.description || '-'}</td>
                      <td className="p-3 border border-blue-700">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEdit(item)} className="bg-blue-600 hover:bg-blue-700">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-amber-300 mb-6">
              {editingId ? 'עריכת מונצח' : 'הוספת מונצח חדש'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-white text-lg mb-2">שם המונצח (כולל שם האם/אב)</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="bg-blue-900 border-blue-600 text-white text-lg"
                  placeholder="לדוגמה: משה בן מרים או שרה בת רבקה"
                />
                <p className="text-blue-200 text-sm mt-1">יש להזין את השם המלא כולל 'בן' או 'בת' ושם האם/אב</p>
              </div>

              <div>
                <Label className="text-white text-lg mb-2">מין</Label>
                <Select value={formData.gender} onValueChange={handleSelectChange}>
                  <SelectTrigger className="bg-blue-900 border-blue-600 text-white text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-900 border-blue-600">
                    <SelectItem value="male" className="text-white">זכר</SelectItem>
                    <SelectItem value="female" className="text-white">נקבה</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white text-lg mb-2">תאריך עברי (אופציונלי)</Label>
                <Input
                  name="hebrew_date"
                  value={formData.hebrew_date}
                  onChange={handleInputChange}
                  className="bg-blue-900 border-blue-600 text-white text-lg"
                  placeholder="כ״ג כסלו תשפ״ה"
                />
              </div>

              <div>
                <Label className="text-white text-lg mb-2">תיאור או הקדשה (אופציונלי)</Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-blue-900 border-blue-600 text-white text-lg"
                  placeholder="לעילוי נשמת..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-white text-lg mb-2">סדר תצוגה</Label>
                <Input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="bg-blue-900 border-blue-600 text-white text-lg"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  {editingId ? 'עדכן' : 'הוסף'}
                </Button>
                <Button type="button" onClick={() => setShowForm(false)} variant="outline" className="bg-blue-700 border-blue-500 hover:bg-blue-600 text-white">
                  ביטול
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}