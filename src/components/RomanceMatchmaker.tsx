// src/components/RomanceMatchmaker.tsx
import { useState, useMemo } from "react";
import { 
  Heart, 
} from "lucide-react";
import { BaziChart } from "../paipan";
import { GAN_TO_ELEMENT } from "../constants";

interface Props {
  chart: BaziChart;
  primaryPattern: string;
}

export default function RomanceMatchmaker({ chart, primaryPattern }: Props) {
  const [partnerGender, setPartnerGender] = useState<"男" | "女">("女");
  const [partnerDayMaster, setPartnerDayMaster] = useState<string>("甲");
  const [partnerZodiac, setPartnerZodiac] = useState<string>("鼠");

  const zodiacZhiMap: Record<string, string> = {
    鼠: "子", 牛: "丑", 虎: "寅", 兔: "卯", 
    龍: "辰", 蛇: "巳", 馬: "午", 羊: "未", 
    猴: "申", 雞: "酉", 狗: "戌", 豬: "亥"
  };

  const selfZhi = chart.year.zhi;
  const pZhi = zodiacZhiMap[partnerZodiac] || "子";

  const compatibilityResult = useMemo(() => {
    let score = 65; // Base score
    const details: string[] = [];

    // 1. 生肖三合與六沖
    // 三合：申子辰（鼠猴龍）、巳酉丑（蛇雞牛）、寅午戌（虎馬狗）、亥卯未（豬羊兔）
    const tripleGroups = [
      ["子", "申", "辰"],
      ["巳", "酉", "丑"],
      ["寅", "午", "戌"],
      ["亥", "卯", "未"]
    ];
    let isTriple = false;
    for (const group of tripleGroups) {
      if (group.includes(selfZhi) && group.includes(pZhi)) {
        isTriple = true;
        break;
      }
    }

    const clashPairs: Record<string, string> = {
      子: "午", 午: "子", 丑: "未", 未: "丑",
      寅: "申", 申: "寅", 卯: "酉", 酉: "卯",
      辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳"
    };
    const isClash = clashPairs[selfZhi] === pZhi;

    if (isTriple) {
      score += 15;
      details.push("【生肖三合（大吉）】雙方生肖契合度極高，天生志趣相投、默契十足，在相處上能夠彼此寬容與欣賞！");
    } else if (isClash) {
      score -= 20;
      details.push("【生肖六沖（考驗）】差距六歲、地支相沖。脾氣或理念上易有正面交鋒或環境變異。相處時切忌相互強行干涉，應以理解代替爭執。");
    } else {
      details.push("【生肖安和（平穩）】生肖磁場安靜平順，無大刑沖，相伴之路平平穩。");
    }

    // 2. 姻緣五行相同
    const dmSelfEl = GAN_TO_ELEMENT[chart.dayMaster as keyof typeof GAN_TO_ELEMENT] || "水";
    const dmPartnerEl = GAN_TO_ELEMENT[partnerDayMaster as keyof typeof GAN_TO_ELEMENT] || "水";
    
    // 男命夫妻星為財，女命為官殺
    const getSpouseElement = (dm: string, isMale: boolean) => {
      const el = GAN_TO_ELEMENT[dm as keyof typeof GAN_TO_ELEMENT] || "水";
      if (isMale) {
        // 男命財為夫妻星：金日主木、木日主土、土日主水、火日主金、水日主火
        switch (el) {
          case "金": return "木";
          case "木": return "土";
          case "土": return "水";
          case "火": return "金";
          case "水": return "火";
          default: return "木";
        }
      } else {
        // 女命官殺為夫妻星：金日主火、木日主金、土日主木、火日主水、水日主土
        switch (el) {
          case "金": return "火";
          case "木": return "金";
          case "土": return "木";
          case "火": return "水";
          case "水": return "土";
          default: return "金";
        }
      }
    };

    const selfSpouseEl = getSpouseElement(chart.dayMaster, chart.gender === "男");
    const partnerSpouseEl = getSpouseElement(partnerDayMaster, partnerGender === "男");

    if (chart.dayMaster !== partnerDayMaster && selfSpouseEl === partnerSpouseEl) {
      score += 10;
      details.push("【姻緣五行相同（相遇而契合）】男女日主雖不同，但共同夫妻星五行一致（同屬 " + selfSpouseEl + "）。天生具有相近的審美和生活態度，磁場極易調頻到同一緯度。");
    }

    // 3. 日主互為夫妻星
    const selfIsSpouseForPartner = getSpouseElement(partnerDayMaster, partnerGender === "男") === dmSelfEl;
    const partnerIsSpouseForSelf = getSpouseElement(chart.dayMaster, chart.gender === "男") === dmPartnerEl;

    if (selfIsSpouseForPartner && partnerIsSpouseForSelf) {
      score += 15;
      details.push("【日主互為夫妻星（天作之合）】宿世情緣、正配大吉！男女日主五行正好互為對方的夫妻星，先天引力極強，容易一見鍾情或相看兩不拆。");
    }

    // 4. 五行能量互補
    // 粗略以日主強弱判斷
    const selfStrong = primaryPattern?.includes("強");
    const partnerStrong = partnerDayMaster === "甲" || partnerDayMaster === "丙" || partnerDayMaster === "戊" || partnerDayMaster === "庚" || partnerDayMaster === "壬"; // 簡易陽日主默認身強
    
    if (selfStrong !== partnerStrong) {
      score += 5;
      details.push("【五行能量陰陽調和（互補型）】一方個性強悍果決，另一方溫婉沈穩。運勢上互補、人生上相扶，有利於長期共同成長。");
    } else {
      details.push("【心有靈犀（相似型）】雙方的個性力量相似，好時並蒂蓮、壞時容易因意氣之爭而互不相讓，建議共同修持包容心。");
    }

    // Bound scores between 30 and 100
    score = Math.max(30, Math.min(100, score));

    let level = "中等適配";
    let colorClass = "text-amber-400";
    let bgClass = "bg-amber-500/10 border-amber-500/20";
    if (score >= 85) {
      level = "天作良緣";
      colorClass = "text-rose-400";
      bgClass = "bg-rose-500/10 border-rose-500/20";
    } else if (score >= 75) {
      level = "上等適配";
      colorClass = "text-pink-400";
      bgClass = "bg-pink-500/10 border-pink-500/20";
    } else if (score < 60) {
      level = "磨合較多";
      colorClass = "text-red-400";
      bgClass = "bg-red-500/10 border-red-500/20";
    }

    return { score, level, colorClass, bgClass, details };
  }, [chart, partnerGender, partnerDayMaster, partnerZodiac, selfZhi]);

  const GAN_LIST = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const ZODIAC_LIST = ["鼠", "牛", "虎", "兔", "龍", "蛇", "馬", "羊", "猴", "雞", "狗", "豬"];

  return (
    <div className="bg-zen-surface/30 border border-zen-border rounded-2xl p-5 mb-4">
      <h3 className="font-bold text-pink-400 text-sm mb-4 flex items-center gap-1.5 font-sans">
        <Heart size={16} className="text-pink-500 animate-pulse" />
        <span>🔮 八字契合度客製即時測算</span>
      </h3>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
        請手動輸入您或心儀對象的日主（Day Master）天干與生肖（Zodiac），系統將立即模擬雙方的命理契合維度並生成適配度報告：
      </p>

      {/* Input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-[10px] text-zen-muted font-bold mb-1.5 uppercase font-sans">對方性別</label>
          <div className="flex rounded-lg overflow-hidden border border-white/5 p-0.5 bg-black/40">
            {(["男", "女"] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setPartnerGender(g)}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${
                  partnerGender === g ? 'bg-pink-500/20 text-pink-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-zen-muted font-bold mb-1.5 uppercase font-sans">對方日主天干</label>
          <select
            value={partnerDayMaster}
            onChange={(e) => setPartnerDayMaster(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-xs text-zen-text focus:outline-none focus:border-pink-500/50"
          >
            {GAN_LIST.map(g => (
              <option key={g} value={g} className="bg-zinc-950 font-bold">{g}木/火/土/金/水 ({GAN_TO_ELEMENT[g as keyof typeof GAN_TO_ELEMENT]}命)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-zen-muted font-bold mb-1.5 uppercase font-sans">對方的生肖</label>
          <select
            value={partnerZodiac}
            onChange={(e) => setPartnerZodiac(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-xs text-zen-text focus:outline-none focus:border-pink-500/50"
          >
            {ZODIAC_LIST.map(z => (
              <option key={z} value={z} className="bg-zinc-950 font-bold">{z} ({zodiacZhiMap[z]})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Match Result Output */}
      <div className={`p-4 rounded-xl border ${compatibilityResult.bgClass} flex flex-col md:flex-row items-center gap-4 transition-all duration-300`}>
        <div className="text-center shrink-0 border-r border-white/5 pr-4 md:h-24 flex flex-col justify-center">
          <span className="text-[10px] text-zen-muted font-bold uppercase tracking-widest block font-sans">綜合評級</span>
          <span className={`text-2xl font-black ${compatibilityResult.colorClass} block my-1 font-serif`}>
            {compatibilityResult.level}
          </span>
          <span className="text-xs font-bold font-mono text-white/50">
            得分: {compatibilityResult.score} / 100
          </span>
        </div>

        <div className="flex-1 space-y-2 py-1">
          <strong className="text-xs font-bold text-white/80 block">契合度理氣剖析：</strong>
          <ul className="text-[11px] text-zen-text space-y-1.5 font-sans leading-relaxed">
            {compatibilityResult.details.map((detail, idx) => {
              const isDanger = detail.includes("考驗");
              const isAuspicion = detail.includes("大吉") || detail.includes("天作");
              return (
                <li key={idx} className="flex gap-1.5 items-start">
                  <span className={isDanger ? "text-red-400 mt-0.5 shrink-0" : isAuspicion ? "text-pink-400 mt-0.5 shrink-0" : "text-zinc-500 mt-0.5 shrink-0"}>
                    {isDanger ? "⚠️" : isAuspicion ? "🌸" : "●"}
                  </span>
                  <span>{detail}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
