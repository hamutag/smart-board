import React, { useState, useEffect } from 'react';
import { NiftarWeekly } from '@/api/entities';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Mail, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addDays, parseISO, format, isWithinInterval } from 'date-fns';

export default function SendYahrzeitReminders() {
  const [niftarim, setNiftarim] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    loadUpcomingYahrzeits();
  }, []);

  const loadUpcomingYahrzeits = async () => {
    try {
      const allNiftarim = await NiftarWeekly.filter({ active: true, send_reminder: true });
      
      const today = new Date();
      const weekFromNow = addDays(today, 7);
      const currentYear = today.getFullYear();
      
      // Filter those with yahrzeit in the next week that haven't been reminded this year
      const upcoming = allNiftarim.filter(niftar => {
        if (!niftar.yahrzeit_gregorian_date || !niftar.family_email) return false;
        if (niftar.reminder_sent_year === currentYear) return false;
        
        try {
          const yahrzeitDate = parseISO(niftar.yahrzeit_gregorian_date);
          // Create this year's yahrzeit date
          const thisYearYahrzeit = new Date(currentYear, yahrzeitDate.getMonth(), yahrzeitDate.getDate());
          
          return isWithinInterval(thisYearYahrzeit, { start: today, end: weekFromNow });
        } catch {
          return false;
        }
      });
      
      setNiftarim(upcoming);
    } catch (err) {
      console.error("Error loading niftarim:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (niftar) => {
    setSending(true);
    try {
      const emailBody = `
שלום ${niftar.family_name || 'יקרים'},

אנו מזכירים לכם שיום האזכרה של ${niftar.hebrew_name} ז"ל מתקרב.
${niftar.yahrzeit_hebrew_date ? `תאריך עברי: ${niftar.yahrzeit_hebrew_date}` : ''}
תאריך לועזי: ${niftar.yahrzeit_gregorian_date}

המשפחה מוזמנת להשתתף בתפילות ולהדליק נר נשמה.

בברכה,
לוח חכם ארנון
      `.trim();

      await base44.integrations.Core.SendEmail({
        to: niftar.family_email,
        subject: `תזכורת אזכרה - ${niftar.hebrew_name} ז"ל`,
        body: emailBody
      });

      // Mark as sent this year
      await NiftarWeekly.update(niftar.id, { 
        reminder_sent_year: new Date().getFullYear() 
      });

      setSentEmails(prev => [...prev, niftar.id]);
    } catch (err) {
      console.error("Error sending email:", err);
      setErrors(prev => [...prev, { id: niftar.id, error: err.message }]);
    } finally {
      setSending(false);
    }
  };

  const sendAllReminders = async () => {
    for (const niftar of niftarim) {
      if (!sentEmails.includes(niftar.id)) {
        await sendReminder(niftar);
      }
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("NiftarimAdmin")}>
            <Button variant="outline" className="bg-blue-800 border-blue-600 hover:bg-blue-700 text-white">
              <ArrowRight className="w-5 h-5 ml-2" />
              חזרה לניהול
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-amber-400">שליחת תזכורות אזכרה</h1>
        </div>

        <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-bold text-amber-300 mb-4">אזכרות בשבוע הקרוב ({niftarim.length})</h2>
          
          {niftarim.length > 0 ? (
            <>
              <div className="space-y-3 mb-6">
                {niftarim.map((niftar) => (
                  <div key={niftar.id} className="bg-blue-900/50 p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-white">{niftar.hebrew_name}</p>
                      <p className="text-blue-300">{niftar.yahrzeit_hebrew_date} | {niftar.yahrzeit_gregorian_date}</p>
                      <p className="text-blue-400 text-sm">
                        <Mail className="w-4 h-4 inline ml-1" />
                        {niftar.family_email} ({niftar.family_name})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {sentEmails.includes(niftar.id) ? (
                        <span className="text-green-400 flex items-center gap-1">
                          <Check className="w-5 h-5" />
                          נשלח
                        </span>
                      ) : errors.find(e => e.id === niftar.id) ? (
                        <span className="text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-5 h-5" />
                          שגיאה
                        </span>
                      ) : (
                        <Button 
                          onClick={() => sendReminder(niftar)} 
                          disabled={sending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Mail className="w-4 h-4 ml-2" />
                          שלח תזכורת
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={sendAllReminders} 
                disabled={sending || sentEmails.length === niftarim.length}
                className="bg-amber-500 hover:bg-amber-600 text-blue-900 w-full"
              >
                <Mail className="w-5 h-5 ml-2" />
                שלח את כל התזכורות ({niftarim.length - sentEmails.length} נותרו)
              </Button>
            </>
          ) : (
            <p className="text-blue-300 text-center">אין אזכרות בשבוע הקרוב שדורשות תזכורת</p>
          )}
        </div>

        <div className="bg-blue-800 bg-opacity-40 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-amber-300 mb-2">הערות</h3>
          <ul className="text-blue-200 space-y-1 text-sm">
            <li>• התזכורות נשלחות למשפחות שהוגדר להן מייל ואופציית "שלח תזכורת"</li>
            <li>• כל משפחה תקבל תזכורת אחת בשנה בלבד</li>
            <li>• מומלץ להריץ דף זה פעם בשבוע</li>
          </ul>
        </div>
      </div>
    </div>
  );
}