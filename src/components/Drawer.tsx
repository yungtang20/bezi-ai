import React from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, title, icon, children }: DrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-96 max-w-[90vw] z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0a1a12 0%, #0d2218 100%)',
          borderLeft: '1px solid rgba(212, 168, 83, 0.15)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-zen-gold/10">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(212, 168, 83, 0.12)',
                boxShadow: '0 0 12px rgba(212, 168, 83, 0.08)',
              }}
            >
              {icon}
            </div>
            <h2
              className="text-sm font-bold tracking-widest text-zen-gold"
              style={{ fontFamily: '"Noto Serif TC", serif' }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zen-gold/10 transition-colors text-zen-muted hover:text-zen-gold"
            aria-label="關閉"
          >
            <X size={18} />
          </button>
        </div>

        {/* Panel Content */}
        <div style={{ height: 'calc(100vh - 73px)' }}>
          {children}
        </div>
      </div>
    </>
  );
}
