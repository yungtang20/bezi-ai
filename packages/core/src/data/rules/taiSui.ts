export interface TaiSuiResult {
  type: string;
  description: string;
}

export const CLASH_MAP: Record<string, string> = {
  '子': '午', '午': '子', '丑': '未', '未': '丑',
  '寅': '申', '申': '寅', '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳'
};

export const PUNISH_MAP: Record<string, string[]> = {
  '寅': ['巳', '申'], '巳': ['寅', '申'], '申': ['寅', '巳'],
  '丑': ['戌', '未'], '戌': ['丑', '未'], '未': ['丑', '戌'],
  '子': ['卯'], '卯': ['子'],
  '辰': ['辰'], '午': ['午'], '酉': ['酉'], '亥': ['亥'] // 自刑
};

export const HARM_MAP: Record<string, string> = {
  '子': '未', '未': '子', '丑': '午', '午': '丑',
  '寅': '巳', '巳': '寅', '卯': '辰', '辰': '卯',
  '申': '亥', '亥': '申', '酉': '戌', '戌': '酉'
};

export const DESTROY_MAP: Record<string, string> = {
  '子': '酉', '酉': '子', '寅': '亥', '亥': '寅',
  '辰': '丑', '丑': '辰', '午': '卯', '卯': '午',
  '申': '巳', '巳': '申', '戌': '未', '未': '戌'
};

const ZODIAC_TO_ZHI: Record<string, string> = {
  '鼠': '子', '牛': '丑', '虎': '寅', '兔': '卯',
  '龍': '辰', '蛇': '巳', '馬': '午', '羊': '未',
  '猴': '申', '雞': '酉', '狗': '戌', '豬': '亥'
};

export function getTaiSuiAdvice(): string[] {
  return [
    '主動見血：可透過定期洗牙、捐血等方式應驗「血光之災」',
    '財物化解：可多做善事捐款（破歡喜財），或花錢購買原本就想買的貴重物品',
    '避開危險：減少高風險運動、保養車輛、注意行車安全',
    '安太歲：農曆正月前往廟宇點太歲燈，祈求平安'
  ];
}

export function checkTaiSui(yearZhi: string, personalZodiac: string): string[] {
  const personalZhi = ZODIAC_TO_ZHI[personalZodiac] || personalZodiac;
  const afflictions: string[] = [];

  if (personalZhi === yearZhi) {
    afflictions.push('值太歲 (需注意情緒起伏、健康、事業變動)');
  }
  if (CLASH_MAP[personalZhi] === yearZhi) {
    afflictions.push('沖太歲 (動盪較大，易有搬家、轉職、感情生變)');
  }
  if (PUNISH_MAP[personalZhi]?.includes(yearZhi)) {
    afflictions.push('刑太歲 (易有口舌是非、官司、人際摩擦)');
  }
  if (HARM_MAP[personalZhi] === yearZhi) {
    afflictions.push('害太歲 (易遭人陷害、背後小人、難以防避)');
  }
  if (DESTROY_MAP[personalZhi] === yearZhi) {
    afflictions.push('破太歲 (易有突發破財、關係破裂、計畫生變)');
  }

  return afflictions;
}
