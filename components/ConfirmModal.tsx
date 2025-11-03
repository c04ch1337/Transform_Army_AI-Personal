import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  confirmButtonClass?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children,
  confirmText = "CONFIRM",
  confirmButtonClass = "bg-red-500 hover:bg-red-600"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
        <h2 className="font-display text-pink-400 text-xl mb-4 text-glow-pink">{title}</h2>
        <div className="mb-6 space-y-2 font-mono text-gray-300">{children}</div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="font-display bg-gray-700 text-gray-200 px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className={`font-display text-white px-6 py-2 rounded-md transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};