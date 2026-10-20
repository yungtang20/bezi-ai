/**
 * 大運流年補運架構
 * 來源：大運流年補運架構/ 資料夾（10個 PDF）
 * [AI MOD] 依照講義資料完整寫入，支援四種格局：身強、身弱、從強、從弱
 */

import type { FiveElement } from '../core/types';
export type Pattern = '身強' | '身弱' | '從強' | '從弱';

/** 大運流年補運架構 */
export interface DayunLiunianGuide {
  element: FiveElement
  pattern: Pattern
  goodFlowYears: string[]    // 好的流年五行
  badFlowYears: string[]     // 不好的流年五行
  goodDayun: string[]        // 好的大運五行
  badDayun: string[]         // 不好的大運五行
  remedy: string[]           // 補運建議
}

/**
 * 大運流年補運架構對照表
 * 來源：大運流年補運架構_*.pdf（10個）
 *
 * 結構說明：
 * - 身強者：喜用神為「剋洩耗」（財、官殺、食傷），忌「印、比劫」
 * - 身弱者：喜用神為「生扶」（印、比劫），忌「財、官殺、食傷」
 * - 從強者：喜用神為「生扶」（印、比劫），忌「財、官殺、食傷」（同身弱）
 * - 從弱者：喜用神為「剋洩耗」（財、官殺、食傷），忌「印、比劫」（同身強）
 */
export const DAYUN_LIUNIAN_GUIDES: Record<FiveElement, Record<Pattern, DayunLiunianGuide>> = {
  '金': {
    '身強': {
      element: '金',
      pattern: '身強',
      goodFlowYears: ['木', '水', '火'],
      badFlowYears: ['土金'],
      goodDayun: ['木', '水', '火'],
      badDayun: ['土金'],
      remedy: ['木', '水', '火'],
    },
    '身弱': {
      element: '金',
      pattern: '身弱',
      goodFlowYears: ['土金'],
      badFlowYears: ['木', '水', '火'],
      goodDayun: ['土金'],
      badDayun: ['木', '水', '火'],
      remedy: ['土金'],
    },
    '從強': {
      element: '金',
      pattern: '從強',
      goodFlowYears: ['土金'],
      badFlowYears: ['木', '水', '火'],
      goodDayun: ['土金'],
      badDayun: ['木', '水', '火'],
      remedy: ['土金'],
    },
    '從弱': {
      element: '金',
      pattern: '從弱',
      goodFlowYears: ['木', '水', '火'],
      badFlowYears: ['土金'],
      goodDayun: ['木', '水', '火'],
      badDayun: ['土金'],
      remedy: ['木', '水', '火'],
    },
  },
  '木': {
    '身強': {
      element: '木',
      pattern: '身強',
      goodFlowYears: ['火土金'],
      badFlowYears: ['水木'],
      goodDayun: ['火土金'],
      badDayun: ['水木'],
      remedy: ['火土金'],
    },
    '身弱': {
      element: '木',
      pattern: '身弱',
      goodFlowYears: ['水木'],
      badFlowYears: ['火土金'],
      goodDayun: ['水木'],
      badDayun: ['火土金'],
      remedy: ['水木'],
    },
    '從強': {
      element: '木',
      pattern: '從強',
      goodFlowYears: ['水木'],
      badFlowYears: ['火土金'],
      goodDayun: ['水木'],
      badDayun: ['火土金'],
      remedy: ['水木'],
    },
    '從弱': {
      element: '木',
      pattern: '從弱',
      goodFlowYears: ['火土金'],
      badFlowYears: ['水木'],
      goodDayun: ['火土金'],
      badDayun: ['水木'],
      remedy: ['火土金'],
    },
  },
  '水': {
    '身強': {
      element: '水',
      pattern: '身強',
      goodFlowYears: ['木火', '土'],
      badFlowYears: ['金', '水'],
      goodDayun: ['木火', '土'],
      badDayun: ['金', '水'],
      remedy: ['木火', '土'],
    },
    '身弱': {
      element: '水',
      pattern: '身弱',
      goodFlowYears: ['金', '水'],
      badFlowYears: ['木火', '土'],
      goodDayun: ['金', '水'],
      badDayun: ['木火', '土'],
      remedy: ['金', '水'],
    },
    '從強': {
      element: '水',
      pattern: '從強',
      goodFlowYears: ['金', '水'],
      badFlowYears: ['木火', '土'],
      goodDayun: ['金', '水'],
      badDayun: ['木火', '土'],
      remedy: ['金', '水'],
    },
    '從弱': {
      element: '水',
      pattern: '從弱',
      goodFlowYears: ['木火', '土'],
      badFlowYears: ['金', '水'],
      goodDayun: ['木火', '土'],
      badDayun: ['金', '水'],
      remedy: ['木火', '土'],
    },
  },
  '火': {
    '身強': {
      element: '火',
      pattern: '身強',
      goodFlowYears: ['土金水', '木'],
      badFlowYears: ['木火'],
      goodDayun: ['土金水'],
      badDayun: ['木火'],
      remedy: ['土金水'],
    },
    '身弱': {
      element: '火',
      pattern: '身弱',
      goodFlowYears: ['木', '木火'],
      badFlowYears: ['土金水'],
      goodDayun: ['木', '木火'],
      badDayun: ['土金水'],
      remedy: ['木', '木火'],
    },
    '從強': {
      element: '火',
      pattern: '從強',
      goodFlowYears: ['木', '木火'],
      badFlowYears: ['土金水'],
      goodDayun: ['木', '木火'],
      badDayun: ['土金水'],
      remedy: ['木', '木火'],
    },
    '從弱': {
      element: '火',
      pattern: '從弱',
      goodFlowYears: ['土金水'],
      badFlowYears: ['木火'],
      goodDayun: ['土金水'],
      badDayun: ['木火'],
      remedy: ['土金水'],
    },
  },
  '土': {
    '身強': {
      element: '土',
      pattern: '身強',
      goodFlowYears: ['金水木'],
      badFlowYears: ['火土'],
      goodDayun: ['金水木'],
      badDayun: ['火土'],
      remedy: ['金水木'],
    },
    '身弱': {
      element: '土',
      pattern: '身弱',
      goodFlowYears: ['火土'],
      badFlowYears: ['金水木'],
      goodDayun: ['火土'],
      badDayun: ['金水木'],
      remedy: ['火土'],
    },
    '從強': {
      element: '土',
      pattern: '從強',
      goodFlowYears: ['火土'],
      badFlowYears: ['金水木'],
      goodDayun: ['火土'],
      badDayun: ['金水木'],
      remedy: ['火土'],
    },
    '從弱': {
      element: '土',
      pattern: '從弱',
      goodFlowYears: ['金水木'],
      badFlowYears: ['火土'],
      goodDayun: ['金水木'],
      badDayun: ['火土'],
      remedy: ['金水木'],
    },
  },
}

/**
 * 取得大運流年補運建議
 */
export function getDayunLiunianGuide(element: FiveElement, pattern: Pattern): DayunLiunianGuide {
  return DAYUN_LIUNIAN_GUIDES[element]?.[pattern] || {
    element,
    pattern,
    goodFlowYears: [],
    badFlowYears: [],
    goodDayun: [],
    badDayun: [],
    remedy: [],
  }
}
