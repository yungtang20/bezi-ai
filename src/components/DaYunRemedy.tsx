import React from 'react';
import { BaziChart } from '../paipan';
import { calculateDaYun } from '../dayun';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from '../constants';
import { getLiunianAndRemedy } from '../data/core/fiveElementsBalance';
import { DEFICIENT_ELEMENT_REMEDIES } from '../data/core/fiveElementsRemedies';
import { FiveElement, DayMasterStrength } from '../data/core/types';
import { Sparkles } from 'lucide-react';

interface Props {
  chart: BaziChart;
  primaryPattern: string;
  favorable: string[];
  pageContext: string;
  children?: React.ReactNode;
}

export default function DaYunRemedy({ chart, primaryPattern, favorable, pageContext, children }: Props) {
  const currentYearDate = new Date().getFullYear();
  const currentAge = currentYearDate - chart.birthYear;
  const daYunList = calculateDaYun(chart);
  const currentDaYun = daYunList.find(dy => currentAge >= dy.startAge && currentAge <= dy.startAge + 9);
  
  let isDayunGood = false;
  if (currentDaYun) {
    const currentDaYunGanElement = GAN_TO_ELEMENT[currentDaYun.gan];
    const currentDaYunZhiElement = ZHI_TO_ELEMENT[currentDaYun.zhi];
    isDayunGood = favorable.includes(currentDaYunGanElement) || favorable.includes(currentDaYunZhiElement);
  }

  const dmEl = GAN_TO_ELEMENT[chart.dayMaster] as FiveElement;
  const strength = (primaryPattern.includes('從強') ? '從強' : primaryPattern.includes('從弱') ? '從弱' : primaryPattern.includes('身弱') ? '身弱' : '身強') as DayMasterStrength;
  
  const { remedy } = getLiunianAndRemedy(dmEl, strength, isDayunGood);
  // Pick the primary remedy element.
  // If we can specifically match the page context, we could try (e.g. index 1 for wealth), but using the most powerful remedy[0] is universally safe and recommended for Da Yun stability.
  const targetElement = remedy[0];
  const remedyData = DEFICIENT_ELEMENT_REMEDIES[targetElement];

  if (!remedyData) return null;

  return (
    <div className="info-card !bg-black !border-zinc-800">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Sparkles className="text-amber-500" size={20} /> 專屬五行開運能量錦囊 ({pageContext})
      </h2>
      <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
        您目前大運狀態為{isDayunGood ? '【順勢用神】' : '【遇逢忌神】'}。身為 <strong>{chart.dayMaster} ({dmEl})</strong> 日主，且格局偏向{strength}，當前階段最有效的補運五行磁場為「<strong className="text-amber-400">{targetElement}</strong>」。以下依據五行平衡原則，為您提供專屬的日常開運與行動指引：
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3 shadow-inner">
          <p className="text-sm leading-relaxed"><strong className="text-amber-400 block mb-1">🎯 核心補運五行：</strong>{targetElement}</p>
          <p className="text-sm leading-relaxed"><strong className="text-amber-400 block mb-1">🗺️ 專屬開運方位：</strong>{remedyData.direction}</p>
          <p className="text-sm leading-relaxed"><strong className="text-amber-400 block mb-1">✈️ 建議旅遊地：</strong>{remedyData.directionsDetail}</p>
          <p className="text-sm leading-relaxed"><strong className="text-amber-400 block mb-1">🎨 空間與穿搭色系：</strong>{remedyData.colors}</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3 shadow-inner">
          <p className="text-sm leading-relaxed">
            <strong className="text-amber-400 block mb-1">🧸 吉祥物品與生肖：</strong>
            <span className="block text-zinc-300">{remedyData.luckyItems.join('、')}</span>
          </p>
          <p className="text-sm leading-relaxed">
            <strong className="text-amber-400 block mb-1">📍 日常特定行動：</strong>
            <span className="block text-zinc-300">{remedyData.dailyActions.map((act, i) => `${i+1}. ${act}`).join(' ')}</span>
          </p>
          <p className="text-sm leading-relaxed">
            <strong className="text-red-400 block mb-1">⚠️ 需盡量避免：</strong>
            <span className="block text-zinc-300">{remedyData.avoid.join('、')}</span>
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
