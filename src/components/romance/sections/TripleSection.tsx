// src/components/romance/sections/TripleSection.tsx
// 流年生肖三合桃花旺年 — 判斷當前流年是否為命盤生肖的三合旺年。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  SectionGrammar,
} from "../../../components/shared";
import {
  ZHI_TO_ZODIAC,
  isPeachBlossomTripleYear,
  LECTURE_DATA,
} from "../../../data";
import type { BaziChart } from "@bezi/core";

const MAX_ACTIONS = 3;

const YEAR_ZHI: string[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function currentYearZhi(year: number): string {
  // 2024 = 甲辰 (辰，索引 4)，2024 % 12 = 8 → 索引 = (year % 12 + 8) % 12
  return YEAR_ZHI[(year % 12 + 8) % 12];
}

function section(
  title: string,
  level: SectionGrammar["level"],
  conclusion: string,
  rest: Partial<SectionGrammar>,
): SectionGrammar {
  return { title, level, conclusion: conclusion.slice(0, 120), ...rest };
}

interface TripleSectionProps {
  chart: BaziChart;
}

export default function TripleSection({ chart }: TripleSectionProps) {
  const currentYear = new Date().getFullYear();
  const yearZhi = currentYearZhi(currentYear);
  const userZodiac = chart.zodiac || ZHI_TO_ZODIAC[chart.year.zhi];
  const tripleMembers = userZodiac ? isPeachBlossomTripleYear(userZodiac, yearZhi) : false;
  const tripleList = userZodiac ? (LECTURE_DATA.PEACH_BLOSSOM_ZODIAC_YEAR as Record<string, string[]>)[userZodiac] ?? [] : [];

  return (
    <div className="space-y-6">
      <ContentSection
        defaultOpen
        grammar={section(
          "流年生肖三合桃花旺年",
          2,
          `您的生肖為 ${userZodiac ?? "—"}，${currentYear} 年（${yearZhi}）${
            tripleMembers ? "是" : "不是"
          } 您生肖的三合桃花旺年。`,
          {
            evidence: (
              <div className="space-y-2">
                <ReasoningCard label="生肖與三合" variant="default">
                  <p className="text-xs text-zen-text">
                    命盤生肖：{userZodiac ?? "—"}；三合生肖：{tripleList.join("、") || "—"}。
                  </p>
                </ReasoningCard>
                <ReasoningCard label="流年判斷" variant={tripleMembers ? "accent" : "muted"}>
                  <p className="text-xs text-zen-text">
                    {tripleMembers
                      ? `${currentYear} 年 ${yearZhi} 與您的生肖 ${userZodiac} 形成三合局，桃花運旺盛，利戀愛、結婚與喜事。`
                      : `${currentYear} 年 ${yearZhi} 未與您的生肖 ${userZodiac} 形成三合，桃花運以平穩為主。`}
                  </p>
                </ReasoningCard>
              </div>
            ),
            timeWindow: `流年 ${currentYear} 年（${yearZhi}）。`,
            actions: [
              "確認命盤生肖",
              "對照流年三合生肖",
              "把握桃花旺年時機",
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
      <UncertaintyNotice>
        三合桃花旺年依生肖三合對照表推斷，實際桃花運勢仍需結合命盤整體格局與大運流年判斷，僅供參考。
      </UncertaintyNotice>
    </div>
  );
}
