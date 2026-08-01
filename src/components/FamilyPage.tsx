// src/components/FamilyPage.tsx
// [AI MOD] 家人篇深度解析 — 打造與健康篇完全一致的精緻目錄導覽與流暢滾動體驗，融合講義最完整之家庭/手足/子息宮軟裝配置

import CategoryPageTemplate from './CategoryPageTemplate';
import { useState, useEffect } from 'react';
import { BaziChart } from '../paipan';
import { PatternScores } from '../pattern';
import { getFamilyRole, SIBLING_RELATIONS, FAMILY_CHANGES } from '../data';
import { getUpcomingDatesForCategory } from '../dailyAnalysis';
import { checkLiuChong, checkLiuHai, checkLiuPo, checkXiangXing } from '../matchmaking';
import CategoryTimelineRemedy from './CategoryTimelineRemedy';
import CategorySynastry from './CategorySynastry';
import DailyForecastCard from './DailyForecastCard';
import ElementRemedyCard from './ElementRemedyCard';
import { 
  Compass, 
  Users, 
  Home, 
  Calendar, 
  Sparkles, 
  Layers, 
  Sparkle, 
  Activity, 
  Heart,
  Baby,
  TrendingUp,
  Info,
  ShieldCheck,
  AlertTriangle,
  Gift
} from 'lucide-react';

interface Props {
  chart: BaziChart;
  scores: PatternScores;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  weakestElement: string;
  weakestElements: string[];  // 所有最弱五行
  onNavigate?: (step: number) => void;
  partners?: any[];
}

interface DecorGuide {
  location: string;
  directions: string[];
  items: string[];
  ornament: string;
}

const CHILD_PALACE_DECOR: Record<string, Record<'male' | 'female', DecorGuide>> = {
  '金': {
    male: {
      location: '臥室 / 個人空間',
      directions: ['南', '東南', '西南'],
      items: [
        '擺放綠色或藍綠色系掛畫或地毯',
        '擺放紅色香氛、紅色燈具',
        '擺放水缸或裝水玻璃杯',
        '擺放綠色植栽、竹子或萬年青',
        '特別推薦使用與子息宮同色系的床單與枕頭套（或以太太子息宮色彩為主）'
      ],
      ornament: '生肖擺件：虎、兔、龍、羊、豬（宜選擇木質、木製材質，色彩以紅、橘、黃色為主）'
    },
    female: {
      location: '臥室 / 個人空間',
      directions: ['東北', '西北', '北'],
      items: [
        '擺放藍色、藍綠色、黑色系的床單、枕頭套',
        '擺放流動的水缸或裝水玻璃杯'
      ],
      ornament: '生肖擺件：鼠、龍、猴、豬（宜選擇玻璃、水晶材質擺件）'
    }
  },
  '木': {
    male: {
      location: '臥室 / 個人空間',
      directions: ['西', '西北', '西南', '東北'],
      items: [
        '擺放白色、灰色、金色、銀色系的地毯、掛畫或燈具',
        '擺放白色瓶身的香氛、金屬製鬧鐘、風鈴、或音樂盒',
        '特別推薦使用與子息宮同色系的床單與枕頭套（或以太太子息宮色彩為主）'
      ],
      ornament: '生肖擺件：牛、蛇、猴、雞（宜選擇金屬材質擺件）'
    },
    female: {
      location: '臥室 / 個人空間',
      directions: ['南', '東南', '西南'],
      items: [
        '擺放紅色、橘色、黃色系的床單、枕頭套、地毯',
        '擺放紅/紫子的鮮花、紅色燈具、紅色香氛或香氛蠟燭',
        '擺放紅色瓶身的香氛/香水'
      ],
      ornament: '生肖擺件：蛇、馬、羊、狗（宜選擇陶瓷、玉石製材質，或同色系生肖布偶）'
    }
  },
  '水': {
    male: {
      location: '臥室 / 個人空間',
      directions: ['南', '東南', '西南'],
      items: [
        '擺放紅色、黃色、橘色、土黃色系的掛畫或地毯',
        '擺放紅色燈具、鹽燈、紅色/紫色/土黃色瓶身香氛',
        '擺放陶瓷、玉石、或陶土擺件',
        '特別推薦使用與子息宮同色系的床單與枕頭套（或以太太子息宮色彩為主）'
      ],
      ornament: '生肖擺件：牛、龍、蛇、馬、羊、狗（宜選擇陶瓷、玉石製材質）'
    },
    female: {
      location: '臥室 / 個人空間',
      directions: ['東北', '東', '東南', '北'],
      items: [
        '擺放綠色、藍綠色系的床單、枕頭套、地毯',
        '擺放綠色裝飾植栽、萬年青、竹子',
        '擺放綠色水晶、翡翠、綠色燈具/鹽燈'
      ],
      ornament: '生肖擺件：虎、兔、龍、羊、豬（宜選擇木製材質擺件）'
    }
  },
  '火': {
    male: {
      location: '臥室 / 個人空間',
      directions: ['南', '東南', '西南', '東', '西', '北'],
      items: [
        '擺放藍色、藍綠色、黑色、白色、灰色、金色、銀色系的地毯、掛畫',
        '擺放同色系瓶身的精緻香氛',
        '擺放藍/白/灰/金/銀色燈具、金屬裝飾製品',
        '擺放流動水缸或裝水玻璃杯',
        '特別推薦使用與子息宮同色系的床單與枕頭套（或以太太子息宮色彩為主）'
      ],
      ornament: '生肖擺件：鼠、牛、龍、猴、雞、豬（宜選擇金屬、玻璃、水晶製材質）'
    },
    female: {
      location: '臥室 / 個人空間',
      directions: ['南', '東南', '西南', '東北', '西北'],
      items: [
        '擺放紅色、黃色、橘色、土黃色系的床單、枕頭套、地毯',
        '擺放紅/紫/土黃色系瓶身香氛、紅色燈具/鹽燈',
        '擺放溫潤質感之陶瓷、陶土、玉石類擺飾'
      ],
      ornament: '生肖擺件：牛、龍、蛇、馬、羊、狗（宜選擇陶瓷、玉石製材質）'
    }
  },
  '土': {
    male: {
      location: '臥室 / 個人空間',
      directions: ['東北', '東', '東南', '北'],
      items: [
        '擺放藍色、藍綠色、綠色系的掛畫、地毯、燈具',
        '擺放同色系瓶身的清爽香氛',
        '擺放綠色水晶、翡翠、或優雅木製品',
        '特別推薦使用與子息宮同色系的床單與枕頭套（或以太太子息宮色彩為主）'
      ],
      ornament: '生肖擺件：虎、兔、龍、羊、豬（宜選擇木製材質）'
    },
    female: {
      location: '臥室 / 個人空間',
      directions: ['南', '西南', '西', '西北'],
      items: [
        '擺放白色、灰色、金色、銀色系的地毯、掛畫、床單、與枕頭套',
        '擺放白色淡雅瓶身的香氛',
        '擺放具金屬亮面質感之鬧鐘、風鈴、經典音樂盒、或裝飾錢幣'
      ],
      ornament: '生肖擺件：牛、蛇、猴、雞（宜選擇金製、金屬材質擺件）'
    }
  }
};

export default function FamilyPage({ chart, primaryPattern, favorable, unfavorable, weakestElement, weakestElements, partners, onNavigate }: Props) {
  const [activeSection, setActiveSection] = useState('judgment');
  const isMale = chart.gender === '男';
  const pillars = [chart.year, chart.month, chart.day, chart.hour];
  const dayElement = chart.dayMaster ? (chart.dayMaster === '甲' || chart.dayMaster === '乙' ? '木' :
    chart.dayMaster === '丙' || chart.dayMaster === '丁' ? '火' :
    chart.dayMaster === '戊' || chart.dayMaster === '己' ? '土' :
    chart.dayMaster === '庚' || chart.dayMaster === '辛' ? '金' : '水') : '金';

  const upcomingMoveInDays = getUpcomingDatesForCategory(chart, 'move_in', favorable, unfavorable, weakestElement, 4, partners);

  // 統計十神數量
  const tenGodCount: Record<string, number> = {};
  for (const p of pillars) {
    if (p.tenGod) {
      tenGodCount[p.tenGod] = (tenGodCount[p.tenGod] || 0) + 1;
    }
  }

  // 找最多的十神類型
  let maxGod = '';
  let maxCount = 0;
  for (const [god, count] of Object.entries(tenGodCount)) {
    if (count > maxCount) { maxCount = count; maxGod = god; }
  }
  
  // 取得家人相處策略
  const familyRole = getFamilyRole(maxGod);

  // 子女星 — 來源：家人相處.pdf L515
  // 男命：官殺代表兒子、食傷代表女兒
  // 女命：食傷代表兒子、官殺代表女兒
  const childGods = ['正官', '七殺', '食神', '傷官'];
  let childStar = '';
  let childLocation = '';
  let childZhi = '';
  const pillarNames = ['年柱', '月柱', '日柱', '時柱'];
  for (let i = 0; i < pillars.length; i++) {
    if (childGods.includes(pillars[i].tenGod)) {
      childStar = `${pillars[i].gan}${pillars[i].zhi}`;
      childLocation = pillarNames[i];
      childZhi = pillars[i].zhi;
      break;
    }
  }

  const ZHI_TYPE: Record<string, string> = {
    '子': '四正', '午': '四正', '卯': '四正', '酉': '四正',
    '寅': '四長生', '申': '四長生', '巳': '四長生', '亥': '四長生',
    '辰': '四墓庫', '戌': '四墓庫', '丑': '四墓庫', '未': '四墓庫',
  };
  
  const CHILD_ZHI_TRAITS: Record<string, any> = {
    '四正': {
       trait: '個性鮮明直接、情緒寫在臉上、自尊心較強。',
       strategy: '孩子吃軟不吃硬，同理陪伴與傾聽。'
    },
    '四長生': {
       trait: '活潑好動、好奇心強、電力十足。',
       strategy: '安排動態活動、釋放孩子電力。'
    },
    '四墓庫': {
       trait: '安靜內斂、喜靜態活動、專注興趣，鑽研冷門知識。',
       strategy: '少參加社交場合、尊重鼓勵孩子興趣。'
    }
  };
  const childZhiType = ZHI_TYPE[childZhi] || '';
  const childTrait = CHILD_ZHI_TRAITS[childZhiType];

  // 判斷刑沖破害
  const zhiValues = pillars.map(p => p.zhi);
  const relations: { type: string; msg: string }[] = [];
  
  // 檢查相鄰柱 (年-月, 月-日, 日-時)
  const posNames = ['年', '月', '日', '時'];
  for (let i = 0; i < 3; i++) {
    const z1 = zhiValues[i];
    const z2 = zhiValues[i+1];
    if (!z1 || !z2) continue;
    
    if (checkLiuChong(z1, z2)) relations.push({ type: '沖', msg: `${posNames[i]}${posNames[i+1]}相沖：環境、宮位易有劇烈變動。` });
    if (z1 === z2) continue; // ignore self duplicate
    if (checkLiuHai(z1, z2)) relations.push({ type: '害', msg: `${posNames[i]}${posNames[i+1]}相害：溝通或相處易有隱性隔閡。` });
    if (checkLiuPo(z1, z2)) relations.push({ type: '破', msg: `${posNames[i]}${posNames[i+1]}相破：事多波折，需細心磨合。` });
    if (checkXiangXing(z1, z2)) relations.push({ type: '刑', msg: `${posNames[i]}${posNames[i+1]}相刑：法律或規範面的摩擦，需多一份體諒。` });
  }

  // 特殊三刑 (跨柱檢查)
  const hasYinSiShen = zhiValues.includes('寅') && zhiValues.includes('巳') && zhiValues.includes('申');
  const hasChouXuWei = zhiValues.includes('丑') && zhiValues.includes('戌') && zhiValues.includes('未');
  if (hasYinSiShen) relations.push({ type: '刑', msg: '命局帶寅巳申三刑：主觀性強，注意與家人相處和諧、放慢情緒步伐。' });
  if (hasChouXuWei) relations.push({ type: '刑', msg: '命局帶丑戌未三刑：自我施壓，需適時發洩或安排休閒。' });

  // 計算是否易剖腹產 (女命且時支與日/月支有沖刑)
  const isCesareanRisk = !isMale && (
    checkLiuChong(zhiValues[3], zhiValues[2]) || checkLiuChong(zhiValues[3], zhiValues[1]) ||
    checkXiangXing(zhiValues[3], zhiValues[2]) || checkXiangXing(zhiValues[3], zhiValues[1])
  );

  // 1. 手足關係與特質
  const hasSiblingStar = tenGodCount['比肩'] || tenGodCount['劫財'];
  const isWeakPattern = primaryPattern === '身弱' || primaryPattern === '從弱'; 
  const siblingFortune = isWeakPattern ? SIBLING_RELATIONS.fortune[0] : SIBLING_RELATIONS.fortune[1];

  const catCounts = {
    '財星較多': (tenGodCount['正財'] || 0) + (tenGodCount['偏財'] || 0),
    '官殺較多': (tenGodCount['正官'] || 0) + (tenGodCount['七殺'] || 0),
    '食傷較多': (tenGodCount['食神'] || 0) + (tenGodCount['傷官'] || 0),
    '比劫較多': (tenGodCount['比肩'] || 0) + (tenGodCount['劫財'] || 0),
    '印星較多': (tenGodCount['正印'] || 0) + (tenGodCount['偏印'] || 0),
  };
  let maxCat = '比劫較多';
  let maxCatCount = -1;
  for (const [cat, count] of Object.entries(catCounts)) {
    if (count > maxCatCount) {
      maxCatCount = count;
      maxCat = cat;
    }
  }
  const matchingSiblingTrait = SIBLING_RELATIONS.traits.find(t => t.tenGod === maxCat) || SIBLING_RELATIONS.traits[3];

  // 2. 2026年子息宮催旺
  const childPalaceDecor = CHILD_PALACE_DECOR[dayElement]?.[isMale ? 'male' : 'female'];

    const menuItems = [
    { id: 'judgment', label: '1. 我是怎麼判斷的', labelShort: '判斷依據', icon: Compass },
    { id: 'inherent', label: '2. 先天命盤特質', labelShort: '先天特質', icon: Users },
    { id: 'guide', label: '3. 專屬家宅開運', labelShort: '家宅開運', icon: Home },
    { id: 'timeline', label: '4. 歲運推演化解', labelShort: '歲運推演', icon: Calendar },
    { id: 'remedy', label: '5. 家人補運指南', labelShort: '補運指南', icon: Sparkles },
    { id: 'childpalace', label: '6. 2026子息催旺', labelShort: '子息催旺', icon: Layers },
    { id: 'forecast', label: '7. 專屬入宅吉日', labelShort: '入宅預報', icon: Sparkle },
  ];

    return (
    <CategoryPageTemplate
      title="家人深度解析"
      subtitle="Family Dynamics & Parenting Guide"
      icon={Baby}
      accentColor="rose"
      menuItems={menuItems}
    >
      <div className="space-y-8">

        {/* Section 1: 我是怎麼判斷的 */}
        <div id="judgment" className="scroll-mt-20 glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-zen-muted opacity-10">
            <Compass size={80} />
          </div>
          
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-pink-400 font-mono">01.</span> 我是怎麼判斷的
          </h2>
          <p className="text-sm text-zen-muted mb-4 leading-relaxed">
            研判家運、親子緣分、與手足相處關係，本派學術體系是以<strong>「命盤十神分布（四柱天干）」</strong>之旺衰作為核心依據。天干代表主星，地支藏干與其交織形成主要的磁場傾向。
          </p>

          <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-zen-text mb-3">命盤十神分布（四柱占卜透出）</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(tenGodCount)
                .sort((a, b) => b[1] - a[1])
                .map(([god, count], idx) => (
                  <div key={god} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-white/5">
                    <span className="text-xs text-zen-muted font-bold">#{idx + 1}</span>
                    <span className="text-sm font-bold text-pink-400">{god}</span>
                    <span className="text-sm font-bold text-zen-text font-mono">{count} 個</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Section 2: 先天命盤特質 */}
        <div id="inherent" className="scroll-mt-20 glass-card relative overflow-hidden">
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-pink-400 font-mono">02.</span> 先天命盤特質：家人與家庭位呈現
          </h2>

          <div className="space-y-6">
            {/* 家族宮位刑沖克害 */}
            {relations.length > 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <h3 className="font-bold text-amber-400 text-sm mb-3 flex items-center gap-1.5">
                  <AlertTriangle size={15} /> ⚠️ 家族宮位與環境變動觀測
                </h3>
                <div className="space-y-3">
                  {relations.map((r, i) => (
                    <div key={i} className="bg-zen-surface/60 border border-zen-border rounded-xl p-3 flex gap-2.5 items-center">
                      <span className={`w-1.5 h-1.5 rounded-full ${r.type === '沖' ? 'bg-red-500' : r.type === '刑' ? 'bg-amber-500' : 'bg-pink-400'}`}></span>
                      <p className="text-sm text-zen-text font-bold">{r.msg}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-zen-muted leading-relaxed">
                  ※ <strong>「年柱」</strong>代指祖輩與父母，<strong>「月柱」</strong>是兄弟姐妹與原生家境環境，<strong>「日支」</strong>代表配偶與自家宅，<strong>「時柱」</strong>代指子女。宮位間相鄰如有刑沖破害，代表該宮相應人際於一生中多為人生磨練與和諧課題。
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-sm text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck size={16} /> 恭喜！您命盤中的四柱宮位極具凝聚力，無明顯對沖或刑害磨難，家宅平穩。
                </p>
              </div>
            )}

            {/* 子女緣分觀測 */}
            <div className="border border-zen-border/60 rounded-xl p-4 space-y-4 bg-zen-surface/30">
              <h3 className="font-bold text-pink-400 text-sm flex items-center gap-1.5">
                <Baby size={16} /> 1. 子息緣份與子女宮位觀測
              </h3>
              <p className="text-sm text-zen-muted leading-relaxed">
                定男女命之子女緣分：{isMale ? '【男命】以官殺（正官、七殺）為子息星' : '【女命】以食傷（食神、傷官）為子息星'}。
              </p>
              {childStar ? (
                <div className="space-y-3 mt-2">
                  <p className="text-sm text-green-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></span>
                    本命子息星現於：{childStar} （在您的 {childLocation}）
                  </p>
                  {childTrait && (
                    <div className="bg-zen-surface/60 border border-zen-border rounded-lg p-3">
                      <p className="text-xs text-pink-300 font-bold mb-1">子女地支特質類型及相處：{childZhiType}</p>
                      <p className="text-sm text-zen-text leading-relaxed"><strong>特徵：</strong>{childTrait.trait}</p>
                      <p className="text-sm text-zen-text mt-1 leading-relaxed"><strong>引導策略：</strong>{childTrait.strategy}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-amber-500 mt-1 font-bold">
                  ⚠️ 命盤本局暫無明顯顯現之子息星星位，需等待大運、流年將子息星補上時機。
                </p>
              )}

              {/* 專屬孕育時機與生產吉日 */}
              <div className="mt-3 p-3.5 bg-zinc-950/40 rounded-xl border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-pink-400">👶 專屬易懷胎得子流年：</h4>
                <p className="text-sm text-zen-text leading-relaxed">
                  {childStar ? (
                    <>根據您本命五行的五行生剋平衡，若遇流年天干或地支透出：<strong className="text-pink-300">
                    {isMale ? (
                      dayElement === '木' ? '庚、辛 / 申、酉 (猴、雞年)' :
                      dayElement === '火' ? '壬、癸 / 亥、子 (豬、鼠年)' :
                      dayElement === '土' ? '甲、乙 / 寅、卯 (虎、兔年)' :
                      dayElement === '金' ? '丙、丁 / 巳、午 (蛇、馬年)' :
                      dayElement === '水' ? '戊、己 / 辰、戌、丑、未 (龍、狗、牛、羊年)' : ''
                    ) : (
                      dayElement === '木' ? '丙、丁 / 巳、午 (蛇、馬年)' :
                      dayElement === '火' ? '戊、己 / 辰、戌、丑、未 (龍、狗、牛、羊年)' :
                      dayElement === '土' ? '庚、辛 / 申、酉 (猴、雞年)' :
                      dayElement === '金' ? '壬、癸 / 亥、子 (豬、鼠年)' :
                      dayElement === '水' ? '甲、乙 / 寅、卯 (虎、兔年)' : ''
                    )}
                    </strong> 之時期，親子懷胎之緣、繁衍子息之磁力最旺盛。</>
                  ) : '依您命盤之五行平衡，近期孕育磁場平淡，若有得子希冀，需調和五行，隨時機及伴侶緣分而來。'}
                </p>

                {!isMale && (
                  <div className="pt-2 border-t border-white/5 mt-2 space-y-2 text-xs">
                    {isCesareanRisk ? (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="font-bold text-red-400 mb-1">⚠️ 警惕：命盤帶易剖腹產之理</p>
                        <p className="text-zen-muted leading-relaxed">
                          因您自身命盤中「時支」強烈刑沖到「日支/月支」，在十神理論中，時支為子息宮。生產時逢強震，增加剖腹機率，宜提前對產檢與生產醫療做完善之安排。
                        </p>
                      </div>
                    ) : (
                      <p className="text-zen-muted">
                        <strong className="text-pink-300">📝 生產吉凶：</strong> 雖未有先天剖腹刑剋，如遇逢刑沖時支的流年流日，剖腹機率亦會增加。
                      </p>
                    )}
                    <div className="p-3 bg-zen-surface rounded-lg">
                      <p className="font-bold text-green-400 mb-1">💡 子女出生擇日基本原則 (預產期規劃)</p>
                      <ul className="text-slate-400 space-y-1">
                        <li>• <strong>避開與產婦刑沖：</strong>不能與產婦個人生肖、或日柱地支直接相沖，以保大人平安。</li>
                        <li>• <strong>喜用互補均衡：</strong>挑選使當日命局五行各方能量較為中和之時辰。</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* 子女性別、數量與人緣判定 */}
              <div className="p-3.5 bg-cyan-950/20 border border-cyan-800/10 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                  <span>👶</span> 子女性別、數量與「天地同源」判定
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <p className="text-xs text-zen-muted">{isMale ? '食神 (女兒星)' : '食神 (兒子星)'}</p>
                    <p className="text-sm font-bold text-pink-400 mt-1">現：{tenGodCount['食神'] || 0} 個</p>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <p className="text-xs text-zen-muted">{isMale ? '傷官 (兒子星)' : '傷官 (女兒星)'}</p>
                    <p className="text-sm font-bold text-blue-400 mt-1">現：{tenGodCount['傷官'] || 0} 個</p>
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-1 leading-relaxed mt-2">
                  <p>• <strong>數量與種類：</strong>本門學說「食傷皆有」代表兒女雙全；「只有食神或傷官」往往子息性別單一。</p>
                  <p>• <strong>天地同補之貴（人緣與貴人）：</strong>子息星坐時柱，若天干與地支同五行。女性皆食神、男性皆官殺，為「天地同源」，象徵生子後孩子天生得長輩賞識，人緣優秀，能繼承家學或能遇大貴人提攜。</p>
                </div>
              </div>
            </div>

            {/* 手足關係特質 */}
            <div className="border border-zen-border/60 rounded-xl p-4 space-y-3 bg-zen-surface/30">
              <h3 className="font-bold text-pink-400 text-sm flex items-center gap-1.5">
                <Activity size={16} /> 2. 手足關係與互動緣分
              </h3>
              <div className="text-sm text-zen-text space-y-2.5">
                <p className="leading-relaxed">
                  本命手足、兄弟姐妹關係首看<strong>「比劫星（比肩、劫財）」</strong>。
                </p>
                <div className="p-3 rounded-lg bg-zinc-950/40 border border-white/5 space-y-1">
                  <span className="text-xs text-pink-300 font-bold block mb-1">🌸 本命手足相處福澤：</span>
                  <p className="text-xs text-slate-200">{siblingFortune}</p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950/40 border border-white/5 space-y-1">
                  <span className="text-xs text-pink-300 font-bold block mb-1">🔍 與手足之緣份及交集深淺：</span>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {!hasSiblingStar ? (
                      <li className="text-amber-400 font-bold">若本命八字全無「比劫星」：長大後手足多 各自忙碌、交集較少。</li>
                    ) : (
                      <li>命盤中有比劫星的存在，兄弟姐妹自幼能同氣相求。</li>
                    )}
                    {(chart.year.tenGod === '比肩' || chart.year.tenGod === '劫財') && (
                      <li className="text-amber-300">比劫星處於「年柱」：代表兄弟姐妹未來各自在外地居住發展，家宅相隔較遠。</li>
                    )}
                    <li>若比劫一柱遭大運、流年強烈刑沖，容易引起口角糾紛或聚少離多。大運逢之、宜守口德多照應手足的出入健康。</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950/40 border border-white/5">
                  <span className="text-xs text-cyan-300 font-bold block mb-1">🧬 手足心性特質剖析：</span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    根據您自身的十神傾向，您的兄弟姐妹之主要性格：<strong>{matchingSiblingTrait.trait}</strong>
                  </p>
                  <p className="text-xs text-emerald-400 font-bold mt-1.5">
                    👉 與手足相處策略：{matchingSiblingTrait.strategy}
                  </p>
                </div>
              </div>
            </div>

            {/* 家庭變動預測 */}
            <div className="border border-zen-border/60 rounded-xl p-4 space-y-3 bg-zen-surface/30">
              <h3 className="font-bold text-pink-400 text-sm flex items-center gap-1.5">
                <Home size={16} /> 3. 家庭變動與遷徒移往觀測
              </h3>
              <p className="text-sm text-zen-muted leading-relaxed">
                在八字中，家宅與原生父母宮的「變動遷徒」，主要是因「大運、流年地支相沖」所激發：
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3 rounded-lg bg-zinc-950/40 border border-white/5 space-y-1.5">
                  <span className="text-xs text-amber-300 font-bold block">🏠 家宅物理變動 (沖、刑)：</span>
                  <ul className="text-[11px] text-slate-300 space-y-1">
                    <li>• <strong>大運與年支沖：</strong>易在外國工作、移民，屬「大跨度」遠距離移動。</li>
                    <li>• <strong>大運與日支沖：</strong>易外派其他城市，「家」的地址變更、常出差折騰。</li>
                    <li>• <strong>流年與日柱沖：</strong>利於搬家、大裝修或因公頻繁奔波外宿。</li>
                    <li>• <strong>流年與日支刑：</strong>裝修或產產買賣容易陷入合約起糾紛。</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950/40 border border-white/5 space-y-1.5">
                  <span className="text-xs text-amber-300 font-bold block">👨‍👩‍👧 宿命宮位變盪 (子女、父母)：</span>
                  <ul className="text-[11px] text-slate-300 space-y-1">
                    <li>• <strong>流年與月柱(父母宮)沖：</strong>父母該年容易有外出旅遊、家宅裝修、遷徙現象。</li>
                    <li>• <strong>日支與時支(子女宮)沖：</strong>代表孩子長大離家求學或出國。</li>
                    <li>• <strong>日支與月支相沖：</strong>多主早年即離家在外地生活、工作獨立。</li>
                    <li>• <strong>日支與月支相刑：</strong>與家人、父母相處易因情緒執著而有磨合疙瘩。</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: 專屬十神家宅開運指南 */}
        <div id="guide" className="scroll-mt-20">
          {(() => {
            const sortedGods = Object.entries(tenGodCount).sort((a, b) => b[1] - a[1]);
            const topTwoGods = sortedGods.slice(0, 2);
            const topGod = topTwoGods[0]?.[0] || '';
            const secondGod = topTwoGods[1]?.[0] || '';

            const GOD_FAMILY_ADVICE: Record<string, { title: string; advice: string; homeTip: string }> = {
              '比肩': {
                title: '比肩能量',
                advice: '命盤比肩能量強，家人間講求平等與獨立。適合營造「各自有獨立空間、共享公共區域」的居家格局。',
                homeTip: '建議在客廳設置開放式交流區，臥室則保留個人隱私空間。'
              },
              '劫財': {
                title: '劫財能量',
                advice: '劫財旺者，家庭資源易有競爭感。需建立透明的家庭財務溝通機制，避免因金錢產生嫌隙。',
                homeTip: '家中財物擺放宜整齊有序，避免雜亂引發煩躁情緒。'
              },
              '食神': {
                title: '食神能量',
                advice: '食神代表享受與表達，家庭成員重視生活品質與美食。廚房與餐廳是家的核心，適合投資在烹飪設備與餐桌氛圍。',
                homeTip: '餐桌圓形為佳，促進家人圍坐交流；廚房保持明亮整潔。'
              },
              '傷官': {
                title: '傷官能量',
                advice: '傷官旺者，家人想法多、創意豐富，但也易有口角。需要建立「尊重差異、理性溝通」的家庭文化。',
                homeTip: '家中可設置創意工作區或閱讀角，讓成員有獨立思考空間。'
              },
              '偏財': {
                title: '偏財能量',
                advice: '偏財代表流動之財，家庭財運有意外之財機會。但需注意理財風險，避免投機心態影響家庭和諧。',
                homeTip: '家中財位宜保持乾淨，可擺放流動水景或招財擺件。'
              },
              '正財': {
                title: '正財能量',
                advice: '正財穩健，家庭財務規劃宜保守務實。適合建立長期儲蓄與投資計畫，為家人打造安穩的經濟基礎。',
                homeTip: '家中宜有固定財庫位置，如保險櫃或收納盒，象徵財有歸宿。'
              },
              '七殺': {
                title: '七殺能量',
                advice: '七殺帶權威與壓力，家庭中可能有較强势的成員。需要學習柔性溝通，避免權威式管教造成隔閡。',
                homeTip: '家中色調宜柔和，避免過於冷硬；可多用木質家具增添溫暖。'
              },
              '正官': {
                title: '正官能量',
                advice: '正官代表規矩與責任，家庭重視紀律與傳統。適合建立明確的家規與分工，讓每位成員都有角色與責任。',
                homeTip: '家中宜有明確的功能分區，各司其序，井然有序。'
              },
              '偏印': {
                title: '偏印能量',
                advice: '偏印旺者，家人直覺敏銳、精神世界豐富。適合營造有文化氣息的居家環境，鼓勵學習與心靈成長。',
                homeTip: '家中可設書房或閱讀區，摆放書籍與藝術品，提升精神能量。'
              },
              '正印': {
                title: '正印能量',
                advice: '正印代表智慧與包容，家庭重視教育與傳承。適合打造充滿書香與溫暖的居家氛圍，鼓勵家人共同學習。',
                homeTip: '客廳可懸掛字畫或家庭照片，強化家的凝聚力與記憶。'
              }
            };

            const topAdvice = GOD_FAMILY_ADVICE[topGod];
            const secondAdvice = GOD_FAMILY_ADVICE[secondGod];

            return (
              <div className="glass-card animate-in fade-in relative overflow-hidden">
                <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
                  <span className="text-pink-400 font-mono">03.</span> 專屬十神家宅開運與軟裝指南
                </h2>
                <p className="text-sm text-zen-muted mb-6 leading-relaxed">
                  結合您天生十神格局排名名列前茅的<strong>「{topGod}」</strong>與<strong>「{secondGod}」</strong>星宿，爲您定制最適配、更利於家族良性互動與和諧的居家開運佈置：
                </p>

                {/* 前兩名十神統計 */}
                <div className="flex gap-4 mb-6">
                  {topTwoGods.map(([god, count], idx) => (
                    <div key={god} className="flex-1 p-4 rounded-xl bg-zen-surface/60 border border-zen-border text-center">
                      <p className="text-xs text-zen-muted mb-1">十神最旺第 {idx + 1} 順位</p>
                      <p className="text-lg font-bold text-pink-400">{god}</p>
                      <p className="text-2xl font-bold text-zen-text font-mono mt-1">{count} <span className="text-xs text-zen-muted">主星</span></p>
                    </div>
                  ))}
                </div>

                {/* 主要十神建議 */}
                {topAdvice && (
                  <div className="p-5 rounded-2xl bg-zinc-950/45 border border-white/5 space-y-4 shadow-inner mb-4">
                    <h4 className="text-sm font-bold text-pink-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <span className="animate-pulse">🌟</span> 1. 主導家宅氣場：{topAdvice.title}
                    </h4>
                    <div className="space-y-3 text-xs text-zen-text leading-relaxed">
                      <p>
                        <strong className="text-pink-300">👨‍👩‍👧‍👦 家族相處建議：</strong><br/>
                        {topAdvice.advice}
                      </p>
                      <p className="border-t border-white/5 pt-3">
                        <strong className="text-pink-300">🏠 家宅軟裝佈置：</strong><br/>
                        {topAdvice.homeTip}
                      </p>
                    </div>
                  </div>
                )}

                {/* 次要十神建議 */}
                {secondAdvice && (
                  <div className="p-5 rounded-2xl bg-zinc-900/20 border border-white/5 space-y-4 shadow-inner">
                    <h4 className="text-sm font-bold text-amber-500 flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <span>🌙</span> 2. 輔助調和磁場：{secondAdvice.title}
                    </h4>
                    <div className="space-y-3 text-xs text-zen-text leading-relaxed">
                      <p>
                        <strong className="text-amber-300">👨‍👩‍👧‍👦 家族相處建議：</strong><br/>
                        {secondAdvice.advice}
                      </p>
                      <p className="border-t border-white/5 pt-3">
                        <strong className="text-amber-300">🏠 家宅軟裝佈置：</strong><br/>
                        {secondAdvice.homeTip}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Section 4: 歲運推演與化解(家人) */}
        <div id="timeline" className="scroll-mt-20">
          <CategoryTimelineRemedy 
            chart={chart} 
            primaryPattern={primaryPattern} 
            favorable={favorable} 
            unfavorable={unfavorable} 
            category="family" 
            categoryTitle="家人" 
          />
        </div>

        {/* Section 5: 家人補運指南 */}
        <div id="remedy" className="scroll-mt-20">
          <ElementRemedyCard
            chart={chart}
            primaryPattern={primaryPattern}
            weakestElements={weakestElements}
            category="family"
            accentColor="text-pink-400"
            accentBg="bg-pink-500/10"
            accentBorder="border-pink-500/20"
            categoryLabel="家人"
          />
        </div>

        {/* Section 6: 2026年 子息宮催旺及佈置指南 */}
        <div id="childpalace" className="scroll-mt-20 glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-zen-muted opacity-10">
            <Layers size={80} />
          </div>
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-pink-400 font-mono">06.</span> 2026年 子息宮催旺與方位佈置指南
          </h2>
          <p className="text-sm text-zen-muted mb-4 leading-relaxed">
            依據學術講義<strong>《軟裝添運對照表》</strong>，不同日主命格對應子嗣與繁衍的子息位催旺。以下爲您命格天生五行屬性：<span className="text-pink-400 font-bold">{dayElement}命 ({isMale ? '男命' : '女命'})</span> 之專屬佈置，極其推薦在繁衍或求孕期於宅主臥鋪設：
          </p>

          {childPalaceDecor ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5">
                  <span className="text-xs text-pink-400 font-bold uppercase tracking-wider block mb-1">📍 佈置核心空間</span>
                  <p className="text-base text-zinc-100 font-semibold">{childPalaceDecor.location}</p>
                </div>
                <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5">
                  <span className="text-xs text-pink-400 font-bold uppercase tracking-wider block mb-1">🧭 2026年 催旺方位（宮位）</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {childPalaceDecor.directions.map(dir => (
                      <span key={dir} className="px-2.5 py-1 text-xs font-extrabold bg-pink-500/10 text-pink-400 border border-pink-500/30 rounded-full">
                        {dir}方
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4.5 bg-zinc-950/50 rounded-xl border border-white/5 space-y-3">
                <span className="text-xs text-pink-400 font-bold block border-b border-white/5 pb-2">📦 2026年 子息位軟裝添運擺設</span>
                <ul className="text-xs text-zinc-300 space-y-2">
                  {childPalaceDecor.items.map((item, index) => (
                    <li key={index} className="flex gap-2.5 leading-relaxed items-start">
                      <span className="text-pink-400 text-[10px] bg-pink-500/10 px-1.5 py-0.5 rounded-full shrink-0 font-bold">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-3">
                <Gift className="text-emerald-400 shrink-0" size={24} />
                <div className="space-y-0.5">
                  <span className="text-xs text-emerald-400 font-bold block">🧸 催旺開運生肖擺件：</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{childPalaceDecor.ornament}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2">
                <span className="text-xs text-zinc-400 font-bold block">🌊 財位/水缸佈局高階細節：</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  若本佈局配有小玻璃缸裝水
                  （1） 勿加蓋，水不可帶死寂之氣，保持清新鮮爽，水量以容器 8 ~ 9 分滿爲宜。<br/>
                  （2） 如使用馬達水桶，請維持一週更換一次水質，不帶雜質；如使用小水杯代替，務必每日晨起更換裝水。
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-amber-500 font-bold">暫無適配之子息宮軟裝佈置，請與老師諮詢。</p>
          )}
        </div>

        {/* Section 7: 流日專屬入宅吉日預報 */}
        <div id="forecast" className="scroll-mt-20">
          {upcomingMoveInDays.length > 0 ? (
            <DailyForecastCard
              chart={chart}
              category="move_in"
              categoryName="家庭"
              accentColor="text-pink-400"
              title="流日專屬入宅進移吉日預報"
              emptyMessage="近期無明顯入宅與裝修吉日，請保持穩健觀望。"
              actionGuide="此期間利於搬新居、安床、翻新或購置家宅大型電器實木家具。"
              dateBorderColors={{
                border: 'border-pink-500/20',
                bg: 'bg-pink-500/10',
                text: 'text-pink-400',
              }}
              emoji="📅"
              extraWarning={partners && partners.length > 0 ? `本運程已同步為您和家人（生肖：${partners.map(p => p.name).join('、')}）進行生肖匹配度計算與過濾，確保該遷徒日不對任何家庭成員產生生肖相沖刑。` : undefined}
            />
          ) : (
            <div className="glass-card text-center p-8">
              <Calendar className="mx-auto text-zinc-500 mb-3" size={32} />
              <h3 className="font-bold text-zinc-300 mb-1">近期無顯著家庭遷徙吉日</h3>
              <p className="text-xs text-zinc-500">近期流日能量對遷徙入宅偏弱。如欲搬遷，建議選擇農民曆不沖本人生肖與日支配偶宮之流日。</p>
            </div>
          )}
        </div>

        {/* 5. 合盤觀測 - 保留在最下方作爲家人輔助分析 */}
        <div className="border-t border-zen-border/50 pt-8">
          <CategorySynastry chart={chart} partners={partners || []} category="family" />
        </div>

      </div>
    </CategoryPageTemplate>
  );
}