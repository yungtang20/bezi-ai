// src/ai/knowledge/chartContext.ts
// 從 EvidenceData 派生 ChartContext：日主五行、格局（身強/身弱）。
// 四柱真值以 Evidence 為準（server 端引擎實排結果），不再用假生日重排。
// 格局判定用 packages/core determinePattern（引擎既有邏輯，與前端同一學派）。

import type { EvidenceData } from '../../lib/evidence/provider';
import { determinePattern, type BaziChart } from '../../../packages/core/src/index';
import { GAN_TO_ELEMENT, getTenGod } from '../../../packages/core/src/constants';
import { ZHI_HIDE_GAN } from '../../../packages/core/src/paipan';
import type { ChartContext } from './types';

const GANS = '甲乙丙丁戊己庚辛壬癸';
const ZHIS = '子丑寅卯辰巳午未申酉戌亥';

/** 從干支字串重建 Pillar（含藏干與十神）；時辰未知回 null */
function buildPillarFromGanZhi(ganZhi: string, dayMaster: string) {
  if (!ganZhi || ganZhi === '時辰未知' || ganZhi.length !== 2) return null;
  const [gan, zhi] = [ganZhi[0], ganZhi[1]];
  if (!GANS.includes(gan) || !ZHIS.includes(zhi)) return null;
  const hiddenGan = ZHI_HIDE_GAN[zhi] || [];
  return {
    gan,
    zhi,
    hiddenGan,
    tenGod: getTenGod(dayMaster, gan),
    hiddenTenGods: hiddenGan.map(h => getTenGod(dayMaster, h)),
  };
}

export function buildChartContext(evidence: EvidenceData): ChartContext | null {
  const bazi = evidence?.bazi;
  if (!bazi || typeof bazi.dayMaster !== 'string' || !bazi.dayMaster) return null;

  const dayElement = GAN_TO_ELEMENT[bazi.dayMaster] || null;
  if (!dayElement) return null;

  let pattern: string | null = null;
  if (bazi.time !== '時辰未知') {
    try {
      const year = buildPillarFromGanZhi(bazi.year, bazi.dayMaster);
      const month = buildPillarFromGanZhi(bazi.month, bazi.dayMaster);
      const day = buildPillarFromGanZhi(bazi.day, bazi.dayMaster);
      const hour = buildPillarFromGanZhi(bazi.time, bazi.dayMaster);
      if (year && month && day) {
        const chart = {
          year, month, day,
          hour: hour || { gan: '', zhi: '', hiddenGan: [], tenGod: '', hiddenTenGods: [] },
          dayMaster: bazi.dayMaster,
          gender: bazi.gender === '男' ? '男' : '女',
          birthYear: 2000, birthMonth: 1, birthDay: 1, birthHour: 12,
          zodiac: '',
        } as BaziChart;
        pattern = determinePattern(chart).pattern;
      }
    } catch {
      pattern = null;
    }
  }

  return {
    dayMaster: bazi.dayMaster,
    dayElement,
    pattern,
    tenGods: evidence.tenGods || {},
    fiveElements: evidence.fiveElements || {},
    gender: bazi.gender || '',
  };
}
