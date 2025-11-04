import React from 'react';
import { Modal } from './Modal';

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
  const footer = (
    <>
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
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      {children}
    </Modal>
  );
};