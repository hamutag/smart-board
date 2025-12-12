import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Halacha } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Upload, Plus, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function HalachotImport() {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedHalachot, setExtractedHalachot] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('file'); // 'file' or 'text'

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setError('');
  };

  const handleExtractFromFile = async () => {
    if (!file) {
      alert("נא לבחור קובץ להעלאה");
      return;
    }

    setLoading(true);
    setMessage('מעלה ומעבד את הקובץ...');
    setError('');

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setMessage('מחלץ הלכות מהקובץ...');
      
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            halachot: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string", description: "כותרת ההלכה" },
                  content: { type: "string", description: "תוכן ההלכה" },
                  source: { type: "string", description: "מקור ההלכה" }
                },
                required: ["title", "content"]
              }
            }
          },
          required: ["halachot"]
        }
      });

      if (result.status === "success" && result.output && result.output.halachot && result.output.halachot.length > 0) {
        setExtractedHalachot(result.output.halachot);
        setMessage(`נמצאו ${result.output.halachot.length} הלכות!`);
      } else {
        setError(`לא הצלחתי למצוא הלכות בקובץ. פרטים: ${result.details || 'אין פרטים נוספים'}`);
        setExtractedHalachot([]);
      }
    } catch (err) {
      console.error("Error extracting halachot:", err);
      setError(`שגיאה בעיבוד הקובץ: ${err.message || 'שגיאה לא ידועה'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractFromText = async () => {
    if (!textInput.trim()) {
      alert("נא להדביק טקסט");
      return;
    }

    setLoading(true);
    setMessage('מעבד את הטקסט...');
    setError('');

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `חלץ הלכות מהטקסט הבא. כל הלכה צריכה להכיל כותרת, תוכן, ומקור (אם קיים).
        
טקסט:
${textInput}

החזר JSON בפורמט הבא:
{
  "halachot": [
    {
      "title": "כותרת ההלכה",
      "content": "תוכן ההלכה",
      "source": "מקור ההלכה"
    }
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            halachot: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  source: { type: "string" }
                },
                required: ["title", "content"]
              }
            }
          }
        }
      });

      if (result.halachot && result.halachot.length > 0) {
        setExtractedHalachot(result.halachot);
        setMessage(`נמצאו ${result.halachot.length} הלכות!`);
      } else {
        setError('לא הצלחתי למצוא הלכות בטקסט');
        setExtractedHalachot([]);
      }
    } catch (err) {
      console.error("Error extracting halachot:", err);
      setError(`שגיאה בעיבוד הטקסט: ${err.message || 'שגיאה לא ידועה'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportAll = async () => {
    if (extractedHalachot.length === 0) {
      alert("אין הלכות לייבוא");
      return;
    }

    setLoading(true);
    setMessage('מייבא הלכות...');

    try {
      const existingHalachot = await Halacha.list('order');
      let maxOrder = 0;
      if (existingHalachot.length > 0) {
        maxOrder = Math.max(...existingHalachot.map(h => h.order || 0));
      }

      for (let i = 0; i < extractedHalachot.length; i++) {
        const halacha = extractedHalachot[i];
        await Halacha.create({
          title: halacha.title,
          content: halacha.content,
          source: halacha.source || '',
          active: true,
          order: maxOrder + i + 1
        });
      }

      setMessage(`${extractedHalachot.length} הלכות יובאו בהצלחה!`);
      setExtractedHalachot([]);
      setFile(null);
      setTextInput('');
    } catch (err) {
      console.error("Error importing halachot:", err);
      setError(`שגיאה בייבוא ההלכות: ${err.message || 'שגיאה לא ידועה'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="bg-blue-800 border-blue-600 hover:bg-blue-700 text-white">
              <ArrowRight className="w-5 h-5 ml-2" />
              חזרה לדשבורד
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-amber-400">ייבוא הלכות</h1>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={() => setMode('file')} 
            className={`flex-1 ${mode === 'file' ? 'bg-amber-500 text-blue-900' : 'bg-blue-700 text-white'}`}
          >
            <Upload className="w-5 h-5 ml-2" />
            העלאת קובץ
          </Button>
          <Button 
            onClick={() => setMode('text')} 
            className={`flex-1 ${mode === 'text' ? 'bg-amber-500 text-blue-900' : 'bg-blue-700 text-white'}`}
          >
            <Type className="w-5 h-5 ml-2" />
            הדבקת טקסט
          </Button>
        </div>

        {/* File Upload Mode */}
        {mode === 'file' && (
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl mb-6 border-2 border-blue-600">
            <Label className="text-white text-lg mb-2 font-semibold">העלה קובץ הלכות</Label>
            <p className="text-blue-200 text-base mb-4">
              העלה קובץ טקסט (.txt) המכיל הלכות
            </p>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="block w-full text-white text-lg
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-lg file:border-0
                    file:text-lg file:font-semibold
                    file:bg-amber-500 file:text-blue-900
                    hover:file:bg-amber-600 file:cursor-pointer
                    cursor-pointer"
                />
              </div>
              <Button 
                onClick={handleExtractFromFile} 
                disabled={loading || !file} 
                className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold text-lg px-6 py-3"
              >
                <Upload className="w-5 h-5 ml-2" />
                {loading ? 'מעבד...' : 'חלץ הלכות'}
              </Button>
            </div>
          </div>
        )}

        {/* Text Input Mode */}
        {mode === 'text' && (
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl mb-6 border-2 border-blue-600">
            <Label className="text-white text-lg mb-2 font-semibold">הדבק את ההלכות כאן</Label>
            <p className="text-blue-200 text-base mb-4">
              הדבק טקסט המכיל הלכות - המערכת תזהה אותן באופן אוטומטי
            </p>
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="bg-blue-900 border-blue-600 text-white text-lg min-h-[300px] font-mono"
              placeholder="הדבק כאן את ההלכות..."
            />
            <Button 
              onClick={handleExtractFromText} 
              disabled={loading || !textInput.trim()} 
              className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold text-lg px-6 py-3 mt-4"
            >
              <Type className="w-5 h-5 ml-2" />
              {loading ? 'מעבד...' : 'חלץ הלכות'}
            </Button>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-900 rounded-lg border-2 border-green-600">
            <p className="text-green-100 text-lg">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900 rounded-lg border-2 border-red-600">
            <p className="text-red-100 text-lg">{error}</p>
          </div>
        )}

        {/* Extracted Halachot Preview */}
        {extractedHalachot.length > 0 && (
          <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl mb-6 border-2 border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-300">הלכות שנמצאו ({extractedHalachot.length})</h2>
              <Button onClick={handleImportAll} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold">
                <Plus className="w-5 h-5 ml-2" />
                ייבא הכל
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {extractedHalachot.map((halacha, index) => (
                <div key={index} className="bg-blue-900 p-4 rounded-lg border-2 border-blue-600">
                  <h3 className="text-xl font-bold text-amber-400 mb-2">{halacha.title}</h3>
                  <p className="text-white text-base mb-2">{halacha.content}</p>
                  {halacha.source && <p className="text-sm text-blue-300">מקור: {halacha.source}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl border-2 border-blue-600">
          <h2 className="text-2xl font-bold text-amber-300 mb-4">הוראות שימוש</h2>
          <ul className="list-disc list-inside space-y-2 text-blue-200 text-lg">
            <li>בחר בין העלאת קובץ להדבקת טקסט ישירות</li>
            <li>המערכת תחלץ את ההלכות באופן אוטומטי</li>
            <li>בדוק את ההלכות שנמצאו לפני הייבוא</li>
            <li>לחץ על "ייבא הכל" כדי להוסיף את ההלכות למאגר</li>
          </ul>
        </div>
      </div>
    </div>
  );
}