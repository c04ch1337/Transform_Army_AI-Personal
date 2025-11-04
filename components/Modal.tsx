import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
}

const FOCUSABLE_ELEMENTS = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, className }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = Array.from(modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS));
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            // Fix: Cast to HTMLElement to resolve incorrect type inference.
            (lastElement as HTMLElement).focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            // Fix: Cast to HTMLElement to resolve incorrect type inference.
            (firstElement as HTMLElement).focus();
            event.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      
      // Defer focus to allow modal to render
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_ELEMENTS);
        firstFocusable?.focus();
      }, 100);

    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 w-full m-4 flex flex-col max-h-[90vh] ${className || 'max-w-lg'}`}
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        <h2 id="modal-title" className="font-display text-pink-400 text-xl mb-4 text-glow-pink flex-shrink-0">{title}</h2>
        <div className="mb-6 space-y-2 font-mono text-gray-300 flex-grow overflow-y-auto pr-2 min-h-0">
          {children}
        </div>
        <div className="flex justify-end gap-4 mt-auto pt-4 border-t border-pink-500/30 flex-shrink-0">
          {footer}
        </div>
      </div>
    </div>
  );
};