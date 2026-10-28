// src/components/dashboard/CalibrationPanel.tsx
// 校準面板：當前格局 → 打卡支持 → 分領域準確率 → 定盤年
// 單一真實來源：src/calibration.ts、src/hooks/useCheckInStats、src/hooks/useCalibration
import { useMemo, useState } from "react";
import type { PatternScores } from "../../pattern";
import type { PatternResult } from "../../pattern";
import { useCheckInStats } from "../../hooks/useCheckInStats";
import { useCalibration } from "../../hooks/useCalibration";
import {
  calculateCategoryAccuracy,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  checkAutoSwitch,
  isGoodOutcome,
  isBadOutcome,
  type CategoryKey,
} from "../../calibration";

interface CalibrationPanelProps {
  scores: PatternScores;
  patternResult: PatternResult;
  onNavigate?: (step: number) => void;
}

const TABS: Array<{ id: "pattern" | "checkin" | "accuracy" | "daYun"; label: string }> = [
  { id: "pattern", label: "當前格局" },
  { id: "checkin", label: "打卡支持" },
  { id: "accuracy", label: "分領域準確率" },
  { id: "daYun", label: "定盤年" },
];

export default function CalibrationPanel({
  scores,
  patternResult,
  onNavigate,
}: CalibrationPanelProps) {
  const [tab, setTab] = useState<"pattern" | "checkin" | "accuracy" | "daYun">("pattern");
  const { streak, report, logs, today, refresh: refreshStats } = useCheckInStats();
  const { calibrations, handleCalibration } = useCalibration(scores, patternResult);

  const categories = useMemo(() => calculateCategoryAccuracy(logs), [logs]);
  const autoSwitched = useMemo(() => checkAutoSwitch(scores), [scores]);

  const recordOutcome = (outcome: "順利" | "不順") => {
    const year = new Date().getFullYear().toString();
    handleCalibration(year, outcome);
  };

  const tabClass = (id: string) =>
    `px-3 py-1.5 text-xs rounded-lg transition-colors ${
      tab === id
        ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
        : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
    }`;

  return (
    <div className="glass-card p-3 md:p-4 relative overflow-hidden animate-fade-in-up" aria-label="校準面板">
      <div className="flex gap-1 mb-4">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={tabClass(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pattern" && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-amber-300 tracking-widest uppercase mb-2">
            當前格局
          </h3>
          <div className="glass-card p-3 rounded-xl border border-white/5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-zinc-400">格局</span>
              <span className="text-sm font-bold text-white">{patternResult.pattern}</span>
            </div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-zinc-400">偏好方向</span>
              <span className="text-sm font-bold text-zinc-200">
                {patternResult.favorable.join("、")}
              </span>
            </div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-zinc-400">不利方向</span>
              <span className="text-sm font-bold text-zinc-200">
                {patternResult.unfavorable.join("、")}
              </span>
            </div>
            {patternResult.isContinuum && (
              <p className="text-[10px] text-zinc-500 leading-snug max-w-[260px]">
                40-55% 屬連續體，顯示「偏平衡」，非絕對身強或身弱。
              </p>
            )}
            {autoSwitched && (
              <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-300">
                ⚠️ 系統偵測到格局可能需要校準：建議切換為「{autoSwitched}」
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "checkin" && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-amber-300 tracking-widest uppercase mb-2">
            打卡支持
          </h3>
          <div className="glass-card p-3 rounded-xl border border-white/5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs text-zinc-400 block">連續打卡</span>
                <span className="text-lg font-bold text-emerald-400">{streak.current} 天</span>
                <span className="text-[10px] text-zinc-500">最長 {streak.longest} 天</span>
              </div>
              <span className={`text-xs font-bold rounded px-2 py-0.5 ${
                streak.checkedToday
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500"
                  : "bg-white/5 text-zinc-500 border border-white/5"
              }`}>
                {streak.checkedToday ? "今天已打卡" : "今日未打卡"}
              </span>
            </div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-zinc-400">累計天數</span>
              <span className="text-sm font-bold text-zinc-200">{streak.totalDays} 天</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-zinc-400">可評估樣本</span>
              <span className="text-sm font-bold text-zinc-200">{report.samples} 筆</span>
            </div>
            {report.samples > 0 && (
              <div className="mt-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-300">
                近期吻合度：{report.accuracy}% ({report.matches}/{report.samples})
              </div>
            )}
            <button
              onClick={() => void refreshStats()}
              className="mt-3 w-full text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              刷新打卡紀錄
            </button>
          </div>
        </div>
      )}

      {tab === "accuracy" && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-amber-300 tracking-widest uppercase mb-2">
            分領域準確率
          </h3>
          {categories.length === 0 ? (
            <div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <span className="text-xs text-zinc-500">
                暫無可評估紀錄。先開始每日打卡，記錄實際感受。
              </span>
            </div>
          ) : (
            <div className="glass-card p-3 rounded-xl border border-white/5 space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.key}
                  className="flex justify-between items-start py-1.5 border-b border-white/5 last:border-0"
                >
                  <div>
                    <span className="text-xs text-zinc-400 block">
                      {CATEGORY_LABELS[cat.key as CategoryKey]}
                    </span>
                    <span className="text-xs font-bold text-zinc-200">
                      {cat.total === 0 ? "未評估" : `${cat.match}/${cat.total}`}
                    </span>
                  </div>
                  <div className="text-xs font-bold">
                    {cat.total === 0 ? "—" : `${cat.accuracy}%`}
                  </div>
                </div>
              ))}
              <div className="mt-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-300">
                整體準確率：{report.accuracy}% ({report.matches}/{report.samples} 筆方向吻合)
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "daYun" && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-amber-300 tracking-widest uppercase mb-2">
            定盤年
          </h3>
          <div className="glass-card p-3 rounded-xl border border-white/5">
            <div className="space-y-2">
              {Object.entries(calibrations).map(([year, outcome]) => (
                <div key={year} className="flex justify-between items-center p-2 rounded bg-white/5">
                  <span className="text-xs text-zinc-300">{year} 年</span>
                  <span className={`text-[10px] font-bold rounded px-2 py-0.5 ${
                    outcome === "順利"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500"
                      : "bg-red-500/20 text-red-400 border border-red-500"
                  }`}>
                    {outcome}
                  </span>
                </div>
              ))}
              {Object.keys(calibrations).length === 0 && (
                <span className="text-xs text-zinc-500">尚無定盤年記錄。</span>
              )}
            </div>
            {autoSwitched && (
              <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-300">
                根據打卡證據，建議定盤切換為：「{autoSwitched}」
              </div>
            )}
          </div>
        </div>
      )}

      {/* 快速校準動作 */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <h3 className="text-xs font-bold text-amber-300 tracking-widest uppercase mb-2">
          快速校準（本年）
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => recordOutcome("順利")}
            className="flex-1 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-300 transition-colors"
          >
            今年【順利】
          </button>
          <button
            onClick={() => recordOutcome("不順")}
            className="flex-1 py-2 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-300 transition-colors"
          >
            今年【不順】
          </button>
        </div>
        <p className="mt-2 text-[10px] text-zinc-500">
          校準後會調整格局分數，並可能觸發定盤切換。紀錄兩年後系統會建議是否調整格局方向。
        </p>
      </div>
    </div>
  );
}
