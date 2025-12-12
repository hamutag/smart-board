import React, { useState, useEffect } from 'react';
import { Settings } from '@/api/entities';
import { Announcement } from '@/api/entities';
import { DailyZmanim } from '@/api/entities';
import { Halacha } from '@/api/entities';
import { RefuahShelema } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Settings as SettingsIcon, Bell, Calendar, ChevronRight, Scale, Clock, UploadCloud, HeartHandshake, HeartPulse, Edit3, Download, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function Dashboard() {
  const [settings, setSettings] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [halachot, setHalachot] = useState([]);
  const [refuahList, setRefuahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayZmanim, setTodayZmanim] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const settingsList = await Settings.list();
        setSettings(settingsList.length > 0 ? settingsList[0] : null);
        
        const announcementsList = await Announcement.list('-created_date');
        setAnnouncements(announcementsList);
        
        const halachotList = await Halacha.list('order');
        setHalachot(halachotList);
        
        const refuahData = await RefuahShelema.list();
        setRefuahList(refuahData);

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const todayRecords = await DailyZmanim.filter({ date: formattedDate });
        setTodayZmanim(todayRecords.length > 0 ? todayRecords[0] : null);
        
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="dashboard min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-4 md:p-8 rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-amber-400 mb-8">לוח חכם ארנון - ניהול</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <SettingsIcon className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">הגדרות</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">שנה את הגדרות הלוח, מיקום, זמני תפילה והמידע המוצג</p>
            <Link to={createPageUrl("Settings")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">ערוך הגדרות</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">ספירה לאחור</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">הגדר ציר זמן וספירה לנץ החמה</p>
            <Link to={createPageUrl("CountdownSettingsPage")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">ערוך ספירה</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <HeartHandshake className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">ברכות ותפילות</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">ניהול ברכות ותפילות המוצגות בלוח</p>
            <Link to={createPageUrl("BrachotAdmin")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">נהל ברכות</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
          
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Bell className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">הודעות</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">נהל {announcements.length} הודעות המוצגות בלוח</p>
            <Link to={createPageUrl("Announcements")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">נהל הודעות</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
          
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Scale className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">הלכות יומיות</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">נהל {halachot.length} הלכות המוצגות בלוח</p>
            <Link to={createPageUrl("Halachot")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">נהל הלכות</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
          
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <HeartPulse className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">רפואה שלמה</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">נהל {refuahList.length} שמות לרפואה שלמה</p>
            <Link to={createPageUrl("RefuahShelemaAdmin")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">נהל רשימה</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Edit3 className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">עריכה מלאה</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">ערוך את כל הלוחות והדפים מכאן ישירות</p>
            <Link to={createPageUrl("FullEditor")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">פתח עורך</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <HeartHandshake className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">הנצחה קבועה</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">נהל את רשימת המונצחים הקבועה בלוח</p>
            <Link to={createPageUrl("LeiluyNishmatAdmin")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">נהל מונצחים</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <CalendarClock className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">עריכת יום בודד</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">ערוך זמני תפילה ליום ספציפי</p>
            <Link to={createPageUrl("SingleDayZmanimEditor")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">ערוך יום</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-amber-400 ml-2" />
                <h2 className="text-xl font-bold">זמני שבת</h2>
              </div>
              <p className="text-blue-100 mb-4 text-sm">ערוך זמני שבת קרובה</p>
              <Link to={createPageUrl("ShabbatTimesEditor")} className="block text-amber-400 hover:text-amber-300">
                <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                  <span className="font-semibold">ערוך שבת</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            </div>

            <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <HeartHandshake className="w-6 h-6 text-amber-400 ml-2" />
                <h2 className="text-xl font-bold">קהילתינו היקרה</h2>
              </div>
              <p className="text-blue-100 mb-4 text-sm">ניהול תמונות והודעות קהילה</p>
              <Link to={createPageUrl("CommunityAdmin")} className="block text-amber-400 hover:text-amber-300">
                <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                  <span className="font-semibold">נהל קהילה</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            </div>

            <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-amber-400 ml-2" />
                <h2 className="text-xl font-bold">אזכרות ותזכורות</h2>
              </div>
              <p className="text-blue-100 mb-4 text-sm">ניהול נפטרים ושליחת תזכורות למשפחות</p>
              <Link to={createPageUrl("NiftarimAdmin")} className="block text-amber-400 hover:text-amber-300">
                <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                  <span className="font-semibold">נהל אזכרות</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            </div>

          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Download className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">ייבוא הלכות</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">ייבא הלכות אוטומטית מאתרים</p>
            <Link to={createPageUrl("HalachotImport")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">ייבא הלכות</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Bell className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">פס הודעות חכם</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">נהל את ההודעות המוצגות בפס למטה</p>
            <Link to={createPageUrl("SmartMessagesAdmin")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">נהל פס הודעות</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <SettingsIcon className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">עיצוב שקופיות</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">שנה רקע, צבעים ופונט לכל שקופית</p>
            <Link to={createPageUrl("SlideSettingsAdmin")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">עיצוב שקופיות</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg border-2 border-amber-500/50">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">סדר הדפים (Playlist)</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm">קבע איזה דפים יופיעו, מתי (חול/שבת) ולכמה זמן</p>
            <Link to={createPageUrl("ScheduleAdmin")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">ניהול סדר דפים</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">          
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">זמני היום</h2>
            </div>
            <p className="text-blue-100 mb-4">הגדר את זמני היום, זמני שבת והפרשה השבועית</p>
            <Link to={createPageUrl("Settings")} state={{ defaultTab: "zmanim" }} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">נהל זמני היום</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
          
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <UploadCloud className="w-6 h-6 text-amber-400 ml-2" />
              <h2 className="text-xl font-bold">יבוא זמנים מרובה</h2>
            </div>
            <p className="text-blue-100 mb-4">
              יבאו זמני תפילה והלכה יומיים עבור כל השנה.
              {todayZmanim ? 
                <span className="block mt-1 text-green-300 font-semibold">(נמצאה רשומה להיום)</span> : 
                <span className="block mt-1 text-red-300 font-semibold">(שימו לב: אין רשומה להיום)</span>}
            </p>
            <Link to={createPageUrl("BulkImport")} className="block text-amber-400 hover:text-amber-300">
              <div className="flex items-center justify-between bg-blue-700 bg-opacity-50 p-3 rounded-lg">
                <span className="font-semibold">יבוא זמנים מתקדם</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">סטטוס הלוח</h2>
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-700 bg-opacity-50 p-4 rounded-lg">
                <p className="text-sm text-blue-200">מיקום</p>
                <p className="text-lg font-bold">{settings?.location || 'לא מוגדר'}</p>
              </div>
              <div className="bg-blue-700 bg-opacity-50 p-4 rounded-lg">
                <p className="text-sm text-blue-200">מצב תצוגה</p>
                <p className="text-lg font-bold">{settings?.display_mode || 'רגיל'}</p>
              </div>
              <div className="bg-blue-700 bg-opacity-50 p-4 rounded-lg">
                <p className="text-sm text-blue-200">הודעות פעילות</p>
                <p className="text-lg font-bold">{announcements.filter(a => a.active).length}</p>
              </div>
              <div className="bg-blue-700 bg-opacity-50 p-4 rounded-lg">
                <p className="text-sm text-blue-200">תאריך עדכון אחרון</p>
                <p className="text-lg font-bold">
                  {settings?.updated_date
                    ? format(new Date(settings.updated_date), 'dd/MM/yyyy HH:mm', { locale: he })
                    : 'לא עודכן'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link to={createPageUrl("Board")} className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold rounded-lg text-lg transition duration-200">
            צפה בלוח
          </Link>
        </div>
      </div>
    </div>
  );
}