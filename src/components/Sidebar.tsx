import React from 'react';
import { Home, Compass, BookOpen, Sparkles, Settings, UserRound } from 'lucide-react';
import type { Step } from '../App';
import NavButton from './NavButton';
import { getTopArea, type TopArea } from '../lib/navigation';

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
  area: TopArea;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

const mainItems: TabItem[] = [
  { id: 4, area: 'today', label: '今日', icon: Home },
  { id: 11, area: 'explore', label: '探索', icon: Compass },
  { id: 10, area: 'learn', label: '學習', icon: BookOpen },
  { id: 12, area: 'profile', label: '我的命盤', icon: UserRound },
];

export default function Sidebar({ currentStep, onNavigate, showAI, onToggleAI, onOpenSettings }: SidebarProps) {
  const activeArea = getTopArea(currentStep);
  return (
    <nav
      aria-label="主要導覽"
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
          Bezi 日誌
        </h1>
      </div>

      {/* 四個使用者心智區域 */}
      <div className="relative space-y-0.5 flex-1 overflow-y-auto no-scrollbar">
        {mainItems.map((tab) => (
          <NavButton
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            isActive={activeArea === tab.area}
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
