import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, Tablet, Monitor, Tv, Settings2 } from 'lucide-react'; // Added Settings2 for general icon

export default function LayoutSelector({ currentLayout, onLayoutChange }) {
  const [isVisible, setIsVisible] = useState(false);

  const layouts = [
    { value: 'auto', label: 'אוטומטי', icon: <Monitor className="w-4 h-4 mr-2" /> },
    { value: 'mobileVertical', label: 'טלפון (אנכי)', icon: <Smartphone className="w-4 h-4 mr-2" /> },
    { value: 'mobileHorizontal', label: 'טלפון (אופקי)', icon: <Tablet className="w-4 h-4 mr-2 transform rotate-90" /> },
    { value: 'desktop', label: 'צג מחשב', icon: <Monitor className="w-4 h-4 mr-2" /> },
    { value: 'tv', label: 'טלוויזיה', icon: <Tv className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div 
      className="fixed top-2 left-14 z-50 group" // Changed position to top-left, next to fullscreen
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)} // For touch devices
    >
      <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'}`}>
        <div className="bg-gray-800 bg-opacity-70 p-3 rounded-lg shadow-lg">
          <Select value={currentLayout} onValueChange={onLayoutChange}>
            <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="בחר תצוגה" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              {layouts.map(layout => (
                <SelectItem key={layout.value} value={layout.value} className="hover:bg-gray-600 focus:bg-gray-600">
                  <div className="flex items-center">
                    {layout.icon}
                    {layout.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400 mt-2 text-center">בחר פריסת תצוגה</p>
        </div>
      </div>
       {/* Always visible icon that triggers hover/focus */}
      {!isVisible && (
        <div className="absolute top-0 left-0 p-2 opacity-50 group-hover:opacity-100">
          <Settings2 className="w-5 h-5 text-white cursor-pointer" />
        </div>
      )}
    </div>
  );
}