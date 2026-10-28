// src/components/reference/HealthTab.tsx
// 健康理論速查標籤頁：五行體質、器官、警訊、大運、三刑、病符星、流日、保健。
import React from "react";
import { ContentSection, ReasoningCard, UncertaintyNotice, SectionGrammar } from "../shared";
import {
  HEALTH_DATA,
  HEALTH_PRESERVATION_GUIDE,
  getHealthRemedy,
} from "../../data";
import { Activity, Leaf, Sun, Moon, Wind } from "lucide-react";

interface HealthTabProps {
  decorElement: "金" | "木" | "水" | "火" | "土";
  setDecorElement: (v: "金" | "木" | "水" | "火" | "土") => void;
  decorGender: "男" | "女";
  setDecorGender: (v: "男" | "女") => void;
  referenceFSYear: number;
  setReferenceFSYear: (v: number) => void;
}

const ICONS: Record<string, React.ElementType> = {
  木: Leaf,
  火: Sun,
  土: Sun,
  金: Moon,
  水: Wind,
};

type ElementKey = "木" | "火" | "土" | "金" | "水";

const ELEMENTS: ElementKey[] = ["木", "火", "土", "金", "水"];

function elementBadge(element: ElementKey) {
  const Icon = ICONS[element] || Activity;
  const color: Record<ElementKey, string> = {
    木: "text-emerald-400",
    火: "text-red-400",
    土: "text-amber-400",
    金: "text-zinc-400",
    水: "text-blue-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/10 text-xs font-serif ${color[element]}`}>
      <Icon size={12} />
      {element}
    </span>
  );
}

function buildSection(
  key: string,
  title: string,
  conclusion: string,
  evidence: React.ReactNode,
  actions?: string[],
  timeWindow?: string,
  uncertainty?: string,
  level: 2 | 3 | 4 = 3,
): SectionGrammar {
  return { title, level, conclusion, evidence, timeWindow, actions, uncertainty };
}

export default function HealthTab({
  decorElement,
  setDecorElement,
  decorGender,
  setDecorGender,
  referenceFSYear,
  setReferenceFSYear,
}: HealthTabProps) {
  const organs = HEALTH_DATA.ORGANS as Record<ElementKey, string>;
  const warnings = HEALTH_DATA.WARNINGS as Record<ElementKey, { 旺: string; 弱: string }>;
  const dayunHealth = HEALTH_DATA.DAYUN_HEALTH as Record<
    ElementKey,
    { good: string[]; bad: string[]; badDesc: string }
  >;
  const sanxing = HEALTH_DATA.SANXING_HEALTH;
  const flying = HEALTH_DATA.FLYING_STAR_HEALTH;
  const monthly = HEALTH_DATA.MONTHLY_HEALTH_ALERT as Record<
    ElementKey,
    { extremeDays: string[]; symptoms: string; advice: string }
  >;
  const weak = HEALTH_DATA.WEAK_ADVICE as Record<
    ElementKey,
    {
      avoidElement: string;
      avoidGans: string[];
      avoidZhis: string[];
      avoidDays: string[];
      organs: string;
      symptoms: string;
      advice: string;
    }
  >;
  const taisui = HEALTH_DATA.TAISUI_RULES;
  const guide = HEALTH_PRESERVATION_GUIDE as Record<ElementKey, string[]>;

  const currentRemedy = getHealthRemedy(decorElement);

  return (
    <div className="space-y-6">
      <UncertaintyNotice>
        本標籤頁僅提供八字健康理論參考，內容來源於健康篇講義與命理資料，不構成醫療診斷。身體不適請尋求專業醫療意見。
      </UncertaintyNotice>

      {/* 五行體質與器官 */}
      <ContentSection
        grammar={buildSection(
          "organs",
          "五行體質與對應器官",
          "日主五行對應特定器官系統，為健康照顧的參考基準。",
          (
            <div className="grid gap-3 sm:grid-cols-3">
              {ELEMENTS.map((el) => (
                <ReasoningCard key={el} label={el + "行體質"} variant="default">
                  {elementBadge(el)} <span className="text-zen-text">{organs[el]}</span>
                </ReasoningCard>
              ))}
            </div>
          ),
          ["查看自身日主五行", "對照器官保養重點", "避免過旺或過弱極端"],
          "全年參考，配合大運與流年判斷",
          "器官對應為命理傳統說法，非醫學解剖對照。",
        )}
      />

      {/* 五行健康警訊 */}
      <ContentSection
        grammar={buildSection(
          "warnings",
          "五行健康警訊表",
          "五行過旺會剋弱所剋之五行，五行過弱則易出現對應器官問題。",
          (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {ELEMENTS.map((el) => {
                const w = warnings[el];
                return (
                  <ReasoningCard key={el} label={el + "行警訊"} variant="muted">
                    <p className="text-xs text-zen-text leading-relaxed">
                      旺：{w.旺} · 弱：{w.弱}
                    </p>
                  </ReasoningCard>
                );
              })}
            </div>
          ),
          ["留意過旺五行剋泄", "補強過弱五行", "定期健康檢查"],
          "與大運、流年五行強弱搭配判斷",
          "警訊為統計性命理觀察，個別命盤需整體格局評估。",
        )}
      />

      {/* 大運健康 */}
      <ContentSection
        grammar={buildSection(
          "dayun",
          "大運看健康狀況",
          "大運五行與日主五行相生扶則較順遂，相剋耗泄則需加強保養。",
          (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {ELEMENTS.map((el) => {
                const d = dayunHealth[el];
                return (
                  <ReasoningCard key={el} label={el + "行大運"} variant="default">
                    <p className="text-xs text-zen-text leading-relaxed">
                      偏好：{d.good.join("、")} · 避免：{d.bad.join("、")}<br />
                      <span className="text-zen-muted/70">{d.badDesc}</span>
                    </p>
                  </ReasoningCard>
                );
              })}
            </div>
          ),
          ["比對當前大運五行", "避免忌神大運段積勞", "忌神運段加強對應器官保養"],
          "每段大運十年，與流年交互判斷",
          "大運吉凶需以整體格局喜忌為準，不以單一五行斷定。",
        )}
      />

      {/* 三刑 */}
      <ContentSection
        grammar={buildSection(
          "sanxing",
          "三刑與健康影響",
          "寅巳申無恩之刑與丑戌未恃勢之刑形成時，易有血光、手術或突發疾病。",
          (
            <div className="grid gap-3">
              {Object.entries(sanxing).map(([key, s]) => (
                <ReasoningCard key={key} label={s.description} variant="accent">
                  <p className="text-xs text-zen-text leading-relaxed">
                    {key === "自刑" ? "自刑（辰辰、午午、酉酉、亥亥）" : key}
                    <br />
                    症狀：{s.symptoms}<br />
                    建議：{s.advice}
                  </p>
                </ReasoningCard>
              ))}
            </div>
          ),
          ["查盤是否存在地支相刑", "刑運段注意行車與運動安全", "定期健檢與情緒疏導"],
          "命盤自刑常在，刑大運/流年段特別注意",
          "三刑形成需看全盤地支，單一刑煞不必然發生重大疾病。",
        )}
      />

      {/* 病符星 */}
      <ContentSection
        grammar={buildSection(
          "flying",
          "二黑五黃病符星影響",
          "二黑主精神不濟與舊疾復發，五黃主重大意外與血光，2026年分別位西北與正南。",
          (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(flying).map(([key, s]) => (
                <ReasoningCard key={key} label={s.star} variant="muted">
                  <p className="text-xs text-zen-text leading-relaxed">
                    五行：{s.element} · 2026位置：{s.position}<br />
                    效應：{s.effect}<br />
                    化解：{s.remedy}<br />
                    忌用：{s.avoid}
                  </p>
                </ReasoningCard>
              ))}
            </div>
          ),
          ["避免在凶星方位施工", "佩戴白灰金屬色系飾物", "保持安靜、忌敲打鑽牆"],
          `流年 ${referenceFSYear} 年飛星盤`,
          "飛星病符星為宅運層面參考，與命盤健康綜合判斷。",
        )}
      />

      {/* 極端能量流日 */}
      <ContentSection
        grammar={buildSection(
          "extreme",
          "極端能量流日",
          "日主五行在對應極端能量流日能量最旺，易引發該五行過旺的健康問題。",
          (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {ELEMENTS.map((el) => {
                const m = monthly[el];
                return (
                  <ReasoningCard key={el} label={el + "行流日"} variant="default">
                    <p className="text-xs text-zen-text leading-relaxed">
                      極端日：{m.extremeDays.join("、")}<br />
                      症狀：{m.symptoms}<br />
                      建議：{m.advice}
                    </p>
                  </ReasoningCard>
                );
              })}
            </div>
          ),
          ["避開極端能量流日勞累", "對應五行過旺時加強保養", "記錄身體不適日期規律"],
          "每月對應流日（甲寅乙卯等）",
          "極端流日為趨避參考，非絕對禁忌日。",
        )}
      />

      {/* 最弱五行流日 */}
      <ContentSection
        grammar={buildSection(
          "weak",
          "最弱五行被剋之流日建議",
          "最弱五行被旺氣剋泄之流日，對應器官症狀容易浮現，宜提前預防。",
          (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {ELEMENTS.map((el) => {
                const w = weak[el];
                return (
                  <ReasoningCard key={el} label={el + "行（弱）"} variant="muted">
                    <p className="text-xs text-zen-text leading-relaxed">
                      避免元氣：{w.avoidElement}<br />
                      避免天干：{w.avoidGans.join("、")} · 地支：{w.avoidZhis.join("、")}<br />
                      器官：{w.organs}<br />
                      症狀：{w.symptoms}<br />
                      建議：{w.advice}
                    </p>
                  </ReasoningCard>
                );
              })}
            </div>
          ),
          ["避開忌神流日天干地支", "保養對應器官系統", "流日當天避免過勞與生冷"],
          "與流月、流日地支組合搭配判斷",
          "以日主最弱五行為前提，實際需看全盤強弱與用神。",
        )}
      />

      {/* 犯太歲 */}
      <ContentSection
        grammar={buildSection(
          "taisui",
          "犯太歲與健康注意",
          "值、沖、刑、害、破太歲皆屬流年地支與命盤地支衝刑，流年加重需謹慎。",
          (
            <div className="space-y-2">
              {taisui.types.map((t, i) => (
                <ReasoningCard key={i} label={t.name} variant="default">
                  <p className="text-xs text-zen-text leading-relaxed">{t.description}</p>
                </ReasoningCard>
              ))}
              <ReasoningCard label="加重條件" variant="muted">
                <p className="text-xs text-zen-text leading-relaxed">
                  {taisui.stackRule}
                </p>
              </ReasoningCard>
            </div>
          ),
          ["查盤年支是否犯流年太歲", "犯太歲年行事低調、避險", "可作太歲安座或行善積德"],
          `流年 ${referenceFSYear} 年`,
          "犯太歲不必然發生疾病，需結合整體格局與流年喜忌。",
        )}
      />

      {/* 保健指南 */}
      <ContentSection
        grammar={buildSection(
          "guide",
          "五行保健指南",
          "依五行強弱與對應器官，採取飲食、作息、運動與環境的養生方向。",
          (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {ELEMENTS.map((el) => {
                const g = guide[el];
                const remedy = currentRemedy?.element === el ? currentRemedy : undefined;
                return (
                  <ReasoningCard key={el} label={el + "行保健"} variant="accent">
                    <p className="text-xs text-zen-text leading-relaxed">
                      {g.map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                      {remedy && (
                        <span className="text-zen-sage/70 block mt-1 text-[11px]">
                          補運：{remedy.weakSymptoms}
                        </span>
                      )}
                    </p>
                  </ReasoningCard>
                );
              })}
            </div>
          ),
          ["依日主五行採取保健", "熬夜前務必入睡（木行參考）", "飲食清溫、定時定量（土行參考）"],
          "長期日常養生，特別在忌神大運段",
          "保健建議為傳統養生參考，不能替代醫療治療。",
        )}
      />
    </div>
  );
}
