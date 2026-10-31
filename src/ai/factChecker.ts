// src/ai/factChecker.ts
// [Q4] 決定性事實檢查器：從 AI 回答中抽取「可驗證的命理事實」，並對照 Evidence 命盤
//（引擎排盤結果，經 golden test 驗證）判斷對錯。這是「AI 說得對不對」的證據層，
// 獨立於 validateAIOutput（那只檢查 claims 的 sourceId 引用存在性）。
// 純函式、無 LLM-as-judge（避免用 AI 給 AI 打分的循環论证）。
//
// v1 設計原則：只查「明確斷言」（緊鄰句式），不查推論；抽不到事實 = no_facts，不惩罚。
// 命盤資料不足（時辰未知）的欄位標記 unverifiable，不计入正確率。
// 可查事實：日主、四柱（時辰未知時時柱為 unverifiable）、生肖（年支）、五行最旺/最弱、大運干支。

const GAN = '甲乙丙丁戊己庚辛壬癸';
const ELEMENTS = '木火土金水';
const ZODIACS = '鼠牛虎兔龍蛇馬羊猴雞狗豬';
const GZ = '[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]';

// 年支 → 生肖（與 paipan.ts ZODIAC_MAP 同步）
const ZHI_TO_ZODIAC: Record<string, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔', '辰': '龍', '巳': '蛇',
  '午': '馬', '未': '羊', '申': '猴', '酉': '雞', '戌': '狗', '亥': '豬',
};

// Evidence fiveElements 的英文 key → 中文元素
const ELEMENT_KEY_TO_CN: Record<string, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};

// 命盤記錄的最小結構（server EvidenceData 的結構子集）
export interface FactualBaziRecord {
  bazi: {
    year: string;
    month: string;
    day: string;
    time: string; // '時辰未知' 當時辰未知
    dayMaster: string;
    gender: string;
  };
  fiveElements: Record<string, number>;
  dayun?: Array<Record<string, unknown>>;
}

export type FactVerdict = 'correct' | 'wrong' | 'unverifiable';

export interface FactCheck {
  type: 'day_master' | 'year_pillar' | 'month_pillar' | 'day_pillar' | 'hour_pillar'
    | 'zodiac' | 'strongest_element' | 'weakest_element' | 'dayun';
  claimed: string;
  actual: string | null; // 命盤真值；unverifiable 時為 null
  verdict: FactVerdict;
}

export interface FactCheckResult {
  facts: FactCheck[];
  checked: number; // 可判定（correct + wrong）
  passed: number;
  failed: number;
  accuracy: number | null; // 0..1；checked=0 時 null
  verdict: 'no_facts' | 'all_correct' | 'has_errors' | 'all_unverifiable';
}

// 緊鄰句式抽取：「label 為 gz」或「gz label」，分隔字 為/是/乃/即 可選。
// 不用大視窗掃描，避免抓到與 label 無關的干支。
function findGanZhiByLabel(plain: string, label: string): string[] {
  const out: string[] = [];
  const patterns = [
    new RegExp(`${label}[為是乃即]?(${GZ})`, 'g'),
    new RegExp(`(${GZ})${label}`, 'g'),
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(plain))) {
      if (!out.includes(m[1])) out.push(m[1]);
    }
  }
  return out;
}

/**
 * 對 AI 回答做決定性事實檢查。
 * @param answer 回答文字（含 <term> 標籤亦可，內部會清洗）
 * @param record Evidence 命盤（引擎排盤結果）
 */
export function checkFactualClaims(answer: string, record: FactualBaziRecord): FactCheckResult {
  const plain = String(answer || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<term[^>]*>/g, '')
    .replace(/<\/term>/g, '');

  const facts: FactCheck[] = [];
  const seen = new Set<string>();
  const add = (fact: FactCheck) => {
    const key = `${fact.type}:${fact.claimed}`;
    if (seen.has(key)) return;
    seen.add(key);
    facts.push(fact);
  };

  // 1. 日主（「日主為戊」／「日主戊」緊鄰句式）
  const dmMatch = plain.match(new RegExp(`日主[為是乃即]?([${GAN}])`));
  if (dmMatch) {
    add({ type: 'day_master', claimed: dmMatch[1], actual: record.bazi.dayMaster, verdict: dmMatch[1] === record.bazi.dayMaster ? 'correct' : 'wrong' });
  }

  // 2. 四柱（「年柱為甲子」緊鄰句式；時辰未知時時柱為 unverifiable）
  const pillarAnchors: Array<{ type: FactCheck['type']; label: string; actual: string }> = [
    { type: 'year_pillar', label: '年柱', actual: record.bazi.year },
    { type: 'month_pillar', label: '月柱', actual: record.bazi.month },
    { type: 'day_pillar', label: '日柱', actual: record.bazi.day },
    { type: 'hour_pillar', label: '時柱', actual: record.bazi.time },
  ];
  for (const { type, label, actual } of pillarAnchors) {
    for (const claimed of findGanZhiByLabel(plain, label)) {
      if (actual === '時辰未知' || actual === '') {
        add({ type, claimed, actual: null, verdict: 'unverifiable' });
      } else {
        add({ type, claimed, actual, verdict: claimed === actual ? 'correct' : 'wrong' });
      }
    }
  }

  // 3. 生肖（「屬鼠」緊鄰句式，真值 = 年支）
  const zodiacMatch = plain.match(new RegExp(`屬([${ZODIACS}])`));
  if (zodiacMatch) {
    const actual = ZHI_TO_ZODIAC[record.bazi.year[1]] || null;
    add({ type: 'zodiac', claimed: zodiacMatch[1], actual, verdict: actual && actual === zodiacMatch[1] ? 'correct' : 'wrong' });
  }

  // 4. 五行最旺 / 最弱（「火最旺」／「五行最旺火」緊鄰句式）
  const elementCounts: Array<[string, number]> = Object.entries(record.fiveElements)
    .filter(([, v]) => typeof v === 'number')
    .map(([k, v]) => [ELEMENT_KEY_TO_CN[k] || k, v as number]);
  for (const kind of ['strongest', 'weakest'] as const) {
    const label = kind === 'strongest' ? '最旺' : '最弱';
    const type: FactCheck['type'] = kind === 'strongest' ? 'strongest_element' : 'weakest_element';
    const m = plain.match(new RegExp(`([${ELEMENTS}])${label}`))
      || plain.match(new RegExp(`五行${label}[的是為是乃即]?([${ELEMENTS}])`));
    if (!m) continue;
    const claimed = m[1];
    if (elementCounts.length === 0) {
      add({ type, claimed, actual: null, verdict: 'unverifiable' });
      continue;
    }
    const target = kind === 'strongest' ? Math.max(...elementCounts.map(([, v]) => v)) : Math.min(...elementCounts.map(([, v]) => v));
    const truth = elementCounts.filter(([, v]) => v === target).map(([k]) => k);
    add({ type, claimed, actual: truth.join(','), verdict: truth.includes(claimed) ? 'correct' : 'wrong' });
  }

  // 5. 大運（「戊辰大運」／「大運戊辰」相鄰句式；與 Evidence dayun 任一期比對）
  if (Array.isArray(record.dayun) && record.dayun.length > 0) {
    const truth = record.dayun.map(d => typeof d.ganZhi === 'string' ? d.ganZhi : '').filter(g => g.length > 0);
    for (const claimed of findGanZhiByLabel(plain, '大運')) {
      add({ type: 'dayun', claimed, actual: truth.join(','), verdict: truth.includes(claimed) ? 'correct' : 'wrong' });
    }
  }

  const checked = facts.filter(f => f.verdict !== 'unverifiable');
  const passed = checked.filter(f => f.verdict === 'correct').length;
  const failed = checked.length - passed;
  const accuracy = checked.length > 0 ? passed / checked.length : null;
  const verdict: FactCheckResult['verdict'] =
    facts.length === 0 ? 'no_facts'
      : checked.length === 0 ? 'all_unverifiable'
      : failed === 0 ? 'all_correct'
      : 'has_errors';

  return { facts, checked: checked.length, passed, failed, accuracy, verdict };
}
