import React from "react";
import { ContentSection, ReasoningCard, UncertaintyNotice, type SectionGrammar } from "../../../components/shared";
import { WEALTH_GUIDELINES, getRemedyStrategy } from "../../../data";

interface RemedySectionProps {
  weakestElements: string[];
  dayMaster: string;
  isStrong: boolean;
  isWeak: boolean;
}

function buildGrammar({
  weakestElements,
  dayMaster,
  isStrong,
  isWeak,
}: RemedySectionProps): SectionGrammar {
  const strategy = getRemedyStrategy(dayMaster, isWeak);
  const primaryWeak = weakestElements[0] || dayMaster;
  const guide = WEALTH_GUIDELINES[primaryWeak as keyof typeof WEALTH_GUIDELINES];

  const conclusion =
    isStrong || isWeak
      ? `${dayMaster} 日主${isStrong ? "身強" : "身弱"}，採${strategy.method}：${strategy.directions.join("、")}方位為補強重點。`
      : `日主強弱屬偏平衡帶，建議先觀大運走向再決定補耗洩方向。`;

  const evidence: React.ReactNode = (
    <ReasoningCard label="命盤依據">
      <p>日主五行：{dayMaster}，當前強弱：{isStrong ? "身強" : isWeak ? "身弱" : "偏平衡"}</p>
      <p>補法方向：{strategy.method}（${isWeak ? "生扶印比劫" : "耗洩財官食傷"}）</p>
      <p>首要補足五行：{primaryWeak}，${guide ? guide.wealthElement : ""} 為財星。</p>
    </ReasoningCard>
  );

  const timeWindow = "以當前大運與流年為主，建議每三年複盤一次強弱變化。";

  const actions: string[] = [];
  if (guide) {
    actions.push(...guide.fengShui.boostActions.slice(0, 2));
  }
  if (strategy.colors.length) {
    actions.push(`穿${strategy.colors.join("、")}系服飾`);
  }
  if (strategy.decor) {
    actions.push(`擺設${strategy.decor}`);
  }

  const uncertainty =
    "補運為參考建議，實際效果仍隨大運、流年與個人行為而異；不構成絕對財務或人生指導。";

  return {
    title: "個人財富補運指南",
    level: 2,
    conclusion,
    evidence,
    timeWindow,
    actions,
    uncertainty,
  };
}

export function RemedySection({ weakestElements, dayMaster, isStrong, isWeak }: RemedySectionProps) {
  const grammar = buildGrammar({ weakestElements, dayMaster, isStrong, isWeak });

  return <ContentSection grammar={grammar} defaultOpen={false} />;
}
