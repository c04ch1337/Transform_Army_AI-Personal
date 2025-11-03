import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const config = {
  success: {
    bgColor: 'bg-green-900',
    borderColor: 'border-green-600',
    textColor: 'text-green-200',
    icon: '✨',
  },
  error: {
    bgColor: 'bg-red-900',
    borderColor: 'border-red-600',
    textColor: 'text-red-200',
    icon: '❌',
  }
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const { bgColor, borderColor, textColor, icon } = config[type];

  return (
    <div 
      className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-lg border shadow-lg ${bgColor} ${borderColor} ${textColor} animate-fade-in-up`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 text-lg">{icon}</div>
        <div className="ml-3 flex-1 pt-0.5">
          <p className="text-sm font-medium font-display">{type === 'success' ? 'Success!' : 'Oh no!'}</p>
          <p className="mt-1 text-sm font-mono">{message}</p>
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className="inline-flex rounded-md bg-transparent text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};