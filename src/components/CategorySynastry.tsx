import React, { useMemo } from 'react';
import { BaziChart } from '../paipan';
import { checkMutualComplement } from '../matchmaking';
import { PartnerInfo, SynastryDetail } from '../types';

export function getCompatibilityScore(chart1: BaziChart, chart2: BaziChart, relationship: string) {
  let score = 70; // baseline
  const details = [];

  const complementResult = checkMutualComplement(chart1, chart2);
  if (complementResult.includes('互補')) {
    score += 15;
    details.push({
      factor: '五行/能量互補',
      desc: complementResult,
      advice: '互補代表彼此能提供對方所需能量，互相扶持。'
    });
  } else if (complementResult.includes('碰撞')) {
    score -= 10;
    details.push({
      factor: '能量強度',
      desc: complementResult,
      advice: '強健的能量相遇容易擦出火花，但也需雙方各退一步。'
    });
  } else {
    score += 5;
    details.push({
      factor: '能量共鳴',
      desc: complementResult,
      advice: '兩者能量接近，能在想法與行動上產生共鳴。'
    });
  }

  // Cap score
  if (score > 100) score = 100;
  if (score < 40) score = 40;

  if (details.length === 0) {
    details.push({
      factor: '磁場交流',
      desc: '雙方磁場穩定，能互相尊重與理解。',
      advice: '合盤只是一種天生傾向，真實的關係仍需要雙方共同經營與溝通。'
    });
  }

  return { score, details };
}

interface Props {
  chart: BaziChart;
  partners: PartnerInfo[];
  category: string;
}

export default function CategorySynastry({ chart, partners, category }: Props) {
  const filteredPartners = useMemo(() => {
    if (!partners || partners.length === 0) return [];
    return partners.filter((p) => {
      if (category === 'romance') return p.relationship === '伴侶';
      if (category === 'family') return p.relationship === '家人';
      if (category === 'friends') return p.relationship === '朋友';
      if (category === 'career' || category === 'wealth') return p.relationship === '合作夥伴' || p.relationship === '同事' || p.relationship === '上司' || p.relationship === '下屬';
      return false;
    });
  }, [category, partners]);

  if (filteredPartners.length === 0) return null;

  return (
    <div className="glass-card">
      <h2 className="text-xl font-bold text-zen-text mb-4 flex items-center justify-between">
        合盤觀測結果
        <span className="text-xs font-normal text-zen-muted bg-zen-surface/60 border border-zen-border px-2 py-1 rounded">已篩選 {category} 相關之對象</span>
      </h2>
      <div className="space-y-4">
        {filteredPartners.map((p) => {
          if (!p.chart) return null;
          const scoreData = getCompatibilityScore(chart, p.chart, p.relationship || '');

          return (
            <div key={p.id} className="bg-zen-surface/60 border border-zen-border rounded-2xl p-4 md:p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none rounded-bl-3xl"></div>
              
              <div className="flex items-center justify-between mb-3 border-b border-zen-border pb-3">
                <div>
                  <h3 className="font-bold text-zen-text text-lg">{p.name} <span className="text-sm font-normal text-zen-muted ml-2">({p.relationship})</span></h3>
                  <p className="text-sm text-zen-muted mt-1">日主：{p.chart.dayMaster} | 生肖：{p.chart.year.zhi}</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">{scoreData.score}%</span>
                  <p className="text-sm text-zen-muted font-bold uppercase tracking-wider mt-1">契合度</p>
                </div>
              </div>

              <div className="space-y-3">
                {scoreData.details.map((detail: SynastryDetail, idx: number) => (
                  <div key={idx} className="bg-zen-surface/40 p-3 rounded-xl border border-white/5">
                    <p className="text-sm font-bold text-amber-500 mb-1">{detail.factor}</p>
                    <p className="text-base text-zen-text leading-relaxed font-bold">{detail.desc}</p>
                    {detail.advice && <p className="text-sm text-zen-muted mt-1.5 pt-1.5 border-t border-zen-border border-dashed">{detail.advice}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
