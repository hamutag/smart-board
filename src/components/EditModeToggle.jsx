import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Save, X, Download, Upload } from 'lucide-react';

export default function EditModeToggle({ 
  isEditMode, 
  onToggleEdit, 
  onSaveLayout, 
  onLoadLayout, 
  onExportLayout 
}) {
  const handleImportLayout = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const layout = JSON.parse(e.target.result);
          onLoadLayout(layout);
        } catch (error) {
          alert('שגיאה בקריאת הקובץ');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {!isEditMode ? (
        <Button
          onClick={onToggleEdit}
          className="bg-amber-500 hover:bg-amber-600 text-blue-900"
          size="sm"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          מצב עריכה מתקדם
        </Button>
      ) : (
        <div className="bg-gray-900 p-4 rounded-lg space-y-2">
          <div className="text-white text-sm font-bold mb-2">בקרת עריכה</div>
          
          <Button
            onClick={onSaveLayout}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            שמור פריסה
          </Button>
          
          <Button
            onClick={onExportLayout}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            יצוא פריסה
          </Button>
          
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportLayout}
              className="hidden"
              id="import-layout"
            />
            <label htmlFor="import-layout">
              <Button
                className="w-full bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
                size="sm"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  יבוא פריסה
                </span>
              </Button>
            </label>
          </div>
          
          <Button
            onClick={onToggleEdit}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            size="sm"
          >
            <X className="w-4 h-4 mr-2" />
            סיום עריכה
          </Button>
        </div>
      )}
    </div>
  );
}