import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [visible, setVisible] = useState(false);

  // Return nothing if text is empty to avoid showing empty tooltips
  if (!text) {
    return <>{children}</>;
  }

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-10 border border-gray-600">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};