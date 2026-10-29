// src/components/family/sections/JudgmentSection.tsx
// 命盤十神分布 — 我是怎麼判斷的。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import { ContentSection, SectionGrammar, makeSection } from "../../../components/shared";

const MAX_ACTIONS = 3;

interface JudgmentSectionProps {
  tenGodCount: Record<string, number>;
  maxGod: string;
  maxCount: number;
}

export default function JudgmentSection({
  tenGodCount,
  maxGod,
  maxCount,
}: JudgmentSectionProps) {
  const sorted = Object.entries(tenGodCount)
    .sort((a, b) => b[1] - a[1])
    .filter(([, c]) => c > 0);
  const total = sorted.reduce((sum, [, c]) => sum + c, 0);

  return (
    <div className="space-y-6">
      {/* 十神分布總覽 */}
      <ContentSection
        defaultOpen
        grammar={makeSection(
          "命盤十神分布（四柱占卜透出）",
          2,
          `命盤共 ${total} 位十神，${maxGod} 出現 ${maxCount} 次為最多。`,
          {
            evidence: (
              <div className="flex flex-wrap gap-3">
                {sorted.map(([god, count], idx) => (
                  <div
                    key={god}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-white/5"
                  >
                    <span className="text-xs text-zen-muted font-bold">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-pink-400">
                      {god}
                    </span>
                    <span className="text-sm font-bold text-zen-text font-mono">
                      {count} 個
                    </span>
                  </div>
                ))}
              </div>
            ),
            timeWindow:
              "先天命盤固定，長期適用；大運與流年臨旺時效果更明顯。",
            actions: [
              "確認主星十神類型",
              "對照各十神特質",
              "評估強弱與格局",
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 判斷依據說明 */}
      <ContentSection
        grammar={makeSection(
          "研判依據",
          3,
          "本派學術體系以命盤十神分布（四柱天干）之旺衰作為核心依據。",
          {
            evidence: (
              <p className="text-sm text-zen-muted leading-relaxed">
                研判家運、親子緣分、與手足相處關係，本派學術體系是以<strong>「命盤十神分布（四柱天干）」</strong>之旺衰作為核心依據。天干代表主星，地支藏干與其交織形成主要的磁場傾向。
              </p>
            ),
            timeWindow: "先天命盤固定，長期適用。",
            actions: [
              "閱讀十神分布總覽",
              "確認主星與次星",
              "結合大運流年觀察",
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
    </div>
  );
}
