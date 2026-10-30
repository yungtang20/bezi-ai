// App — thin step coordinator.
// 路由與頁面調度層：不再包含表單驗證、排盤計算、校準邏輯（已拆至 hooks）。
import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Compass,
  Moon,
  Sun,
  Github,
  Sparkles,
  Settings,
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import NavigationBar from './components/NavigationBar';
import Modal from './components/Modal';
import Drawer from './components/Drawer';
import { SkeletonPage } from './components/Skeleton';
import { useAppStep } from './hooks/useAppStep';
import { useBirthChart } from './hooks/useBirthChart';
import { useCalibration } from './hooks/useCalibration';
import AIChatPanel from './components/AIChatPanel';
import { BIRTH_CITIES, cityLongitude } from './lib/trueSolarCities';
import { getPatternScores } from './storage';
import {
  GAN_TO_ELEMENT,
  getCheckYears,
  getFavorableElements,
  getPrimaryPattern,
  type PatternScores,
} from '@bezi/core';
import { CLIENT_CONFIG } from './config';
import { trackProductEvent } from './lib/productEvents';

// [AI MOD] Lazy-loaded page components
// Dashboard 已精簡為先天命局，直接 import（非 lazy）
const Dashboard = lazy(() => import('./components/Dashboard'));
const ExplorePage = lazy(() => import('./components/ExplorePage'));
const SpecialtyNav = lazy(() => import('./components/SpecialtyNav'));
const DailyForecastPage = lazy(() => import('./components/DailyForecastPage'));
const TimelinePage = lazy(() => import('./components/TimelinePage'));
const SynastryPage = lazy(() => import('./components/SynastryPage'));
const ReferenceTablePage = lazy(
  () => import('./components/ReferenceTablePage')
);

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// [AI MOD] 範例命盤：1984-03-25 10:00 男，engine 實排 = 甲子 丁卯 戊午 丁巳（日主戊），
// 與 server 端 demo-001 證據（data/bezi.db）一致，AI 回答與畫面不矛盾
const DEMO_BIRTH = {
  name: '範例命盤',
  gender: 'male' as const,
  birthDate: '1984-03-25',
  birthTime: '10',
};

export default function App() {
  const { step, handleNavigate } = useAppStep();
  const [initializing, setInitializing] = useState(true);
  const initDoneRef = useRef(false);
  const {
    form,
    timeInputRef,
    birthCity,
    setBirthCity,
    bazi,
    pattern,
    isGenerating,
    errorMsg,
    handleStart,
    restoreFromStorage,
  } = useBirthChart(onChartReady, {
    onChartSettled: () => handleNavigate(3),
    onChartFailed: () => {
      // deep-link 指向需命盤的頁面但排盤失敗 → 回表單並清 hash。
      if (window.location.hash) window.location.hash = '';
      sessionStorage.removeItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP);
      handleNavigate(1);
    },
  });
  const {
    scores,
    setScores,
    calibrations,
    handleCalibration,
    skipCalibration,
    loadScores,
  } = useCalibration(null, pattern);

  function onChartReady(
    chartDisplay: {
      chart: unknown;
      year: string;
      month: string;
      day: string;
      time: string;
    },
    patternResult: { pattern: string },
    nextScores: PatternScores
  ) {
    void loadScores();
    setScores(nextScores);
  }

  // Mount 時還原：localStorage 有出生資料 → 重排盤並依「是否有存檔分數」決定回 4 或 3；
  // 無存檔 → step 1。StrictMode 雙跑以 ref 防重複（舊版 mount effect 的 hook 化還原）。
  useEffect(() => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;

    const hasSaved =
      localStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.NAME) &&
      localStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.GENDER) &&
      localStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.DATE) !== null;

    if (!hasSaved) {
      handleNavigate(1);
      sessionStorage.removeItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP);
      setInitializing(false);
      return;
    }

    void (async () => {
      const restored = await restoreFromStorage();
      if (!restored) {
        // 存檔排盤失敗 → 清 deep-link，回表單重填。
        if (window.location.hash) window.location.hash = '';
        sessionStorage.removeItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP);
        handleNavigate(1);
        setInitializing(false);
        return;
      }
      try {
        const savedScores = await getPatternScores();
        if (savedScores) {
          setScores(savedScores);
        }
        // 有存檔命盤即進 dashboard（分數可為 null，由校準重算）；
        // sessionStorage 有步驟（deep-link / 回退）則尊重之。
        if (!sessionStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP)) {
          handleNavigate(savedScores ? 4 : 3);
        }
      } catch {
        // DB 錯誤不擋 UI：分數留空由校準重算。
        if (!sessionStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP)) {
          handleNavigate(3);
        }
      }
      setInitializing(false);
    })();
  }, [handleNavigate, restoreFromStorage, setScores]);

  const [showAI, setShowAI] = useState(false);
  const showSettings = false;

  const openAI = () => {
    trackProductEvent('ai_panel_opened');
    setShowAI(true);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-zen-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zen-sage/30 border-t-zen-sage animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zen-bg text-zen-text overflow-hidden flex flex-col items-center justify-start md:justify-center relative selection:bg-zen-sage selection:text-white">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-zen-accent/20 blur-[100px] md:blur-[140px]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-zen-sage/20 blur-[100px] md:blur-[120px]"
        />
        {/* Subtle grid texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGgwLjV2NDBIMHptMCAwaDQwdjAuNUgweiIgZmlsbD0icmdiYSgwLDAsMCwwLjA0KSIvPgo8L3N2Zz4=')] opacity-30 mask-image:linear-gradient(to_bottom,white,transparent)"></div>
      </div>

      {/* Main Container */}
      <main
        className={`w-full ${step <= 3 ? 'max-w-md flex items-center justify-center min-h-screen' : 'md:pl-44 pt-[5vh] pb-32 min-h-screen'} px-4 md:px-6 py-8 md:py-12 relative z-10 hidden-scrollbar`}
      >
        {step >= 4 && (
          <Sidebar
            currentStep={step}
            onNavigate={handleNavigate}
            showAI={showAI}
            onToggleAI={() => (showAI ? setShowAI(false) : openAI())}
            onOpenSettings={() => {}}
          />
        )}
        {step >= 4 && (
          <div className="md:hidden">
            <NavigationBar currentStep={step} onNavigate={handleNavigate} />
          </div>
        )}
        {step >= 4 && (
          <div className="md:hidden fixed top-4 right-4 z-40">
            <button
              onClick={() => {}}
              aria-label="開啟系統設定"
              className="p-2.5 rounded-full bg-zinc-950/80 border border-white/10 text-zen-gold shadow-lg backdrop-blur-md hover:bg-zinc-900 transition-all active:scale-95 flex items-center justify-center focus:outline-none"
              title="系統設定"
            >
              <Settings size={18} />
            </button>
          </div>
        )}
        {step >= 4 && !showAI && (
          <div className="md:hidden fixed bottom-32 right-5 z-40">
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={openAI}
              aria-label="開啟 AI 問答"
              className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-zen-gold to-amber-600 text-zinc-950 font-bold shadow-[0_8px_24px_rgba(212,168,83,0.35)] border border-amber-400/30 transition-all duration-300 text-xs focus:outline-none"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>AI 問答</span>
              <span className="absolute inset-0 rounded-full border border-amber-400/50 animate-ping opacity-25 pointer-events-none" />
            </motion.button>
          </div>
        )}
        <AnimatePresence mode="wait">
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="w-full relative"
            >
              <Suspense fallback={<SkeletonPage />}>
                <Dashboard
                  bazi={bazi}
                  name={form.name}
                  onNavigate={handleNavigate}
                  scores={scores}
                  birthDate={form.birthDate}
                  birthTime={form.birthTime}
                  gender={form.gender}
                  view="today"
                />
              </Suspense>
            </motion.div>
          )}
          {step === 11 && (
            <motion.div
              key="step11"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-full relative"
            >
              <Suspense fallback={<SkeletonPage />}>
                <ExplorePage onNavigate={handleNavigate} />
              </Suspense>
            </motion.div>
          )}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full relative"
            >
              <Suspense fallback={<SkeletonPage />}>
                <TimelinePage
                  chart={bazi?.chart}
                  scores={scores!}
                  name={form.name}
                  onNavigate={handleNavigate}
                />
              </Suspense>
            </motion.div>
          )}
          {step === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full relative"
            >
              <Suspense fallback={<SkeletonPage />}>
                <SpecialtyNav
                  chart={bazi!.chart}
                  scores={scores!}
                  name={form.name}
                  onNavigate={handleNavigate}
                />
              </Suspense>
            </motion.div>
          )}
          {step === 8 && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full relative"
            >
              <Suspense fallback={<SkeletonPage />}>
                <DailyForecastPage
                  chart={bazi?.chart}
                  scores={scores!}
                  onNavigate={handleNavigate}
                />
              </Suspense>
            </motion.div>
          )}
          {step === 9 && (
            <motion.div
              key="step9"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full relative"
            >
              <Suspense fallback={<SkeletonPage />}>
                <SynastryPage
                  myChart={bazi!.chart}
                  myName={form.name}
                  myScores={scores!}
                  onNavigate={handleNavigate}
                />
              </Suspense>
            </motion.div>
          )}
          {step === 10 && (
            <motion.div
              key="step10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full relative"
            >
              <Suspense fallback={<SkeletonPage />}>
                <ReferenceTablePage onNavigate={handleNavigate} />
              </Suspense>
            </motion.div>
          )}
          {step === 12 && (
            <motion.div
              key="step12"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-full relative"
            >
              <Suspense fallback={<SkeletonPage />}>
                <Dashboard
                  bazi={bazi}
                  name={form.name}
                  onNavigate={handleNavigate}
                  scores={scores}
                  birthDate={form.birthDate}
                  birthTime={form.birthTime}
                  gender={form.gender}
                  view="profile"
                />
              </Suspense>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center w-full"
            >
              {/* Header */}
              <div className="text-center mb-8 space-y-2">
                <div className="inline-flex items-center justify-center p-2 rounded-full bg-zen-card shadow-sm border border-zen-muted/10 mb-2 animate-in fade-in zoom-in duration-1000 delay-200">
                  <Compass size={20} className="text-zen-sage" />
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-zen-text tracking-tight mx-auto max-w-md leading-tight">
                  30 秒，看懂你的
                  <br />
                  八字節奏
                </h1>
                <p className="text-sm md:text-base text-zen-muted max-w-sm mx-auto tracking-wide leading-relaxed">
                  先看今日提醒，再決定要不要深入。
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 text-[10px] text-zen-muted/80">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    免註冊
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    時辰可稍後補充
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    資料留在目前裝置
                  </span>
                </div>
              </div>

              {/* Form Card */}
              <div className="w-full bg-zen-card/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/5 md:border-white/10">
                <div className="space-y-4 md:space-y-5">
                  <div className="space-y-4 relative">
                    <div className="absolute left-0 top-2 bottom-4 w-px bg-gradient-to-b from-zen-sage/30 via-zen-sage/10 to-transparent"></div>

                    {/* Input Group: Name */}
                    <div className="relative pl-6">
                      <div className="absolute left-[-4px] top-[12px] w-2 h-2 rounded-full bg-zen-sage border-2 border-white shadow-sm"></div>
                      <label
                        htmlFor="birth-name"
                        className="block text-xs tracking-[0.2em] uppercase text-zen-muted mb-1 font-medium"
                      >
                        您的稱呼（選填）
                      </label>
                      <input
                        id="birth-name"
                        type="text"
                        value={form.name}
                        onChange={(e) => form.setName(e.target.value)}
                        placeholder="選填"
                        className="w-full bg-transparent border-b border-zen-muted/20 py-2 outline-none text-lg font-serif text-zen-text placeholder:text-zen-muted/40 focus:border-zen-sage transition-colors"
                      />
                    </div>

                    {/* Input Group: Gender */}
                    <div className="relative pl-6">
                      <div className="absolute left-[-4px] top-[12px] w-2 h-2 rounded-full bg-zen-sage border-2 border-white shadow-sm"></div>
                      <fieldset>
                        <legend className="block text-xs tracking-[0.2em] uppercase text-zen-muted mb-2 font-medium">
                          生理性別 <span className="text-red-400">*</span>
                        </legend>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            aria-pressed={form.gender === 'male'}
                            onClick={() => form.setGender('male')}
                            className={`flex-1 py-2 md:py-2.5 px-3 md:px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border ${
                              form.gender === 'male'
                                ? 'bg-zen-text border-zen-text text-zen-bg shadow-md'
                                : 'bg-white/5 border-zen-muted/20 text-zen-muted hover:border-zen-muted/40 hover:bg-white/10'
                            }`}
                          >
                            <Sun
                              size={14}
                              className={
                                form.gender === 'male' ? 'text-zen-accent' : ''
                              }
                            />
                            <span className="font-medium text-sm">男</span>
                          </button>
                          <button
                            type="button"
                            aria-pressed={form.gender === 'female'}
                            onClick={() => form.setGender('female')}
                            className={`flex-1 py-2 md:py-2.5 px-3 md:px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border ${
                              form.gender === 'female'
                                ? 'bg-zen-text border-zen-text text-zen-bg shadow-md'
                                : 'bg-white/5 border-zen-muted/20 text-zen-muted hover:border-zen-muted/40 hover:bg-white/10'
                            }`}
                          >
                            <Moon
                              size={14}
                              className={
                                form.gender === 'female'
                                  ? 'text-zen-accent'
                                  : ''
                              }
                            />
                            <span className="font-medium text-sm">女</span>
                          </button>
                        </div>
                      </fieldset>
                    </div>

                    {/* Input Group: DateTime */}
                    <div className="relative pl-6 z-10">
                      <div className="absolute left-[-4px] top-[12px] w-2 h-2 rounded-full bg-zen-sage border-2 border-white shadow-sm"></div>
                      <div className="block text-xs tracking-[0.2em] uppercase text-zen-muted mb-2 font-medium">
                        出生資訊 <span className="text-red-400">*</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                        <div>
                          <label
                            htmlFor="birth-date"
                            className="block text-xs text-zen-muted mb-1 font-medium"
                          >
                            生日（年/月/日）
                          </label>
                          <div className="bg-white/5 rounded-xl border border-zen-muted/20 px-3 py-2 md:py-2.5 focus-within:border-zen-sage transition-colors">
                            <input
                              id="birth-date"
                              type="text"
                              inputMode="numeric"
                              value={form.birthDate}
                              onChange={form.handleDateChange}
                              placeholder="例如：1990/01/01"
                              aria-describedby="birth-date-help"
                              aria-invalid={Boolean(
                                form.birthDate && form.birthDate.length !== 10
                              )}
                              className="w-full bg-transparent outline-none text-base font-serif text-zen-text placeholder:text-zen-muted/30"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="birth-time"
                            className="block text-xs text-zen-muted mb-1 font-medium"
                          >
                            出生時間（選填）
                          </label>
                          <div className="bg-white/5 rounded-xl border border-zen-muted/20 px-3 py-2 md:py-2.5 focus-within:border-zen-sage transition-colors">
                            <input
                              id="birth-time"
                              ref={timeInputRef}
                              type="text"
                              inputMode="numeric"
                              value={form.birthTimeInput}
                              onChange={(e) =>
                                form.parseHourInput(e.target.value)
                              }
                              onKeyDown={form.handleTimeKeyDown}
                              placeholder="例如：1430 或 14：30；不知道可留空"
                              aria-describedby="birth-time-help"
                              aria-invalid={Boolean(form.hourError)}
                              className={`w-full bg-transparent outline-none text-base font-serif text-zen-text placeholder:text-zen-muted/30 ${form.hourError ? 'text-rose-400' : ''}`}
                            />
                            {form.birthTime && (
                              <div className="text-zen-accent font-medium text-sm tracking-widest px-2 py-1 mt-2">
                                年柱時辰
                              </div>
                            )}
                            {form.hourError && (
                              <p className="text-rose-400 text-sm mt-2 pl-2">
                                {form.hourError}
                              </p>
                            )}
                            {!form.birthTime && !form.hourError && (
                              <p
                                id="birth-time-help"
                                className="text-zen-muted/80 text-[11px] md:text-xs mt-2 pl-2 leading-relaxed"
                              >
                                不知道出生時辰也沒關係，可留空先看主要分析。
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      {form.birthDate &&
                        parseInt(form.birthDate.split('-')[0], 10) >= 1945 &&
                        parseInt(form.birthDate.split('-')[0], 10) <= 1979 && (
                          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-xl text-sm md:text-xs">
                            ⚠️
                            您的出生年份可能受到台灣日光節約時間影響，若在此時間內出生，請確認輸入的時間已扣除一小時。
                          </div>
                        )}
                      {/* [P2] 真太陽時：出生城市快選（選填，預設關閉 → 行為不變） */}
                      {form.birthTime && (
                        <div className="mt-3">
                          <label
                            htmlFor="birth-city"
                            className="block text-xs text-zen-muted mb-1 font-medium"
                          >
                            出生城市（選填，用於真太陽時校正）
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {BIRTH_CITIES.map((c) => (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() => {
                                  const next =
                                    birthCity === c.name ? '' : c.name;
                                  setBirthCity(next);
                                  if (next) {
                                    localStorage.setItem(
                                      CLIENT_CONFIG.STORAGE_KEYS.LONGITUDE,
                                      next
                                    );
                                  } else {
                                    localStorage.removeItem(
                                      CLIENT_CONFIG.STORAGE_KEYS.LONGITUDE
                                    );
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                                  birthCity === c.name
                                    ? 'border-zen-gold/60 bg-zen-gold/20 text-zen-gold'
                                    : 'border-white/10 bg-white/5 text-zen-muted hover:bg-white/10'
                                }`}
                              >
                                {c.name}
                              </button>
                            ))}
                          </div>
                          {birthCity && (
                            <p className="text-zen-accent/80 text-[11px] mt-1.5">
                              已依「{birthCity}」的真太陽時校正時辰（經度{' '}
                              {cityLongitude(birthCity)}°E）。
                            </p>
                          )}
                        </div>
                      )}
                      <details
                        id="birth-date-help"
                        className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-zen-muted/80"
                      >
                        <summary className="cursor-pointer font-medium text-zen-muted">
                          資料如何使用？
                        </summary>
                        <p className="mt-2 leading-relaxed">
                          姓名與出生資料預設只保存在這台裝置。只有開啟 AI
                          問答時，出生資料才會送至後端建立當次工作階段的驗證資料；不會送出姓名。
                        </p>
                      </details>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1 md:pt-2">
                    {errorMsg && (
                      <p
                        role="alert"
                        className="text-rose-400 text-sm text-center mb-2 font-medium"
                      >
                        {errorMsg}
                      </p>
                    )}
                    {!form.isFormValid && !errorMsg && (
                      <p className="text-zen-muted/70 text-xs text-center mb-2">
                        請先選擇性別並填寫生日，時辰可以稍後補充。
                      </p>
                    )}
                    <button
                      id="start-calculation-btn"
                      onClick={() => handleStart()}
                      disabled={!form.isFormValid || isGenerating}
                      className={`group w-full py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all duration-500 overflow-hidden relative ${
                        form.isFormValid && !isGenerating
                          ? 'bg-zen-text text-zen-bg shadow-lg hover:shadow-xl hover:-translate-y-1'
                          : 'bg-zen-text/5 text-zen-text/30 cursor-not-allowed'
                      }`}
                    >
                      {form.isFormValid && !isGenerating && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      )}
                      <span className="font-serif tracking-[0.2em] text-sm relative z-10">
                        {isGenerating ? '建立命盤中...' : '免費建立我的命盤'}
                      </span>
                      {!isGenerating && (
                        <ArrowRight
                          size={16}
                          className={`relative z-10 transition-transform duration-300 ${form.isFormValid ? 'group-hover:translate-x-1' : ''}`}
                        />
                      )}
                    </button>

                    {/* [AI MOD] 範例命盤：降低首次使用門檻（激活用意願），免輸入直接體驗 */}
                    <button
                      onClick={() => handleStart(DEMO_BIRTH)}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs text-zen-muted hover:text-zen-text hover:bg-white/5 transition-colors disabled:opacity-40"
                    >
                      <Sparkles size={13} />
                      先看範例命盤｜先體驗（不用輸入資料）
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center w-full"
            >
              <div className="text-center mb-6">
                <div className="flex items-center justify-between gap-3 mb-4 text-xs text-zen-muted">
                  <span>快速校準</span>
                  <span>
                    第 {Object.keys(calibrations).length + 1} 題，共 2 題
                  </span>
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-block bg-zen-sage/10 text-zen-sage px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] mb-3 uppercase"
                >
                  初步推算完成
                </motion.div>
                <h2 className="font-serif text-2xl md:text-3xl mb-2 tracking-tight">
                  先用兩個年份，讓結果更貼近你
                </h2>
                <p className="text-sm text-zen-muted mb-3">
                  你可以回答，也可以直接查看完整結果。
                </p>
                <div className="flex flex-col items-center gap-1 mb-3">
                  <p className="text-sm text-zen-muted">
                    <span>喜用神：</span>
                    <span className="text-zen-text">
                      {bazi && pattern
                        ? getFavorableElements(
                            bazi.chart.dayMaster,
                            scores ? getPrimaryPattern(scores) : pattern.pattern
                          ).favorable.join('、')
                        : pattern?.favorable.join('、')}
                    </span>
                  </p>
                  <p className="text-sm text-zen-muted">
                    <span>最弱五行：</span>
                    <span className="text-amber-500">
                      {pattern?.weakestElement}
                    </span>
                  </p>
                </div>
                <div className="text-zen-muted text-xs leading-relaxed max-w-lg mx-auto text-left bg-white/5 p-2 rounded-lg border border-white/5 space-y-0.5">
                  <p className="font-medium text-zen-text mb-1.5">
                    回想這些年份是否出現明顯的工作、關係、財務或生活轉變，幫助系統記錄你的能量起伏。
                  </p>
                  <p>回答沒有標準答案，依你的真實感受選擇即可。</p>
                </div>
              </div>

              <div className="w-full space-y-2">
                {bazi && pattern
                  ? getCheckYears(
                      GAN_TO_ELEMENT[bazi.chart.dayMaster],
                      pattern.pattern
                    ).map((year, idx) => {
                      const item = { year: year.toString(), name: `${year}年` };
                      return (
                        <motion.div
                          key={`${item.year}-${idx}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.4 + idx * 0.15,
                            duration: 0.6,
                          }}
                          className="bg-zen-card/80 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-white/5 md:border-white/10"
                        >
                          <div className="flex justify-between items-center mb-2 md:mb-3">
                            <div className="flex items-baseline gap-2">
                              <span className="font-serif text-2xl text-zen-text">
                                {item.year}
                              </span>
                              <span className="text-zen-muted text-xs tracking-widest">
                                {item.name}
                              </span>
                            </div>
                            {calibrations[item.year] && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 bg-zen-sage rounded-full"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {['順利', '不順', '平穩'].map((opt) => (
                              <button
                                key={opt}
                                onClick={() =>
                                  handleCalibration(item.year, opt)
                                }
                                aria-pressed={calibrations[item.year] === opt}
                                className={`py-2 md:py-2.5 px-1 rounded-lg text-sm md:text-base font-medium transition-all duration-300 border ${
                                  calibrations[item.year] === opt
                                    ? 'bg-zen-text text-zen-bg border-zen-text shadow-md transform scale-[1.02]'
                                    : 'bg-white/5 border-transparent text-zen-muted hover:border-zen-muted/20 hover:text-zen-text'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })
                  : null}
              </div>
              <button
                onClick={skipCalibration}
                className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-zen-muted transition-colors hover:bg-white/10 hover:text-zen-text"
              >
                先略過，直接查看完整結果
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {step >= 4 && (
          <footer className="w-full max-w-2xl mx-auto px-4 pb-12 pt-10 border-t border-white/5 space-y-5">
            {step !== 10 && (
              <button
                type="button"
                onClick={() => handleNavigate(10)}
                className="mx-auto flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-medium text-zinc-500 transition hover:bg-white/5 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                查看本頁使用的命理講義與理論來源{' '}
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            )}
            <div className="text-center text-[10px] md:text-xs text-zen-muted/30 leading-relaxed px-6 font-medium tracking-wide">
              <p className="mb-2 uppercase tracking-tighter opacity-50">
                Legal Disclaimer & Advisory
              </p>
              <p className="mb-1">
                本工具僅供娛樂與自我探索參考，所有分析結果不具醫療、法律或財務建議效力。
              </p>
              <p className="mb-4">
                如有健康疑慮請諮詢專業醫師，重大財務或法律決策請尋求相關專業人士協助。
              </p>
              <a
                href="https://github.com/yungtang20/bezi"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zen-muted/5 hover:bg-zen-muted/10 text-zen-muted/50 hover:text-zen-accent transition-colors"
                title="View on GitHub"
              >
                <Github size={14} />
                <span>https://github.com/yungtang20/bezi</span>
              </a>
            </div>
          </footer>
        )}
      </main>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => {}}
        title="系統設定"
        icon={<Settings size={18} className="text-zen-gold" />}
      >
        <div className="space-y-2 text-sm leading-relaxed text-zen-muted">
          <p>
            AI 服務由後端 Agnes AI 設定提供。API
            金鑰不會儲存在瀏覽器或送入前端。
          </p>
          <p>
            姓名、出生資料與日誌主要保存在此裝置。開啟 AI
            問答時，出生資料會送至本服務後端建立短期驗證資料，但不會送出姓名。
          </p>
          <p>
            產品使用事件僅在本機以彙總次數保存，不記錄生日、命盤或問答內容，也不傳送至外部分析服務。
          </p>
        </div>
      </Modal>

      {/* AI Chat Panel - Right Side Overlay */}
      {step >= 4 && showAI && (
        <Drawer
          isOpen={showAI}
          onClose={() => setShowAI(false)}
          title="AI 智能問答"
          icon={<Sparkles size={16} className="text-zen-gold" />}
        >
          <Suspense fallback={<SkeletonPage />}>
            <AIChatPanel bazi={bazi} />
          </Suspense>
        </Drawer>
      )}
    </div>
  );
}
