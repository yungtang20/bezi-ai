export interface FlyingStar {
  name: string;
  type: string;
  location: string;
  remedy: string;
}

// [AI MOD] 2026 飛星通用規則，供靜態資料與動態計算共用
export const FENG_SHUI_2026_GENERAL_RULES: string[] = [
  '桃花、旺運方位若有開窗：時常開窗，保持通風、陽光充足、空氣流動，可以催旺良性吉慶氣場。',
  '桃花、旺運方位若無開窗 (無氣口)：不宜用水強行催旺 (水若成不流動的深色水，易變爛桃花或無效)。改用天然春風香氛機、香石、鮮花，保持該處明亮整潔最佳。'
];

export const FENG_SHUI_2026 = {
  stars: [
    { name: '九紫右弼星', type: '喜慶之星 (桃花、姻緣、喜孕)', location: '東南方', remedy: '以火生旺。宜用紅色系裝飾、粉色水晶。打開氣口引氣。' },
    { name: '一白貪狼星', type: '人際、工作人緣桃花', location: '中宮', remedy: '保持明亮通暢，不堆積雜物。擺白色鮮花、香氛，床具使用白/灰/金/銀色。避開黃/綠/紅色系。' },
    { name: '二黑巨門星', type: '病符星', location: '西北方', remedy: '宜靜不宜動。以金洩土(避免火生土)。金屬物品(如銅鈴、六柱中空銅管、葫蘆)。多用白、灰、金、銀色。避開紅黃綠。' },
    { name: '五黃廉貞星', type: '災煞星', location: '正南方', remedy: '宜靜不宜動。破壞力極大，同樣以金洩土化煞。避免動土、裝修。' }
  ],
  generalRules: FENG_SHUI_2026_GENERAL_RULES
};

export function getFlyingStarsForYear(year: number): { stars: FlyingStar[], generalRules: string[] } {
  let rem = year % 9;
  if (rem === 0) rem = 9;
  let N = 11 - rem;
  if (N > 9) N -= 9;

  const directions = [
    '中宮',    // Index 0
    '西北方',  // Index 1
    '正西方',  // Index 2
    '東北方',  // Index 3
    '正南方',  // Index 4
    '正北方',  // Index 5
    '西南方',  // Index 6
    '正東方',  // Index 7
    '東南方'   // Index 8
  ];

  const starDetails: Record<number, { name: string, type: string, remedyTemplate: (loc: string) => string }> = {
    1: {
      name: '一白貪狼星',
      type: '人際、工作人緣桃花 (吉慶之星)',
      remedyTemplate: (loc) => `保持屋內「${loc}」明亮整潔、通暢流通。可在「${loc}」擺放白色、銀色或金色精美床飾裝擺，亦可放置白色鮮花（經常換水）、天然香氛（如茉莉球或擴香石）以助生旺人緣魅力與貴人扶持。`
    },
    2: {
      name: '二黑巨門星',
      type: '病符之星 (主疾病與負面晦氣)',
      remedyTemplate: (loc) => `「${loc}」宜靜不宜動，切忌動土裝修、開鑿壁孔或擺放過多魚缸及綠意盆栽。宜在此處利用「金洩土氣」法則，擺放金屬工藝製品、大純銅葫蘆、六帝錢、或金屬框架之靜態時鐘以化解不適晦氣。`
    },
    3: {
      name: '三碧祿存星',
      type: '是非爭鬥之星 (主口舌、官非與競爭)',
      remedyTemplate: (loc) => `「${loc}」不宜擺放過多盆栽植物、流水盆或藍白色物件。宜在此處裝設一盞常亮暖光小鹽燈，或鋪設紅色地毯、紅色春聯，以「火洩木氣」轉化凶星戾氣，平息是非。`
    },
    4: {
      name: '四綠文曲星',
      type: '文昌學業官祿之星 (主科名、考試與仕官)',
      remedyTemplate: (loc) => `最宜將辦公桌或書房設置於「${loc}」：可於該區域整齊擺放「四支水培富貴竹（富貴竹直挺生長最佳）、文昌高塔、精裝綠水晶或文墨案台」，提升官祿前程，合同簽約大利。`
    },
    5: {
      name: '五黃廉貞星',
      type: '災煞之星 (流年首凶，主意外考驗與困頓)',
      remedyTemplate: (loc) => `「${loc}」為流年核心大煞，務必保持高度靜止！「至忌動土敲牆、鑿壁裝修、開工釘釘」不宜長時間居住在此處。化解方法：在此方位擺設厚重金屬飾板、開口純銅葫蘆、金屬風鈴、六帝錢，充分發揮「土生金、金洩土」生息原理化煞。`
    },
    6: {
      name: '六白武曲星',
      type: '偏財武貴之星 (主遠行、高升、技能機遇與偏財)',
      remedyTemplate: (loc) => `「${loc}」宜金土相生：可在此處鋪設一條黃色、橙色或金地毯，擺放陶瓷聚寶盆、黃水晶洞、黃玉獅子狗、或銅雕麒麟等吉照擺飾，助其聚引偏財旺氣，亦極利開展外出考察。`
    },
    7: {
      name: '七赤破軍星',
      type: '損折小人是非星 (主口舌爭端、利刃折損與流失)',
      remedyTemplate: (loc) => `「${loc}」宜靜水洩金氣：不宜擺放各質刀劍兵刃、過多亮面鐵器。可在該方位擺設一盆純淨死水（大碗裝滿靜水且常保澄澈）或添置藍色、深黑色軟裝布藝，起「水洩強金」之力制衡小人阻礙。`
    },
    8: {
      name: '八白左輔星',
      type: '正財穩健之星 (主事業正職、長遠財富增值與產業)',
      remedyTemplate: (loc) => `「${loc}」主正財。若該方位受到氣候或其他五行壓制時，宜搭配擺放陶瓷花瓶、黃水晶、陶罐，或鋪設紅地毯/粉橘色系飾布（木生火、火生土），全盤激活、源源湧入正偏穩定收益。`
    },
    9: {
      name: '九紫右弼星',
      type: '喜慶姻緣添喜星 (主第一生旺貴人、正緣配偶與吉慶)',
      remedyTemplate: (loc) => `「${loc}」是當旺的姻緣喜事方位！極宜多加運用。宜用木生火：常開此處大窗（引動生氣進屋），並在此處精緻擺設粉晶礦石、多枝鮮紅色鮮花（定期照料更換）、紅色抱枕、或暖光鹽晶燈，最大化催引良緣。`
    }
  };

  const stars: FlyingStar[] = [];
  for (let k = 0; k < 9; k++) {
    let starNumber = (N + k - 1) % 9 + 1;
    const details = starDetails[starNumber];
    const loc = directions[k];
    stars.push({
      name: details.name,
      type: details.type,
      location: loc,
      remedy: details.remedyTemplate(loc)
    });
  }

  return {
    stars,
    generalRules: FENG_SHUI_2026_GENERAL_RULES
  };
}
