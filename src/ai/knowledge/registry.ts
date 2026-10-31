// src/ai/knowledge/registry.ts
// 知識條目註冊表：每個 QueryCategory 對應一組 builder。
// builder 只讀 src/data/** 既有匯出，不改知識內容；每條輸出附 sourceId 與 matchedWhy。
// sourceId 命名固定 kb:<來源模組>:<鍵>，用 kbId() 產生避免手寫拼錯。

import {
  WEALTH_GUIDELINES,
  WEALTH_LOST_TIMING,
  CAREER_GUIDELINES,
  SPOUSE_STAR_POSITION,
  healthRemedies,
} from '../../data/charts/index';
import { HEALTH_DATA } from '../../data/charts/healthData';
import { TEN_GOD_TRAITS } from '../../data/lecture/index';
import {
  DAY_MASTER_TRAITS,
  ELEMENT_BALANCE_RULES,
  DEFICIENT_ELEMENT_REMEDIES,
  DAY_MASTER_RELATIONS,
} from '../../data/core/index';
import { DAYUN_LIUNIAN_GUIDES } from '../../data/rules/dayunLiunian';
import { getPetAdvice, PET_REMINDERS } from '../../data/rules/petFiveElements';
import { FENG_SHUI_SYSTEM_GUIDE } from '../../data/charts/fengShuiSystemGuide';
import { getTaiSuiAdvice } from '../../data/rules/taiSui';
import { LECTURE_DATA } from '../../data/lecture/lectureData';
import { familyRoles } from '../../data/charts/familyRoles';
import type { ChartContext, KnowledgeItem, QueryCategory } from './types';

export function kbId(module: string, key: string): string {
  return `kb:${module}:${key}`;
}

function item(
  module: string,
  key: string,
  title: string,
  content: string,
  matchedWhy: string
): KnowledgeItem {
  return { sourceId: kbId(module, key), title, content, matchedWhy };
}

function fmtRecord(obj: unknown, indent = 0): string {
  if (obj === null || obj === undefined) return '';
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj))
    return obj
      .map((o) => fmtRecord(o, indent))
      .filter(Boolean)
      .join('；');
  if (typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>)
      .filter(
        ([, v]) =>
          v !== null &&
          v !== undefined &&
          v !== '' &&
          !(Array.isArray(v) && v.length === 0)
      )
      .map(([k, v]) => `${k}：${fmtRecord(v, indent)}`)
      .join('；');
  }
  return String(obj);
}

type Builder = (ctx: ChartContext, topics: string[]) => KnowledgeItem[];

// ---------- 感情姻緣 ----------

const spouseBuilders: Builder[] = [
  (ctx) => {
    // 以日主十神關係補夫妻星面向；完整日柱特質需 Evidence 日柱干支，由 content 涵蓋
    const items: KnowledgeItem[] = [];
    items.push(
      item(
        'spouseGuidelines',
        'spouse-star-position',
        '夫妻星位置',
        fmtRecord(SPOUSE_STAR_POSITION),
        '查詢涉及感情姻緣，夫妻星位置為基礎判斷'
      )
    );
    const relation =
      DAY_MASTER_RELATIONS[ctx.dayMaster as keyof typeof DAY_MASTER_RELATIONS];
    if (relation) {
      const genderStar =
        ctx.gender === '女' ? ['正官', '七殺'] : ['正財', '偏財'];
      const spouseGods = relation.filter(
        (r) =>
          genderStar.includes(r.heteroGod) || genderStar.includes(r.homoGod)
      );
      if (spouseGods.length > 0) {
        items.push(
          item(
            'tenGodRelationships',
            `spouse-star-${ctx.dayMaster}`,
            `${ctx.dayMaster}日主的夫妻星`,
            fmtRecord(
              spouseGods.map((r) => ({
                元素: r.element,
                十神: [r.heteroGod, r.homoGod].join('/'),
              }))
            ),
            `${ctx.gender === '女' ? '女命以官殺' : '男命以財星'}看感情，依日主 ${ctx.dayMaster} 檢索`
          )
        );
      }
    }
    return items;
  },
  (ctx, topics) => {
    const traits = topics.some((t) => ['桃花', '姻緣', '感情'].includes(t));
    return [
      item(
        'spouseGuidelines',
        'peach-blossom-rules',
        '桃花判斷規則',
        fmtRecord(
          (LECTURE_DATA as Record<string, unknown>).PEACH_BLOSSOM_TIMING || ''
        ),
        traits ? '查詢明確提及桃花/姻緣' : '感情類查詢常涉及桃花時機'
      ),
    ];
  },
];

// ---------- 財運 ----------

const wealthBuilders: Builder[] = [
  (ctx) => {
    const guide =
      WEALTH_GUIDELINES[ctx.dayElement as keyof typeof WEALTH_GUIDELINES];
    if (!guide) return [];
    return [
      item(
        'wealthGuidelines',
        `wealth-${ctx.dayElement}`,
        `${ctx.dayElement}命人財運指引`,
        fmtRecord(guide),
        `日主五行為 ${ctx.dayElement}，直接對應財運指引`
      ),
    ];
  },
  (ctx) => {
    if (!ctx.pattern) return [];
    const rule = ELEMENT_BALANCE_RULES.find(
      (r) =>
        r.dayMasterElement === ctx.dayElement &&
        r.strength ===
          (ctx.pattern === '身強' || ctx.pattern === '從弱' ? '身強' : '身弱')
    );
    if (!rule) return [];
    return [
      item(
        'fiveElementsBalance',
        `balance-${ctx.dayElement}-${ctx.pattern}`,
        `五行喜忌（${ctx.dayElement}命・${ctx.pattern}）`,
        fmtRecord(rule),
        `命主格局判定為 ${ctx.pattern}，決定喜用與忌神`
      ),
    ];
  },
  (ctx, topics) => {
    void topics;
    return [
      item(
        'wealthGuidelines',
        'wealth-lost-timing',
        '破財時機',
        fmtRecord(WEALTH_LOST_TIMING),
        '財運查詢需附破財預警'
      ),
    ];
  },
];

// ---------- 事業 ----------

const careerBuilders: Builder[] = [
  (ctx) => {
    const guide =
      CAREER_GUIDELINES[ctx.dayElement as keyof typeof CAREER_GUIDELINES];
    if (!guide) return [];
    return [
      item(
        'careerGuidelines',
        `career-${ctx.dayElement}`,
        `${ctx.dayElement}命人事業指引`,
        fmtRecord(guide),
        `日主五行為 ${ctx.dayElement}，直接對應事業指引`
      ),
    ];
  },
  (ctx) => {
    const transfer = (LECTURE_DATA as Record<string, unknown>).JOB_CHANGE;
    if (!transfer) return [];
    return [
      item(
        'lectureData',
        'job-change',
        '轉職時機（依身強弱與五行）',
        fmtRecord(transfer),
        '事業查詢常涉及轉職時機判斷'
      ),
    ];
  },
  (ctx) => {
    // 十神特質：命盤中數量最多的前三個十神
    const top = Object.entries(ctx.tenGods)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    return top
      .map(([god, count]) => {
        const trait = TEN_GOD_TRAITS[god];
        if (!trait) return null;
        return item(
          'tenGodTraits',
          `ten-god-${god}`,
          `十神特質：${god}（命盤 ${count} 個）`,
          fmtRecord(trait),
          `命盤十神分佈中 ${god} 為主導星（${count} 個）`
        );
      })
      .filter(Boolean) as KnowledgeItem[];
  },
];

// ---------- 健康 ----------

const healthBuilders: Builder[] = [
  (ctx) => {
    const health = HEALTH_DATA as unknown as Record<
      string,
      Record<string, unknown>
    >;
    const organs = health.ORGANS?.[ctx.dayElement] as string | undefined;
    const warnings = health.WARNINGS?.[ctx.dayElement] as
      Record<string, string> | undefined;
    if (!organs) return [];
    return [
      item(
        'healthData',
        `organs-${ctx.dayElement}`,
        `健康對應器官（${ctx.dayElement}）`,
        fmtRecord({ 器官: organs, 警訊: warnings }),
        `健康以命盤最弱五行為準，日主 ${ctx.dayElement} 為起點`
      ),
    ];
  },
  (ctx) => {
    const remedy = healthRemedies.find((r) => r.element === ctx.dayElement);
    if (!remedy) return [];
    return [
      item(
        'healthRemedies',
        `remedy-${ctx.dayElement}`,
        `健康調養（${ctx.dayElement}）`,
        fmtRecord(remedy),
        `日主五行 ${ctx.dayElement} 對應調養建議`
      ),
    ];
  },
];

// ---------- 家人/人際 ----------

const familyBuilders: Builder[] = [
  (ctx, topics) => {
    void topics;
    return familyRoles.map((role) =>
      item(
        'familyRoles',
        `family-role-${role.tenGodName}`,
        `家人角色：${role.tenGodName}（${role.tenGodType}）`,
        fmtRecord(role),
        '家人/人際查詢，提供十神對應家人關係'
      )
    );
  },
  (ctx, topics) => {
    // 寵物與五行（v2.2 skill §2.12）：以最弱五行為「需要補的五行」對應動物屬性
    const petHit = topics.some((t) =>
      ['寵物', '養貓', '養狗', '毛小孩', '貓', '狗', '魚', '烏龜'].some((k) =>
        t.includes(k)
      )
    );
    if (!petHit) return [];
    // EvidenceData.fiveElements 鍵為英文（wood/fire/earth/metal/water）
    const EL_EN_TO_ZH: Record<string, '木' | '火' | '土' | '金' | '水'> = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    };
    const weakest = Object.entries(ctx.fiveElements).sort(
      (a, b) => a[1] - b[1]
    )[0];
    const neededZh = weakest ? EL_EN_TO_ZH[weakest[0]] : undefined;
    const guide = getPetAdvice(neededZh || '木');
    if (!guide) return [];
    return [
      item(
        'petFiveElements',
        `pet-${guide.element}`,
        `寵物與五行（需補：${guide.element}）`,
        `${guide.pets.join('、')}。${guide.note} ${PET_REMINDERS.join(' ')}`,
        `查詢提及寵物，命盤五行中 ${guide.element} 最弱（值 ${weakest?.[1] ?? '未知'}）為需補方向`
      ),
    ];
  },
];

// ---------- 大運流年 ----------

const dayunBuilders: Builder[] = [
  (ctx) => {
    if (!ctx.pattern) return [];
    const guide =
      DAYUN_LIUNIAN_GUIDES[
        ctx.dayElement as keyof typeof DAYUN_LIUNIAN_GUIDES
      ]?.[ctx.pattern as keyof (typeof DAYUN_LIUNIAN_GUIDES)['木']];
    if (!guide) return [];
    const content =
      `好大運：${guide.goodDayun.join('、')}；不好的大運：${guide.badDayun.join('、')}。` +
      `補運規則：大運好時補 ${guide.remedyWhenDayunGood.join('、')}；大運不好時補 ${guide.remedyWhenDayunBad.join('、')}。` +
      (guide.remedyWhenDayunGood.join() === guide.remedyWhenDayunBad.join()
        ? `不論大運好壞，補運一律 ${guide.remedyAlways.join('、')}。`
        : '身弱補運看大運、不看流年，未確認當前大運喜忌時不可只給單一組。') +
      `注意：${guide.note}`;
    return [
      item(
        'dayunLiunian',
        `guide-${ctx.dayElement}-${ctx.pattern}`,
        `大運流年補運（${ctx.dayElement}命・${ctx.pattern}）`,
        content,
        `格局 ${ctx.pattern} 決定大運流年吉凶方向與補運分支`
      ),
    ];
  },
  (_ctx, topics) => {
    if (!topics.some((t) => ['太歲', '犯太歲'].includes(t))) return [];
    return [
      item(
        'taiSui',
        'advice',
        '太歲建議',
        fmtRecord(getTaiSuiAdvice()),
        '查詢明確提及太歲'
      ),
    ];
  },
];

// ---------- 每日運勢 ----------

const dailyBuilders: Builder[] = [
  (ctx) => {
    void ctx;
    return [
      item(
        'lectureData',
        'daily-flow',
        '流日吉凶原則',
        '流日以當日干支對照日主十神判斷；身強喜財官食傷之日，身弱喜印比之日。',
        '每日運勢查詢，提供流日判斷原則'
      ),
    ];
  },
];

// ---------- 一般命盤 ----------

const generalBuilders: Builder[] = [
  (ctx) => {
    const trait =
      DAY_MASTER_TRAITS[ctx.dayMaster as keyof typeof DAY_MASTER_TRAITS];
    if (!trait) return [];
    return [
      item(
        'dayMasterTraits',
        `dm-${ctx.dayMaster}`,
        `日主特質：${ctx.dayMaster}（${ctx.dayElement}）`,
        fmtRecord(trait),
        `查詢涉及命盤解讀，日主 ${ctx.dayMaster} 為核心`
      ),
    ];
  },
  (ctx) => {
    const relation =
      DAY_MASTER_RELATIONS[ctx.dayMaster as keyof typeof DAY_MASTER_RELATIONS];
    if (!relation) return [];
    return [
      item(
        'tenGodRelationships',
        `relations-${ctx.dayMaster}`,
        `${ctx.dayMaster}日主十神對照表`,
        fmtRecord(relation),
        '命盤解讀需十神生剋對照'
      ),
    ];
  },
  (ctx) => {
    const weakest = Object.entries(ctx.fiveElements).sort(
      (a, b) => a[1] - b[1]
    )[0];
    if (!weakest) return [];
    const remedy =
      DEFICIENT_ELEMENT_REMEDIES[
        weakest[0] as keyof typeof DEFICIENT_ELEMENT_REMEDIES
      ];
    if (!remedy) return [];
    return [
      item(
        'fiveElementsRemedies',
        `remedy-${weakest[0]}`,
        `五行補運（最弱：${weakest[0]}）`,
        fmtRecord(remedy),
        `命盤五行中 ${weakest[0]} 最弱（值 ${weakest[1]}），為補運重點`
      ),
    ];
  },
];

// ---------- 風水（系統分離：風水系統與八字系統不互相推導） ----------

const FENG_SHUI_TOPIC_KEYS = [
  '風水',
  '居家',
  '擺設',
  '朝向',
  '方位',
  '收銀',
  '店面',
  '辦公室',
  '紫白',
  '飛星',
  '入宅',
  '動工',
  '裝修',
  '明堂',
  '穿堂',
];

// [AI MOD] fengshuiBuilder 以話題關鍵詞 gate（classifier 會把風水詞抽進 topics），
// 掛到風水查詢可能落入的分類：店面收銀→wealth、辦公室→career、居家健康→health、
// 孩子房間→family，general_bazi 為 other fallback 的落點。
export const fengshuiBuilder: Builder = (_ctx, topics) => {
  const hit = topics.some((t) =>
    FENG_SHUI_TOPIC_KEYS.some((k) => t.includes(k) || k.includes(t))
  );
  if (!hit) return [];
  return FENG_SHUI_SYSTEM_GUIDE.map((section) =>
    item(
      'fengShuiSystemGuide',
      section.id,
      `風水系統：${section.title}`,
      `${section.boundary ? `界線：${section.boundary} ` : ''}${section.items.map((it) => `${it.name}：${it.detail}`).join('；')}`,
      '查詢涉及風水系統（佈局／方位／擺件／選房／商業空間／儀式），依「風水系統 ≠ 八字系統」鐵律提供'
    )
  );
};

export const REGISTRY: Record<QueryCategory, Builder[]> = {
  spouse: spouseBuilders,
  wealth: [...wealthBuilders, fengshuiBuilder],
  career: [...careerBuilders, fengshuiBuilder],
  health: [...healthBuilders, fengshuiBuilder],
  family: [...familyBuilders, fengshuiBuilder],
  dayun_liunian: dayunBuilders,
  daily: dailyBuilders,
  general_bazi: [...generalBuilders, fengshuiBuilder],
  other: [fengshuiBuilder],
};
