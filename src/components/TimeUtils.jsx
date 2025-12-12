export const formatTime = (timeString) => {
  if (!timeString) return "--:--";
  
  // אם זה מחרוזת זמן בפורמט HH:MM:SS או HH:MM, נחלץ רק את השעות והדקות
  if (typeof timeString === 'string') {
    const match = timeString.match(/^(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
  }
  
  return "--:--";
};

// פונקציה פשוטה שרק מחזירה את התאריך העברי כמו שהוא
export const formatHebrewDate = (hebrewDate) => {
  if (!hebrewDate) return "";
  return hebrewDate;
};