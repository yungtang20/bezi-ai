// Reference tables from handouts — 各五行在五大專項(財富/事業/家人/人際/姻緣)的補運資料
// 來源:講義 wealthRemediesData / careerRemediesData / familyRoles / friendSupport / romanceRemediesData + homeDecorGuide

export type CategoryType =
  'health' | 'wealth' | 'career' | 'family' | 'friends' | 'romance';

/** 單一五行的補運資料(通用於各專項) */
export interface ElementRemedy {
  title: string; // 例如「木弱財運解析」
  weakness: string; // 弱項描述
  directions: string; // 建議方位(以逗號分隔)
  colors: string; // 建議顏色
  decor: string; // 裝飾/擺設建議
  avoid: string; // 避免事項
  zodiacs?: string; // 建議生肖擺件(事業/財運專項用)
  actions?: string; // 日常事業行為建議(事業專項用)
}

/** 各五行在日主強弱下的策略 */
export interface StrengthStrategy {
  strongTitle: string; // 身強標題
  strongAdvice: string; // 身強建議
  weakTitle: string; // 身弱標題
  weakAdvice: string; // 身弱建議
}

// ----------------------------------------------
// 1. 財富 - 各五行弱項與補運
// ----------------------------------------------
export const WEAK_ELEMENT_WEALTH: Record<string, ElementRemedy> = {
  金: {
    title: '金弱財運解析',
    weakness: '金弱不生水，財源有限，難以累積財富。',
    directions: '北、東北',
    colors: '黑、藍色',
    decor: '水晶、黑色水晶球、蓮花燭台',
    avoid: '過多土色(忌土克金)',
  },
  木: {
    title: '木弱財運解析',
    weakness: '木弱不生火，財庫虛設，投資容易虧損。',
    directions: '東、東南',
    colors: '綠色、青色',
    decor: '綠植、竹子、木質家具',
    avoid: '過多金色(忌金克木)',
  },
  水: {
    title: '水弱財運解析',
    weakness: '水弱不生木，財氣外洩，財來財去。',
    directions: '北、正北',
    colors: '黑色、深藍色',
    decor: '水缸、噴泉、魚缸',
    avoid: '過多土色(忌土克水)',
  },
  火: {
    title: '火弱財運解析',
    weakness: '火弱不生土，財庫封閉，財難聚。',
    directions: '南、正南',
    colors: '紅色、紫色',
    decor: '紅燭、紅燈籠、紫水晶',
    avoid: '過多水色(忌水克火)',
  },
  土: {
    title: '土弱財運解析',
    weakness: '土弱不生金，財庫空虛，錢財難守。',
    directions: '東南、西南',
    colors: '黃色、褐色',
    decor: '陶瓷、土產品、黃水晶',
    avoid: '過多木色(忌木克土)',
  },
};

// ----------------------------------------------
// 2. 事業 - 各五行弱項與補運
// ----------------------------------------------
export const WEAK_ELEMENT_CAREER: Record<string, ElementRemedy> = {
  金: {
    title: '金弱事業解析',
    weakness: '金弱缺少貴人相助，事業發展受阻。',
    directions: '西、西北',
    colors: '白色、金色',
    decor: '金屬擺件、銀器',
    avoid: '過多火色(忌火克金)',
    zodiacs: '猴、雞',
    actions: '主動結交貴人，善用人脈資源',
  },
  木: {
    title: '木弱事業解析',
    weakness: '木弱缺乏創造力與擴張力，事業停滯。',
    directions: '東、東南',
    colors: '綠色、青色',
    decor: '木質擺件、綠植',
    avoid: '過多金色(忌金克木)',
    zodiacs: '虎、兔',
    actions: '多學習新知識，擴展人際圈',
  },
  水: {
    title: '水弱事業解析',
    weakness: '水弱缺乏智慧與機敏，決策容易出錯。',
    directions: '北、正北',
    colors: '黑色、深藍色',
    decor: '水晶球、魚缸',
    avoid: '過多土色(忌土克水)',
    zodiacs: '鼠、豬',
    actions: '多閱讀，培養獨立思考能力',
  },
  火: {
    title: '火弱事業解析',
    weakness: '火弱缺乏熱情與行動力，事業缺乏動力。',
    directions: '南、正南',
    colors: '紅色、紫色',
    decor: '紅燈籠、紅燭',
    avoid: '過多水色(忌水克火)',
    zodiacs: '蛇、馬',
    actions: '設定明確目標，採取行動',
  },
  土: {
    title: '土弱事業解析',
    weakness: '土弱缺乏穩健與承接力，事業容易波動。',
    directions: '東南、西南',
    colors: '黃色、褐色',
    decor: '陶瓷擺件、土產品',
    avoid: '過多木色(忌木克土)',
    zodiacs: '牛、龍、羊、狗',
    actions: '穩健經營，避免冒險投資',
  },
};

// ----------------------------------------------
// 3. 家人 - 各五行弱項與補運
// ----------------------------------------------
export const WEAK_ELEMENT_FAMILY: Record<string, ElementRemedy> = {
  金: {
    title: '金弱家人關係解析',
    weakness: '金弱家人關係疏離，缺乏溝通。',
    directions: '西、西北',
    colors: '白色、金色',
    decor: '金屬擺件',
    avoid: '過多火色',
  },
  木: {
    title: '木弱家人關係解析',
    weakness: '木弱家人關係疏離，缺乏包容。',
    directions: '東、東南',
    colors: '綠色、青色',
    decor: '綠植',
    avoid: '過多金色',
  },
  水: {
    title: '水弱家人關係解析',
    weakness: '水弱家人關係疏離，缺乏理解。',
    directions: '北、正北',
    colors: '黑色、深藍色',
    decor: '水晶',
    avoid: '過多土色',
  },
  火: {
    title: '火弱家人關係解析',
    weakness: '火弱家人關係疏離，缺乏關懷。',
    directions: '南、正南',
    colors: '紅色、紫色',
    decor: '紅燈籠',
    avoid: '過多水色',
  },
  土: {
    title: '土弱家人關係解析',
    weakness: '土弱家人關係疏離，缺乏依靠。',
    directions: '東南、西南',
    colors: '黃色、褐色',
    decor: '陶瓷',
    avoid: '過多木色',
  },
};

// ----------------------------------------------
// 4. 人際 - 各五行弱項與補運
// ----------------------------------------------
export const WEAK_ELEMENT_FRIENDS: Record<string, ElementRemedy> = {
  金: {
    title: '金弱人際關係解析',
    weakness: '金弱人際關係淡薄，難以結交好友。',
    directions: '西、西北',
    colors: '白色、金色',
    decor: '金屬擺件',
    avoid: '過多火色',
  },
  木: {
    title: '木弱人際關係解析',
    weakness: '木弱人際關係淡薄，難以深交。',
    directions: '東、東南',
    colors: '綠色、青色',
    decor: '綠植',
    avoid: '過多金色',
  },
  水: {
    title: '水弱人際關係解析',
    weakness: '水弱人際關係淡薄，難以信任。',
    directions: '北、正北',
    colors: '黑色、深藍色',
    decor: '水晶',
    avoid: '過多土色',
  },
  火: {
    title: '火弱人際關係解析',
    weakness: '火弱人際關係淡薄，難以熱絡。',
    directions: '南、正南',
    colors: '紅色、紫色',
    decor: '紅燈籠',
    avoid: '過多水色',
  },
  土: {
    title: '土弱人際關係解析',
    weakness: '土弱人際關係淡薄，難以穩定。',
    directions: '東南、西南',
    colors: '黃色、褐色',
    decor: '陶瓷',
    avoid: '過多木色',
  },
};

// ----------------------------------------------
// 5. 姻緣 - 各五行弱項與補運
// ----------------------------------------------
export const WEAK_ELEMENT_ROMANCE: Record<string, ElementRemedy> = {
  金: {
    title: '金弱姻緣解析',
    weakness: '金弱姻緣淡薄，難以遇到合適對象。',
    directions: '西、西北',
    colors: '白色、金色',
    decor: '金屬擺件',
    avoid: '過多火色',
  },
  木: {
    title: '木弱姻緣解析',
    weakness: '木弱姻緣淡薄，難以建立感情。',
    directions: '東、東南',
    colors: '綠色、青色',
    decor: '綠植',
    avoid: '過多金色',
  },
  水: {
    title: '水弱姻緣解析',
    weakness: '水弱姻緣淡薄，難以吸引對象。',
    directions: '北、正北',
    colors: '黑色、深藍色',
    decor: '水晶',
    avoid: '過多土色',
  },
  火: {
    title: '火弱姻緣解析',
    weakness: '火弱姻緣淡薄，難以展現魅力。',
    directions: '南、正南',
    colors: '紅色、紫色',
    decor: '紅燈籠',
    avoid: '過多水色',
  },
  土: {
    title: '土弱姻緣解析',
    weakness: '土弱姻緣淡薄，難以穩定關係。',
    directions: '東南、西南',
    colors: '黃色、褐色',
    decor: '陶瓷',
    avoid: '過多木色',
  },
};

// ----------------------------------------------
// 補運策略（財富/事業用）：各五行在日主強弱下的策略
// ----------------------------------------------
export const ELEMENT_STRATEGY: Record<string, StrengthStrategy> = {
  金: {
    strongTitle: '金強財事業策略',
    strongAdvice: '耗洩財官食傷，適合從事金屬、財務、法律相關行業。',
    weakTitle: '金弱財事業策略',
    weakAdvice: '生扶印比劫，適合從事教育、諮詢、藝術相關行業。',
  },
  木: {
    strongTitle: '木強財事業策略',
    strongAdvice: '耗洩財官食傷，適合從事林業、教育、出版相關行業。',
    weakTitle: '木弱財事業策略',
    weakAdvice: '生扶印比劫，適合從事農業、園藝、植物相關行業。',
  },
  水: {
    strongTitle: '水強財事業策略',
    strongAdvice: '耗洩財官食傷，適合從事航運、貿易、諮詢相關行業。',
    weakTitle: '水弱財事業策略',
    weakAdvice: '生扶印比劫，適合從事水產、漁業、航運相關行業。',
  },
  火: {
    strongTitle: '火強財事業策略',
    strongAdvice: '耗洩財官食傷，適合從事能源、餐飲、娛樂相關行業。',
    weakTitle: '火弱財事業策略',
    weakAdvice: '生扶印比劫，適合從事照明、電氣、藝術相關行業。',
  },
  土: {
    strongTitle: '土強財事業策略',
    strongAdvice: '耗洩財官食傷，適合從事不動產、建築、農業相關行業。',
    weakTitle: '土弱財事業策略',
    weakAdvice: '生扶印比劫，適合從事陶瓷、水泥、農業相關行業。',
  },
};

// ----------------------------------------------
// 補運方位與顏色表（參照 ELEMENT_DIRECTION / ELEMENT_COLOR）
// ----------------------------------------------
export const ELEMENT_DIRECTION: Record<string, string[]> = {
  金: ['西', '西北', '西南'],
  木: ['東', '東南', '東北'],
  水: ['北', '正北', '東北'],
  火: ['南', '正南', '東南'],
  土: ['東南', '西南', '東北'],
};

export const ELEMENT_COLOR: Record<string, string[]> = {
  金: ['白', '金', '銀'],
  木: ['綠', '青', '翠'],
  水: ['黑', '深藍'],
  火: ['紅', '紫', '橘'],
  土: ['黃', '褐', '土黃'],
};

export const ELEMENT_DECOR: Record<string, string> = {
  金: '金屬擺件、銀器',
  木: '木質擺件、綠植',
  水: '水晶球、魚缸',
  火: '紅燈籠、紅燭',
  土: '陶瓷、土產品',
};

/** 取得指定五行的弱項資料 */
export function getRemedyStrategy(
  element: string,
  isWeak: boolean
): {
  method: string;
  directions: string[];
  colors: string[];
  decor: string;
  avoid: string;
} {
  const dirFull: Record<string, string> = {
    金: '西方',
    木: '東方',
    水: '北方',
    火: '南方',
    土: '東南',
  };
  const colorFull: Record<string, string> = {
    金: '白色',
    木: '綠色',
    水: '藍色',
    火: '紅色',
    土: '黃色',
  };
  const child: Record<string, string> = {
    金: '水',
    木: '火',
    水: '木',
    火: '土',
    土: '金',
  }; // 我生什麼（耗洩）
  const parent: Record<string, string> = {
    金: '土',
    木: '水',
    水: '金',
    火: '木',
    土: '火',
  }; // 什麼生我（印）
  const decor = ELEMENT_DECOR[element] ?? '';

  if (isWeak) {
    // 補法：生扶印比劫 —— 印（生我者）+ 比劫（同我者）
    const genMe = parent[element] ?? element;
    const genMeDir =
      genMe === '土' ? '南方（土無方位，借火）' : (dirFull[genMe] ?? '');
    return {
      method: '補法',
      directions: [genMeDir, dirFull[element] ?? ''].filter(Boolean),
      colors: [colorFull[genMe] ?? '', colorFull[element] ?? ''].filter(
        Boolean
      ),
      decor,
      avoid: `過多${colorFull[child[element] ?? element] ?? ''}`,
    };
  }

  // 洩法：耗洩財官食傷 —— 我生子（洩），子生孫，孫生曾孫
  const l1 = child[element] ?? element;
  const l2 = child[l1] ?? element;
  const l3 = child[l2] ?? element;
  const wash = [l1, l2, l3];
  return {
    method: '洩法',
    directions: wash.map((e) => dirFull[e] ?? ''),
    colors: wash.map((e) => colorFull[e] ?? ''),
    decor,
    avoid: '過多印、比劫',
  };
}
/** 取得指定五行的弱項資料 */
export function getWeakElementAdvice(
  element: string,
  category: CategoryType
): ElementRemedy | undefined {
  const map: Record<CategoryType, Record<string, ElementRemedy>> = {
    health: {}, // 健康補運不使用此函式,改用 healthData.ts
    wealth: WEAK_ELEMENT_WEALTH,
    career: WEAK_ELEMENT_CAREER,
    family: WEAK_ELEMENT_FAMILY,
    friends: WEAK_ELEMENT_FRIENDS,
    romance: WEAK_ELEMENT_ROMANCE,
  };
  return map[category]?.[element];
}
