// src/data/taiSui.ts

export interface TaiSuiResult {
  type: string;       // 值太歲、沖太歲、刑太歲、害太歲、破太歲
  level: string;      // 嚴重程度：高、中、低
  description: string;
  remedy: string;     // 化解建議
}

// 地支六沖
const CLASH_MAP: Record<string, string> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
};

// 地支相刑
const PUNISH_MAP: Record<string, string[]> = {
  '子': ['卯'],
  '卯': ['子'],
  '寅': ['巳', '申'],
  '巳': ['寅', '申'],
  '申': ['寅', '巳'],
  '丑': ['戌', '未'],
  '戌': ['丑', '未'],
  '未': ['丑', '戌'],
  '辰': ['辰'],
  '午': ['午'],
  '酉': ['酉'],
  '亥': ['亥'],
};

// 地支相害
const HARM_MAP: Record<string, string> = {
  '子': '未', '未': '子',
  '丑': '午', '午': '丑',
  '寅': '巳', '巳': '寅',
  '卯': '辰', '辰': '卯',
  '申': '亥', '亥': '申',
  '酉': '戌', '戌': '酉',
};

// 地支相破
const DESTROY_MAP: Record<string, string> = {
  '子': '酉', '酉': '子',
  '丑': '辰', '辰': '丑',
  '寅': '亥', '亥': '寅',
  '卯': '午', '午': '卯',
  '巳': '申', '申': '巳',
  '未': '戌', '戌': '未',
};

export function checkTaiSui(myZhi: string, yearZhi: string): TaiSuiResult[] {
  const results: TaiSuiResult[] = [];
  
  // 值太歲
  if (myZhi === yearZhi) {
    results.push({
      type: "值太歲（本命年）",
      level: "高",
      description: "當年犯太歲，易有變動、不順。建議凡事低調，保守行事。",
      remedy: "主動見血（洗牙、捐血）、車輛保養、增加捐款額度。"
    });
  }
  
  // 沖太歲
  if (CLASH_MAP[myZhi] === yearZhi) {
    results.push({
      type: "沖太歲",
      level: "高",
      description: "沖代表變動、衝擊。易有職業、住所變動，或與人衝突。行車走路需多加留意。",
      remedy: "車輛維護保養、放慢速度、主主動破財（捐款、汰舊換新）。"
    });
  }
  
  // 刑太歲
  if (PUNISH_MAP[myZhi]?.includes(yearZhi)) {
    results.push({
      type: "刑太歲",
      level: "中",
      description: "刑代表糾紛、壓力、病痛。注意人際衝突、法律問題、身心健康。",
      remedy: "謹慎發言、不急著表態、避免捲入是非。主動見血化解。"
    });
  }
  
  // 害太歲
  if (HARM_MAP[myZhi] === yearZhi) {
    results.push({
      type: "害太歲",
      level: "中",
      description: "害代表暗中小人、誤解。注意人際關係、溝通不暢。",
      remedy: "加強溝通、把話說明白。避免背後議論他人。"
    });
  }
  
  // 破太歲
  if (DESTROY_MAP[myZhi] === yearZhi) {
    results.push({
      type: "破太歲",
      level: "低",
      description: "破代表突如其來的阻礙或計劃破局。事情易有變數。",
      remedy: "保持彈性，預留備案。不適合做重大決定。"
    });
  }
  
  return results;
}
