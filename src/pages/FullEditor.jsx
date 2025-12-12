import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Edit3, Layout, Users, Heart, BookOpen, MessageSquare, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FullEditorPage() {
  const navigate = useNavigate();

  const editorSections = [
    {
      id: 'boards',
      title: 'צפייה בלוחות',
      icon: Layout,
      description: 'צפה בכל הלוחות השונים',
      items: [
        { name: 'לוח זמנים ראשי', page: 'Board', description: 'הלוח הראשי עם זמני התפילה' },
      ]
    },
    {
      id: 'content',
      title: 'עריכת תוכן',
      icon: BookOpen,
      description: 'נהל את כל התוכן והמידע',
      items: [
        { name: 'הלכות יומיות', page: 'Halachot', description: 'הוסף ועדכן הלכות יומיות' },
        { name: 'הודעות ומודעות', page: 'Announcements', description: 'נהל הודעות פעילות' },
        { name: 'ייבוא הלכות מקובץ', page: 'HalachotImport', description: 'העלה קובץ Word או טקסט' }
      ]
    },
    {
      id: 'people',
      title: 'עריכת אנשים',
      icon: Users,
      description: 'נהל רשימות אנשים ונפטרים',
      items: [
        { name: 'רפואה שלמה', page: 'RefuahShelemaAdmin', description: 'נהל רשימת רפואה שלמה' },
        { name: 'לעילוי נשמת', page: 'LeiluyNishmatAdmin', description: 'נהל רשימת הנצחה קבועה' },
      ]
    },
    {
      id: 'settings',
      title: 'הגדרות מערכת',
      icon: Settings,
      description: 'קבע הגדרות כלליות',
      items: [
        { name: 'הגדרות בסיסיות', page: 'Settings', description: 'מיקום, הקדשה ועוד' },
        { name: 'יבוא זמנים', page: 'BulkImport', description: 'יבוא נתוני זמנים מרובה' },
        { name: 'עריכת יום בודד', page: 'SingleDayZmanimEditor', description: 'ערוך זמני יום ספציפי' }
      ]
    }
  ];

  return (
    <div className="full-editor min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-4 md:p-8 rtl">
      <div className="max-w-7xl mx-auto">
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
            <Edit3 className="w-6 h-6 text-amber-400 ml-2" />
            <h1 className="text-3xl font-bold text-white">עריכה מלאה - לוח חכם ארנון</h1>
          </div>
        </div>

        <Tabs defaultValue="boards" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-blue-800 border-2 border-blue-600">
            {editorSections.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="text-white data-[state=active]:bg-amber-500 data-[state=active]:text-blue-900 data-[state=active]:font-bold">
                <section.icon className="w-4 h-4 ml-2" />
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {editorSections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <Card className="bg-blue-800 bg-opacity-40 border-2 border-blue-600">
                <CardHeader>
                  <CardTitle className="text-amber-400 flex items-center text-2xl">
                    <section.icon className="w-6 h-6 ml-2" />
                    {section.title}
                  </CardTitle>
                  <p className="text-blue-100 text-lg">{section.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.items.map((item) => (
                      <div key={item.name} className="bg-blue-700 bg-opacity-50 p-4 rounded-lg border-2 border-blue-600 hover:border-amber-400 transition-colors">
                        <h3 className="font-bold text-amber-400 mb-2 text-xl">{item.name}</h3>
                        <p className="text-blue-100 text-base mb-4">{item.description}</p>
                        <Button 
                          onClick={() => navigate(createPageUrl(item.page))}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold"
                        >
                          ערוך עכשיו
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-8 text-center">
          <Button 
            onClick={() => navigate(createPageUrl("Board"))}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-3"
          >
            צפה בתוצאה הסופית
          </Button>
        </div>
      </div>
    </div>
  );
}