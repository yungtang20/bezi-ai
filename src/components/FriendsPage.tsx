// src/components/FriendsPage.tsx
// [AI MOD] 人際篇深度解析 — 打造與健康篇、財富篇完全一致的精緻目錄導覽與流暢滾動體驗，融合講義最完整之社交/互補生肖/合夥判定與事業貴人位軟裝配置

import CategoryPageTemplate from './CategoryPageTemplate';
import { useMemo } from 'react';
import { BaziChart } from '../paipan';
import { PatternScores } from '../pattern';
import { getUpcomingDatesForCategory } from '../dailyAnalysis';
import CategoryTimelineRemedy from './CategoryTimelineRemedy';
import CategorySynastry from './CategorySynastry';
import DailyForecastCard from './DailyForecastCard';
import ElementRemedyCard from './ElementRemedyCard';
import { 
  Compass, 
  Users, 
  Calendar, 
  Sparkles, 
  Layers, 
  Sparkle,
  Briefcase,
  ShieldCheck,
  Award,
  Crown
} from 'lucide-react';

import { PartnerInfo } from '../types';

interface Props {
  chart: BaziChart;
  scores?: PatternScores;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  weakestElement: string;
  weakestElements: string[];  // 所有最弱五行
  onNavigate?: (step: number) => void;
  partners?: PartnerInfo[];
}

interface CareerNobleDecorGuide {
  element: string;
  location: string;
  directions: string[];
  items: string[];
  ornament: string;
}

const CAREER_NOBLE_DECOR_MAP: Record<string, CareerNobleDecorGuide> = {
  '金': {
    element: '金命人',
    location: '客廳 / 書房 / 個人空間',
    directions: ['南', '東南', '西南', '東', '西'],
    items: [
      '擺放紅、黃、橘、綠色系的地毯。',
      '擺放同色系瓶身的香氛蠟燭、精緻燈具。',
      '擺放鮮艷的紅色或紫色鮮花，增旺貴人緣。'
    ],
    ornament: '生肖擺件：虎、蛇、馬、羊、狗（宜選擇木製材質擺飾，或同色系生肖布偶）'
  },
  '木': {
    element: '木命人',
    location: '客廳 / 書房 / 個人空間',
    directions: ['西', '西北', '西南', '東北'],
    items: [
      '擺放白、灰、金、銀色系的精緻瓶身香氛。',
      '擺放金屬亮面質感之金色/銀色燈具。',
      '擺放金屬製的精密鬧鐘、精美外銷錢幣、清雅風鈴、或古典音樂盒。'
    ],
    ornament: '生肖擺件：牛、蛇、猴、雞（宜選擇金屬材質，強化金能伐木、催旺官貴氣場）'
  },
  '水': {
    element: '水命人',
    location: '客廳 / 書房 / 個人空間',
    directions: ['南', '東南', '西南'],
    items: [
      '擺放紅、黃、橘、土黃色系的溫和色調地毯。',
      '擺放紅/紫色鮮花，或點亮溫馨的同色系香氛蠟燭。',
      '擺放紅色精美燈具、正能量鹽燈、天然溫潤玉石、或黃土色精賞石。'
    ],
    ornament: '生肖擺件：牛、龍、蛇、馬、羊、狗（宜選擇陶瓷、玉石製材質，藉火土中和水勢）'
  },
  '火': {
    element: '火命人',
    location: '客廳 / 書房 / 個人空間',
    directions: ['南', '東南', '西南', '東', '西', '北'],
    items: [
      '擺放藍、藍綠、黑、白、灰、金、銀色系的地毯或落地裝飾。',
      '點著淡雅白瓶氛圍燈，或純白色系瓶身的頂級香氛蠟燭。',
      '擺放金屬亮面裝飾製品或精美擺件。'
    ],
    ornament: '生肖擺件：鼠、牛、龍、猴、雞、豬（宜選擇金屬、玻璃、水晶製材質）'
  },
  '土': {
    element: '土命人',
    location: '客廳 / 書房 / 個人空間',
    directions: ['東北', '東', '東南', '北'],
    items: [
      '擺放綠色、藍綠色系的鮮花或高雅植栽盆景。',
      '選擇具有森林雨後系香氣之香氛蠟燭。',
      '擺放翠綠水晶、翡翠、綠色微暖色調燈具、精緻木雕藝術擺設。'
    ],
    ornament: '生肖擺件：虎、兔、龍、羊、豬（宜選擇木製、木刻材質百搭飾品）'
  }
};

const GOD_TRAITS_MAP: Record<string, {
  characterName: string;
  traits: string[];
  bossStrategy: string;
  peerStrategy: string;
  subordinateStrategy: string;
  groupType: string;
  groupAdvise: string;
}> = {
  '正財': {
    characterName: '正財較多：務實誠信的理財先鋒',
    traits: [
      '做事極其謹慎小心，性格保守，按部就班。',
      '極度務實，重視信用、講求實證，不喜混亂與投機冒險。'
    ],
    bossStrategy: '以主管意見為主、恪守規章、理性謹慎，多用實證與詳細數據提出分析。',
    peerStrategy: '提供具體且安全的實務建言，避免人情綁架，在乎承諾，討厭虛無縹緲的空話。',
    subordinateStrategy: '指令需極其明確具體，分清公私權責範圍，規矩透明。',
    groupType: '保守型 (正財、正官)',
    groupAdvise: '給予精準數據、遵守制度、展現高信評與守信特質。'
  },
  '偏財': {
    characterName: '偏財較多：敏銳效率的開創梟雄',
    traits: [
       '敢於承擔風險，做事效率極高，討厭無意義的進度拖延。',
       '具大氣的事業野心與社交熱情，更重視市場結果而非理論。'
    ],
    bossStrategy: '以最終業績結果為導向，主動展現不畏艱難的開荒先鋒精神，不給藉口。',
    peerStrategy: '愛恨隨性、不喜繁文縹緲。合作時需直切要點，主動包容與補足其粗放的細節。',
    subordinateStrategy: '不需板著脸大談輩分尊卑。應多加鼓勵其開拓方向，並設置明晰的階梯獎勵制度。',
    groupType: '開拓型 (偏財、劫財)',
    groupAdvise: '以結果和重義氣建立牢固紐帶，避免在瑣事拖延時間。'
  },
  '正官': {
    characterName: '正官較多：自律守紀的模範典範',
    traits: [
       '自律心強極高，待己待人極為重視社會形象與客觀理性的倫理規律。',
       '行事得體，凡事照既定章法與規矩前行，討厭不端行為。'
    ],
    bossStrategy: '主動做到高質量預期，及時進度匯報，堅決守法與合乎公司法規。',
    peerStrategy: '務必履行守時、講信、守諾之準則，秉公辦理合作。',
    subordinateStrategy: '為其指派職能清晰、職責劃分完好（不指派變數極大之天馬行空職務）的職位。',
    groupType: '保守型 (正財、正官)',
    groupAdvise: '以規矩、客觀數據，循規蹈矩地推進，保證正向正氣溝通。'
  },
  '七殺': {
    characterName: '七殺較多：殺伐果斷的攻堅猛將',
    traits: [
       '抗壓自強能力驚世，面對千頭萬緒的難關依舊沉著冷靜、甚至迎難而上。',
       '具有強烈內在征服欲、效率極高、目標極其明確、講求實效與結果。'
    ],
    bossStrategy: '勇於抗下巨大艱險任務，切勿在失敗前尋找藉口逃避，展現高度意志力與勇氣。',
    peerStrategy: '條列清晰，切忌說一些拖沓客套之詞；建立肝膽相照的戰友情深，避免自我貶低。',
    subordinateStrategy: '大膽委派極具挑戰的要塞。在其成功克服困難後，給予其明確升職加薪或決策自由。',
    groupType: '衝鋒型 (比肩、七殺)',
    groupAdvise: '真誠將其認作一路並肩為戰的骨幹，多指派核心舞台。'
  },
  '食神': {
    characterName: '食神較多：優雅樂觀的才華智士',
    traits: [
       '性格開朗、重視情感流露。愛好廣泛，愛好美食、藝術、生活美學體驗。',
       '自帶藝術天賦，喜歡和諧自在的對流氛圍，抗拒沈重指責。'
    ],
    bossStrategy: '提煉並篩選出精準匯報點，避免思維過度發散，不要在匯報中講天馬行空的閒事。',
    peerStrategy: '包容其較慢、講求靈感的節奏。平日裡多聊美食、共同興趣與美學放鬆。',
    subordinateStrategy: '雖然充滿非凡創意但有些散漫，需從旁溫柔梳理進度並保持任務靈活，合適放到原創與創意崗。',
    groupType: '才華型 (食神、傷官)',
    groupAdvise: '保護其靈性，多給寬鬆與自主環境，忌官大一級壓死人。'
  },
  '傷官': {
    characterName: '傷官較多：靈感無束的鬼才謀主',
    traits: [
       '才高八斗，充滿創意的點子狂魔。不喜拘束與按部就班，天生帶點叛逆。',
       '言辭尖銳，眼光高潔，好勝心特強。'
    ],
    bossStrategy: '提供極具革命性的奇思妙想，注意避開主管的威信防線，別在大眾場合直言頂撞。',
    peerStrategy: '多與其進行思維腦洞大開之交流。合作時協助其把控好項目落實進度。',
    subordinateStrategy: '絕對不要進行死板的高壓指責與束縛。放手讓其去開拓客戶或研發革命新項目。',
    groupType: '才華型 (食神、傷官)',
    groupAdvise: '不要讓制度扼殺其才華，提供寬裕空間及表現大舞台。'
  },
  '正印': {
    characterName: '正印較多：恩慈溫厚的道德大儒',
    traits: [
       '和善真誠、心靈包容力卓越。同理心與佛家禪風極深。',
       '不爭不搶，精神世界深沉。重視長幼有序與家學涵養。'
    ],
    bossStrategy: '行事隨緣安寧。本著自行設定的極高進度、自律完成，不需要領導反覆操心。',
    peerStrategy: '默默負重前行把活幹完。多體諒尊重、在私領域保持友好。',
    subordinateStrategy: '絕不壓榨其私下私人作息，指令務必清晰，給予最誠摯的智慧滋養與信任。',
    groupType: '佛系型 (正印、偏印)',
    groupAdvise: '充分尊重私人隱私，提供完全安寧與獨立工作。'
  },
  '偏印': {
    characterName: '偏印較多：直覺靈敏的神性密探',
    traits: [
       '心思敏捷如鏡，能洞穿人情世態、好研究、孤芳自賞。',
       '喜歡與人保持神秘邊界、著迷偏門或小眾美學或命理。'
    ],
    bossStrategy: '保持得體而安靜的邊界，不需要迎合阿諛，按照自己的步驟優雅把事做漂亮。',
    peerStrategy: '無私、低調完成本職，不介入八卦。在空閒時可交流哲學與小眾理論，切忌敷衍。',
    subordinateStrategy: '不邀功、不惹事，安守本分。給予其絕對足量的技術舞台。',
    groupType: '佛系型 (正印、偏印)',
    groupAdvise: '尊重其獨處隱私，不可隨意窺伺與隨意打探。'
  },
  '比肩': {
    characterName: '比肩較多：赤誠平等的大氣俠隱',
    traits: [
       '自尊心極重、追求絕對平等與相互尊重、極其講求義氣。',
       '公私分明有時略顯界限模糊。待人坦率。'
    ],
    bossStrategy: '主動相助與挺身相護。公私有時交融，讓老闆體會到你真摯相扶的心意。',
    peerStrategy: '合作不計較細帳，處事極為大氣豪邁。相交直來直往、真情流露即可。',
    subordinateStrategy: '待其如手足，真心與他們生活與社交層面建立互信，能發揮其頑強鬥志。',
    groupType: '衝鋒型 (比肩、七殺)',
    groupAdvise: '待之如自己人與同路戰友，大膽給予具有高度挑戰的高度擔當舞台。'
  },
  '劫財': {
    characterName: '劫財較多：長袖豪情的大氣豪俠',
    traits: [
       '多才多德，冒險主義極強，性格多變極具魅力與大氣魅力。',
       '心性豪放、在競爭氣氛中鬥志越發旺盛激動。'
    ],
    bossStrategy: '大膽秀出勃勃野心與勇氣，在動態考驗中能夠主動做出最及時的格局調適。',
    peerStrategy: '平級中熱情助人，不計得失。合作過程中宜備份齊全文書，以防人際節外生枝。',
    subordinateStrategy: '不要以輩分制度死死壓制。大膽給予極致激情、極富企圖心的回報舞台，鍛煉沉穩考量。',
    groupType: '開拓型 (偏財、劫財)',
    groupAdvise: '不談太空話、以大氣的回應情義或激勵，提供最耀眼的展現天地。'
  }
};

export default function FriendsPage({ 
  chart, 
  primaryPattern, 
  favorable, 
  unfavorable, 
  weakestElement, 
  weakestElements, 
  partners
}: Props) {
  // 計算日主五行
  const dayMaster = chart.dayMaster || '庚';
  const dayElement = (dayMaster === '甲' || dayMaster === '乙') ? '木' :
                     (dayMaster === '丙' || dayMaster === '丁') ? '火' :
                     (dayMaster === '戊' || dayMaster === '己') ? '土' :
                     (dayMaster === '庚' || dayMaster === '辛') ? '金' : '水';

  // 1. 計算十神（僅計算天干 3 個及地支本氣 4 個，排除中餘氣，共計最多 7 個十神關係）
  const tenGodCount = useMemo(() => {
    const counts: Record<string, number> = {};
    const add = (god: string) => {
      if (god && god !== '日主') {
        counts[god] = (counts[god] || 0) + 1;
      }
    };
    
    // 天干十神
    if (chart.year.tenGod) add(chart.year.tenGod);
    if (chart.month.tenGod) add(chart.month.tenGod);
    if (chart.hour.tenGod) add(chart.hour.tenGod);

    // 地支本氣十神 (第一主氣 / 本氣)
    if (chart.year.hiddenTenGods && chart.year.hiddenTenGods[0]) add(chart.year.hiddenTenGods[0]);
    if (chart.month.hiddenTenGods && chart.month.hiddenTenGods[0]) add(chart.month.hiddenTenGods[0]);
    if (chart.day.hiddenTenGods && chart.day.hiddenTenGods[0]) add(chart.day.hiddenTenGods[0]);
    if (chart.hour.hiddenTenGods && chart.hour.hiddenTenGods[0]) add(chart.hour.hiddenTenGods[0]);

    return counts;
  }, [chart]);

  // 2. 獲取最盛的十神
  const mainGod = useMemo(() => {
    let maxGod = '';
    let maxGodCount = 0;
    for (const [god, count] of Object.entries(tenGodCount)) {
      if (count > maxGodCount) {
        maxGodCount = count;
        maxGod = god;
      }
    }
    return maxGod || '比肩';
  }, [tenGodCount]);
  const matchedGodTrait = GOD_TRAITS_MAP[mainGod] || GOD_TRAITS_MAP['比肩'];

  // 3. 朋友合夥與合夥助力計算
  const isStrongBazi = primaryPattern === '身強' || primaryPattern === '從強';
  const partnersRecommendation = isStrongBazi 
    ? {
        role: '適合合夥/獨資判定：【身強/從強】應慎選合夥、主導事業',
        advice: '身強或從強格局者，性格往往極有主見與大局掌控力。若大運或流年逢「比劫」為忌神時，合夥極易因利益摩擦或決策不同而分道揚鑣。因此，在事業上最佳方式為【慎選夥伴，由您主導主控事業】或以獨資為主，合夥則應確保您握有核心話語權。',
        matchingElements: '身強者，找補益與互補您的：【剋我之五行（官殺）】或【我剋之五行（財星）】。'
      }
    : {
        role: '適合合夥/獨資判定：【身弱】最利依靠團隊、合夥借力',
        advice: '身弱格局者，比肩、劫財為您的「喜用神」，代表朋友、平輩夥伴是您命中源源不斷的印信貴人與護盾。古人云「比劫幫身，一木難支、眾木成林」。您非常適合與志同道合之人團隊攜手合夥、共同創業，多方借力能大大提升抗壓性並將財富與事業蛋糕迅速做大。',
        matchingElements: '身弱者，找補益與互補您的：【生我之五行（印星）】或【同我之五行（比劫）】。'
      };

  // 五行和互補生肖對照表 (PDF 2, Page 1: 朋友助力)
  // 金身強/木身弱/金身弱 -> 金 => 猴、雞、牛、龍
  // 土身強/火身弱/木身弱 -> 木 => 虎、兔、龍、羊
  // 火身強/木身弱/水身弱 -> 水 => 豬、鼠、牛、龍
  // 金身強/土身弱/火身弱 -> 火 => 蛇、馬、羊、狗
  // 水身強/金身弱/土身弱 -> 土 => 龍、狗、羊、牛
  const getComplementaryAnimals = () => {
    if (dayElement === '火' && isStrongBazi) return { needed: '金', animals: '猴、雞、牛、龍' };
    if (dayElement === '木' && !isStrongBazi) return { needed: '水或木', animals: '豬、鼠、牛、龍 / 虎、兔、龍、羊' };
    if (dayElement === '金' && !isStrongBazi) return { needed: '土或金', animals: '龍、狗、羊、牛 / 猴、雞、牛、龍' };
    if (dayElement === '土' && isStrongBazi) return { needed: '木', animals: '虎、兔、龍、羊' };
    if (dayElement === '火' && !isStrongBazi) return { needed: '木或火', animals: '虎、兔、龍、羊 / 蛇、馬、羊、狗' };
    if (dayElement === '水' && isStrongBazi) return { needed: '火', animals: '蛇、馬、羊、狗' };
    if (dayElement === '金' && isStrongBazi) return { needed: '不拘/木或水', animals: '虎、兔、龍、羊 / 豬、鼠、牛、龍' };
    if (dayElement === '水' && !isStrongBazi) return { needed: '金或水', animals: '猴、雞、牛、龍 / 豬、鼠、牛、龍' };
    if (dayElement === '土' && !isStrongBazi) return { needed: '火或土', animals: '蛇、馬、羊、狗 / 龍、狗、羊、牛' };
    
    return { needed: '生扶與互補者', animals: '龍、狗、牛、羊' };
  };
  const compAnimals = getComplementaryAnimals();

  // 4. 2026年事業貴人位
  const nobleDecorGuide = CAREER_NOBLE_DECOR_MAP[dayElement];

  // 5. 流日人際預警 (使用 villainDays)
  const upcomingVillainDays = getUpcomingDatesForCategory(chart, 'health_warning', favorable, unfavorable, weakestElement, 4, partners);

    const menuItems = [
    { id: 'judgment', label: '1. 我是怎麼判斷的', labelShort: '判斷依據', icon: Compass },
    { id: 'inherent', label: '2. 先天朋友手足', labelShort: '先天特質', icon: Users },
    { id: 'timeline', label: '3. 歲運社交推演', labelShort: '歲運推演', icon: Calendar },
    { id: 'remedy', label: '4. 個人人際補運', labelShort: '補運指南', icon: Sparkles },
    { id: 'stars', label: '5. 2026貴人催旺', labelShort: '貴人催旺', icon: Layers },
    { id: 'forecast', label: '6. 流日人際預警', labelShort: '人際預警', icon: Sparkle },
  ];

    return (
    <CategoryPageTemplate
      title="人際深度解析"
      subtitle="Social Dynamics & Networking Strategy"
      icon={Users}
      accentColor="cyan"
      menuItems={menuItems}
    >
      <div className="space-y-8">

        {/* Section 1: 我是怎麼判斷的 */}
        <div id="judgment" className="scroll-mt-20 glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-zen-muted opacity-10">
            <Compass size={80} />
          </div>
          
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">01.</span> 我是怎麼判斷的
          </h2>
          <p className="text-sm text-zen-muted mb-4 leading-relaxed">
            研判先天交友廣度、職場溝通和諧度與貴人福報，本派學術體系是以<strong>「命盤十神分布（四柱天干）」</strong>作為核心研究基底。天干主管社會形象與顯性作風，地支刑沖與喜忌則決定人際最終能否化為事業與人脈的實質助力。
          </p>

          <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-zen-text mb-3 flex items-center gap-1">
              <span>🧬</span> 命主四柱八字內藏十神力量排序（僅計天干與地支本氣）
            </h3>
            <div className="flex flex-wrap gap-3 mb-2.5">
              {Object.entries(tenGodCount)
                .sort((a, b) => b[1] - a[1])
                .map(([god, count], idx) => (
                  <div key={god} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-white/5">
                    <span className="text-xs text-zen-muted font-bold">#{idx + 1}</span>
                    <span className="text-sm font-bold text-indigo-400">{god}</span>
                    <span className="text-sm font-bold text-zen-text font-mono">{count} 個</span>
                  </div>
                ))}
            </div>
            <p className="text-[10px] text-zen-muted leading-relaxed font-sans mt-2">
              💡 <strong className="text-indigo-400 font-bold">學術級計法說明：</strong>依講義排盤準則，本盤點排除支藏干內的中氣與餘氣，僅計日主外之天干（3個）與地支本氣/主氣（4個）共計 7 個十神關係，能最真實反映其主導格局，因此總和不超過 7 個（時柱未知時為 5 個）。
            </p>
          </div>
        </div>

        {/* Section 2: 先天朋友與手足特質 */}
        <div id="inherent" className="scroll-mt-20 glass-card relative overflow-hidden">
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">02.</span> 先天命盤特質：朋友與手足磁場
          </h2>

          <div className="space-y-6">
            
            {/* 1. 基礎同儕比劫星觀測 */}
            <div className="border border-zen-border/60 rounded-xl p-4 space-y-3.5 bg-zen-surface/30">
              <h3 className="font-bold text-indigo-400 text-sm flex items-center gap-1.5">
                <Users size={16} /> 1. 本命比肩、劫財磁場呈現
              </h3>
              <p className="text-sm text-zen-text leading-relaxed">
                {tenGodCount['比肩'] || tenGodCount['劫財'] ? (
                  <>
                    您的命盤中透出<strong>「比肩 / 劫財」</strong>({(tenGodCount['比肩'] || 0) + (tenGodCount['劫財'] || 0)} 顆)。代表您天生講義氣、重信賴，朋友之交有如手足般赤誠。
                  </>
                ) : (
                  <>
                    您的命局中暫無透出平輩之「比肩星」與「劫財星」。這昭示著您傾向於高質量的少數至交，不喜勉強投身熱鬧喧囂，行事偏求精神深交。
                  </>
                )}
              </p>

              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-900/10 space-y-2">
                <span className="text-xs text-indigo-300 font-bold block">🎯 多人團隊與合夥契機判定：</span>
                <p className="text-xs text-slate-200 font-semibold">{partnersRecommendation.role}</p>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">{partnersRecommendation.advice}</p>
                <div className="pt-2 border-t border-white/5 mt-2 flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] text-amber-300 font-bold">💡 事業合夥喜用五行：</span>
                  <span className="text-[11px] text-slate-200">{partnersRecommendation.matchingElements}</span>
                </div>
              </div>
            </div>

            {/* 2. 互補生肖助力 */}
            <div className="border border-zen-border/60 rounded-xl p-4 space-y-3 bg-zen-surface/30">
              <h3 className="font-bold text-indigo-400 text-sm flex items-center gap-1.5">
                <ShieldCheck size={16} /> 2. 朋友助力：命盤整體用神互補生肖
              </h3>
              <p className="text-sm text-zen-muted leading-relaxed">
                欲尋求一生的事業合夥人、人生知心友人或極致親密伴侶，應跳出天干之表象，考察「命盤喜用神整體互補性」：
              </p>
              <div className="p-4 rounded-xl bg-cyan-950/15 border border-cyan-800/10 space-y-2">
                <p className="text-[13px] text-zinc-100 flex items-center gap-1.5 font-bold">
                  <span className="text-cyan-400">❖</span> 您當前喜用的核心互補五行：
                  <span className="text-cyan-300 font-mono font-black">{compAnimals.needed}</span>
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  本派建議的最佳互補社交喜用貴人生肖：
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {compAnimals.animals.split('、').map(ani => (
                    <span key={ani} className="px-2.5 py-1 text-xs font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                      屬 {ani}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 pt-1 leading-relaxed">
                  ※ 生生相息、五行中和，多與匹配生肖之平輩共事，能形成良性共振。
                </p>
              </div>
            </div>

            {/* 3. 職場對人溝通模式 & 職場性格 */}
            <div className="border border-zen-border/60 rounded-xl p-4 space-y-4 bg-zen-surface/30">
              <h3 className="font-bold text-indigo-400 text-sm flex items-center gap-1.5">
                <Briefcase size={16} /> 3. 職場與社交溝通模式
              </h3>
              <p className="text-sm text-zen-muted leading-relaxed">
                根據您命盤中天生力量最盛的十神<strong>【{mainGod}】</strong>，為您全面推演個人與上級、平級以及下屬的職場互動策略：
              </p>

              {matchedGodTrait && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-xs text-indigo-300 font-bold block">🎭 您的本命人際社交特質：</span>
                    <p className="text-sm text-zinc-100 font-bold">{matchedGodTrait.characterName}</p>
                    <ul className="text-xs text-slate-300 list-disc list-inside space-y-1 mt-2">
                      {matchedGodTrait.traits.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/5 space-y-1 text-xs">
                      <span className="text-indigo-400 font-extrabold block mb-1">👔 面對上級 (Boss) 策略</span>
                      <p className="text-slate-300 leading-relaxed">{matchedGodTrait.bossStrategy}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/5 space-y-1 text-xs">
                      <span className="text-emerald-400 font-extrabold block mb-1">🤝 面對同僚 (Peers) 溝通</span>
                      <p className="text-slate-300 leading-relaxed">{matchedGodTrait.peerStrategy}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/5 space-y-1 text-xs">
                      <span className="text-amber-500 font-extrabold block mb-1">👥 面對屬下 (Subordinates) 引導</span>
                      <p className="text-slate-300 leading-relaxed">{matchedGodTrait.subordinateStrategy}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-3">
                    <Award className="text-indigo-400 shrink-0" size={24} />
                    <div className="space-y-0.5">
                      <span className="text-xs text-zinc-400 block font-semibold">職場本命相處策略組：</span>
                      <p className="text-xs text-indigo-300 font-bold">
                        {matchedGodTrait.groupType} — {matchedGodTrait.groupAdvise}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Section 3: 歲運推演與化解(人際) */}
        <div id="timeline" className="scroll-mt-20">
          <CategoryTimelineRemedy 
            chart={chart} 
            primaryPattern={primaryPattern} 
            favorable={favorable} 
            unfavorable={unfavorable} 
            category="friends" 
            categoryTitle="社交與朋友" 
          />
        </div>

        {/* Section 4: 人際補運指南 */}
        <div id="remedy" className="scroll-mt-20">
          <ElementRemedyCard
            chart={chart}
            primaryPattern={primaryPattern}
            weakestElements={weakestElements}
            category="friends"
            accentColor="text-indigo-400"
            accentBg="bg-indigo-500/10"
            accentBorder="border-indigo-500/20"
            categoryLabel="人際"
          />
        </div>

        {/* Section 5: 2026年 事業/貴人位催旺方位 */}
        <div id="stars" className="scroll-mt-20 glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-zen-muted opacity-10">
            <Layers size={80} />
          </div>
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">05.</span> 2026年 事業與貴人位軟裝催旺配置
          </h2>
          <p className="text-sm text-zen-muted mb-4 leading-relaxed">
            依據老師講義<strong>《軟裝添運對照表》</strong>的開運法則，事業與逢迎貴人位是依靠自身日干五行的磁場相乘。以下爲屬於您的：<span className="text-indigo-400 font-bold">{nobleDecorGuide?.element}</span> 專屬年度貴人催旺佈置。極其推薦在客廳、書房或個人辦公桌進行相應配置：
          </p>

          {nobleDecorGuide ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5">
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider block mb-1">📍 佈置核心空間</span>
                  <p className="text-base text-zinc-100 font-semibold">{nobleDecorGuide.location}</p>
                </div>
                <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5">
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider block mb-1">🧭 2026年 催旺方位（宮位）</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {nobleDecorGuide.directions.map(dir => (
                      <span key={dir} className="px-2.5 py-1 text-xs font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full">
                        {dir}方
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4.5 bg-zinc-950/50 rounded-xl border border-white/5 space-y-3">
                <span className="text-xs text-indigo-400 font-bold block border-b border-white/5 pb-2">📦 2026年 貴人位軟裝擺設物</span>
                <ul className="text-xs text-zinc-300 space-y-2">
                  {nobleDecorGuide.items.map((item, index) => (
                    <li key={index} className="flex gap-2.5 leading-relaxed items-start">
                      <span className="text-indigo-400 text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded-full shrink-0 font-bold">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-3">
                <Crown className="text-emerald-400 shrink-0" size={24} />
                <div className="space-y-0.5">
                  <span className="text-xs text-emerald-400 font-bold block">🦁 催旺開運生肖金局擺件：</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{nobleDecorGuide.ornament}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2">
                <span className="text-xs text-zinc-400 font-bold block">🌊 財位高階細劃水流動細節：</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  若在此開運宮位擺設有微型水缸、流水石等景物，
                  （1） 請不要加蓋，水量裝至約八至九分滿，切記不能加裝高強度死刺的冷光照明。<br/>
                  （2） 保持水流常清水潔，如加馬達流動每週更換一次；若是小杯，保證每天早上更換一次潔淨白清水。
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-amber-500 font-bold">暫無適配之貴人宮軟裝佈置。</p>
          )}
        </div>

        {/* Section 6: 流日專屬人際預警 */}
        <div id="forecast" className="scroll-mt-20">
          {upcomingVillainDays.length > 0 ? (
            <DailyForecastCard
              chart={chart}
              category="health_warning"
              categoryName="人際社交"
              accentColor="text-indigo-400"
              title="流日專屬人際防小人與預警日曆"
              emptyMessage="近期不受任何人際摩擦或小人口舌干擾。"
              actionGuide="此期間切勿強出頭、秉持低調理智。不對外參與辦公室或群組是非，涉及工作交接凡事留下詳細書面郵件紀錄為憑。"
              dateBorderColors={{
                border: 'border-red-500/20',
                bg: 'bg-red-500/10',
                text: 'text-red-400',
              }}
              emoji="⚠️"
              extraWarning={partners && partners.length > 0 ? `已為您與關聯親人（${partners.map(p => p.name).join('、')}）進行生肖刑沖干涉過濾，標記之流日需自覺守口保平安。` : undefined}
            />
          ) : (
            <div className="glass-card text-center p-8">
              <Calendar className="mx-auto text-zinc-500 mb-3" size={32} />
              <h3 className="font-bold text-zinc-300 mb-1">近期無顯著人際沖合課題</h3>
              <p className="text-xs text-zinc-500">人際能量近期十分平穩。繼續大度行事、善結良緣即可。</p>
            </div>
          )}
        </div>

        {/* 合盤觀測 - 保留在最下方 */}
        <div className="border-t border-zen-border/50 pt-8">
          <CategorySynastry chart={chart} partners={partners || []} category="friends" />
        </div>

      </div>
    </CategoryPageTemplate>
  );
}