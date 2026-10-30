// Judgment logic and calculation functions
export * from './childrenGuidelines'; // [AI MOD] Used by ReferenceTablePage (CHILDREN_GUIDELINES)
export * from './compatibilityRules';
export * from './dailyFlowDays';
// [AI MOD] dayunLiunian 不由此檔轉出（registry.ts 直接 import；內容為靜態速查表，
// 動態補運分支的單一來源在 src/data/core/fiveElementsBalance.ts getLiunianAndRemedy）
export * from './partnerMatching';
export * from './peachBlossomTiming';
export * from './petFiveElements';
export * from './taiSui';
export * from './timelineGuidelines';
