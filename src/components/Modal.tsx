import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, icon, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = dialogRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(item => !item.hasAttribute('disabled'));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus(); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
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
              <h2 id="modal-title" className="text-base font-bold tracking-widest text-zen-gold" style={{ fontFamily: '"Noto Serif TC", serif' }}>
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
