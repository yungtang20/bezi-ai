// [AI MOD] ElementRemedyCard.tsx
// 各專項專屬補運指南 — 根據講義資料，每個專項有不同的補運方式
// 財富→財星方位 / 事業→官殺方位 / 家人→家宅宮位+相處策略 / 人際→朋友貴人 / 姻緣→桃花宮 / 健康→缺失五行保健+流日提醒
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BaziChart } from '../paipan';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from '../constants';
import {
  WEALTH_REMEDIES_DATA,
  CAREER_REMEDIES_DATA,
  ROMANCE_FENG_SHUI_DATA,
  COMPANION_MATCHING,
  COMPANION_ZODIAC,
  BIRTHPLACE_COMPANION,
} from '../data';
import { HEALTH_DATA, HEALTH_PRESERVATION_GUIDE } from '../data/charts/healthData';
import { getHealthRemedy } from '../data/charts/healthRemedies';
import type { CategoryType } from '../data/elementRemedyHelper';

interface Props {
  chart: BaziChart;
  primaryPattern: string;
  weakestElements: string[];
  category: CategoryType;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  categoryLabel: string;
  customTitle?: string;
}

/**
 * 取得日主強弱分數
 */
function getStrongScore(chart: BaziChart): { score: number; isWeak: boolean } {
  const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || '土';
  const elementCount: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const pillars = [chart.year, chart.month, chart.day, chart.hour];
  for (const p of pillars) {
    const eGan = GAN_TO_ELEMENT[p.gan];
    if (eGan) elementCount[eGan] += 1;
    const eZhi = p.zhi ? ZHI_TO_ELEMENT[p.zhi] : '';
    if (eZhi) elementCount[eZhi] += 1;
  }
  const generates: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const genMe = Object.entries(generates).find(([, v]) => v === dmEl)?.[0] || '';
  const sameCount = elementCount[dmEl] || 0;
  const genCount = elementCount[genMe] || 0;
  return { score: sameCount + genCount, isWeak: sameCount + genCount <= 3 };
}

// ──────────────────────────────────────────────
// 財富：財星方位補運
// ──────────────────────────────────────────────
function renderWealthRemedy(chart: BaziChart, accentColor: string, accentBg: string, accentBorder: string) {
  const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || '土';
  const remedy = WEALTH_REMEDIES_DATA[dmEl];
  if (!remedy) return null;
  const { fengShui, dayGuide } = remedy;

  return (
    <>
      {/* 財星方位補運 */}
      <div className={`p-4 rounded-xl ${accentBg} border ${accentBorder} mb-4`}>
        <h4 className={`text-sm font-bold ${accentColor} mb-2 flex items-center gap-2`}>
          <span>💰</span> 財星方位補運（{dmEl}日主）
        </h4>
        <p className="text-xs text-zen-text leading-relaxed mb-2">
          您的財星為「<strong>{remedy.fengShui.remedyElement}</strong>」，
          建議在<strong>{fengShui.directions}</strong>方位佈置財位。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div>
            <p className="text-zen-muted mb-0.5">🏠 空間</p>
            <p className="text-zen-text">{fengShui.spaces}</p>
          </div>
          <div>
            <p className="text-zen-muted mb-0.5">🎨 顏色</p>
            <p className="text-zen-text">{fengShui.colors}</p>
          </div>
        </div>
        <p className="text-[11px] text-emerald-400/80 mt-2">✅ {fengShui.decorations}</p>
        <p className="text-[11px] text-zen-muted mt-1">🪙 生肖擺件：{fengShui.zodiacs}</p>
      </div>

      {/* 每日穿搭/行動 */}
      <div className={`p-4 rounded-xl ${accentBg} border ${accentBorder} mb-4`}>
        <h4 className={`text-sm font-bold ${accentColor} mb-2 flex items-center gap-2`}>
          <span>👔</span> 每日開運穿搭與行動
        </h4>
        <p className="text-xs text-zen-text leading-relaxed mb-1">
          <strong>幸運色：</strong>{dayGuide.colorSuite}
        </p>
        <p className="text-xs text-zen-text leading-relaxed mb-1">
          <strong>幸運物品：</strong>{dayGuide.amulets}
        </p>
        <p className="text-xs text-zen-text leading-relaxed mb-1">
          <strong>幸運方位：</strong>{dayGuide.direction}
        </p>
        <p className="text-xs text-zen-text leading-relaxed mb-1">
          <strong>貴人生肖：</strong>{dayGuide.nobleZodiacs}
        </p>
        {dayGuide.remedyActions && (
          <p className="text-[11px] text-emerald-400/80 mt-1">✅ {dayGuide.remedyActions}</p>
        )}
      </div>

      {/* 財位維護行動 */}
      <div className={`p-3 rounded-xl ${accentBg} border ${accentBorder}`}>
        <h4 className={`text-xs font-bold ${accentColor} mb-1`}>📋 財位維護行動</h4>
        <ul className="text-[11px] text-zen-text space-y-0.5">
          {fengShui.actions.map((a, i) => <li key={i}>• {a}</li>)}
        </ul>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────
// 事業：官殺方位補運
// ──────────────────────────────────────────────
function renderCareerRemedy(chart: BaziChart, accentColor: string, accentBg: string, accentBorder: string) {
  const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || '土';
  const remedy = CAREER_REMEDIES_DATA[dmEl];
  if (!remedy) return null;

  return (
    <>
      {/* 事業官殺方位 */}
      <div className={`p-4 rounded-xl ${accentBg} border ${accentBorder} mb-4`}>
        <h4 className={`text-sm font-bold ${accentColor} mb-2 flex items-center gap-2`}>
          <span>💼</span> 事業官殺方位補運（{dmEl}日主）
        </h4>
        <p className="text-xs text-zen-text leading-relaxed mb-2">
          您的事業用神為「<strong>{remedy.careerElement}</strong>」，
          建議在<strong>{remedy.directions}</strong>方位辦公或提案。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div>
            <p className="text-zen-muted mb-0.5">🎨 顏色</p>
            <p className="text-zen-text">{remedy.colors}</p>
          </div>
          <div>
            <p className="text-zen-muted mb-0.5">🎯 行動</p>
            <p className="text-zen-text">坐{remedy.careerElement}方位寫提案、開會。整理事業宮位的佈置擺件。</p>
          </div>
        </div>
        <p className="text-[11px] text-emerald-400/80 mt-2">✅ {remedy.decorations}</p>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────
// 家人：家宅宮位 + 相處策略
// ──────────────────────────────────────────────
function renderFamilyRemedy(
  chart: BaziChart,
  primaryPattern: string,
  weakestElements: string[],
  accentColor: string,
  accentBg: string,
  accentBorder: string,
) {
  const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || '土';
  const isWeak = primaryPattern.includes('弱');
  const { score } = getStrongScore(chart);

  // 各五行家人補運資料
  const familyData: Record<string, {
    weakness: string;
    parentStrategy: string;
    homeTip: string;
    communication: string;
    avoid: string;
  }> = {
    '金': {
      weakness: '性格過於剛毅嚴肅，易给人距離感。重視規矩，溝通時過於直接，缺乏柔軟度。',
      parentStrategy: '主動軟化語氣，多用「討論」取代「命令」。每週安排家庭共餐時間，營造輕鬆氛圍。',
      homeTip: '客廳/財位擺放金屬製品（風鈴、錢幣）。材質選用金屬、銅製、玻璃、水晶。',
      communication: '對子女多鼓勵、少批評。與伴侶分工家事，避免過度掌控。',
      avoid: '避免在家庭中過度強調權威與服從。避免冷戰，有衝突時應在 24 小時內溝通解決。',
    },
    '木': {
      weakness: '性格優柔寡斷，難以堅定表達立場。過於重視他人感受，容易忽略自身需求。',
      parentStrategy: '練習表達真實想法，每週與家人進行一次深度對話。在家庭會議中主動發言。',
      homeTip: '客廳/財位擺放大型綠色植栽（萬年青、竹子、發財樹）。木質家具、木製裝飾品。',
      communication: '設定個人底線，學會適時說「不」。多與木旺的親友（屬虎、兔者）聯繫。',
      avoid: '避免過度迎合他人而委屈自己。避免白色、金屬材質的大量擺設。',
    },
    '水': {
      weakness: '性格敏感多疑，容易過度解讀他人言行。情緒起伏大，易因小事與家人產生摩擦。',
      parentStrategy: '練習情緒辨識，當感到不安時先深呼吸再溝通。建立「冷靜角」，衝突時先暫停 10 分鐘。',
      homeTip: '流動水缸（需裝馬達保持水流動）。材質選用玻璃、水晶、陶瓷。水缸內容水草、玉石。',
      communication: '每週安排個人獨處時間，避免過度黏膩。多與金旺的親友（屬猴、雞者）交流。',
      avoid: '避免在情緒激動時做重大決定。避免紅色、暖色調的大型裝潢。',
    },
    '火': {
      weakness: '性格急躁衝動，易與家人發生爭吵。重視效率，對家人缺乏耐心。溝通時過於直接。',
      parentStrategy: '練習「暫停 3 秒」再回應。每週安排家庭活動（如戶外運動、露營），釋放能量。',
      homeTip: '紅色裝飾品、鹽燈、暖色燈具。木製家具（木生火）。陶瓷/玉石。',
      communication: '對子女採「鼓勵式教導」，減少批評嘮叨。與伴侶建立「冷靜溝通協議」。',
      avoid: '避免在家庭中過度強調效率與成果。避免黑色、藍色、白色的牀單或窗簾。',
    },
    '土': {
      weakness: '性格固執保守，難以接受家人新觀念。過於重視傳統，對子女管教過嚴。',
      parentStrategy: '練習「傾聽 3 分鐘」再回應。每週安排家庭聚餐，輪流分享一週心情。',
      homeTip: '玉石、水晶、陶瓷擺件。陶瓷/玉石/金屬（土生金）。',
      communication: '對子女採「引導式溝通」，減少權威式管教。與火旺的親友（屬蛇、馬者）聯繫。',
      avoid: '避免在家庭中過度強調傳統與規矩。避免黑色、藍色、綠色的牀單或窗簾。',
    },
  };

  const data = familyData[dmEl];
  if (!data) return null;

  return (
    <>
      {/* 家人關係弱項 */}
      <div className={`p-4 rounded-xl ${accentBg} border ${accentBorder} mb-4`}>
        <h4 className={`text-sm font-bold ${accentColor} mb-2 flex items-center gap-2`}>
          <span>🏠</span> {dmEl}命人家人關係弱項
        </h4>
        <p className="text-xs text-zen-text leading-relaxed mb-3">{data.weakness}</p>
        <div className="space-y-2">
          <div>
            <p className="text-[11px] text-zen-muted mb-0.5">💬 相處策略</p>
            <p className="text-[11px] text-zen-text leading-relaxed">{data.parentStrategy}</p>
          </div>
          <div>
            <p className="text-[11px] text-zen-muted mb-0.5">🏡 家宅佈置</p>
            <p className="text-[11px] text-zen-text leading-relaxed">{data.homeTip}</p>
          </div>
          <div>
            <p className="text-[11px] text-zen-muted mb-0.5">🗣️ 溝通建議</p>
            <p className="text-[11px] text-zen-text leading-relaxed">{data.communication}</p>
          </div>
        </div>
      </div>

      {/* 弱項五行提醒 */}
      {weakestElements.length > 0 && (
        <div className={`p-4 rounded-xl ${accentBg} border ${accentBorder} mb-4`}>
          <h4 className={`text-sm font-bold ${accentColor} mb-2 flex items-center gap-2`}>
            <span>⚠️</span> 最弱五行對家人關係的影響
          </h4>
          <div className="space-y-2">
            {weakestElements.map((el) => {
              const elData = familyData[el];
              if (!elData) return null;
              return (
                <div key={el} className="text-xs">
                  <strong className={accentColor}>{el}：</strong>
                  <span className="text-zen-text">{elData.weakness.split('。')[0]}。</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 補洩法方位 */}
      <div className={`p-3 rounded-xl ${accentBg} border ${accentBorder}`}>
        <h4 className={`text-xs font-bold ${accentColor} mb-1`}>
          ⚖️ 日主強弱與家人調和（{score}分，{isWeak ? '身弱宜補' : '身強宜洩'}）
        </h4>
        <p className="text-[11px] text-zen-text leading-relaxed">
          {isWeak
            ? `${dmEl}氣偏弱，宜用「補」法 — 強化「生我」與「同我」方位，增進家庭和諧。`
            : `${dmEl}氣充足，宜用「洩」法 — 透過「我生」方位洩秀，平衡過旺能量。`
          }
        </p>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────
// 人際：朋友貴人 + 生肖 + 出生地
// ──────────────────────────────────────────────
function renderFriendsRemedy(
  chart: BaziChart,
  primaryPattern: string,
  accentColor: string,
  accentBg: string,
  accentBorder: string,
) {
  const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || '土';
  const isWeak = primaryPattern.includes('弱') || primaryPattern.includes('從強');
  const patternKey = `${dmEl}${isWeak ? '身弱' : '身強'}`;

  // 找互補資料
  const companion = COMPANION_MATCHING.find(c => c.dayMaster === dmEl && c.pattern === (isWeak ? '身弱' : '身強'));
  const zodiacData = COMPANION_ZODIAC[patternKey];
  const birthplace = BIRTHPLACE_COMPANION[dmEl];

  // 各五行的人際弱項
  const friendWeakness: Record<string, { strong: string; weak: string }> = {
    '木': { strong: '過於剛直、固執己見、缺乏變通，容易與人爭執', weak: '優柔寡斷、缺乏主見、容易受他人影響，自信心不足' },
    '火': { strong: '急躁易怒、衝動行事、說話直接傷人，缺乏耐心', weak: '缺乏熱情、過於內向、社交退縮，容易感到孤獨' },
    '土': { strong: '固執保守、缺乏變通、過於重視細節，讓人感到壓力', weak: '缺乏穩重感、做事不踏實、容易失信於人' },
    '金': { strong: '過於剛硬、固執、缺乏同理心，容易與人發生衝突', weak: '優柔寡斷、缺乏原則、容易受他人擺佈' },
    '水': { strong: '過於情緒化、善變、缺乏安全感，容易懷疑他人', weak: '缺乏適應力、過於固執、社交能力不足' },
  };

  const weakness = friendWeakness[dmEl];

  return (
    <>
      {/* 人際弱項 */}
      {weakness && (
        <div className={`p-4 rounded-xl ${accentBg} border ${accentBorder} mb-4`}>
          <h4 className={`text-sm font-bold ${accentColor} mb-2 flex items-center gap-2`}>
            <span>🧩</span> {dmEl}命人人際關係特質
          </h4>
          <p className="text-xs text-zen-text leading-relaxed mb-2">
            <strong className={accentColor}>身強者：</strong>{weakness.strong}
          </p>
          <p className="text-xs text-zen-text leading-relaxed">
            <strong className={accentColor}>身弱者：</strong>{weakness.weak}
          </p>
        </div>
      )}

      {/* 貴人朋友選擇 */}
      {companion && (
        <div className={`p-4 rounded-xl ${accentBg} border ${accentBorder} mb-4`}>
          <h4 className={`text-sm font-bold ${accentColor} mb-2 flex items-center gap-2`}>
            <span>🤝</span> 貴人朋友選擇
          </h4>
          <p className="text-xs text-zen-text leading-relaxed mb-2">
            依您的命盤（{dmEl}日主，{primaryPattern}），
            建議找<strong className={accentColor}>{companion.complementaryElement}</strong>屬性的朋友作為貴人。
          </p>
          <p className="text-xs text-zen-text leading-relaxed mb-1">
            <strong>互補日主：</strong>{companion.complementaryDayMasters.join('、')}
          </p>
          {zodiacData && (
            <p className="text-xs text-zen-text leading-relaxed mb-1">
              <strong>貴人生肖：</strong>{zodiacData.zodiacs.join('、')}（{zodiacData.elements.join('')}屬性）
            </p>
          )}
          {birthplace && (
            <p className="text-[11px] text-emerald-400/80">📍 {birthplace}</p>
          )}
        </div>
      )}

      {/* 溝通策略 */}
      <div className={`p-3 rounded-xl ${accentBg} border ${accentBorder}`}>
        <h4 className={`text-xs font-bold ${accentColor} mb-1`}>💬 溝通策略 reminder</h4>
        <ul className="text-[11px] text-zen-text space-y-0.5">
          {isWeak ? (
            <>
              <li>• 身弱者：多找可以依靠的朋友，避免與過於強勢的人深交</li>
              <li>• 學會表達自己的感受，避免過於內斂或被動</li>
              <li>• 選擇正向、支持性的朋友圈</li>
            </>
          ) : (
            <>
              <li>• 身強者：多幫助朋友，但避免過度控制或主導</li>
              <li>• 學會傾聽，避免過於固執己見</li>
              <li>• 注意人際界線，避免過度干涉他人</li>
            </>
          )}
        </ul>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────
// 姻緣：桃花宮 + 男女各異
// ──────────────────────────────────────────────
function renderRomanceRemedy(
  chart: BaziChart,
  weakestElements: string[],
  accentColor: string,
  accentBg: string,
  accentBorder: string,
) {
  const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || '土';
  const isMale = chart.gender === '男';
  const romanceData = ROMANCE_FENG_SHUI_DATA[dmEl]?.[isMale ? '男' : '女'];
  if (!romanceData) return null;

  // 各五行姻緣弱項
  const romanceWeakness: Record<string, { title: string; desc: string }> = {
    '金': { title: '金命人姻緣弱項', desc: '金命人若身弱，姻緣來得較慢，對伴侶要求高但表達內斂，感情易生冷場。男命財星（木）弱：不善表達感情。女命官星（火）弱：對異性缺乏吸引力。' },
    '木': { title: '木命人姻緣弱項', desc: '木命人情緒敏感，易因小事受傷，感情優柔寡斷。男命財星（土）弱：缺乏安全感。女命官星（金）弱：易遇不到理想對象。' },
    '水': { title: '水命人姻緣弱項', desc: '水命人感情豐富但多變，易陷入曖昧或暗戀。男命財星（火）弱：對伴侶缺乏熱情。女命官星（土）弱：易遇不穩定對象。' },
    '火': { title: '火命人姻緣弱項', desc: '火命人熱情來得快去得快，感情易三分鐘熱度。男命財星（金）弱：對伴侶缺乏耐心。女命官星（水）弱：易遇不到理性對象。' },
    '土': { title: '土命人姻緣弱項', desc: '土命人穩重但固執，感情表達笨拙，易錯過姻緣。男命財星（水）弱：對伴侶缺乏浪漫。女命官星（木）弱：易遇不到主動對象。' },
  };

  const weakness = romanceWeakness[dmEl];

  return (
    <>
      {/* 桃花宮補運 */}
      <div className={`p-4 rounded-xl ${accentBg} border ${accentBorder} mb-4`}>
        <h4 className={`text-sm font-bold ${accentColor} mb-2 flex items-center gap-2`}>
          <span>💕</span> 桃花宮補運（{dmEl}日主，{isMale ? '男' : '女'}命）
        </h4>
        <p className="text-xs text-zen-muted mb-2">
          {weakness?.desc || ''}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div>
            <p className="text-zen-muted mb-0.5">🧭 桃花方位</p>
            <p className="text-zen-text">{romanceData.direction}</p>
          </div>
          <div>
            <p className="text-zen-muted mb-0.5">🎨 顏色</p>
            <p className="text-zen-text">{romanceData.colors}</p>
          </div>
        </div>
        <p className="text-[11px] text-emerald-400/80 mt-2">✅ {romanceData.decorations}</p>
        <p className="text-[11px] text-zen-muted mt-1">🪙 生肖擺件：{romanceData.zodiacs}</p>
      </div>

      {/* 弱項五行提醒 */}
      {weakestElements.length > 0 && (
        <div className={`p-3 rounded-xl ${accentBg} border ${accentBorder}`}>
          <h4 className={`text-xs font-bold ${accentColor} mb-1`}>
            ⚠️ 最弱五行對姻緣的影響
          </h4>
          <div className="space-y-1">
            {weakestElements.map((el) => {
              const elData = romanceWeakness[el];
              if (!elData) return null;
              return (
                <p key={el} className="text-[11px] text-zen-text">
                  <strong className={accentColor}>{el}：</strong>{elData.desc.split('。')[0]}。
                </p>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────
// 健康：缺失五行保健 + 流日健康提醒（手風琴呈現）
// ──────────────────────────────────────────────

/** 單一可收合區塊 */
function AccordionItem({
  icon, title, titleColor, defaultOpen = false, children,
}: {
  icon: string; title: string; titleColor: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between p-3 text-left transition-colors ${open ? 'bg-white/5' : 'bg-white/[0.02] hover:bg-white/5'}`}
      >
        <span className={`text-sm font-bold ${titleColor} flex items-center gap-2`}>
          <span>{icon}</span> {title}
        </span>
        <ChevronDown size={16} className={`text-zen-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="p-4 pt-2 border-t border-white/5 bg-black/20">
          {children}
        </div>
      )}
    </div>
  );
}

function renderHealthRemedy(
  chart: BaziChart,
  weakestElements: string[],
  accentColor: string,
  accentBg: string,
  accentBorder: string,
) {
  const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || '土';

  // 取得最弱五行的完整資料
  const weakEl = weakestElements[0] || dmEl;
  const weakAdvice = HEALTH_DATA.WEAK_ADVICE[weakEl as keyof typeof HEALTH_DATA.WEAK_ADVICE];
  const monthlyAlert = HEALTH_DATA.MONTHLY_HEALTH_ALERT[weakEl as keyof typeof HEALTH_DATA.MONTHLY_HEALTH_ALERT];
  const dayunHealth = HEALTH_DATA.DAYUN_HEALTH[weakEl as keyof typeof HEALTH_DATA.DAYUN_HEALTH];

  // 五行顏色映射
  const wxColors: Record<string, string> = {
    '木': '#22C55E', '火': '#EF4444', '土': '#F59E0B', '金': '#64748B', '水': '#3B82F6',
  };

  // 所有最弱五行的保健資料
  const allWeakRemedies = weakestElements.map(el => ({
    el,
    remedy: getHealthRemedy(el),
    preservation: HEALTH_PRESERVATION_GUIDE[el] || [],
  }));

  return (
    <div className="space-y-3">
      {/* 1. 缺失五行日常保健方案 — 預設展開 */}
      <AccordionItem icon="🌿" title="缺失五行日常保健方案" titleColor={accentColor} defaultOpen>
        <p className="text-xs text-zen-muted mb-3">
          依據講義：健康不看合化、不看身強身弱，直接看命盤中最少或沒有的五行。
        </p>
        <div className="space-y-3">
          {allWeakRemedies.map(({ el, remedy, preservation }) => (
            <div key={el} className="p-3 rounded-lg bg-black/20 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-black" style={{ color: wxColors[el] }}>{el}</span>
                <span className="text-xs text-zen-text">
                  {remedy?.organs || HEALTH_DATA.ORGANS[el as keyof typeof HEALTH_DATA.ORGANS] as string || ''}
                </span>
              </div>
              {preservation.length > 0 && (
                <div className="mb-2">
                  <p className="text-[11px] text-emerald-400/80 mb-1">✅ 日常保健：</p>
                  <ul className="text-[11px] text-zen-text space-y-0.5 ml-2">
                    {preservation.map((tip, i) => <li key={i}>• {tip}</li>)}
                  </ul>
                </div>
              )}
              {remedy?.weakSymptoms && (
                <div className="mb-2">
                  <p className="text-[11px] text-red-400/80 mb-1">⚠️ 弱項警訊：</p>
                  <p className="text-[11px] text-zen-text ml-2">{remedy.weakSymptoms}</p>
                </div>
              )}
              {/* remedy data used above */}
            </div>
          ))}
        </div>
      </AccordionItem>

      {/* 2. 大運×健康狀況 */}
      {dayunHealth && (
        <AccordionItem icon="📅" title={`大運×健康狀況（${weakEl}命人）`} titleColor={accentColor}>
          <p className="text-xs text-zen-muted mb-2">好大運補養穩定；不好大運為健康警訊。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/20">
              <p className="text-[11px] text-emerald-400 font-bold mb-1">✅ 好大運（健康穩定）</p>
              <p className="text-[11px] text-zen-text">
                五行屬「<strong>{dayunHealth.good.join('、')}</strong>」— 得到補養，健康穩定
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/20">
              <p className="text-[11px] text-red-400 font-bold mb-1">⚠️ 不佳大運（健康警訊）</p>
              <p className="text-[11px] text-zen-text">
                五行屬「<strong>{dayunHealth.bad.join('、')}</strong>」— {dayunHealth.badDesc}
              </p>
            </div>
          </div>
        </AccordionItem>
      )}

      {/* 3. 極端能量流日 */}
      {monthlyAlert && (
        <AccordionItem icon="⚡" title="極端能量流日（每月健康注意）" titleColor="text-amber-400">
          <p className="text-xs text-zen-muted mb-2">
            以下流日您的<strong className="text-amber-400">{weakEl}</strong>五行能量最旺，易引發過旺症狀：
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {monthlyAlert.extremeDays.map((day: string) => (
              <span key={day} className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold">
                {day}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-zen-text"><strong className="text-amber-400">症狀：</strong>{monthlyAlert.symptoms}</p>
          <p className="text-[11px] text-zen-text mt-1"><strong className="text-emerald-400">建議：</strong>{monthlyAlert.advice}</p>
        </AccordionItem>
      )}

      {/* 4. 最弱五行被剋流日 */}
      {weakAdvice && (
        <AccordionItem icon="🛡️" title="最弱五行被剋流日（宜避免）" titleColor="text-red-400">
          <p className="text-xs text-zen-muted mb-2">
            當流日出現「<strong className="text-red-400">{weakAdvice.avoidElement}</strong>」時，會加重對最弱五行「{weakEl}」的剋制。
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {weakAdvice.avoidGans.map((gan: string) => (
              <span key={gan} className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold">天干 {gan}</span>
            ))}
            {weakAdvice.avoidZhis.map((zhi: string) => (
              <span key={zhi} className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold">地支 {zhi}</span>
            ))}
          </div>
          <p className="text-[11px] text-zen-text"><strong className="text-emerald-400">保健建議：</strong>{weakAdvice.advice}</p>
        </AccordionItem>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 主元件
// ──────────────────────────────────────────────
export default function ElementRemedyCard({
  chart,
  primaryPattern,
  weakestElements,
  category,
  accentColor,
  accentBg,
  accentBorder,
  categoryLabel,
  customTitle,
}: Props) {
  const title = customTitle || `${categoryLabel}補運指南`;

  return (
    <div className="mt-6">
      <h3 className={`text-base font-bold ${accentColor} mb-3 flex items-center gap-2`}>
        <span>🧭</span> {title}
      </h3>

      {category === 'health' && renderHealthRemedy(chart, weakestElements, accentColor, accentBg, accentBorder)}
      {category === 'wealth' && renderWealthRemedy(chart, accentColor, accentBg, accentBorder)}
      {category === 'career' && renderCareerRemedy(chart, accentColor, accentBg, accentBorder)}
      {category === 'family' && renderFamilyRemedy(chart, primaryPattern, weakestElements, accentColor, accentBg, accentBorder)}
      {category === 'friends' && renderFriendsRemedy(chart, primaryPattern, accentColor, accentBg, accentBorder)}
      {category === 'romance' && renderRomanceRemedy(chart, weakestElements, accentColor, accentBg, accentBorder)}
    </div>
  );
}