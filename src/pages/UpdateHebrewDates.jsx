import React, { useState } from 'react';
import { DailyZmanim } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight, CheckCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Helper to convert DD/MM/YYYY to YYYY-MM-DD
const parseDate = (dateStr) => {
  if (!dateStr || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr.trim())) return null;
  const [day, month, year] = dateStr.trim().split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export default function UpdateHebrewDatesPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  const updateData = [
    { date: "19/04/2025", hebrew_date: "כ״א ניסן תשפ״ה" },
    { date: "20/04/2025", hebrew_date: "כ״ב ניסן תשפ״ה" },
    { date: "21/04/2025", hebrew_date: "כ״ג ניסן תשפ״ה" },
    { date: "22/04/2025", hebrew_date: "כ״ד ניסן תשפ״ה" },
    { date: "23/04/2025", hebrew_date: "כ״ה ניסן תשפ״ה" },
    { date: "24/04/2025", hebrew_date: "כ״ו ניסן תשפ״ה" },
    { date: "25/04/2025", hebrew_date: "כ״ז ניסן תשפ״ה" },
    { date: "26/04/2025", hebrew_date: "כ״ח ניסן תשפ״ה" },
    { date: "27/04/2025", hebrew_date: "כ״ט ניסן תשפ״ה" },
    { date: "28/04/2025", hebrew_date: "ל׳ ניסן תשפ״ה" },
    { date: "29/04/2025", hebrew_date: "א׳ אייר תשפ״ה" },
    { date: "30/04/2025", hebrew_date: "ב׳ אייר תשפ״ה" },
    { date: "01/05/2025", hebrew_date: "ג׳ אייר תשפ״ה" },
    { date: "02/05/2025", hebrew_date: "ד׳ אייר תשפ״ה" },
    { date: "03/05/2025", hebrew_date: "ה׳ אייר תשפ״ה" },
    { date: "04/05/2025", hebrew_date: "ו׳ אייר תשפ״ה" },
    { date: "05/05/2025", hebrew_date: "ז׳ אייר תשפ״ה" },
    { date: "06/05/2025", hebrew_date: "ח׳ אייר תשפ״ה" },
    { date: "07/05/2025", hebrew_date: "ט׳ אייר תשפ״ה" },
    { date: "08/05/2025", hebrew_date: "י׳ אייר תשפ״ה" },
    { date: "09/05/2025", hebrew_date: "י״א אייר תשפ״ה" },
    { date: "10/05/2025", hebrew_date: "י״ב אייר תשפ״ה" },
    { date: "11/05/2025", hebrew_date: "י״ג אייר תשפ״ה" },
    { date: "12/05/2025", hebrew_date: "י״ד אייר תשפ״ה" },
    { date: "13/05/2025", hebrew_date: "ט״ו אייר תשפ״ה" },
    { date: "14/05/2025", hebrew_date: "ט״ז אייר תשפ״ה" },
    { date: "15/05/2025", hebrew_date: "י״ז אייר תשפ״ה" },
    { date: "16/05/2025", hebrew_date: "י״ח אייר תשפ״ה" },
    { date: "17/05/2025", hebrew_date: "י״ט אייר תשפ״ה" },
    { date: "18/05/2025", hebrew_date: "כ׳ אייר תשפ״ה" },
    { date: "19/05/2025", hebrew_date: "כ״א אייר תשפ״ה" },
    { date: "20/05/2025", hebrew_date: "כ״ב אייר תשפ״ה" },
    { date: "21/05/2025", hebrew_date: "כ״ג אייר תשפ״ה" },
    { date: "22/05/2025", hebrew_date: "כ״ד אייר תשפ״ה" },
    { date: "23/05/2025", hebrew_date: "כ״ה אייר תשפ״ה" },
    { date: "24/05/2025", hebrew_date: "כ״ו אייר תשפ״ה" },
    { date: "25/05/2025", hebrew_date: "כ״ז אייר תשפ״ה" },
    { date: "26/05/2025", hebrew_date: "כ״ח אייר תשפ״ה" },
    { date: "27/05/2025", hebrew_date: "כ״ט אייר תשפ״ה" },
    { date: "28/05/2025", hebrew_date: "א׳ סיוון תשפ״ה" },
    { date: "29/05/2025", hebrew_date: "ב׳ סיוון תשפ״ה" },
    { date: "30/05/2025", hebrew_date: "ג׳ סיוון תשפ״ה" },
    { date: "31/05/2025", hebrew_date: "ד׳ סיוון תשפ״ה" },
    { date: "01/06/2025", hebrew_date: "ה׳ סיוון תשפ״ה" },
    { date: "02/06/2025", hebrew_date: "ו׳ סיוון תשפ״ה" },
    { date: "03/06/2025", hebrew_date: "ז׳ סיוון תשפ״ה" },
    { date: "04/06/2025", hebrew_date: "ח׳ סיוון תשפ״ה" },
    { date: "05/06/2025", hebrew_date: "ט׳ סיוון תשפ״ה" },
    { date: "06/06/2025", hebrew_date: "י׳ סיוון תשפ״ה" },
    { date: "07/06/2025", hebrew_date: "י״א סיוון תשפ״ה" },
    { date: "08/06/2025", hebrew_date: "י״ב סיוון תשפ״ה" },
    { date: "09/06/2025", hebrew_date: "י״ג סיוון תשפ״ה" },
    { date: "10/06/2025", hebrew_date: "י״ד סיוון תשפ״ה" },
    { date: "11/06/2025", hebrew_date: "ט״ו סיוון תשפ״ה" },
    { date: "12/06/2025", hebrew_date: "ט״ז סיוון תשפ״ה" },
    { date: "13/06/2025", hebrew_date: "י״ז סיוון תשפ״ה" },
    { date: "14/06/2025", hebrew_date: "י״ח סיוון תשפ״ה" },
    { date: "15/06/2025", hebrew_date: "י״ט סיוון תשפ״ה" },
    { date: "16/06/2025", hebrew_date: "כ׳ סיוון תשפ״ה" },
    { date: "17/06/2025", hebrew_date: "כ״א סיוון תשפ״ה" },
    { date: "18/06/2025", hebrew_date: "כ״ב סיוון תשפ״ה" },
    { date: "19/06/2025", hebrew_date: "כ״ג סיוון תשפ״ה" },
    { date: "20/06/2025", hebrew_date: "כ״ד סיוון תשפ״ה" },
    { date: "21/06/2025", hebrew_date: "כ״ה סיוון תשפ״ה" },
    { date: "22/06/2025", hebrew_date: "כ״ו סיוון תשפ״ה" },
    { date: "23/06/2025", hebrew_date: "כ״ז סיוון תשפ״ה" },
    { date: "24/06/2025", hebrew_date: "כ״ח סיוון תשפ״ה" },
    { date: "25/06/2025", hebrew_date: "כ״ט סיוון תשפ״ה" },
    { date: "26/06/2025", hebrew_date: "ל׳ סיוון תשפ״ה" },
    { date: "27/06/2025", hebrew_date: "א׳ תמוז תשפ״ה" },
    { date: "28/06/2025", hebrew_date: "ב׳ תמוז תשפ״ה" },
    { date: "29/06/2025", hebrew_date: "ג׳ תמוז תשפ״ה" },
    { date: "30/06/2025", hebrew_date: "ד׳ תמוז תשפ״ה" },
    { date: "01/07/2025", hebrew_date: "ה׳ תמוז תשפ״ה" },
    { date: "02/07/2025", hebrew_date: "ו׳ תמוז תשפ״ה" },
    { date: "03/07/2025", hebrew_date: "ז׳ תמוז תשפ״ה" },
    { date: "04/07/2025", hebrew_date: "ח׳ תמוז תשפ״ה" },
    { date: "05/07/2025", hebrew_date: "ט׳ תמוז תשפ״ה" },
    { date: "06/07/2025", hebrew_date: "י׳ תמוז תשפ״ה" },
    { date: "07/07/2025", hebrew_date: "י״א תמוז תשפ״ה" },
    { date: "08/07/2025", hebrew_date: "י״ב תמוז תשפ״ה" },
    { date: "09/07/2025", hebrew_date: "י״ג תמוז תשפ״ה" },
    { date: "10/07/2025", hebrew_date: "י״ד תמוז תשפ״ה" },
    { date: "11/07/2025", hebrew_date: "ט״ו תמוז תשפ״ה" },
    { date: "12/07/2025", hebrew_date: "ט״ז תמוז תשפ״ה" },
    { date: "13/07/2025", hebrew_date: "י״ז תמוז תשפ״ה" },
    { date: "14/07/2025", hebrew_date: "י״ח תמוז תשפ״ה" },
    { date: "15/07/2025", hebrew_date: "י״ט תמוז תשפ״ה" },
    { date: "16/07/2025", hebrew_date: "כ׳ תמוז תשפ״ה" },
    { date: "17/07/2025", hebrew_date: "כ״א תמוז תשפ״ה" },
  ];

  const handleUpdate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let updatedCount = 0;
      let notFoundCount = 0;

      for (const item of updateData) {
        const formattedDate = parseDate(item.date);
        if (!formattedDate) continue;

        try {
          const existingRecords = await DailyZmanim.filter({ date: formattedDate });
          
          if (existingRecords.length > 0) {
            const record = existingRecords[0];
            await DailyZmanim.update(record.id, {
              ...record,
              hebrew_date: item.hebrew_date
            });
            updatedCount++;
          } else {
            notFoundCount++;
          }
        } catch (recordError) {
          console.error(`Error updating record for ${item.date}:`, recordError);
        }
      }

      setSuccessMessage(`עדכון הושלם בהצלחה! עודכנו ${updatedCount} רשומות. ${notFoundCount > 0 ? `לא נמצאו ${notFoundCount} רשומות.` : ''}`);
    } catch (err) {
      console.error("Error during update:", err);
      setError(`שגיאה במהלך העדכון: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 rtl bg-gradient-to-b from-blue-900 to-blue-950 text-white min-h-screen">
      <div className="flex items-center mb-8">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="bg-blue-800 border-blue-700 hover:bg-blue-700 ml-4"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">עדכון תאריכים עבריים</h1>
      </div>

      <Card className="bg-blue-800 bg-opacity-40 text-white border-blue-600">
        <CardHeader>
          <CardTitle className="text-amber-400">עדכון רשומות עם תאריך עברי</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            המערכת תעדכן את הרשומות הקיימות עם התאריך העברי המתאים.
            יעודכנו {updateData.length} רשומות.
          </p>
          
          <Button 
            onClick={handleUpdate} 
            disabled={isLoading}
            className="bg-amber-500 hover:bg-amber-600 text-blue-900"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />מעדכן...</>
            ) : (
              <><Calendar className="mr-2 h-4 w-4"/>התחל עדכון</>
            )}
          </Button>

          {error && (
            <div className="mt-4 text-red-300 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded">
              <p><strong>שגיאה:</strong> {error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="mt-4 text-green-300 p-3 bg-green-900 bg-opacity-50 border border-green-500 rounded">
              <p><strong>הצלחה:</strong> {successMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}