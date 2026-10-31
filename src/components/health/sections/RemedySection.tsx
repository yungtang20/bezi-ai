// src/components/health/sections/RemedySection.tsx
// 健康補運指南 — 健康頁第六區塊。
// 內容僅用 src/data 僅讀引用，不改動邏輯。
import { Sparkles, Compass } from 'lucide-react';

export default function RemedySection() {
  return (
    <div
      id="remedy"
      className="scroll-mt-20 glass-card relative overflow-hidden"
    >
      <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
        <span className="text-emerald-400 font-mono">06.</span> 健康補運指南
      </h2>

      <div className="space-y-4 text-xs text-zen-text">
        {/* Rules of thumb */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
          <h4 className="font-bold text-emerald-400 flex items-center gap-2">
            <Sparkles size={14} /> 核心補運大綱與調候
          </h4>
          <div className="space-y-2 leading-relaxed font-semibold">
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold">1.</span>
              <p>
                找出命中最少的五行物理性質（如服飾色彩、配戴水晶或用神掛飾）增補先天缺口。
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold">2.</span>
              <p>
                若健康五行在命局中不幸為忌神，則<strong>不盲目進補</strong>
                ；此時以大運的用神（喜神，如平衡大運命盤整體氣候）作為養生和調理的首要參考。
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold">3.</span>
              <p>
                若是特殊從格，則<strong>順勢而為</strong>
                ，不必刻意補足，行用神運限時健康狀態即暢順自得。
              </p>
            </div>
          </div>
        </div>

        {/* Space Feng Shui section */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
          <h4 className="font-bold text-amber-500 flex items-center gap-2">
            <Compass size={14} /> 空間民俗觀察（2026 年飛星）
          </h4>
          <p className="text-xs text-zen-muted leading-relaxed">
            以下為傳統飛星民俗說法，沒有醫療證據，僅供文化與自我觀察參考。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className="p-3 rounded-lg bg-yellow-950/10 border border-yellow-900/20 space-y-1.5">
              <strong className="text-yellow-400 text-xs block">
                二黑巨門星 (西北方位) — 病符星
              </strong>
              <p className="text-[11px] text-zen-muted leading-relaxed">
                傳統說法將 2026 年<strong>西北方</strong>
                列為宜保持安定的方位；不代表會造成疾病。
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-950/15 border border-red-900/20 space-y-1.5">
              <strong className="text-red-400 text-xs block">
                五黃廉貞星 (正南方位) — 凶煞星
              </strong>
              <p className="text-[11px] text-zen-muted leading-relaxed">
                傳統說法將 2026 年<strong>正南方</strong>
                列為宜減少擾動的方位；不代表會造成意外或疾病。
              </p>
            </div>
          </div>

          <div className="bg-black/40 p-3 rounded-lg border border-zen-border space-y-2 text-[11px] font-semibold mt-3">
            <strong className="text-emerald-400 block mb-1">
              {' '}
              二黑五黃具體化解方法：
            </strong>
            <div className="space-y-1.5 leading-relaxed">
              <p>
                <span className="text-yellow-500">
                  【原則一：煞方宜靜不宜動】
                </span>{' '}
                西北與正南方不宜施工敲牆、鑽洞、敲打，不宜堆放有聲家電（音響、風扇、拖地機器人、鬧鐘）。保持門窗遮掩，避免氣氣流動激動土煞。
              </p>
              <p>
                <span className="text-yellow-500">
                  【原則二：以「金」洩土煞】
                </span>{' '}
                二黑五黃屬土。用金屬器皿（如金屬銅葫蘆、六帝金錢、銅鈴、銀器擺飾）來化宿疾與凶災。地毯選用白、灰、金屬色系。
              </p>
              <p>
                <span className="text-red-400">【避忌禁區】</span>{' '}
                煞方絕對忌用紅色（火生土助煞）、黃色系（助旺土氣）、綠色系植物（木克土，驚動土地神引發反噬）。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
