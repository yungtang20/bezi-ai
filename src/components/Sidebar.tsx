import React from 'react';
import { Home, LineChart, Calendar, Cpu, Compass, Users, BookOpen, Sparkles, Settings } from 'lucide-react';
import type { Step } from '../App';
import NavButton from './NavButton';

interface SidebarProps {
  currentStep: Step;
  onNavigate: (step: Step) => void;
  showAI: boolean;
  onToggleAI: () => void;
  onOpenSettings: () => void;
}

// [AI MOD] 為 tab 項目定義型別
interface TabItem {
  id: Step;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

const groups: { title: string; items: TabItem[] }[] = [
  {
    title: '命局格局',
    items: [
      { id: 4, label: '先天命局', icon: Home },
      { id: 7, label: '深度專項', icon: Cpu },
    ]
  },
  {
    title: '歲運推演',
    items: [
      { id: 6, label: '大運流年', icon: LineChart },
      { id: 8, label: '流月流日', icon: Calendar },
    ]
  }
];

const bottomItems: TabItem[] = [
  { id: 9, label: '合盤配對', icon: Users },
  { id: 10, label: '理論對照', icon: BookOpen },
];

export default function Sidebar({ currentStep, onNavigate, showAI, onToggleAI, onOpenSettings }: SidebarProps) {
  return (
    <nav
      className="hidden md:flex flex-col w-44 h-screen fixed left-0 top-0 z-50 p-4 pt-10 shadow-2xl"
      style={{
        background: 'linear-gradient(180deg, #0a1a12 0%, #0d2218 100%)',
        borderRight: '1px solid rgba(212, 168, 83, 0.15)',
      }}
    >
      {/* 頂部光暈裝飾 */}
      <div
        className="absolute top-0 left-0 w-full h-32 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212, 168, 83, 0.12) 0%, transparent 70%)',
        }}
      />

      {/* Logo 區域 */}
      <div className="relative flex items-center gap-2.5 mb-10 px-1">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: 'rgba(212, 168, 83, 0.12)',
            boxShadow: '0 0 12px rgba(212, 168, 83, 0.08)',
          }}
        >
          <Compass size={16} className="text-zen-gold" />
        </div>
        <h1
          className="text-sm font-bold tracking-widest text-zen-gold"
          style={{ fontFamily: '"Noto Serif TC", serif' }}
        >
          觀測系統
        </h1>
      </div>

      {/* 導航區域（所有項目連續排列） */}
      <div className="relative space-y-0.5 flex-1 overflow-y-auto no-scrollbar">
        {groups.map((group) => (
          <div key={group.title} className="space-y-0.5">
            <h3 className="text-[9px] font-bold text-zen-muted/40 tracking-widest px-2 pt-2 pb-0.5 uppercase">
              {group.title}
            </h3>
            {group.items.map((tab) => (
              <NavButton
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                isActive={currentStep === tab.id}
                onClick={() => onNavigate(tab.id)}
                orientation="vertical"
              />
            ))}
          </div>
        ))}

        {/* 分隔線 */}
        <div className="px-3 py-1">
          <div className="h-px bg-zen-gold/10" />
        </div>

        {/* 底部項目（流日、合盤、理論知識） */}
        {bottomItems.map((tab) => (
          <NavButton
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            isActive={currentStep === tab.id}
            onClick={() => onNavigate(tab.id)}
            orientation="vertical"
          />
        ))}

        {/* AI 問答切換按鈕 */}
        <NavButton
          icon={Sparkles}
          label="AI 問答"
          isActive={showAI}
          onClick={onToggleAI}
          orientation="vertical"
        />

        {/* 分隔線 */}
        <div className="px-3 py-1">
          <div className="h-px bg-zen-gold/10" />
        </div>

        {/* 設定按鈕 */}
        <NavButton
          icon={Settings}
          label="設定"
          onClick={onOpenSettings}
          orientation="vertical"
        />
      </div>
    </nav>
  );
}
