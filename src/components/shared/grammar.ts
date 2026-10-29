// Content grammar budget — keeps every page scannable and ≤30KB per component.
// 内容文法預算：讓每個頁面可掃描，且單一元件 ≤30KB。
export const GRAMMAR = {
  // Max file size (KB) for any single page/component before mandatory split.
  MAX_COMPONENT_KB: 30,
  // Allowed heading levels per section block. A section must not skip a level (h2→h4).
  ALLOWED_HEADING_DELTAS: [1],
  // Max visible text lines per section before progressive disclosure (accordion).
  MAX_SECTION_LINES: 12,
};

// 一個分析區塊固定結構（與 prompts.ts DISCIPLINE_RULE 對齊）：
// 結論先行 → 依據（命盤數字/知識條目）→ 時間窗（哪段大運/年份）→ 3 個可執行動作 → 不確定處
export type SectionGrammar = {
  title: string;              // heading text
  level: 2 | 3 | 4;           // heading level, no skip
  conclusion: string;         // 一句話結論（可掃描）
  evidence?: React.ReactNode; // 依據
  timeWindow?: string;        // 適用時間窗
  actions?: string[];         // 可執行動作（最多 3 個）
  uncertainty?: string;       // 不確定處 / 誠實界線
};

export const GRAMMAR_RULES = {
  conclusionMaxChars: 120,
  actionsMax: 3,
};
/**
 * 建立 ContentSection 文法物件，統一所有 section 組件的結構。
 * 結論先行 → 依據 → 時間窗 → 3 個可執行動作 → 不確定處。
 */
export function makeSection(
  title: string,
  level: SectionGrammar["level"],
  conclusion: string,
  rest: Partial<SectionGrammar>,
): SectionGrammar {
  return { title, level, conclusion: conclusion.slice(0, 120), ...rest };
}
