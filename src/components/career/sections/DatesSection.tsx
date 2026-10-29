// src/components/career/sections/DatesSection.tsx
// 流日專屬事業預報 — 依日主五行與 CAREER_DAYS 表推演出專屬事業機會流日。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import { ContentSection, ReasoningCard, UncertaintyNotice, makeSection } from "../../../components/shared";
import { LECTURE_DATA } from "../../../data";
import type { BaziChart } from "@bezi/core";
import { GAN_TO_ELEMENT } from "../../../constants";
import { getUpcomingDatesForCategory } from "../../../dailyAnalysis";

const MAX_ACTIONS = 3;

interface UpcomingDay {
  date: string;
  ganZhi: string;
  isFavorable: boolean;
}

interface DatesSectionProps {
  chart: BaziChart;
  category?: string;
  categoryName?: string;
}

export default function DatesSection({
  chart,
  category = "career",
  categoryName = "事業",
}: DatesSectionProps) {
  const dayMasterElement = (GAN_TO_ELEMENT[chart.dayMaster] || "金") as keyof typeof LECTURE_DATA.CAREER_DAYS;
  const careerDays = LECTURE_DATA.CAREER_DAYS[dayMasterElement];
  const upcomingDays = getUpcomingDatesForCategory(
    chart,
    category as "career",
    [],
    [],
    "",
    3,
    [],
  ) as UpcomingDay[];

  const grammar = makeSection(
    "流日專屬事業預報",
    2,
    `日主 ${chart.dayMaster}（${dayMasterElement}）專屬事業機會流日：${careerDays.combos.length} 個推薦組合，${upcomingDays.length} 個近期旺日。`,
    {
      evidence: (
        <ReasoningCard label="事業機會流日依據" variant="default">
          <p className="text-xs text-zen-text">
            適用天干：{careerDays.gans.join("、")}。
          </p>
          <p className="text-xs text-zen-text">
            適用地支：{careerDays.zhis.join("、")}。
          </p>
          <p className="text-xs text-zen-text">
            推薦組合：{careerDays.combos.join("、")}。
          </p>
          {upcomingDays.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-zen-sage/70 block mb-1 uppercase tracking-wider">近期旺日</p>
              <div className="flex flex-wrap gap-1.5">
                {upcomingDays.map((d) => (
                  <span
                    key={d.date}
                    className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold"
                  >
                    {d.date} ({d.ganZhi})
                  </span>
                ))}
              </div>
            </div>
          )}
        </ReasoningCard>
      ),
      timeWindow:
        "依 CAREER_DAYS 表對照日主五行，適用於近期選擇事業行動、簽約、面試或升遷談判的旺日。",
      actions: [
        "確認日主五行屬性",
        "對照事業機會流日天干地支組合",
        "選擇近期旺日進行重要事業行動",
      ].slice(0, MAX_ACTIONS),
      uncertainty:
        "事業流日依命理參考表推斷，實際結果仍受大運、流年與個人條件影響，僅供參考，非絕對斷言。",
    },
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-blue-400 font-mono">09.</span> 流日專屬事業預報
        </h2>
      </div>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
        依日主五行對照 CAREER_DAYS 表，篩選出與您日主天干地支相合的事業機會流日，適合安排重要商業活動、簽約、面試或升遷談判。
      </p>
      <ContentSection grammar={grammar} defaultOpen />
      <UncertaintyNotice>
        事業機會流日僅為命理參考，實際吉凶需結合整體格局、用神與喜忌綜合判斷，不構成絕對事業指導。
      </UncertaintyNotice>
    </div>
  );
}
