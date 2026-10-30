// tests/unit/petFiveElements.test.ts
// v2.2 skill §2.12 寵物與五行：資料層口徑回歸（外部裁判 = vitest 斷言）
import { describe, it, expect } from 'vitest';
import {
  PET_ELEMENT_GUIDES,
  getPetAdvice,
  PET_REMINDERS,
} from '../../src/data/rules/petFiveElements';
import { classifyQuery } from '../../src/ai/knowledge/classifier';
import {
  retrieveKnowledge,
  formatKnowledgeForPrompt,
} from '../../src/ai/knowledge/retriever';
import type { EvidenceData } from '../../src/lib/evidence/provider';

describe('寵物五行資料（skill v2.2 §2.12）', () => {
  it('五行齊全：木火土金水各有一組', () => {
    const elements = PET_ELEMENT_GUIDES.map((g) => g.element).sort();
    expect(elements).toEqual(['土', '木', '水', '火', '金']);
  });

  it('口徑釘住：貓=木火、兔=木、狗=火土、缺金水→鳥倉鼠蛇魚龜', () => {
    const wood = getPetAdvice('木');
    expect(wood?.pets.some((p) => p.includes('貓'))).toBe(true);
    expect(wood?.pets.some((p) => p.includes('兔'))).toBe(true);
    const earth = getPetAdvice('土');
    expect(earth?.pets.some((p) => p.includes('狗'))).toBe(true);
    const water = getPetAdvice('水');
    expect(water?.pets).toEqual(expect.arrayContaining(['魚', '烏龜', '蛇']));
  });

  it('鐵律存在：食神傷官定位、先看命盤五行、責任心大於開運', () => {
    const all = PET_REMINDERS.join(' ');
    expect(all).toContain('食神傷官');
    expect(all).toContain('先看命盤需要哪種五行');
    expect(all).toContain('責任心永遠比開運更重要');
  });

  it('getPetAdvice 對未知五行回 null（不虛構）', () => {
    // @ts-expect-error 故意傳非法值驗證 fail-closed
    expect(getPetAdvice('光')).toBeNull();
  });
});

describe('寵物查詢的知識管線（classifier + retriever 接線）', () => {
  // retriever 簽名吃 EvidenceData（bazi 為干支字串、fiveElements 為英文鍵）
  const evidence = {
    record_id: 'current-test',
    bazi: {
      year: '庚申',
      month: '庚辰',
      day: '戊寅',
      hour: '丁巳',
      dayMaster: '戊',
      gender: '男',
      time: '10',
    },
    fiveElements: { wood: 20, fire: 15, earth: 40, metal: 5, water: 10 },
    tenGods: {},
    dayun: [],
    liunian: [],
  } as unknown as EvidenceData;

  it('classifier 把寵物/養貓/毛小孩分到 family', () => {
    for (const q of ['養貓好嗎？', '我適合養什麼寵物？', '毛小孩能補運嗎']) {
      const c = classifyQuery(q);
      expect(c.category).toBe('family');
    }
  });

  it('retriever 對寵物查詢回傳 kb:petFiveElements 條目，含提醒與引用規則所需欄位', () => {
    const cls = classifyQuery('我適合養貓還是養狗？');
    const { items } = retrieveKnowledge(cls, evidence);
    const pet = items.find((i) => i.sourceId.startsWith('kb:petFiveElements:'));
    expect(pet).toBeDefined();
    expect(pet?.content).toContain('責任心');
    expect(pet?.sourceId).toMatch(/^kb:petFiveElements:pet-./);
  });

  it('非寵物查詢不出現寵物條目（gate 生效，不污染其他分類）', () => {
    const cls = classifyQuery('我的財運如何？');
    const { items } = retrieveKnowledge(cls, evidence);
    expect(items.some((i) => i.sourceId.startsWith('kb:petFiveElements'))).toBe(
      false
    );
  });

  it('formatKnowledgeForPrompt 輸出含檢索原因（引用可溯源）', () => {
    const cls = classifyQuery('養貓好嗎');
    const { items } = retrieveKnowledge(cls, evidence);
    const pet = items.find((i) => i.sourceId.startsWith('kb:petFiveElements'));
    const text = formatKnowledgeForPrompt([pet!]);
    expect(text).toContain('[kb:petFiveElements:');
    expect(text).toContain('檢索原因');
  });
});
