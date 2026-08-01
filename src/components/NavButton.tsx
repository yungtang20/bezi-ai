import React from 'react';

interface NavButtonProps {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  orientation?: 'horizontal' | 'vertical'; // For distinguishing between Sidebar (vertical) and NavigationBar (horizontal)
}

export default function NavButton({ icon: Icon, label, isActive, onClick, orientation = 'vertical' }: NavButtonProps) {
  if (orientation === 'horizontal') {
    return (
      <button
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative group focus:outline-none"
        style={{
          color: isActive ? '#d4a853' : 'rgba(200, 200, 190, 0.4)',
        }}
      >
        <span
          className="relative transition-transform duration-300"
          style={{
            transform: isActive ? 'scale(1.15) translateY(-2px)' : undefined,
            filter: isActive ? 'drop-shadow(0 0 4px rgba(212, 168, 83, 0.4))' : undefined,
          }}
        >
          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
          {isActive && (
            <span
              className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-zen-gold"
              style={{ boxShadow: '0 0 6px rgba(212, 168, 83, 0.6)' }}
            />
          )}
        </span>
        <span
          className="text-[11px] tracking-widest mt-1 transition-all duration-300"
          style={{
            fontWeight: isActive ? 700 : 500,
            opacity: isActive ? 1 : 0.55,
            transform: 'translateY(0)',
          }}
        >
          {label}
        </span>
      </button>
    );
  }

  // Vertical orientation (Sidebar)
  return (
    <button
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className="relative w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-300 group focus:ring-2 focus:ring-zen-gold/50 focus:outline-none"
      style={{
        color: isActive ? '#d4a853' : 'rgba(200, 200, 190, 0.6)',
        backgroundColor: isActive ? 'rgba(212, 168, 83, 0.08)' : 'transparent',
      }}
    >
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full"
          style={{
            background: 'linear-gradient(180deg, #d4a853 0%, #b8942e 100%)',
            boxShadow: '0 0 6px rgba(212, 168, 83, 0.4)',
          }}
        />
      )}
      <span
        className="transition-transform duration-300"
        style={{
          transform: isActive ? 'scale(1.1)' : undefined,
          filter: isActive ? 'drop-shadow(0 0 3px rgba(212, 168, 83, 0.3))' : undefined,
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
      </span>
      <span
        className="text-[13px] tracking-wide transition-all duration-300"
        style={{
          fontWeight: isActive ? 700 : 400,
          textShadow: isActive ? '0 0 8px rgba(212, 168, 83, 0.2)' : 'none',
        }}
      >
        {label}
      </span>
    </button>
  );
}