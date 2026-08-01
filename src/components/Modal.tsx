import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, icon, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl p-6 relative"
          style={{
            background: 'linear-gradient(180deg, #0f1a14 0%, #0a1210 100%)',
            border: '1px solid rgba(212, 168, 83, 0.2)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {icon}
              <h2 className="text-base font-bold tracking-widest text-zen-gold" style={{ fontFamily: '"Noto Serif TC", serif' }}>
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
      </div>
    </>
  );
}
