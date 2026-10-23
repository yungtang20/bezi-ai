// src/components/dashboard/TodayEnergyCard.tsx
// [AI MOD] 今日能量首屏卡：每日鉤子 — 讓使用者每天打開都有新理由（留存機制）
// 資料來源：getDailyEnergy（packages/core/dailyAnalysis），僅唯讀呈現，不含新領域規則。
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Share2 } from 'lucide-react';
import { BaziChart } from '../../paipan';
import { PatternScores, getPrimaryPattern, determinePattern } from '../../pattern';
import { getDailyEnergy, type DailyEnergy } from '../../dailyAnalysis';
import { useShareImage } from '../../hooks/useShareImage';
import { useCheckInStats } from '../../hooks/useCheckInStats';
import { buildDailyShareText, buildLineShareUrl } from '../../lib/shareText';
import ShareImage from '../share/ShareImage';
import DailyShareCard from '../share/DailyShareCard';
import { DailyVerseHero, QuickCheckIn, deriveLogOutcome } from './DailyVerse';
import { trackProductEvent } from '../../lib/productEvents';

interface TodayEnergyCardProps {
  chart: BaziChart;
  scores: PatternScores;
  name?: string;
  onNavigate?: (view: string | number) => void;
}

interface OutcomeMeta {
  label: string;
  tone: string;
  advice: string;
  // 分享圖用（hex，html2canvas 不支援 oklch）
  toneBg: string;
  toneFg: string;
  toneBorder: string;
}

const OUTCOME_META: Record<string, OutcomeMeta> = {
  '大好': { label: '大吉', tone: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/40', advice: '今日命理能量偏高，可安排重要事項，也請依實際資訊判斷。', toneBg: 'rgba(16, 185, 129, 0.18)', toneFg: '#6ee7b7', toneBorder: 'rgba(52, 211, 153, 0.45)' },
  '順利': { label: '吉', tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30', advice: '今日命理方向偏順，可穩健推進既有安排。', toneBg: 'rgba(16, 185, 129, 0.12)', toneFg: '#6ee7b7', toneBorder: 'rgba(52, 211, 153, 0.32)' },
  '小吉': { label: '小吉', tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30', advice: '運勢溫和向上，把小事做好就是進帳。', toneBg: 'rgba(16, 185, 129, 0.12)', toneFg: '#6ee7b7', toneBorder: 'rgba(52, 211, 153, 0.32)' },
  '平穩': { label: '平', tone: 'text-zinc-300 bg-white/5 border-white/15', advice: '平常心過日子，宜守成、蓄積能量。', toneBg: 'rgba(255, 255, 255, 0.05)', toneFg: '#d4d4d8', toneBorder: 'rgba(255, 255, 255, 0.16)' },
  '較差': { label: '注意', tone: 'text-amber-300 bg-amber-500/10 border-amber-400/30', advice: '今日阻力較大，重大決定緩一緩。', toneBg: 'rgba(245, 158, 11, 0.14)', toneFg: '#fcd34d', toneBorder: 'rgba(251, 191, 36, 0.34)' },
  '不順': { label: '宜靜', tone: 'text-red-300 bg-red-500/10 border-red-400/30', advice: '宜靜不宜動，多休息、少爭執。', toneBg: 'rgba(239, 68, 68, 0.14)', toneFg: '#fca5a5', toneBorder: 'rgba(248, 113, 113, 0.34)' },
  '不佳': { label: '宜靜', tone: 'text-red-300 bg-red-500/10 border-red-400/30', advice: '宜靜不宜動，多休息、少爭執。', toneBg: 'rgba(239, 68, 68, 0.14)', toneFg: '#fca5a5', toneBorder: 'rgba(248, 113, 113, 0.34)' },
};

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

const DIRECTION_HEADLINES: Record<string, string> = {
  '大好': '今天適合把握機會',
  '順利': '今天可以穩健推進',
  '小吉': '今天適合從小事開始',
  '平穩': '今天維持原有節奏',
  '較差': '今天先確認，再決定',
  '不順': '今天適合放慢腳步',
  '不佳': '今天適合放慢腳步',
};

export default function TodayEnergyCard({ chart, scores, name, onNavigate }: TodayEnergyCardProps) {
  const { isSharing, error: shareError, share } = useShareImage();
  const [shareTarget, setShareTarget] = useState(false);
  const [lineShareUrl, setLineShareUrl] = useState<string | null>(null);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [sharePrivateDetails, setSharePrivateDetails] = useState(false);
  // [AI MOD] 連續打卡 + 準確率（每日回訪的回饋）
  const { streak, report, logs, today, refresh: refreshStats } = useCheckInStats();

  const patternResult = useMemo(() => determinePattern(chart), [chart]);
  const primaryPattern = getPrimaryPattern(scores);
  const energy: DailyEnergy = useMemo(() => {
    return getDailyEnergy(chart, patternResult.weakestElement, patternResult.favorable, patternResult.unfavorable, primaryPattern, new Date());
  }, [chart, scores, patternResult]);
  // [AI MOD] 明日預告（每日一句 hero 用）：同一引擎算明日能量
  const tomorrowEnergy: DailyEnergy = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getDailyEnergy(chart, patternResult.weakestElement, patternResult.favorable, patternResult.unfavorable, primaryPattern, tomorrow);
  }, [chart, scores, patternResult]);

  const meta = OUTCOME_META[energy.theoreticalOutcome] || OUTCOME_META['平穩'];
  const directionHeadline = DIRECTION_HEADLINES[energy.theoreticalOutcome] || DIRECTION_HEADLINES['平穩'];
  const now = new Date();
  const dateLabel = `${now.getMonth() + 1} 月 ${now.getDate()} 日 · 星期${WEEK_LABELS[now.getDay()]}`;
  const explanation = energy.theoreticalExplanation.replace(/^。$/, '').trim();
  const siteUrl = typeof window === 'undefined' ? '' : window.location.origin;
  const weekStart = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    return start.toISOString().slice(0, 10);
  }, [today]);
  const weeklyCheckIns = logs.filter(log => log.date >= weekStart && log.date <= today).length;

  useEffect(() => {
    trackProductEvent('daily_checkin_viewed');
  }, []);

  const handleCaptureReady = useCallback(async (element: HTMLElement) => {
    const text = buildDailyShareText({
      name: sharePrivateDetails ? name : undefined,
      outcomeLabel: meta.label,
      ganZhi: sharePrivateDetails ? energy.dayGanZhi : '',
      tenGod: sharePrivateDetails ? energy.dayTenGodType : '',
      dateLabel,
      advice: meta.advice,
      favorable: sharePrivateDetails ? patternResult.favorable : [],
      weakestElement: sharePrivateDetails ? patternResult.weakestElement : '',
    }, siteUrl);

    const outcome = await share(element, {
      fileName: `bezi-daily-${Date.now()}.png`,
      title: sharePrivateDetails && name ? `${name} 的今日運勢` : '我的今日運勢',
      text,
    });
    setShareTarget(false);
    if (outcome === 'shared' || outcome === 'downloaded') trackProductEvent('share_exported');

    // 桌機：Web Share 不支援檔案 → 已下載圖片，再提供 LINE 文字分享按鈕
    // （擷取為非同步，window.open 會失去使用者手勢而被彈出視窗封鎖器攔截）
    if (outcome === 'downloaded') setLineShareUrl(buildLineShareUrl(text));
  }, [share, name, meta, energy, dateLabel, patternResult, siteUrl, sharePrivateDetails]);

  const handleShare = () => {
    if (isSharing || shareTarget) return;
    setSharePrivateDetails(false);
    setShowSharePreview(true);
    trackProductEvent('share_preview_opened');
  };

  return (
    <div
      className="glass-card p-3 md:p-4 relative overflow-hidden animate-fade-in-up"
      style={{ animationDelay: '0.05s' }}
      aria-label="今日能量"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] md:text-xs text-zinc-400 tracking-widest">
            今日 · {dateLabel}
          </span>
          <div className="flex items-center gap-1.5">
            {streak.current > 0 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 border border-orange-400/30 flex items-center gap-1"
                title={`已連續打卡 ${streak.current} 天（最長 ${streak.longest} 天）`}
              >
                🔥 連續 {streak.current} 天
              </span>
            )}
            {report.samples >= 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-400/30">
                {report.samples < 7 ? `${report.matches}/${report.samples} 同方向・初步` : `近期吻合 ${report.accuracy}%`}
              </span>
            )}
          </div>
        </div>

        <div className="mb-3">
          <span className={`inline-flex shrink-0 rounded-lg border px-2 py-1 text-[11px] font-bold ${meta.tone}`}>命理觀察 · {meta.label}</span>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-white">{directionHeadline}</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{meta.advice}</p>
        </div>

        <details className="mb-3 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-[11px] text-zinc-400">
          <summary className="cursor-pointer font-medium text-zinc-300">為什麼這樣說？</summary>
          <div className="mt-2 space-y-1.5 leading-relaxed">
            <p>{explanation && explanation !== '。' ? explanation : '今日沒有額外的五行加減分說明。'}</p>
            <p className="text-zinc-500">日期：{energy.solarDate}（{energy.lunarDate}）</p>
            <p className="text-zinc-500">依據：{energy.dayGanZhi} · 十神 {energy.dayTenGodType} · 喜用神 {patternResult.favorable.join('、') || '未列出'} · 最弱五行 {patternResult.weakestElement}</p>
            {(energy.isExtremeDay || energy.isWeaknessDay) && <p className="text-amber-300/80">特殊訊號：{[energy.extremeType, energy.weaknessType].filter(Boolean).join('；')}</p>}
            <p className="text-zinc-500">這是命理規則的觀察方向，不是事實預測；重要決定請依實際資訊判斷。</p>
          </div>
        </details>

        {/* [AI MOD] 每日一句 hero + 3-tap 快速打卡（留存鉤子） */}
        <DailyVerseHero
          today={energy}
          tomorrow={tomorrowEnergy}
          pattern={primaryPattern}
          checkedToday={streak.checkedToday}
          recentOutcome={deriveLogOutcome(logs.find(l => l.date === today), energy.dayTenGodType)}
        />
        <QuickCheckIn
          scores={scores}
          energy={energy}
          logs={logs}
          today={today}
          checkedToday={streak.checkedToday}
          onSubmitted={() => void refreshStats()}
        />

        <div className="flex gap-2">
          <button
            onClick={() => onNavigate?.(8)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 text-xs font-bold text-amber-300 transition-colors"
          >
            {streak.checkedToday ? '查看今日詳解' : '10 秒記錄今天'} <ArrowRight size={13} />
          </button>
          <button
            onClick={handleShare}
            disabled={isSharing}
            aria-label="分享今日運勢"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-bold text-zinc-200 transition-colors disabled:opacity-50"
          >
            <Share2 size={13} /> {isSharing ? '產生中' : '分享'}
          </button>
        </div>

        {lineShareUrl && (
          <button
            onClick={() => window.open(lineShareUrl, '_blank', 'noopener')}
            className="mt-2 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-300 transition-colors"
          >
            圖片已下載 · 分享到 LINE
          </button>
        )}

        {shareError && <p className="text-[11px] text-rose-400 mt-2">{shareError}</p>}

        {showSharePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="分享前預覽">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white">分享前隱私預覽</h3>
              <div className="mt-3 rounded-xl border border-amber-400/20 bg-gradient-to-br from-emerald-950 to-zinc-950 p-3">
                <p className="text-[10px] tracking-widest text-amber-300/80">BEZI · 今日觀察</p>
                <p className="mt-2 text-sm font-bold text-white">{dateLabel} · {meta.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-300">{meta.advice}</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">預設只分享日期、今日方向與一般建議，不包含姓名、日主、喜用神或最弱五行。</p>
              <label className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-300">
                <input type="checkbox" checked={sharePrivateDetails} onChange={event => setSharePrivateDetails(event.target.checked)} className="mt-0.5" />
                <span>我了解公開風險，仍要顯示姓名與命盤細節</span>
              </label>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setShowSharePreview(false)} className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300">取消</button>
                <button onClick={() => { setShowSharePreview(false); setShareTarget(true); }} className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-zinc-950">產生分享圖</button>
              </div>
            </div>
          </div>
        )}

        {/* [AI MOD] 分享圖（離屏擷取） */}
        <ShareImage active={shareTarget} onReady={handleCaptureReady}>
          <DailyShareCard
            name={name}
            dateLabel={dateLabel}
            lunarDate={energy.lunarDate}
            ganZhi={energy.dayGanZhi}
            tenGod={energy.dayTenGodType}
            outcomeLabel={meta.label}
            outcomeTone={{ bg: meta.toneBg, fg: meta.toneFg, border: meta.toneBorder }}
            advice={meta.advice}
            favorable={patternResult.favorable}
            weakestElement={patternResult.weakestElement}
            dayMaster={chart.dayMaster}
            siteUrl={siteUrl}
            showPrivateDetails={sharePrivateDetails}
          />
        </ShareImage>
      </div>
    </div>
  );
}
