import React, { useId } from 'react';
import { X } from 'lucide-react';
import { useDialog } from '../lib/useDialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
}: ModalProps) {
  const dialogRef = useDialog(isOpen);
  const titleId = useId();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="modal-dialog"
    >
      <div
        className="w-full rounded-2xl p-6 relative"
        style={{
          background: 'linear-gradient(180deg, #0f1a14 0%, #0a1210 100%)',
          border: '1px solid rgba(212, 168, 83, 0.2)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {icon}
            <h2
              id={titleId}
              className="text-base font-bold tracking-widest text-zen-gold"
              style={{ fontFamily: '"Noto Serif TC", serif' }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-zen-muted hover:text-white"
            aria-label="關閉"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
