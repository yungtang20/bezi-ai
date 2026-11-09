// Judgment logic and calculation functions
export * from './childrenGuidelines'; // [AI MOD] Used by ReferenceTablePage (CHILDREN_GUIDELINES)
export * from './compatibilityRules';
// [AI MOD] dailyFlowDays 已移除重複副本，單一來源在 @bezi/core packages/core/src/data/rules/dailyFlowDays.ts
// [AI MOD] dayunLiunian 不由此檔轉出（registry.ts 直接 import；內容為靜態速查表，
// 動態補運分支的單一來源在 src/data/core/fiveElementsBalance.ts getLiunianAndRemedy）
export * from './partnerMatching';
export * from './peachBlossomTiming';
export * from './petFiveElements';
export * from './taiSui';
export * from './timelineGuidelines';
