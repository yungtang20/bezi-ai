import { BaziChart } from './paipan';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from './constants';

export const ELEMENT_LABELS = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' } as const;
export type ElementKey = keyof typeof ELEMENT_LABELS;
export interface ChartDatum { name: string; value: number; }

const ELEMENT_KEYS = Object.keys(ELEMENT_LABELS) as ElementKey[];
const TEN_GODS = ['比肩', '劫財', '食神', '傷官', '偏財', '正財', '七殺', '正官', '偏印', '正印'];

export function getFiveElementData(chart: BaziChart): ChartDatum[] {
  const counts = Object.fromEntries(ELEMENT_KEYS.map(key => [key, 0])) as Record<ElementKey, number>;
  for (const pillar of [chart.year, chart.month, chart.day, chart.hour]) {
    for (const element of [GAN_TO_ELEMENT[pillar.gan], ZHI_TO_ELEMENT[pillar.zhi]]) {
      const key = ELEMENT_KEYS.find(candidate => ELEMENT_LABELS[candidate] === element);
      if (key) counts[key] += 1;
    }
  }
  const max = Math.max(...Object.values(counts), 1);
  return ELEMENT_KEYS.map(key => ({ name: ELEMENT_LABELS[key], value: Math.round((counts[key] / max) * 100) }));
}

export function getTenGodData(chart: BaziChart): ChartDatum[] {
  const counts = Object.fromEntries(TEN_GODS.map(name => [name, 0])) as Record<string, number>;
  for (const pillar of [chart.year, chart.month, chart.day, chart.hour]) {
    if (TEN_GODS.includes(pillar.tenGod)) counts[pillar.tenGod] += 1;
    for (const tenGod of pillar.hiddenTenGods) if (TEN_GODS.includes(tenGod)) counts[tenGod] += 1;
  }
  return TEN_GODS.map(name => ({ name, value: Math.max(1, counts[name]) }));
}
