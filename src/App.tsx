import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Compass, Moon, Sun, Github, Sparkles, Settings } from 'lucide-react';
import Sidebar from './components/Sidebar';
import NavigationBar from './components/NavigationBar';
import AIChatPanel from './components/AIChatPanel';
import Modal from './components/Modal';
import Drawer from './components/Drawer';
import { SkeletonPage } from './components/Skeleton';
import { useBirthForm } from './hooks/useBirthForm';

// [AI MOD] Lazy-loaded page components
// Dashboard 已精簡為先天命局，直接 import（非 lazy）
import Dashboard from './components/Dashboard';
const SpecialtyNav = lazy(() => import('./components/SpecialtyNav'));
const DailyForecastPage = lazy(() => import('./components/DailyForecastPage'));
const TimelinePage = lazy(() => import('./components/TimelinePage'));
const SynastryPage = lazy(() => import('./components/SynastryPage'));
const ReferenceTablePage = lazy(() => import('./components/ReferenceTablePage'));

import { calculateChart } from './paipan';
import { BaziDisplay } from './types';
import { determinePattern, PatternResult, PatternScores, initPatternScores, getPrimaryPattern, getCheckYears, getFavorableElements } from './pattern';
import { GAN_TO_ELEMENT, getShiChen } from './constants';
import { CLIENT_CONFIG } from './config';
import { validateBirthInput } from './utils/validation';

// [AI MOD] 定義有效的步驟型別（供 Sidebar 等元件匯入）
export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
const VALID_STEPS: Step[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// [AI MOD] step 11 為側邊欄知識搜尋，不在主要導航中
export const KNOWLEDGE_SEARCH_STEP = 11;

export default function App() {
  const [step, setStep] = useState<Step>(() => {
    const saved = sessionStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed === 5) {
        return 4; // Redirect deprecated steps to Dashboard
      }
      // [AI MOD] 使用型別守衛而非 as any
      if (VALID_STEPS.includes(parsed as Step)) {
        return parsed as Step;
      }
    }
    return 1;
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (step === 5) {
      setStep(4);
      return;
    }
    sessionStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP, step.toString());
    if (step > 3) {
      import('./storage').then(({ getPatternScores }) => {
        getPatternScores().then(savedScores => {
          if (savedScores) {
            setScores(savedScores);
          }
        }).catch(() => {/* [AI MOD] 靜默處理 DB 錯誤 */});
      }).catch(() => {/* [AI MOD] 靜態處理 */});
    }
  }, [step]);

  const {
    name, setName, gender, setGender,
    birthDate, setBirthDate, birthTime, setBirthTime, birthTimeInput, setBirthTimeInput,
    hourError, isFormValid,
    handleDateChange, parseHourInput, handleTimeKeyDown, timeInputRef,
  } = useBirthForm();

  const [calibrations, setCalibrations] = useState<{ [year: string]: string }>({});
  const [bazi, setBazi] = useState<BaziDisplay | null>(null);
  const [pattern, setPattern] = useState<PatternResult | null>(null);
  const [scores, setScores] = useState<PatternScores | null>(null);

  const [isInitializing, setIsInitializing] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.API_KEY) || '');
  const [apiKeySaved, setApiKeySaved] = useState(false);

  useEffect(() => {
    // Load persisted state from localStorage
    const savedName = localStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.NAME);
    const savedGender = localStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.GENDER);
    const savedDate = localStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.DATE);
    const savedTime = localStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.TIME);

    if (savedName && savedGender && savedDate && savedTime !== null) {
      setName(savedName);
      setGender(savedGender as 'male' | 'female');
      setBirthDate(savedDate);
      setBirthTime(savedTime);
      setBirthTimeInput(savedTime);
      
      try {
        const [y, m, d] = savedDate.split('-').map(Number);
        const isHourUnknown = !savedTime;
        const hour = isHourUnknown ? 12 : parseInt(savedTime, 10);
        const g = savedGender === 'male' ? '男' : '女';
        const chart = calculateChart(y, m, d, hour, g, isHourUnknown);
        const patternResult = determinePattern(chart);
        
        setBazi({
          year: chart.year.gan + chart.year.zhi,
          month: chart.month.gan + chart.month.zhi,
          day: chart.day.gan + chart.day.zhi,
          time: chart.hour.gan + chart.hour.zhi,
          chart: chart
        });
        setPattern(patternResult);

        // Load scores securely from IndexedDB
        import('./storage').then(({ getPatternScores }) => {
          getPatternScores().then(savedScores => {
            if (savedScores) {
              setScores(savedScores);
              if (!sessionStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP)) {
                setStep(4); // Go to dashboard if already registered
              }
            } else {
              setScores(initPatternScores(patternResult.score));
              if (!sessionStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP)) {
                setStep(3);
              }
            }
            setIsInitializing(false);
          }).catch(() => {
             setIsInitializing(false);
          });
        }).catch(() => {/* [AI MOD] 靜態處理 */});

      } catch (e: unknown) {
        console.error(e);
        localStorage.removeItem(CLIENT_CONFIG.STORAGE_KEYS.DATE);
        setStep(1);
        sessionStorage.removeItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP);
        setIsInitializing(false);
      }
    } else {
      setStep(1);
      sessionStorage.removeItem(CLIENT_CONFIG.STORAGE_KEYS.CURRENT_STEP);
      setIsInitializing(false);
    }
  }, []);

  const [errorMsg, setErrorMsg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStart = () => {
    if (!isFormValid || isGenerating) return;
    
    const isHourUnknown = !birthTime;
    const validation = validateBirthInput({
      name: name || '未提供',
      gender: gender === 'male' ? '男' : '女',
      birthDate,
      birthTime: isHourUnknown ? '' : birthTime,
    });
    if (!validation.valid) {
      setErrorMsg(validation.error!);
      return;
    }

    const [y, m, d] = birthDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const today = new Date();
    if (dateObj > today) {
      setErrorMsg("出生日期不可大於今天");
      return;
    }
    if (y < 1900) {
      setErrorMsg("目前僅支援 1900 年之後出生的命盤");
      return;
    }
    setErrorMsg('');
    setIsGenerating(true);
    
    // Save to localStorage (keep birthTime empty if omitted, do not force or prefill)
    localStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.NAME, name);
    localStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.GENDER, gender ?? '');
    localStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.DATE, birthDate);
    localStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.TIME, birthTime);
    
    try {
      const hour = isHourUnknown ? 12 : parseInt(birthTime, 10);
      const chart = calculateChart(y, m, d, hour, gender === 'male' ? '男' : '女', isHourUnknown);
      const patternResult = determinePattern(chart);

      setBazi({
        year: chart.year.gan + chart.year.zhi,
        month: chart.month.gan + chart.month.zhi,
        day: chart.day.gan + chart.day.zhi,
        time: chart.hour.gan + chart.hour.zhi,
        chart,
      });
      setPattern(patternResult);
      setScores(initPatternScores(patternResult.score));

      setTimeout(() => {
        setIsGenerating(false);
        setStep(3);
      }, 800);

    } catch (e: unknown) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : String(e);
      setErrorMsg("排盤發生錯誤: " + errMsg);
      localStorage.removeItem(CLIENT_CONFIG.STORAGE_KEYS.DATE);
      setIsGenerating(false);
      setStep(1);
      setIsInitializing(false);
    }
  };

  const advanceToDashboard = (calibrations: Record<string, string>) => {
    if (Object.keys(calibrations).length === 2) {
      setTimeout(() => {
        setStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
    }
  };

  const CALIBRATION_DELTAS: Record<string, Record<string, Partial<PatternScores>>> = {
    '順利': { '從強': { followStrong: 10, strong: -5 }, '從弱': { followWeak: 10, weak: -5 }, '身強': { strong: 10, weak: -5 }, '身弱': { weak: 10, strong: -5 } },
    '不順': { '從強': { followStrong: -15, strong: 15 }, '從弱': { followWeak: -15, weak: 15 }, '身強': { strong: -10, weak: 10 }, '身弱': { weak: -10, strong: 10 } },
  };

  const handleCalibration = (year: string, value: string) => {
    if (!scores || !pattern) return;

    if (value === '順利' || value === '不順') {
      const nextScores = { ...scores };
      const delta = CALIBRATION_DELTAS[value]?.[pattern.pattern];
      if (delta) {
        for (const [k, v] of Object.entries(delta)) {
          nextScores[k as keyof PatternScores] = Math.max(0, Math.min(100, nextScores[k as keyof PatternScores] + v));
        }
      }
      setScores(nextScores);
    }

    setCalibrations(prev => {
      const next = { ...prev, [year]: value };
      advanceToDashboard(next);
      return next;
    });
  };

  const handleNavigate = (targetStep: number | string) => {
    const s = typeof targetStep === 'string' ? parseInt(targetStep, 10) : targetStep;
    // [AI MOD] 加入 Number.isNaN 檢查，step 11 為知識搜尋（不導航，由側邊欄處理）
    if (!Number.isNaN(s) && s >= 1 && s <= 10) {
      setStep(s as Step);
    }
  };

  if (isInitializing) {
     return <div className="min-h-screen bg-zen-bg flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-zen-sage/30 border-t-zen-sage animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-zen-bg text-zen-text overflow-hidden flex flex-col items-center justify-start md:justify-center relative selection:bg-zen-sage selection:text-white">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-zen-accent/20 blur-[100px] md:blur-[140px]"
        />
        <motion.div 
          animate={{ rotate: -360 }} 
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-zen-sage/20 blur-[100px] md:blur-[120px]"
        />
        
        {/* Subtle grid texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGgwLjV2NDBIMHptMCAwaDQwdjAuNUgweiIgZmlsbD0icmdiYSgwLDAsMCwwLjA0KSIvPgo8L3N2Zz4=')] opacity-30 mask-image:linear-gradient(to_bottom,white,transparent)"></div>
      </div>

      {/* Main Container */}
      <div className={`w-full ${step <= 3 ? 'max-w-md flex items-center justify-center min-h-screen' : 'md:pl-44 pt-[5vh] pb-32 min-h-screen'} px-4 md:px-6 py-8 md:py-12 relative z-10 hidden-scrollbar`}>
        {step >= 4 && <Sidebar currentStep={step} onNavigate={handleNavigate} showAI={showAI} onToggleAI={() => setShowAI(!showAI)} onOpenSettings={() => setShowSettings(true)} />}
        {step >= 4 && <div className="md:hidden"><NavigationBar currentStep={step} onNavigate={handleNavigate} /></div>}
        {/* 手機版頂部/懸浮設定按鈕 */}
        {step >= 4 && (
          <div className="md:hidden fixed top-4 right-4 z-40">
            <button
              onClick={() => {
                setApiKeyInput(localStorage.getItem('bazi_api_key') || '');
                setShowSettings(true);
              }}
              className="p-2.5 rounded-full bg-zinc-950/80 border border-white/10 text-zen-gold shadow-lg backdrop-blur-md hover:bg-zinc-900 transition-all active:scale-95 flex items-center justify-center focus:outline-none"
              title="系統設定"
            >
              <Settings size={18} />
            </button>
          </div>
        )}
        {/* 手機版懸浮 AI 諮詢按鈕 */}
        {step >= 4 && !showAI && (
          <div className="md:hidden fixed bottom-32 right-5 z-40">
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAI(true)}
              className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-zen-gold to-amber-600 text-zinc-950 font-bold shadow-[0_8px_24px_rgba(212,168,83,0.35)] border border-amber-400/30 transition-all duration-300 text-xs focus:outline-none"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>AI 問答</span>
              {/* 呼吸光暈圈 */}
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
              <Dashboard
                bazi={bazi}
                name={name}
                onNavigate={handleNavigate}
                scores={scores}
                birthDate={birthDate}
                birthTime={birthTime}
                gender={gender}
              />
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
                  name={name}
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
                  name={name}
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
                  myName={name}
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




          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              {/* Header */}
              <div className="text-center mb-8 space-y-2">
                <div className="inline-flex items-center justify-center p-2 rounded-full bg-zen-card shadow-sm border border-zen-muted/10 mb-2 animate-in fade-in zoom-in duration-1000 delay-200">
                  <Compass size={20} className="text-zen-sage" />
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-zen-text tracking-tight mx-auto max-w-md leading-tight">
                  窺探<br/>生命伏筆
                </h1>
                <p className="text-sm md:text-base text-zen-muted max-w-sm mx-auto tracking-wide leading-relaxed">
                  順應自然週期的個人觀測系統
                </p>
              </div>

              {/* Form Card */}
              <div className="w-full bg-zen-card/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/5 md:border-white/10">
                <div className="space-y-4 md:space-y-5">

                  <div className="space-y-4 relative">
                    <div className="absolute left-0 top-2 bottom-4 w-px bg-gradient-to-b from-zen-sage/30 via-zen-sage/10 to-transparent"></div>
                    
                    {/* Input Group: Name */}
                    <div className="relative pl-6">
                      <div className="absolute left-[-4px] top-[12px] w-2 h-2 rounded-full bg-zen-sage border-2 border-white shadow-sm"></div>
                      <label className="block text-xs tracking-[0.2em] uppercase text-zen-muted mb-1 font-medium">您的稱呼</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="選填" 
                        className="w-full bg-transparent border-b border-zen-muted/20 py-2 outline-none text-lg font-serif text-zen-text placeholder:text-zen-muted/40 focus:border-zen-sage transition-colors"
                      />
                    </div>

                    {/* Input Group: Gender */}
                    <div className="relative pl-6">
                       <div className="absolute left-[-4px] top-[12px] w-2 h-2 rounded-full bg-zen-sage border-2 border-white shadow-sm"></div>
                       <label className="block text-xs tracking-[0.2em] uppercase text-zen-muted mb-2 font-medium">生理性別 <span className="text-red-400">*</span></label>
                       <div className="flex gap-3">
                         <button
                           onClick={() => setGender('male')}
                           className={`flex-1 py-2 md:py-2.5 px-3 md:px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border ${
                             gender === 'male'
                               ? 'bg-zen-text border-zen-text text-zen-bg shadow-md'
                               : 'bg-white/5 border-zen-muted/20 text-zen-muted hover:border-zen-muted/40 hover:bg-white/10'
                           }`}
                         >
                           <Sun size={14} className={gender === 'male' ? 'text-zen-accent' : ''} />
                           <span className="font-medium text-sm">男</span>
                         </button>
                         <button
                           onClick={() => setGender('female')}
                           className={`flex-1 py-2 md:py-2.5 px-3 md:px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border ${
                             gender === 'female'
                               ? 'bg-zen-text border-zen-text text-zen-bg shadow-md'
                               : 'bg-white/5 border-zen-muted/20 text-zen-muted hover:border-zen-muted/40 hover:bg-white/10'
                           }`}
                         >
                           <Moon size={14} className={gender === 'female' ? 'text-zen-accent' : ''} />
                           <span className="font-medium text-sm">女</span>
                         </button>
                       </div>
                    </div>

                     {/* Input Group: DateTime */}
                    <div className="relative pl-6 z-10">
                       <div className="absolute left-[-4px] top-[12px] w-2 h-2 rounded-full bg-zen-sage border-2 border-white shadow-sm"></div>
                       <label className="block text-xs tracking-[0.2em] uppercase text-zen-muted mb-2 font-medium">出生資訊 <span className="text-red-400">*</span></label>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="block text-xs text-zen-muted mb-1 font-medium">日期 (年/月/日)</label>
                            <div className="bg-white/5 rounded-xl border border-zen-muted/20 px-3 py-2 md:py-2.5 focus-within:border-zen-sage transition-colors">
                              <input 
                                type="text"
                                inputMode="numeric"
                                value={birthDate}
                                onChange={handleDateChange}
                                placeholder="例如: 19900101"
                                className="w-full bg-transparent outline-none text-base font-serif text-zen-text placeholder:text-zen-muted/30"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-zen-muted mb-1 font-medium">時間 (選填)</label>
                            <div className="bg-white/5 rounded-xl border border-zen-muted/20 px-3 py-2 md:py-2.5 focus-within:border-zen-sage transition-colors">
                              <input 
                                ref={timeInputRef}
                                  type="text"
                                  inputMode="numeric"
                                  value={birthTimeInput}
                                  onChange={(e) => parseHourInput(e.target.value)}
                                  onKeyDown={handleTimeKeyDown}
                                  placeholder="例如: 14 或 1430 (不填僅排前三柱)"
                                  className={`w-full bg-transparent outline-none text-base font-serif text-zen-text placeholder:text-zen-muted/30 ${hourError ? 'text-rose-400' : ''}`}
                                />
                              </div>
                              {birthTime && (
                                <div className="text-zen-accent font-medium text-sm tracking-widest px-2 py-1 mt-2">
                                  🕐 {getShiChen(birthTime)}
                                </div>
                              )}
                            {hourError && (
                              <p className="text-rose-400 text-sm mt-2 pl-2">{hourError}</p>
                            )}
                          </div>
                        </div>
                       
                       {birthDate && parseInt(birthDate.split('-')[0], 10) >= 1945 && parseInt(birthDate.split('-')[0], 10) <= 1979 && (
                         <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-xl text-sm md:text-xs">
                           ⚠️ 您的出生年份可能受到台灣日光節約時間影響，若在此時間內出生，請確認輸入的時間已扣除一小時。
                         </div>
                       )}
                       {birthTime && (birthTime === '23' || parseInt(birthTime, 10) >= 23 || parseInt(birthTime, 10) === 0) && (
                         <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-xl text-sm md:text-xs mt-3">
                           ℹ️ 若為 23:00~00:59 出生（子時），系統將依照八字規則，自動視為隔日並排定日期的氣場。
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1 md:pt-2">
                    {errorMsg && <p className="text-rose-400 text-sm text-center mb-2 font-medium">{errorMsg}</p>}
                    <button
                      id="start-calculation-btn"
                      onClick={handleStart}
                      disabled={!isFormValid || isGenerating}
                      className={`group w-full py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all duration-500 overflow-hidden relative ${
                        isFormValid && !isGenerating
                          ? 'bg-zen-text text-zen-bg shadow-lg hover:shadow-xl hover:-translate-y-1'
                          : 'bg-zen-text/5 text-zen-text/30 cursor-not-allowed'
                      }`}
                    >
                      {isFormValid && !isGenerating && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      )}
                      <span className="font-serif tracking-[0.2em] text-sm relative z-10">{isGenerating ? '排盤中...' : '進入觀測'}</span>
                      {!isGenerating && <ArrowRight size={16} className={`relative z-10 transition-transform duration-300 ${isFormValid ? 'group-hover:translate-x-1' : ''}`} />}
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
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-block bg-zen-sage/10 text-zen-sage px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] mb-3 uppercase"
                >
                  初步推算完成
                </motion.div>
                <h2 className="font-serif text-2xl md:text-3xl mb-2 tracking-tight">您屬於<span className="text-zen-sage mx-1 md:mx-2">{scores ? getPrimaryPattern(scores) : (pattern ? pattern.pattern : '身強')}格</span></h2>
                <div className="flex flex-col items-center gap-1 mb-3">
                   <p className="text-sm text-zen-muted"><span>喜用神：</span><span className="text-zen-text">{bazi && pattern ? getFavorableElements(bazi.chart.dayMaster, scores ? getPrimaryPattern(scores) : pattern.pattern).favorable.join('、') : pattern?.favorable.join('、')}</span></p>
                   <p className="text-sm text-zen-muted"><span>最弱五行：</span><span className="text-amber-500">{pattern?.weakestElement}</span></p>
                </div>
                <div className="text-zen-muted text-xs leading-relaxed max-w-lg mx-auto text-left bg-white/5 p-2 rounded-lg border border-white/5 space-y-0.5">
                  <p className="font-medium text-zen-text mb-1.5">命理結構雖已成形，但真實生命經驗是不可或缺的記錄因子。回顧近代流年，將幫助系統記錄您的能量起伏。再加上該年是否有：</p>
                  <p>💰 <span className="font-bold text-yellow-500/80">金錢財運</span>：該年是否投資失利、詐騙或意外得財。</p>
                  <p>🚀 <span className="font-bold text-blue-400/80">工作學業</span>：該年是否壓力大、責任增但成果不佳。</p>
                  <p>🌸 <span className="font-bold text-pink-400/80">感情家庭</span>：該年是否分手、離婚、口角。</p>
                  <p>⚠️ <span className="font-bold text-red-400/80">身體健康</span>：該年是否開刀、住院、意外等突發狀況。</p>
                </div>
              </div>

              <div className="w-full space-y-2">
                {bazi && pattern ? getCheckYears(GAN_TO_ELEMENT[bazi.chart.dayMaster], pattern.pattern).map((year, idx) => {
                  const item = { year: year.toString(), name: `${year}年` };
                  return (
                  <motion.div
                    key={`${item.year}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.15, duration: 0.6 }}
                    className="bg-zen-card/80 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-white/5 md:border-white/10"
                  >
                    <div className="flex justify-between items-center mb-2 md:mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-2xl text-zen-text">{item.year}</span>
                        <span className="text-zen-muted text-xs tracking-widest">{item.name}</span>
                      </div>
                      {calibrations[item.year] && (
                         <motion.div initial={{scale:0}} animate={{scale:1}} className="w-2 h-2 bg-zen-sage rounded-full" />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['順利', '不順', '平穩'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleCalibration(item.year, opt)}
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
                )}) : null}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
        
        {step >= 4 && (
          <footer className="w-full max-w-2xl mx-auto px-4 pb-12 pt-12 border-t border-white/5 space-y-6">
            <button 
              onClick={() => setStep(10)}
              className="w-full py-5 px-6 bg-zen-card/60 hover:bg-zen-card/80 backdrop-blur-md rounded-[2rem] border border-white/10 transition-all duration-500 group text-center shadow-2xl"
            >
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-zen-muted text-xs tracking-[0.3em] uppercase opacity-70">✱ 本頁面分析皆基於八字命理學說</span>
                <span className="text-zen-accent font-serif font-medium text-lg lg:text-xl group-hover:scale-105 transition-transform flex items-center gap-2 justify-center">
                  查看【理論速查】對照表
                  <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-zen-sage" />
                </span>
              </div>
            </button>
            <div className="text-center text-[10px] md:text-xs text-zen-muted/30 leading-relaxed px-6 font-medium tracking-wide">
              <p className="mb-2 uppercase tracking-tighter opacity-50">Legal Disclaimer & Advisory</p>
              <p className="mb-1">本工具僅供娛樂與自我探索參考，所有分析結果不具醫療、法律或財務建議效力。</p>
              <p className="mb-4">如有健康疑慮請諮詢專業醫師，重大財務或法律決策請尋求相關專業人士協助。</p>
              <a 
                href="https://github.com/yungtang20/bezi-ai"
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zen-muted/5 hover:bg-zen-muted/10 text-zen-muted/50 hover:text-zen-accent transition-colors"
                title="View on GitHub"
              >
                <Github size={14} />
                <span>https://github.com/yungtang20/bezi-ai</span>
              </a>
            </div>
          </footer>
        )}
      </div>

      {/* Settings Modal */}
      <Modal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        title="系統設定" 
        icon={<Settings size={18} className="text-zen-gold" />}
      >
        {/* API Key 設定 */}
        <div className="space-y-2">
          <label className="block text-xs text-zen-muted tracking-wide">
            NVIDIA API 金鑰
          </label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => { setApiKeyInput(e.target.value); setApiKeySaved(false); }}
            placeholder="輸入您的 API 金鑰..."
            className="w-full px-3 py-2.5 bg-zen-surface/60 border border-zen-border rounded-lg text-zen-text text-sm placeholder-zen-muted/40 focus:outline-none focus:border-amber-500/50"
          />
          <p className="text-[11px] text-zen-muted/50 leading-relaxed">
            金鑰會儲存於瀏覽器本地，並在 AI 對談時傳送至本專案後端以呼叫 NVIDIA 服務。
            </p>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => {
              localStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.API_KEY, apiKeyInput);
              setApiKeySaved(true);
              setTimeout(() => setApiKeySaved(false), 2000);
            }}
            className="flex-1 py-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-colors"
          >
            {apiKeySaved ? '✓ 已儲存' : '儲存金鑰'}
          </button>
          <button
            onClick={() => {
              setApiKeyInput('');
              localStorage.removeItem(CLIENT_CONFIG.STORAGE_KEYS.API_KEY);
              setApiKeySaved(false);
            }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 text-zen-muted rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            清除
          </button>
        </div>
      </Modal>

      {/* AI Chat Panel - Right Side Overlay */}
      {step >= 4 && (
        <Drawer
          isOpen={showAI}
          onClose={() => setShowAI(false)}
          title="AI 智能問答"
          icon={<Sparkles size={16} className="text-zen-gold" />}
        >
          <AIChatPanel bazi={bazi} userName={name} />
        </Drawer>
      )}
    </div>
  );
}
