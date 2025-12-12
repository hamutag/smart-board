
import React, { useState } from 'react';
import { DailyZmanim } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowRight, UploadCloud, AlertTriangle, CheckCircle, Package, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Helper to convert DD/MM/YYYY to YYYY-MM-DD
const parseDate = (dateStr) => {
  if (!dateStr || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr.trim())) return null;
  const [day, month, year] = dateStr.trim().split('/');
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export default function BulkImportPage() {
  const navigate = useNavigate();
  const [textData, setTextData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recordsToImport, setRecordsToImport] = useState([]);

  const handleAnalyze = () => {
    setError(null);
    setSuccessMessage(null);
    setAnalysisResult(null);
    setRecordsToImport([]);

    if (!textData.trim()) {
      setError("אנא הדבק נתונים לתוך תיבת הטקסט.");
      return;
    }

    const lines = textData.trim().split('\n');
    const dataLines = lines[0].toLowerCase().includes('date') ? lines.slice(1) : lines;

    const validRecords = [];
    const invalidLines = [];

    for (const line of dataLines) {
      if (!line.trim()) continue;

      const columns = line.split('\t');
      const formattedDate = parseDate(columns[0]);

      // Expecting at least 18 columns now (date + 17 fields: alot to omer including rosh_chodesh)
      if (!formattedDate || columns.length < 18) { 
        invalidLines.push(line);
        continue;
      }

      try {
        // Updated column mapping (with rosh_chodesh)
        const record = {
          date: formattedDate,
          alot: columns[1]?.trim() || "",
          sunrise: columns[2]?.trim() || "",
          sunset: columns[3]?.trim() || "",
          tzeit: columns[4]?.trim() || "",
          tzeit_rt: columns[5]?.trim() || "",
          parasha: columns[6]?.trim() || "",
          rosh_chodesh: columns[7]?.trim() || "", // New field
          candles: columns[8]?.trim() || "",
          havdalah: columns[9]?.trim() || "",
          mincha: columns[10]?.trim() || "",
          class: columns[11]?.trim() || "",
          zman_talit: columns[12]?.trim() || "",
          mincha_gedola: columns[13]?.trim() || "",
          molad: columns[14]?.trim() || "",
          arvit: columns[15]?.trim() || "",
          hebrew_date: columns[16]?.trim() || "",
          omer: columns[17]?.trim() || "",
          is_sample: false
        };
        validRecords.push(record);
      } catch (e) {
        invalidLines.push(line);
      }
    }
    
    setRecordsToImport(validRecords);
    setAnalysisResult({
        validCount: validRecords.length,
        invalidCount: invalidLines.length,
        preview: validRecords.length > 0 ? validRecords[0] : null,
        errors: invalidLines.slice(0, 5)
    });
  };

  const handleConfirmImport = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setProgress({ current: 0, total: 0 });

    try {
      const chunks = chunkArray(recordsToImport, 50);
      setProgress({ current: 0, total: chunks.length });
      
      let totalImported = 0;
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        await DailyZmanim.bulkCreate(chunk);
        totalImported += chunk.length;
        setProgress({ current: i + 1, total: chunks.length });
        if (i < chunks.length - 1) {
          // Increased delay to 1 second to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setSuccessMessage(`יובאו בהצלחה ${totalImported} רשומות!`);
      setTextData('');
      setAnalysisResult(null);
      setRecordsToImport([]);
    } catch (err) {
      console.error("Error during bulk create:", err);
      let errorMessage = `שגיאה כללית במהלך היבוא: ${err.message}`;
      // Provide a user-friendly error for rate-limiting issues
      if (err.message && (err.message.includes('429') || err.message.toLowerCase().includes('rate limit'))) {
          errorMessage = "קצב העלאת הנתונים מהיר מדי והשרת עצר את הפעולה. אנא המתן מספר דקות ונסה שוב, אולי עם כמות קטנה יותר של שורות בכל פעם.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
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
        <h1 className="text-2xl font-bold">יבוא נתונים מתקדם</h1>
      </div>

      <Card className="bg-blue-800 bg-opacity-40 text-white border-blue-600">
        <CardHeader>
          <CardTitle className="text-amber-400">שלב 1: הדבקה וניתוח נתונים</CardTitle>
          <CardDescription className="text-blue-100">
            העתק נתונים מאקסל (מופרדים בטאבים) והדבק כאן. המערכת תנתח אותם לפני היבוא.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-700">
            <h3 className="font-semibold mb-2">סדר העמודות הצפוי (עודכן עם ראש חודש):</h3>
            <p className="text-xs font-mono ltr text-left text-blue-200">
              date &rarr; alot &rarr; sunrise &rarr; sunset &rarr; tzeit &rarr; tzeit_rt &rarr; parasha &rarr; rosh_chodesh &rarr; candles &rarr; havdalah &rarr; mincha &rarr; class &rarr; zman_talit &rarr; mincha_gedola &rarr; molad &rarr; arvit &rarr; hebrew_date &rarr; omer
            </p>
          </div>
          
          <Textarea
            value={textData}
            onChange={(e) => { setTextData(e.target.value); setAnalysisResult(null); }}
            placeholder="הדבק כאן את השורות מקובץ האקסל..."
            rows={10}
            className="w-full font-mono text-sm bg-blue-950 border-blue-700 text-blue-100"
            dir="ltr"
            disabled={isLoading}
          />
          <div className="flex gap-3">
            <Button onClick={handleAnalyze} disabled={isLoading || !textData.trim()}>
              <Search className="mr-2 h-4 w-4"/>
              ניתוח נתונים
            </Button>
             <Button 
              onClick={() => { setTextData(''); setAnalysisResult(null); }}
              variant="outline"
              className="bg-blue-800 border-blue-700 hover:bg-blue-700"
              disabled={isLoading}
            >
              נקה הכל
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card className="mt-6 bg-blue-800 bg-opacity-60 text-white border-blue-600">
          <CardHeader>
            <CardTitle className="text-amber-400">שלב 2: אימות ואישור יבוא</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-700 space-y-2">
              <div className="flex items-center text-green-300"><CheckCircle className="h-5 w-5 mr-2"/>נמצאו {analysisResult.validCount} רשומות תקינות ליבוא.</div>
              {analysisResult.invalidCount > 0 && <div className="flex items-center text-red-300"><AlertTriangle className="h-5 w-5 mr-2"/>נמצאו {analysisResult.invalidCount} שורות שגויות שידולגו.</div>}
            </div>

            {analysisResult.preview && (
              <div>
                <h4 className="font-semibold mb-2">תצוגה מקדימה (רשומה ראשונה):</h4>
                <div className="p-3 bg-blue-950 rounded text-xs font-mono ltr text-left overflow-x-auto">
                  <pre>{JSON.stringify(analysisResult.preview, null, 2)}</pre>
                </div>
              </div>
            )}
            
            {analysisResult.errors.length > 0 && (
                 <div>
                    <h4 className="font-semibold mb-2 text-red-400">דוגמאות לשורות שגויות:</h4>
                    <div className="p-3 bg-red-900 bg-opacity-20 rounded text-xs font-mono ltr text-left">
                        {analysisResult.errors.map((line, i) => <div key={i}>{line}</div>)}
                    </div>
                </div>
            )}

            {isLoading && progress.total > 0 && (
                <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg border border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-400 font-semibold">מעלה נתונים...</span>
                    <span className="text-blue-200">{progress.current} / {progress.total} חבילות</span>
                  </div>
                  <div className="bg-blue-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
            )}

            <Button 
              onClick={handleConfirmImport} 
              disabled={isLoading || analysisResult.validCount === 0}
              className="bg-amber-500 hover:bg-amber-600 text-blue-900 w-full"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />מעלה...</>
              ) : (
                <><Package className="mr-2 h-4 w-4"/>אשר ויבא {analysisResult.validCount} רשומות</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {error && <div className="mt-4 text-red-300 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded"><p><strong>שגיאה:</strong> {error}</p></div>}
      {successMessage && <div className="mt-4 text-green-300 p-3 bg-green-900 bg-opacity-50 border border-green-500 rounded"><p><strong>הצלחה:</strong> {successMessage}</p></div>}

    </div>
  );
}
