import React, { useState, useEffect } from 'react';
import { SmartMessage } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function SmartMessagesAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    active: true,
    order: 1,
    display_duration: 0
  });

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await SmartMessage.list('order');
      setMessages(data);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMessage) {
        await SmartMessage.update(editingMessage.id, formData);
      } else {
        await SmartMessage.create(formData);
      }
      await loadMessages();
      setShowForm(false);
      setEditingMessage(null);
      setFormData({
        content: '',
        active: true,
        order: 1,
        display_duration: 0
      });
    } catch (err) {
      console.error("Error saving message:", err);
      alert("שגיאה בשמירת ההודעה");
    }
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setFormData({
      content: message.content,
      active: message.active,
      order: message.order || 1,
      display_duration: message.display_duration || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק הודעה זו?")) return;
    
    try {
      await SmartMessage.delete(id);
      await loadMessages();
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("שגיאה במחיקת ההודעה");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
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
          <h1 className="text-4xl font-bold text-amber-400">ניהול פס הודעות חכם</h1>
        </div>

        {!showForm ? (
          <>
            <div className="mb-6">
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditingMessage(null);
                  setFormData({
                    content: '',
                    active: true,
                    order: 1,
                    display_duration: 0
                  });
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-5 h-5 ml-2" />
                הוסף הודעה חדשה
              </Button>
            </div>

            <div className="bg-blue-800 bg-opacity-40 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-700 bg-opacity-50">
                  <tr>
                    <th className="p-4 text-right">תוכן ההודעה</th>
                    <th className="p-4 text-center">סדר</th>
                    <th className="p-4 text-center">פעיל</th>
                    <th className="p-4 text-center">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id} className="border-t border-blue-600">
                      <td className="p-4">{message.content}</td>
                      <td className="p-4 text-center">{message.order}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${message.active ? 'bg-green-600' : 'bg-red-600'}`}>
                          {message.active ? 'פעיל' : 'לא פעיל'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => handleEdit(message)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(message.id)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {messages.length === 0 && (
                <div className="p-8 text-center text-blue-300">
                  <p>אין הודעות עדיין. לחץ על "הוסף הודעה חדשה" כדי להתחיל.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-amber-300 mb-6">
              {editingMessage ? 'עריכת הודעה' : 'הודעה חדשה'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-white text-lg">תוכן ההודעה</Label>
                <Textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  className="bg-blue-900 border-blue-600 text-white text-lg min-h-[100px]"
                  placeholder="הזן את תוכן ההודעה המוצגת בפס..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white text-lg">סדר הצגה</Label>
                  <Input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white"
                    min="1"
                  />
                </div>

                <div>
                  <Label className="text-white text-lg">זמן תצוגה (שניות)</Label>
                  <Input
                    type="number"
                    name="display_duration"
                    value={formData.display_duration}
                    onChange={handleInputChange}
                    className="bg-blue-900 border-blue-600 text-white"
                    min="0"
                  />
                  <p className="text-sm text-blue-300 mt-1">0 = ברירת מחדל (15 שניות)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                />
                <Label className="text-white text-lg">הודעה פעילה</Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingMessage ? 'עדכן' : 'צור'} הודעה
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMessage(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700"
                >
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