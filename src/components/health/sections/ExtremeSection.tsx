// src/components/health/sections/ExtremeSection.tsx
// 極端能量流日 — 健康頁第七區塊。
// 內容僅用 src/data 僅讀引用，不改動邏輯。
import { Info } from 'lucide-react';

interface ExtremeSectionProps {
  dmEl: string;
  extremeDaysList: { date: string; ganZhi: string; comment: string }[];
}

export default function ExtremeSection({
  dmEl,
  extremeDaysList,
}: ExtremeSectionProps) {
  return (
    <div
      id="extreme"
      className="scroll-mt-20 glass-card relative overflow-hidden"
    >
      <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
        <span className="text-emerald-400 font-mono">07.</span> 能量波動流日
      </h2>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed">
        當流日出現與您的<strong>「日主五行相同且能量較強的日辰」</strong>
        時，命理規則會列為觀察日。這不是疾病預測；身體不適請以醫療專業判斷為準。
      </p>

      {/* Extreme Warning rules table */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3 mb-4 text-xs font-semibold">
        <div className="flex items-center gap-2 text-amber-400">
          <Info size={14} />
          <span>您的日主五行屬【{dmEl}】，專屬極端流日警示：</span>
        </div>
        <div className="space-y-2 leading-relaxed">
          {dmEl === '木' && (
            <p>
              • <strong className="text-zen-text">日主屬木</strong>
              ：流年流日逢「甲寅、乙卯」能量最強，極端剋土，易致腸胃不適、壓力腹部脹痛。
            </p>
          )}
          {dmEl === '火' && (
            <p>
              • <strong className="text-zen-text">日主屬火</strong>
              ：流年流日逢「丙午、丁巳」能量最強，極端剋金，多見支氣管發炎、呼吸困難、皮膚大爆疹過敏。
            </p>
          )}
          {dmEl === '土' && (
            <p>
              • <strong className="text-zen-text">日主屬土</strong>
              ：流年流日逢「戊辰、戊戌、己丑、己未」能量最強，極端剋水，小心代謝水腫、泌尿感染、腎經負擔增加。
            </p>
          )}
          {dmEl === '金' && (
            <p>
              • <strong className="text-zen-text">日主屬金</strong>
              ：流年流日逢「庚申、辛酉」能量最強，極端剋木，易感焦慮失眠、血壓突然不穩、關節緊繃與手足抽痛。
            </p>
          )}
          {dmEl === '水' && (
            <p>
              • <strong className="text-zen-text">日主屬水</strong>
              ：流年流日逢「壬子、癸亥」能量最強，極端剋火，需特別防範心血管、眼底壓升高與頭暈。
            </p>
          )}
        </div>
      </div>

      {/* Dynamic scanned dates visualizer */}
      <div className="bg-zen-surface/30 border border-zen-border rounded-xl p-4">
        <strong className="text-xs text-zen-text block mb-2">
          {' '}
          預測推算：未來 120 天內您的「極端流日」警示：
        </strong>
        {extremeDaysList.length === 0 ? (
          <p className="text-xs text-zen-muted">
            未來 120 天內沒有明顯的極端能量流日，請常規保持即可。
          </p>
        ) : (
          <div className="space-y-2.5">
            {extremeDaysList.map((item, idx) => (
              <div
                key={`extreme-date-${idx}`}
                className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    {item.ganZhi}日
                  </span>
                  <span className="text-xs font-bold text-zen-text">
                    {item.date}
                  </span>
                </div>
                <span className="text-[11px] text-zen-muted font-medium text-right">
                  {item.comment}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
