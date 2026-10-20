import { memo } from 'react';

const TERM_EXPLANATIONS: Record<string, string> = {
  '傷官見官': '表達與規範產生張力，適合先確認溝通方式與權責。',
  '大運': '以約十年為一段的長期運勢週期。',
  '流年': '以當年度干支觀察的年度趨勢。',
  '用神': '分析中用來協助平衡命局的五行方向。',
  '忌神': '分析中需要留意過度偏盛或造成失衡的五行方向。',
};

function TermTooltip({ term }: { term: string }) {
  const explanation = TERM_EXPLANATIONS[term] || '暫無解釋';
  return <span className="relative inline-block cursor-help border-b border-dotted border-amber-400/70 text-amber-300" title={explanation}>{term}</span>;
}

export default memo(TermTooltip);
