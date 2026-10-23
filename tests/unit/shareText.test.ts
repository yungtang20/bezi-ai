// tests/unit/shareText.test.ts — 分享文案（純函式）
import { describe, it, expect } from 'vitest';
import {
  buildDailyShareText,
  buildSynastryShareText,
  buildLineShareUrl,
  synastryHeadline,
  SHARE_BRAND,
} from '../../src/lib/shareText';

const URL = 'https://bezi-ai-api.onrender.com';

describe('buildDailyShareText', () => {
  const info = {
    outcomeLabel: '大吉',
    ganZhi: '戊午日',
    tenGod: '正印',
    dateLabel: '10 月 21 日 · 星期三',
    advice: '今日能量高峰，重要的事放心推進。',
    favorable: ['木', '水'],
    weakestElement: '金',
  };

  it('包含品牌、運勢、干支、建議與網址', () => {
    const text = buildDailyShareText(info, URL);
    expect(text).toContain(SHARE_BRAND);
    expect(text).toContain('大吉');
    expect(text).toContain('戊午日');
    expect(text).toContain('正印');
    expect(text).toContain('今日能量高峰');
    expect(text).toContain('喜用五行：木、水');
    expect(text).toContain(URL);
  });

  it('有姓名時帶上姓名', () => {
    expect(buildDailyShareText({ ...info, name: '小明' }, URL)).toContain('小明 的今日運勢');
  });

  it('無姓名時使用預設標題', () => {
    expect(buildDailyShareText(info, URL)).toContain('我的今日運勢');
  });

  it('喜用五行為空時不產生空字串行', () => {
    const text = buildDailyShareText({ ...info, favorable: [] }, URL);
    expect(text).not.toContain('喜用五行');
  });

  it('匿名分享時不輸出干支與個人十神', () => {
    const text = buildDailyShareText({ ...info, ganZhi: '', tenGod: '', favorable: [] }, URL);
    expect(text).toContain('今日方向：大吉');
    expect(text).not.toContain('戊午日');
    expect(text).not.toContain('正印');
  });
});

describe('buildSynastryShareText', () => {
  const info = {
    myName: '小明',
    partnerName: '小華',
    score: 78,
    myDayMaster: '戊',
    partnerDayMaster: '辛',
    topFactor: '五行互補',
    topDesc: '土生金，相生有情',
  };

  it('包含雙方姓名、契合度與日主', () => {
    const text = buildSynastryShareText(info, URL);
    expect(text).toContain('小明 × 小華');
    expect(text).toContain('78%');
    expect(text).toContain('日主：戊 × 辛');
    expect(text).toContain('五行互補');
    expect(text).toContain(URL);
  });

  it('缺少重點發現時不產生空行', () => {
    const text = buildSynastryShareText({ ...info, topFactor: undefined, topDesc: undefined }, URL);
    expect(text.split('\n').every(line => line.trim().length > 0)).toBe(true);
  });

  it('匿名分享時不輸出空白日主欄', () => {
    const text = buildSynastryShareText({ ...info, myName: '我', partnerName: '夥伴', myDayMaster: '', partnerDayMaster: '' }, URL);
    expect(text).not.toContain('日主：');
  });
});

describe('buildLineShareUrl', () => {
  it('產生 LINE 分享連結並正確編碼', () => {
    const url = buildLineShareUrl('你好 八字');
    expect(url.startsWith('https://line.me/R/msg/text/?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('你好 八字'));
  });
});

describe('synastryHeadline', () => {
  it('依契合度給出不同標語', () => {
    expect(synastryHeadline(90)).toBe('天作之合');
    expect(synastryHeadline(75)).toBe('相當合拍');
    expect(synastryHeadline(60)).toBe('互補有道');
    expect(synastryHeadline(45)).toBe('有合有磨');
    expect(synastryHeadline(20)).toBe('需要磨合');
  });
});
