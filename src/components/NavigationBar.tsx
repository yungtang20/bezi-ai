import React from 'react';
import { Home, LineChart, Cpu, Calendar, Users, BookOpen } from 'lucide-react';
import NavButton from './NavButton';

interface NavigationBarProps {
  currentStep: number;
  onNavigate: (step: number) => void;
}

const tabs = [
  { id: 4, label: '命局', icon: Home },
  { id: 6, label: '歲運', icon: LineChart },
  { id: 7, label: '專項', icon: Cpu },
  { id: 8, label: '流日', icon: Calendar },
  { id: 9, label: '合盤', icon: Users },
  { id: 10, label: '理論', icon: BookOpen },
];

export default function NavigationBar({ currentStep, onNavigate }: NavigationBarProps) {
  return (
    <div
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
            isActive={currentStep === tab.id}
            onClick={() => onNavigate(tab.id as any)}
            orientation="horizontal"
          />
        ))}
      </div>
    </div>
  );
}
