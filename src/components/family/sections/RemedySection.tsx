// src/components/family/sections/RemedySection.tsx
// 家人補運指南 — 委託 ElementRemedyCard 呈現。
// 內容僅用 src/data 僅讀引用，不改動邏輯。
import React from "react";
import ElementRemedyCard from "../../../components/ElementRemedyCard";

interface RemedySectionProps {
  chart: React.ComponentPropsWithRef<typeof ElementRemedyCard>["chart"];
  primaryPattern: string;
  weakestElements: string[];
}

export default function RemedySection({
  chart,
  primaryPattern,
  weakestElements,
}: RemedySectionProps) {
  return (
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
  );
}
