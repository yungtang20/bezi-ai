// src/components/family/sections/InherentSection.tsx
// 先天命盤特質 — 家族宮位刑沖與子息緣分（家人篇）。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import { AlertTriangle, Baby, ShieldCheck } from 'lucide-react';
import {
  ContentSection,
  SectionGrammar,
  makeSection,
} from '../../../components/shared';

const MAX_ACTIONS = 3;

interface InherentSectionProps {
  relations: { type: string; msg: string }[];
  childStar: string;
  childLocation: string;
  childZhi: string;
  childZhiType: string;
  childTrait: { trait: string; strategy: string } | undefined;
  dayElement: string;
  isMale: boolean;
  isCesareanRisk: boolean;
  tenGodCount: Record<string, number>;
}

export default function InherentSection({
  relations,
  childStar,
  childLocation,
  childZhi,
  childZhiType,
  childTrait,
  dayElement,
  isMale,
  isCesareanRisk,
  tenGodCount,
}: InherentSectionProps) {
  return (
    <div className="space-y-6">
      {/* 家族宮位刑沖克害 */}
      <ContentSection
        grammar={makeSection(
          '家族宮位刑沖克害',
          2,
          relations.length > 0
            ? `命盤中有 ${relations.length} 處宮位刑沖破害，家宅平穩需留意磨合。`
            : '命盤四柱宮位極具凝聚力，無明顯對沖或刑害磨難，家宅平穩。',
          {
            evidence:
              relations.length > 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                  <h3 className="font-bold text-amber-400 text-sm mb-3 flex items-center gap-1.5">
                    <AlertTriangle size={15} /> 家族宮位與環境變動觀測
                  </h3>
                  {relations.map((r, i) => (
                    <div
                      key={i}
                      className="bg-zen-surface/60 border border-zen-border rounded-xl p-3 flex gap-2.5 items-center"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          r.type === '沖'
                            ? 'bg-red-500'
                            : r.type === '刑'
                              ? 'bg-amber-500'
                              : 'bg-pink-400'
                        }`}
                      ></span>
                      <p className="text-sm text-zen-text font-bold">{r.msg}</p>
                    </div>
                  ))}
                  <p className="mt-3 text-xs text-zen-muted leading-relaxed">
                    ※ <strong>「年柱」</strong>代指祖輩與父母，
                    <strong>「月柱」</strong>是兄弟姐妹與原生家境環境，
                    <strong>「日支」</strong>代表配偶與自家宅，
                    <strong>「時柱」</strong>
                    代指子女。宮位間相鄰如有刑沖破害，代表該宮相應人際於一生中多為人生磨練與和諧課題。
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-sm text-emerald-400 font-bold flex items-center gap-1.5">
                    <ShieldCheck size={16} />{' '}
                    恭喜！您命盤中的四柱宮位極具凝聚力，無明顯對沖或刑害磨難，家宅平穩。
                  </p>
                </div>
              ),
            timeWindow:
              '宮位刑沖破害依命盤先天結構，長期適用；大運與流年臨刑沖時效果更明顯。',
            actions: [
              '確認宮位刑沖破害',
              '對照家人與家宅關係',
              '注意大運流年刑沖年份',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 子息緣分觀測 */}
      <ContentSection
        grammar={makeSection(
          '子息緣份與子女宮位觀測',
          2,
          childStar
            ? `本命子息星現於：${childStar}（在您的 ${childLocation}）`
            : '命盤本局暫無明顯顯現之子息星星位，需等待大運、流年將子息星補上時機。',
          {
            evidence: childStar ? (
              <div className="space-y-3 mt-2">
                <p className="text-sm text-green-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></span>
                  本命子息星現於：{childStar} （在您的 {childLocation}）
                </p>
                {childTrait && (
                  <div className="bg-zen-surface/60 border border-zen-border rounded-lg p-3">
                    <p className="text-xs text-pink-300 font-bold mb-1">
                      子女地支特質類型及相處：{childZhiType}
                    </p>
                    <p className="text-sm text-zen-text leading-relaxed">
                      <strong>特徵：</strong>
                      {childTrait.trait}
                    </p>
                    <p className="text-sm text-zen-text mt-1 leading-relaxed">
                      <strong>引導策略：</strong>
                      {childTrait.strategy}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-amber-500 mt-1 font-bold">
                命盤本局暫無明顯顯現之子息星星位，需等待大運、流年將子息星補上時機。
              </p>
            ),
            timeWindow:
              '定男女命之子女緣分：男命以官殺（正官、七殺）為子息星，女命以食傷（食神、傷官）為子息星。先天固定，流年透出子息星時效果更明顯。',
            actions: [
              '確認子息星星位',
              '對照子女地支特質',
              '採用引導策略相處',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 專屬孕育時機與生產吉日 */}
      <ContentSection
        grammar={makeSection(
          '專屬易懷胎得子流年',
          3,
          childStar
            ? `依您命盤五行 ${dayElement}，流年透出相應天干地支時，親子懷胎之緣最旺盛。`
            : '依您命盤之五行平衡，近期孕育磁場平淡。',
          {
            evidence: (
              <>
                <p className="text-xs font-bold text-pink-400 mb-1">
                  專屬易懷胎得子流年：
                </p>
                <p className="text-sm text-zen-text leading-relaxed">
                  {childStar ? (
                    <>
                      根據您本命五行的五行生剋平衡，若遇流年天干或地支透出：
                      <strong className="text-pink-300">
                        {isMale
                          ? dayElement === '木'
                            ? '庚、辛 / 申、酉 (猴、雞年)'
                            : dayElement === '火'
                              ? '壬、癸 / 亥、子 (豬、鼠年)'
                              : dayElement === '土'
                                ? '甲、乙 / 寅、卯 (虎、兔年)'
                                : dayElement === '金'
                                  ? '丙、丁 / 巳、午 (蛇、馬年)'
                                  : dayElement === '水'
                                    ? '戊、己 / 辰、戌、丑、未 (龍、狗、牛、羊年)'
                                    : ''
                          : dayElement === '木'
                            ? '丙、丁 / 巳、午 (蛇、馬年)'
                            : dayElement === '火'
                              ? '戊、己 / 辰、戌、丑、未 (龍、狗、牛、羊年)'
                              : dayElement === '土'
                                ? '庚、辛 / 申、酉 (猴、雞年)'
                                : dayElement === '金'
                                  ? '壬、癸 / 亥、子 (豬、鼠年)'
                                  : dayElement === '水'
                                    ? '甲、乙 / 寅、卯 (虎、兔年)'
                                    : ''}
                      </strong>
                      之時期，親子懷胎之緣、繁衍子息之磁力最旺盛。
                    </>
                  ) : (
                    '依您命盤之五行平衡，近期孕育磁場平淡，若有得子希冀，需調和五行，隨時機及伴侶緣分而來。'
                  )}
                </p>
                {!isMale && (
                  <div className="pt-2 border-t border-white/5 mt-2 space-y-2 text-xs">
                    {isCesareanRisk ? (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="font-bold text-red-400 mb-1">
                          警惕：命盤帶易剖腹產之理
                        </p>
                        <p className="text-zen-muted leading-relaxed">
                          因您自身命盤中「時支」強烈刑沖到「日支/月支」，在十神理論中，時支為子息宮。生產時逢強震，增加剖腹機率，宜提前對產檢與生產醫療做完善之安排。
                        </p>
                      </div>
                    ) : (
                      <p className="text-zen-muted">
                        <strong className="text-pink-300"> 生產吉凶：</strong>{' '}
                        雖未有先天剖腹刑剋，如遇逢刑沖時支的流年流日，剖腹機率亦會增加。
                      </p>
                    )}
                    <div className="p-3 bg-zen-surface rounded-lg">
                      <p className="font-bold text-green-400 mb-1">
                        子女出生擇日基本原則 (預產期規劃)
                      </p>
                      <ul className="text-slate-400 space-y-1">
                        <li>
                          • <strong>避開與產婦刑沖：</strong>
                          不能與產婦個人生肖、或日柱地支直接相沖，以保大人平安。
                        </li>
                        <li>
                          • <strong>喜用互補均衡：</strong>
                          挑選使當日命局五行各方能量較為中和之時辰。
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </>
            ),
            timeWindow: '流年透出子息星時懷胎緣分最旺。',
            actions: [
              '確認子息星與流年互動',
              '選擇易懷胎得子流年',
              '避開刑沖時支之流日',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
    </div>
  );
}
