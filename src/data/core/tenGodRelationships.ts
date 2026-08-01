import type { HeavenlyStem, FiveElement, YinYang } from './types';

export interface TenGodRelation {
  elementGroup: string; // "我剋者", "剋我者", etc.
  element: FiveElement;
  heteroStem: string;
  heteroGod: string;
  homoStem: string;
  homoGod: string;
}

export const DAY_MASTER_RELATIONS: Record<HeavenlyStem, TenGodRelation[]> = {
  '甲': [
    { elementGroup: '我剋者', element: '土', heteroStem: '己', heteroGod: '正財', homoStem: '戊', homoGod: '偏財' },
    { elementGroup: '剋我者', element: '金', heteroStem: '辛', heteroGod: '正官', homoStem: '庚', homoGod: '七殺' },
    { elementGroup: '我生者', element: '火', heteroStem: '丁', heteroGod: '傷官', homoStem: '丙', homoGod: '食神' },
    { elementGroup: '生我者', element: '水', heteroStem: '癸', heteroGod: '正印', homoStem: '壬', homoGod: '偏印' },
    { elementGroup: '同我者', element: '木', heteroStem: '乙', heteroGod: '劫財', homoStem: '甲', homoGod: '比肩' }
  ],
  '乙': [
    { elementGroup: '我剋者', element: '土', heteroStem: '戊', heteroGod: '正財', homoStem: '己', homoGod: '偏財' },
    { elementGroup: '剋我者', element: '金', heteroStem: '庚', heteroGod: '正官', homoStem: '辛', homoGod: '七殺' },
    { elementGroup: '我生者', element: '火', heteroStem: '丙', heteroGod: '傷官', homoStem: '丁', homoGod: '食神' },
    { elementGroup: '生我者', element: '水', heteroStem: '壬', heteroGod: '正印', homoStem: '癸', homoGod: '偏印' },
    { elementGroup: '同我者', element: '木', heteroStem: '甲', heteroGod: '劫財', homoStem: '乙', homoGod: '比肩' }
  ],
  '丙': [
    { elementGroup: '我剋者', element: '金', heteroStem: '辛', heteroGod: '正財', homoStem: '庚', homoGod: '偏財' },
    { elementGroup: '剋我者', element: '水', heteroStem: '癸', heteroGod: '正官', homoStem: '壬', homoGod: '七殺' },
    { elementGroup: '我生者', element: '土', heteroStem: '己', heteroGod: '傷官', homoStem: '戊', homoGod: '食神' },
    { elementGroup: '生我者', element: '木', heteroStem: '乙', heteroGod: '正印', homoStem: '甲', homoGod: '偏印' },
    { elementGroup: '同我者', element: '火', heteroStem: '丁', heteroGod: '劫財', homoStem: '丙', homoGod: '比肩' }
  ],
  '丁': [
    { elementGroup: '我剋者', element: '金', heteroStem: '庚', heteroGod: '正財', homoStem: '辛', homoGod: '偏財' },
    { elementGroup: '剋我者', element: '水', heteroStem: '壬', heteroGod: '正官', homoStem: '癸', homoGod: '七殺' },
    { elementGroup: '我生者', element: '土', heteroStem: '戊', heteroGod: '傷官', homoStem: '己', homoGod: '食神' },
    { elementGroup: '生我者', element: '木', heteroStem: '甲', heteroGod: '正印', homoStem: '乙', homoGod: '偏印' },
    { elementGroup: '同我者', element: '火', heteroStem: '丙', heteroGod: '劫財', homoStem: '丁', homoGod: '比肩' }
  ],
  '戊': [
    { elementGroup: '我剋者', element: '水', heteroStem: '癸', heteroGod: '正財', homoStem: '壬', homoGod: '偏財' },
    { elementGroup: '剋我者', element: '木', heteroStem: '乙', heteroGod: '正官', homoStem: '甲', homoGod: '七殺' },
    { elementGroup: '我生者', element: '金', heteroStem: '辛', heteroGod: '傷官', homoStem: '庚', homoGod: '食神' },
    { elementGroup: '生我者', element: '火', heteroStem: '丁', heteroGod: '正印', homoStem: '丙', homoGod: '偏印' },
    { elementGroup: '同我者', element: '土', heteroStem: '己', heteroGod: '劫財', homoStem: '戊', homoGod: '比肩' }
  ],
  '己': [
    { elementGroup: '我剋者', element: '水', heteroStem: '壬', heteroGod: '正財', homoStem: '癸', homoGod: '偏財' },
    { elementGroup: '剋我者', element: '木', heteroStem: '甲', heteroGod: '正官', homoStem: '乙', homoGod: '七殺' },
    { elementGroup: '我生者', element: '金', heteroStem: '庚', heteroGod: '傷官', homoStem: '辛', homoGod: '食神' },
    { elementGroup: '生我者', element: '火', heteroStem: '丙', heteroGod: '正印', homoStem: '丁', homoGod: '偏印' },
    { elementGroup: '同我者', element: '土', heteroStem: '戊', heteroGod: '劫財', homoStem: '己', homoGod: '比肩' }
  ],
  '庚': [
    { elementGroup: '我剋者', element: '木', heteroStem: '乙', heteroGod: '正財', homoStem: '甲', homoGod: '偏財' },
    { elementGroup: '剋我者', element: '火', heteroStem: '丁', heteroGod: '正官', homoStem: '丙', homoGod: '七殺' },
    { elementGroup: '我生者', element: '水', heteroStem: '癸', heteroGod: '傷官', homoStem: '壬', homoGod: '食神' },
    { elementGroup: '生我者', element: '土', heteroStem: '己', heteroGod: '正印', homoStem: '戊', homoGod: '偏印' },
    { elementGroup: '同我者', element: '金', heteroStem: '辛', heteroGod: '劫財', homoStem: '庚', homoGod: '比肩' }
  ],
  '辛': [
    { elementGroup: '我剋者', element: '木', heteroStem: '甲', heteroGod: '正財', homoStem: '乙', homoGod: '偏財' },
    { elementGroup: '剋我者', element: '火', heteroStem: '丙', heteroGod: '正官', homoStem: '丁', homoGod: '七殺' },
    { elementGroup: '我生者', element: '水', heteroStem: '壬', heteroGod: '傷官', homoStem: '癸', homoGod: '食神' },
    { elementGroup: '生我者', element: '土', heteroStem: '戊', heteroGod: '正印', homoStem: '己', homoGod: '偏印' },
    { elementGroup: '同我者', element: '金', heteroStem: '庚', heteroGod: '劫財', homoStem: '辛', homoGod: '比肩' }
  ],
  '壬': [
    { elementGroup: '我剋者', element: '火', heteroStem: '丁', heteroGod: '正財', homoStem: '丙', homoGod: '偏財' },
    { elementGroup: '剋我者', element: '土', heteroStem: '己', heteroGod: '正官', homoStem: '戊', homoGod: '七殺' },
    { elementGroup: '我生者', element: '木', heteroStem: '乙', heteroGod: '傷官', homoStem: '甲', homoGod: '食神' },
    { elementGroup: '生我者', element: '金', heteroStem: '辛', heteroGod: '正印', homoStem: '庚', homoGod: '偏印' },
    { elementGroup: '同我者', element: '水', heteroStem: '癸', heteroGod: '劫財', homoStem: '壬', homoGod: '比肩' }
  ],
  '癸': [
    { elementGroup: '我剋者', element: '火', heteroStem: '丙', heteroGod: '正財', homoStem: '丁', homoGod: '偏財' },
    { elementGroup: '剋我者', element: '土', heteroStem: '戊', heteroGod: '正官', homoStem: '己', homoGod: '七殺' },
    { elementGroup: '我生者', element: '木', heteroStem: '甲', heteroGod: '傷官', homoStem: '乙', homoGod: '食神' },
    { elementGroup: '生我者', element: '金', heteroStem: '庚', heteroGod: '正印', homoStem: '辛', homoGod: '偏印' },
    { elementGroup: '同我者', element: '水', heteroStem: '壬', heteroGod: '劫財', homoStem: '癸', homoGod: '比肩' }
  ]
};
