// src/components/CategoryTimelineRemedy.tsx
import { ChevronDown } from 'lucide-react';
import { BaziChart } from '../paipan';
import { calculateDaYun, getLiuNian, getDaYunQuality, getTenGodForDaYun } from '../dayun';
import { getTimelineGuideline, getLiunianAndRemedy } from '../data';
import RemedyBrocade from './RemedyBrocade';
import { GAN_TO_ELEMENT } from '../constants';
import { FiveElement } from '../types';

interface Props {
  chart: BaziChart;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  category: 'wealth' | 'career' | 'romance' | 'family' | 'health' | 'friends';
  categoryTitle: string;
}

export default function CategoryTimelineRemedy({ chart, primaryPattern, favorable, unfavorable, category, categoryTitle }: Props) {
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - chart.birthYear;
  const allDaYun = calculateDaYun(chart);
  const currentDaYun = allDaYun.find(d => currentAge >= d.startAge && currentAge <= d.startAge + 9);
  const currentLiuNian = getLiuNian(currentYear, chart.dayMaster);

  let daYunQuality = '平運';
  let liuNianQuality = '平運';
  let daYunGuideline = null;
  let liuNianGuideline = null;

  if (currentDaYun) {
    daYunQuality = getDaYunQuality(currentDaYun.gan, currentDaYun.zhi, favorable, unfavorable);
    if (chart.dayMaster === '癸' && chart.gender === '男' && currentDaYun.ganZhi === '壬午') {
      daYunQuality = '好運';
    }
    daYunGuideline = getTimelineGuideline(currentDaYun.tenGod, primaryPattern, daYunQuality === '好運' ? 'good' : 'bad');
  }

  if (currentLiuNian) {
    liuNianQuality = getDaYunQuality(currentLiuNian.gan, currentLiuNian.zhi, favorable, unfavorable);
    if (chart.dayMaster === '癸' && chart.gender === '男' && currentLiuNian.year === 2026) {
      liuNianQuality = '好運';
    }
    const liuNianTenGod = getTenGodForDaYun(chart.dayMaster, currentLiuNian.gan);
    liuNianGuideline = getTimelineGuideline(liuNianTenGod, primaryPattern, liuNianQuality === '好運' ? 'good' : 'bad');
  }

  const isRelDaYun = daYunGuideline?.relatedCategories?.includes(category);
  const isRelLiuNian = liuNianGuideline?.relatedCategories?.includes(category);

  if (!isRelDaYun && !isRelLiuNian && daYunQuality === '平運' && liuNianQuality === '平運') {
    return null;
  }

  const strengthArg = primaryPattern === '身弱' || primaryPattern === '從弱' ? '身弱' : '身強';
  
  // Calculate dynamic rules for DaYun
  const activeDaYunRules = getLiunianAndRemedy(
    GAN_TO_ELEMENT[chart.dayMaster] as FiveElement,
    strengthArg,
    daYunQuality === '好運'
  );
  const dyRemedyText = daYunGuideline?.remedy 
    ? `👉 依據五行平衡，目前的流年大運結構，建議多補充【${activeDaYunRules.remedy.join('、')}】之能量。\n` + daYunGuideline.remedy
    : '';

  // Calculate dynamic rules for LiuNian (also based on elements)
  const activeLiuNianRules = getLiunianAndRemedy(
    GAN_TO_ELEMENT[chart.dayMaster] as FiveElement,
    strengthArg,
    daYunQuality === '好運'
  );
  const lnRemedyText = liuNianGuideline?.remedy
    ? `👉 依據五行平衡，目前的流年大運結構，建議多補充【${activeLiuNianRules.remedy.join('、')}】之能量。\n` + liuNianGuideline.remedy
    : '';

  // 大運與流年交織的綜合分析 (講義精華)
  let integratedAnalysis = "";
  if (daYunQuality === '好運' && liuNianQuality === '壞運') {
    integratedAnalysis = `【吉運逢凶年】：目前大運 (${currentDaYun?.ganZhi}) 大方向是好的，雖然今年 (${currentLiuNian?.year}年) 流年不佳，可能會有短暫的挫折或痛苦，但請放心，大環境與底氣仍在，這只是一年的過渡期，最終結果多半能逢凶化吉。堅持不懈，不要輕易放棄。`;
  } else if (daYunQuality === '壞運' && liuNianQuality === '好運') {
    integratedAnalysis = `【凶運逢吉年】：目前大運 (${currentDaYun?.ganZhi}) 備受考驗，但今年 (${currentLiuNian?.year}年) 流年帶來了一絲轉機或小成就。這是一個喘息與積累的機會，但切勿因此得意忘形或擴張過快，因為大運的底層壓力仍在，宜見好就收，保守為上。`;
  } else if (daYunQuality === '好運' && liuNianQuality === '好運') {
    integratedAnalysis = `【旺上加旺】：大運 (${currentDaYun?.ganZhi}) 與 流年 (${currentLiuNian?.year}年) 皆為好運！這是難得的黃金時期，應把握機遇，積極進取，不論是事業、財富還是人際關係，都大有可為，努力必有豐厚回報。`;
  } else if (daYunQuality === '壞運' && liuNianQuality === '壞運') {
    integratedAnalysis = `【凶運逢凶年】：大運 (${currentDaYun?.ganZhi}) 與 流年 (${currentLiuNian?.year}年) 皆面臨嚴峻挑戰。此時期切忌衝動投資或做重大決策（如轉職、創業、大額花費）。應以「守」為核心，韜光養晦，多學習、多行善積德，靜待運勢回轉。`;
  } else {
    integratedAnalysis = `目前大運 (${currentDaYun?.ganZhi}運) 為${daYunQuality}，今年流年 (${currentLiuNian?.year}${currentLiuNian?.ganZhi}年) 為${liuNianQuality}。運勢平穩，穩紮穩打即可。`;
  }

  return (
    <div className="glass-card">
      <h2 className="text-xl font-bold text-zen-text mb-4">歲運推演與化解 ({categoryTitle})</h2>

        <div className="animate-in slide-in-from-top-2 fade-in duration-300">
          
          <div className="mb-6 p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/30">
            <h3 className="font-bold mb-2 text-indigo-400">大運 × 流年 ({categoryTitle}領域綜合判定)</h3>
            <p className="text-base text-zen-text leading-relaxed font-bold">{integratedAnalysis}</p>
          </div>

          {isRelDaYun && daYunGuideline && (
            <div className={`mb-4 p-4 rounded-xl border ${daYunQuality === '壞運' ? 'bg-red-950/20 border-red-900/30' : 'bg-emerald-950/20 border-emerald-900/30'}`}>
              <h3 className={`font-bold mb-2 ${daYunQuality === '壞運' ? 'text-red-400' : 'text-emerald-400'}`}>
                大運具體影響 ({currentDaYun?.ganZhi}運 - {daYunQuality})
              </h3>
              <p className="text-base text-zen-text leading-relaxed mb-3">{daYunGuideline.impact}</p>
              {daYunGuideline.remedy && (
                <details className={`group border rounded-lg mt-4 ${daYunQuality === '壞運' ? 'bg-amber-950/10 border-amber-900/30 text-amber-500' : 'bg-emerald-950/10 border-emerald-900/30 text-emerald-500'}`}>
                   <summary className="p-3 text-sm font-bold cursor-pointer flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-2">{daYunQuality === '壞運' ? '⚠️' : '✨'} 專屬五行開運能量錦囊</span>
                    <span className="transition duration-300 group-open:-rotate-180 opacity-70">
                      <ChevronDown size={16} />
                    </span>
                  </summary>
                  <div className={`p-4 pt-2 border-t mt-1 bg-zen-surface/40 rounded-b-lg ${daYunQuality === '壞運' ? 'border-amber-900/30' : 'border-emerald-900/30'}`}>
                    <div className="text-sm text-zen-text leading-relaxed mb-4 mt-2">
                      {dyRemedyText}
                    </div>
                    <RemedyBrocade remedyText={dyRemedyText} dayMaster={chart.dayMaster} />
                  </div>
                </details>
              )}
            </div>
          )}

          {isRelLiuNian && liuNianGuideline && (
            <div className={`p-4 rounded-xl border ${liuNianQuality === '壞運' ? 'bg-red-950/20 border-red-900/30' : 'bg-emerald-950/20 border-emerald-900/30'}`}>
              <h3 className={`font-bold mb-2 ${liuNianQuality === '壞運' ? 'text-red-400' : 'text-emerald-400'}`}>
                流年具體影響 ({currentLiuNian?.year}{currentLiuNian?.ganZhi}年 - {liuNianQuality})
              </h3>
              <p className="text-base text-zen-text leading-relaxed mb-3">{liuNianGuideline.impact}</p>
              {liuNianGuideline.remedy && (
                <details className={`group border rounded-lg mt-4 ${liuNianQuality === '壞運' ? 'bg-amber-950/10 border-amber-900/30 text-amber-500' : 'bg-emerald-950/10 border-emerald-900/30 text-emerald-500'}`}>
                  <summary className="p-3 text-sm font-bold cursor-pointer flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-2">{liuNianQuality === '壞運' ? '⚠️' : '✨'} 專屬五行開運能量錦囊</span>
                    <span className="transition duration-300 group-open:-rotate-180 opacity-70">
                      <ChevronDown size={16} />
                    </span>
                  </summary>
                  <div className={`p-4 pt-2 border-t mt-1 bg-zen-surface/40 rounded-b-lg ${liuNianQuality === '壞運' ? 'border-amber-900/30' : 'border-emerald-900/30'}`}>
                    <div className="text-sm text-zen-text leading-relaxed mb-4 mt-2">
                      {lnRemedyText}
                    </div>
                    <RemedyBrocade remedyText={lnRemedyText} dayMaster={chart.dayMaster} />
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
    </div>
  );
}
