// src/components/family/sections/TimelineSection.tsx
// 歲運推演與化解(家人) — 委託 CategoryTimelineRemedy 呈現。
// 內容僅用 src/data 僅讀引用，不改動邏輯。
import React from "react";
import CategoryTimelineRemedy from "../../../components/CategoryTimelineRemedy";

interface TimelineSectionProps {
  chart: React.ComponentPropsWithRef<typeof CategoryTimelineRemedy>["chart"];
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
}

export default function TimelineSection({
  chart,
  primaryPattern,
  favorable,
  unfavorable,
}: TimelineSectionProps) {
  return (
    <CategoryTimelineRemedy
      chart={chart}
      primaryPattern={primaryPattern}
      favorable={favorable}
      unfavorable={unfavorable}
      category="family"
      categoryTitle="家人"
    />
  );
}
