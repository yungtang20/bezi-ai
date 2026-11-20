// src/lib/domains.ts
// [R7 ARCH-01] 十神日型 → 可評估領域（單一真實來源，供整體與分領域準確率共用）。
// 此模組專責「領域分類表」這個 GLOSSARY 領域詞彙，不應與校準分數引擎混在同一模組。
export type CategoryKey =
  'health' | 'career' | 'romance' | 'wealth' | 'family' | 'friends';

export const DAY_TYPE_FIELDS: Record<string, CategoryKey[]> = {
  財星: ['wealth'],
  官殺: ['career'],
  食傷: ['romance', 'health'],
  比劫: ['wealth', 'romance', 'friends', 'family'],
  印星: ['career'],
};

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  health: '健康',
  career: '事業',
  romance: '感情',
  wealth: '財運',
  family: '家庭',
  friends: '人際',
};

export const CATEGORY_ORDER: CategoryKey[] = [
  'wealth',
  'career',
  'romance',
  'health',
  'family',
  'friends',
];

export function domainLabel(key: CategoryKey): string {
  return CATEGORY_LABELS[key];
}
