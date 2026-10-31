// src/components/health/sections/TimelineSection.tsx
// 歲運推演分析 — Health Page Section 3：大運與流年對先天健康弱項的推演。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import {
  ContentSection,
  SectionGrammar,
  makeSection,
} from '../../../components/shared';
import type { DaYun } from '../../../dayun';
import type { LiuNian } from '../../../dayun';
const MAX_ACTIONS = 3;

interface TimelineSectionProps {
  currentDaYun: DaYun | undefined;
  currentLiuNian: LiuNian | undefined;
  currentYear: number;
  targetWeakest: string[];
  daYunHealthDetails: {
    status: string;
    desc: string;
    code: string;
  };
  combinedYearlyAnalysis: {
    phrase: string;
    body: string;
  };
}

export default function TimelineSection({
  currentDaYun,
  currentLiuNian,
  currentYear,
  targetWeakest,
  daYunHealthDetails,
  combinedYearlyAnalysis,
}: TimelineSectionProps) {
  const primaryWeak = targetWeakest[0];

  const headerEvidence = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1">
        <span className="text-[10px] text-zen-muted uppercase tracking-wider block">
          當前逢限大運
        </span>
        <strong className="text-lg text-zen-text font-serif block">
          {currentDaYun
            ? `${currentDaYun.startAge}歲~${currentDaYun.startAge + 9}歲大運：${currentDaYun.ganZhi}`
            : '查無大運'}
        </strong>
        <span className="text-xs text-zen-muted block">
          大限管中局：奠定這十年健康修復與病理的背景底色。（歲數為大致區間，非判定因素）
        </span>
      </div>
      <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1">
        <span className="text-[10px] text-zen-muted uppercase tracking-wider block">
          當前流年歲君
        </span>
        <strong className="text-lg text-emerald-400 font-serif block">
          {currentLiuNian
            ? `${currentYear}年 (${currentLiuNian.ganZhi}年)`
            : `${currentYear}年`}
        </strong>
        <span className="text-xs text-zen-muted block">
          流年主時效：點燃突發性意外、疾痛修復起伏的導火索。
        </span>
      </div>
    </div>
  );

  const daYunBadge = (
    <span
      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
        daYunHealthDetails.code === 'good'
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : daYunHealthDetails.code === 'bad'
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : 'bg-white/5 text-zen-muted'
      }`}
    >
      {daYunHealthDetails.status}
    </span>
  );

  return (
    <div className="space-y-6" id="timeline">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-emerald-400 font-mono">03.</span> 動態歲運推演
        </h2>
      </div>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
        將大運與流年與先天健康弱項交叉對照，推演出一整年的動態走向與健康重點，非醫療診斷。
      </p>

      <ContentSection
        defaultOpen
        grammar={makeSection(
          '當前大運與流年品質',
          2,
          `目前大運 ${currentDaYun?.ganZhi ?? '—'}，今年流年 ${currentYear} 年。`,
          {
            evidence: headerEvidence,
            timeWindow: '以當前大運與流年為主，建議每三年複盤一次強弱變化。',
            actions: [
              '確認當前大運宮位',
              '對照流年好壞運',
              '擇定化解與行動方向',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* Subset A: 大運 x 先天健康狀況 */}
      <ContentSection
        defaultOpen
        grammar={makeSection(
          '子項一：大運 x 先天健康狀況',
          3,
          `大運健康推演判定為「${daYunHealthDetails.status}」。`,
          {
            evidence: (
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zen-muted font-bold">
                    大運推演判定：
                  </span>
                  {daYunBadge}
                </div>
                <p className="text-xs text-zen-text leading-relaxed font-semibold">
                  {daYunHealthDetails.desc}
                </p>
              </div>
            ),
            timeWindow: '適用於當前十年大運週期，重點觀察首三年與交運年份。',
            actions: [
              '記錄大運起運與交運年份',
              '對照先天弱項五行是否受克',
              '安排定期健康檢查',
            ].slice(0, MAX_ACTIONS),
            uncertainty:
              '大運健康推演依命盤最弱五行與大運干支五行屬性推論，非醫療診斷。',
          }
        )}
      />

      {/* Subset B: 大運 x 流年雙重干涉 */}
      <ContentSection
        defaultOpen
        grammar={makeSection(
          '子項二：大運 x 流年雙重干涉',
          3,
          `歲運合演結構：【${combinedYearlyAnalysis.phrase}】。`,
          {
            evidence: (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                <h4 className="text-xs font-bold text-emerald-400 mb-1">
                  歲運合演結構：【{combinedYearlyAnalysis.phrase}】
                </h4>
                <p className="text-xs text-zen-text leading-relaxed font-semibold">
                  {combinedYearlyAnalysis.body}
                </p>
              </div>
            ),
            timeWindow: '以當前流年為主效年份，建議每季觀察身體感受變化。',
            actions: [
              primaryWeak
                ? `特別留意${primaryWeak}氣對應器官感受`
                : '留意身體微小變化',
              '保持充足睡眠，忌熬夜暴食',
              '如感不適請尋求專業醫療協助',
            ].slice(0, MAX_ACTIONS),
            uncertainty:
              '歲運合演為命理象徵推論，實際健康狀態仍請以專業醫療判斷為準。',
          }
        )}
      />

      <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 text-sm text-amber-200 leading-relaxed mb-4">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 mb-1 uppercase tracking-wider block">
          不確定處
        </span>
        歲運推演依命盤五行生剋與大運流年推斷，實際走勢仍受個人選擇與環境影響，僅供參考，非斷言。
      </div>
    </div>
  );
}
