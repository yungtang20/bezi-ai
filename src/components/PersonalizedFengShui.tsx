// [AI MOD] PersonalizedFengShui.tsx — 專屬五行開運與住宅軟裝添運指南 共用元件
// 依使用者命盤五行 + 性別，自動顯示對應的 FiveElementFengShui + 軟裝清單 + 水缸 + 飛星

import { useState } from 'react';
import { Solar } from 'lunar-javascript';
import { GAN_TO_ELEMENT } from '../constants';
import { getHomeDecorGuide, getFlyingStarsForYear } from '../data';
import { FiveElement } from '../data/core/types';
import type { FengShuiItem } from './FiveElementFengShui';
import FiveElementFengShui from './FiveElementFengShui';
import FlyingStarsDisplay from './FlyingStarsDisplay';

interface Props {
  /** 日主天干 */
  dayMaster: string;
  /** 性別 */
  gender: string;
  /** 強調色 class（如 "text-yellow-400"） */
  accentColor: string;
  /** 背景色 class（如 "bg-yellow-500/10"） */
  accentBg: string;
  /** 邊框色 class（如 "border-yellow-500/20"） */
  accentBorder: string;
  /** 宮位類型（決定顯示哪個宮位的軟裝） */
  palaceType: '財位' | '事業貴人位' | '桃花宮' | '文昌宮';
  /** 頁面標題前綴 */
  pageLabel: string;
}

/**
 * 依五行 + 性別 + 宮位類型，產生對應的 FiveElementFengShui items
 */
function buildFengShuiItems(element: FiveElement): FengShuiItem[] {
  // 五行開運 5 方位 — 依該五行屬性的建議色彩與物品
  const elementFengShui: Record<FiveElement, FengShuiItem[]> = {
    '木': [
      { direction: '南方（火）', color: '紅、橘、黃、土黃色系', position: '主臥室 / 客廳', zodiac: '生肖 牛、龍、蛇、馬、羊、狗', item: '紅/橘色地毯、紅/紫色鮮花、紅色燈具、天然玉石' },
      { direction: '東方（木）', color: '紅、橘、黃、土黃色系', position: '主臥室 / 客廳', zodiac: '生肖 牛、龍、蛇、馬、羊、狗', item: '掛畫（紅、橘、黃、土黃色系）、水缸、紅/紫色瓶身香氛' },
      { direction: '中央（土）', color: '白、灰、金、銀色系', position: '主臥室 / 客廳', zodiac: '生肖 牛、蛇、猴、雞', item: '白、灰、金、銀色系地毯、金屬擺件、白色瓶身香氛' },
      { direction: '西方（金）', color: '白、灰、金、銀色系', position: '主臥室 / 客廳', zodiac: '生肖 牛、蛇、猴、雞', item: '金屬製鬧鐘/錢幣/風鈴/音樂盒、白色植栽' },
      { direction: '北方（水）', color: '紅、黃、橘、土黃色系', position: '主臥室 / 客廳', zodiac: '生肖 牛、龍、蛇、馬、羊、狗', item: '陶瓷品、玉石、紅色燈具/鹽燈、天然黃土色石頭' },
    ],
    '火': [
      { direction: '南方（火）', color: '白、灰、金、銀色系', position: '主臥室 / 客廳', zodiac: '生肖 牛、蛇、猴、雞', item: '白、灰、金、銀色系地毯、燈具、金屬擺件、白色鮮花' },
      { direction: '東方（木）', color: '白、灰、金、銀色系', position: '主臥室 / 客廳', zodiac: '生肖 牛、蛇、猴、雞', item: '掛畫（白、灰、金、銀色系）、金屬鬧鐘/風鈴/音樂盒' },
      { direction: '中央（土）', color: '藍、藍綠、黑、白、灰、金、銀色系', position: '主臥室 / 客廳', zodiac: '生肖 鼠、牛、龍、猴、雞、豬', item: '藍、藍綠、黑、白、灰、金、銀色系地毯、玻璃/水晶製品' },
      { direction: '西方（金）', color: '藍、藍綠、黑、白、灰、金、銀色系', position: '主臥室 / 客廳', zodiac: '生肖 鼠、牛、龍、猴、雞、豬', item: '金屬製品、水缸或裝水玻璃杯、金屬擺件' },
      { direction: '北方（水）', color: '紅、黃、橘、土黃色系', position: '主臥室 / 客廳', zodiac: '生肖 牛、龍、蛇、馬、羊、狗', item: '紅、黃、橘、土黃色系地毯、紅色燈具/鹽燈、陶瓷/玉石' },
    ],
    '土': [
      { direction: '南方（火）', color: '藍、藍綠、黑、白、灰、金、銀色系', position: '主臥室 / 客廳', zodiac: '生肖 鼠、牛、龍、猴、雞、豬', item: '藍、藍綠、黑、白、灰、金、銀色系掛畫、白/灰/金/銀色燈具' },
      { direction: '東方（木）', color: '藍、藍綠、黑、白、灰、金、銀色系', position: '主臥室 / 客廳', zodiac: '生肖 鼠、牛、龍、猴、雞、豬', item: '地毯、白色植物、白/灰色掛畫、白色瓶身香氛' },
      { direction: '中央（土）', color: '綠、藍綠色系', position: '主臥室 / 客廳', zodiac: '生肖 虎、兔、龍、羊、豬', item: '綠、藍綠色系鮮花、水晶、翡翠、木製品、綠色燈具' },
      { direction: '西方（金）', color: '綠、藍綠色系', position: '主臥室 / 客廳', zodiac: '生肖 虎、兔、龍、羊、豬', item: '掛畫（綠、藍綠色系）、木製品、綠色水晶/翡翠' },
      { direction: '北方（水）', color: '白、灰、金、銀色系', position: '主臥室 / 客廳', zodiac: '生肖 牛、蛇、猴、雞', item: '白、灰、金、銀色系地毯、金屬擺件、鹽燈' },
    ],
    '金': [
      { direction: '南方（火）', color: '綠色系（綠、藍綠色）', position: '主臥室 / 客廳', zodiac: '生肖 豬、兔、羊、虎、龍', item: '植栽（萬年青、竹子）、綠色水晶、翡翠、水缸或裝水玻璃杯' },
      { direction: '東方（木）', color: '綠色系（綠、藍綠色）', position: '主臥室 / 客廳', zodiac: '生肖 豬、兔、羊、虎、龍', item: '掛畫（綠色系）、地毯、木製擺件、綠色系燈具' },
      { direction: '中央（土）', color: '紅、黃、橘、綠色系', position: '主臥室 / 客廳', zodiac: '生肖 虎、蛇、馬、羊、狗', item: '紅、黃、橘、綠色系地毯、紅/紫色鮮花、紅色燈具' },
      { direction: '西方（金）', color: '紅、黃、橘、綠色系', position: '主臥室 / 客廳', zodiac: '生肖 虎、蛇、馬、羊、狗', item: '紅/紫色瓶身香氛、紅色燈具、紅/橘/黃色系生肖布偶' },
      { direction: '北方（水）', color: '紅、黃、橘、綠色系', position: '主臥室 / 客廳', zodiac: '生肖 虎、蛇、馬、羊、狗', item: '紅、黃、橘、綠色系地毯、水缸或裝水玻璃杯、綠色植栽' },
    ],
    '水': [
      { direction: '南方（火）', color: '紅、橘、黃、綠色系', position: '主臥室 / 客廳', zodiac: '生肖 虎、蛇、馬、羊、狗', item: '紅、橘、黃、綠色系地毯、紅/紫色鮮花、紅色燈具/鹽燈' },
      { direction: '東方（木）', color: '紅、橘、黃、綠色系', position: '主臥室 / 客廳', zodiac: '生肖 虎、蛇、馬、羊、狗', item: '掛畫（紅、橘、黃、綠色系）、紅/紫色瓶身香氛、綠色植栽' },
      { direction: '中央（土）', color: '紅、黃、橘、土黃色系', position: '主臥室 / 客廳', zodiac: '生肖 牛、龍、蛇、馬、羊、狗', item: '紅、黃、橘、土黃色系地毯、陶瓷/玉石/陶土擺件' },
      { direction: '西方（金）', color: '紅、黃、橘、土黃色系', position: '主臥室 / 客廳', zodiac: '生肖 牛、龍、蛇、馬、羊、狗', item: '紅/紫/土黃色系瓶身香氛、天然玉石、黃土色石頭' },
      { direction: '北方（水）', color: '綠、藍綠色系', position: '主臥室 / 客廳', zodiac: '生肖 虎、兔、龍、羊、豬', item: '綠、藍綠色系地毯、綠色植栽、萬年青、竹子、綠色水晶/翡翠' },
    ],
  };

  return elementFengShui[element] || elementFengShui['土'];
}

export default function PersonalizedFengShui({
  dayMaster,
  gender,
  accentColor,
  accentBg,
  accentBorder,
  palaceType,
  pageLabel,
}: Props) {
  const [flyingStarYear, setFlyingStarYear] = useState(2026);

  const element = (GAN_TO_ELEMENT[dayMaster] || '土') as FiveElement;
  const decorGuide = getHomeDecorGuide(element, gender);
  const palace = decorGuide?.palaces.find((p) => p.palace === palaceType);
  const waterTank = decorGuide?.waterTank;
  const fengShuiItems = buildFengShuiItems(element);

  // 決定飛星篩選條件
  const starFilter: Record<string, (name: string) => boolean> = {
    '財位': (name) => name.includes('八白') || name.includes('一白'),
    '事業貴人位': (name) => name.includes('四綠') || name.includes('一白') || name.includes('六白'),
    '桃花宮': (name) => name.includes('九紫') || name.includes('一白'),
    '文昌宮': (name) => name.includes('四綠') || name.includes('一白'),
  };
  const filterFn = starFilter[palaceType] || starFilter['財位'];

  // 頁面標題
  const pageTitle: Record<string, string> = {
    '財位': `✨ 專屬五行開運與住宅軟裝添運指南 (${pageLabel})`,
    '事業貴人位': `✨ 專屬五行開運與住宅軟裝添運指南 (${pageLabel})`,
    '桃花宮': `✨ 專屬五行開運與住宅軟裝添運指南 (${pageLabel})`,
    '文昌宮': `✨ 專屬五行開運與住宅軟裝添運指南 (${pageLabel})`,
  };
  const title = pageTitle[palaceType] || `✨ 專屬五行開運與住宅軟裝添運指南 (${pageLabel})`;

  return (
    <div className="glass-card animate-in fade-in">
      <h2 className={`text-xl font-bold text-zen-text mb-4 flex items-center gap-2 border-b border-zen-border pb-3`}>
        <span className={accentColor}>✨</span> {title}
      </h2>
      <p className="text-sm text-zen-muted mb-6 leading-relaxed">
        身為 <strong>{dayMaster}</strong> 日主，您的命盤五行屬「<strong className={accentColor}>{element}</strong>」。
        以下將您的<strong>「天命五行開運能量」</strong>與徐玉蘭老師的<strong>「家宅軟裝添運風水佈置」</strong>
        完美融合成專屬的五大核心開運維度：
      </p>

      {/* 第一層：五行開運 5 方位 */}
      <div className="mb-6">
        <FiveElementFengShui
          title="一體化五行開運五大方位"
          items={fengShuiItems}
          accentColor={accentColor}
          accentBg={accentBg}
          accentBorder={accentBorder}
        />
      </div>

      {/* 第二層：軟裝添運 — 宮位專屬 */}
      {palace && (
        <div className="mb-6 p-5 rounded-2xl border border-zen-border bg-zen-surface/40">
          <h4 className={`text-base font-bold ${accentColor} mb-3 flex items-center gap-2`}>
            <span>🏡</span> 軟裝添運 — {palace.palace} 佈置清單
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zen-text">
            <div className="space-y-2">
              <p><strong className="text-zen-muted">📍 佈置位置：</strong>{palace.location}</p>
              <p><strong className="text-zen-muted">🎨 建議色系：</strong>{palace.colors}</p>
              <p><strong className="text-zen-muted">🧱 材質建議：</strong>{palace.material}</p>
            </div>
            <div className="space-y-2">
              <p><strong className="text-zen-muted">🧭 開運方位：</strong>{palace.directions.join('、')}</p>
              <p><strong className="text-zen-muted">🐾 生肖擺件：</strong>{palace.zodiac}</p>
              <p><strong className="text-zen-muted">🔮 擺件材質：</strong>{palace.zodiacMaterial}</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-black border border-white/5">
            <strong className="text-zen-muted text-xs block mb-2">🏺 建議擺設物品：</strong>
            <p className="text-zen-text text-sm leading-relaxed">{palace.items.join('、')}</p>
          </div>
          {palace.flowerSide && (
            <div className="mt-3 p-3 rounded-xl bg-pink-950/10 border border-pink-900/20">
              <strong className="text-pink-400 text-xs block mb-1">🌸 鮮花擺放：</strong>
              <p className="text-zen-text text-sm">{palace.flowerSide}</p>
            </div>
          )}
        </div>
      )}

      {/* 第三層：水缸開運 */}
      {waterTank && (
        <div className="mb-6 p-5 rounded-2xl border border-zen-border bg-zen-surface/40">
          <h4 className={`text-base font-bold ${accentColor} mb-3 flex items-center gap-2`}>
            <span>🐟</span> 水缸開運擺設
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zen-text">
            <div className="space-y-2">
              <p><strong className="text-zen-muted">📐 尺寸：</strong>{waterTank.size}</p>
              <p><strong className="text-zen-muted">🧱 材質：</strong>{waterTank.material}</p>
              <p><strong className="text-zen-muted">🎨 顏色：</strong>{waterTank.color}</p>
            </div>
            <div className="space-y-2">
              <p><strong className="text-zen-muted">💧 水位：</strong>{waterTank.waterLevel}</p>
              <p><strong className="text-zen-muted">🌿 內容物：</strong>{waterTank.contents}</p>
              <p><strong className="text-zen-muted">⚙️ 馬達：</strong>{waterTank.pump}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-zen-muted">
            <strong>🔄 換水頻率：</strong>{waterTank.changeFrequency}
          </div>
          {waterTank.notes.length > 0 && (
            <ul className="mt-2 text-xs text-zen-muted space-y-1">
              {waterTank.notes.map((note, i) => (
                <li key={i}>• {note}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 第四層：通用 Tips */}
      {decorGuide?.generalTips && decorGuide.generalTips.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-zen-surface/30 border border-zen-border">
          <h4 className="text-sm font-bold text-zen-text mb-2">💡 軟裝通用原則</h4>
          <ul className="text-xs text-zen-muted space-y-1.5">
            {decorGuide.generalTips.map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 第五層：飛星 */}
      <FlyingStarsDisplay
        title={<><span>🌟</span> 紫白飛星地利佈局 ({flyingStarYear} {Solar.fromYmdHms(flyingStarYear, 6, 1, 0, 0, 0).getLunar().getYearInGanZhi()}年)</>}
        subtitle={`除了個人日主的八字喜忌與空間佈置外，流年五行紫白星更能為您引動旺盛的${palaceType}能量。請善用 ${flyingStarYear} 年流年吉星方位：`}
        year={flyingStarYear}
        onYearChange={setFlyingStarYear}
        stars={getFlyingStarsForYear(flyingStarYear).stars.filter((s) => filterFn(s.name))}
        accentColor={accentColor}
      />

      <p className="text-[11px] text-zen-muted mt-4 leading-relaxed font-sans">
        ※ 此五行開運軟裝指南依據您個人日主五行（{element}）與性別（{gender}）客製化，飛星則由 {flyingStarYear} 流年地利磁場決定。在您的專屬流日時，加強上述空間佈置淨化，開局最有利。
      </p>
    </div>
  );
}
