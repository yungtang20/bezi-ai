import React from 'react';
import { BookOpen, Compass, Home, UserRound } from 'lucide-react';
import NavButton from './NavButton';
import { getTopArea, type TopArea } from '../lib/navigation';

interface NavigationBarProps {
  currentStep: number;
  onNavigate: (step: number) => void;
}

const tabs = [
  { id: 4, area: 'today', label: '今日', icon: Home },
  { id: 11, area: 'explore', label: '探索', icon: Compass },
  { id: 10, area: 'learn', label: '學習', icon: BookOpen },
  { id: 12, area: 'profile', label: '我的', icon: UserRound },
] satisfies { id: number; area: TopArea; label: string; icon: typeof Home }[];

export default function NavigationBar({ currentStep, onNavigate }: NavigationBarProps) {
  const activeArea = getTopArea(currentStep);
  return (
    <nav
      aria-label="主要導覽"
      className="fixed bottom-0 left-0 right-0 z-50 pb-4 pt-2"
      style={{
        background: 'rgba(8, 12, 10, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(212, 168, 83, 0.15)',
      }}
    >
      {/* 頂部金色漸變光暈 */}
      <div
        className="absolute top-0 left-0 w-full h-8 pointer-events-none opacity-40"
        style={{
          background: 'linear-gradient(180deg, rgba(212, 168, 83, 0.08) 0%, transparent 100%)',
        }}
      />

      <div className="relative flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavButton
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            isActive={activeArea === tab.area}
            onClick={() => onNavigate(tab.id)}
            orientation="horizontal"
          />
        ))}
      </div>
    </nav>
  );
}
