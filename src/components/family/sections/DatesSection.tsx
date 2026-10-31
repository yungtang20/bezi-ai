// src/components/family/sections/DatesSection.tsx
// 流日專屬入宅吉日預報 — 委託 DailyForecastCard 呈現。
// 內容僅用 src/data 僅讀引用，不改動邏輯。
import DailyForecastCard from '../../../components/DailyForecastCard';
import { Calendar } from 'lucide-react';
import type { BaziChart } from '../../../paipan';
import type { PartnerInfo } from '../../../types';

interface DatesSectionProps {
  chart: BaziChart;
  upcomingMoveInDays: {
    date: string;
    ganZhi: string;
    isFavorable: boolean;
  }[];
  partners?: PartnerInfo[];
}

export default function DatesSection({
  chart,
  upcomingMoveInDays,
  partners,
}: DatesSectionProps) {
  const extraWarning =
    partners && partners.length > 0
      ? `本運程已同步為您和家人（生肖：${partners.map((p) => p.name).join('、')}）進行生肖匹配度計算與過濾，確保該遷徒日不對任何家庭成員產生生肖相沖刑。`
      : undefined;

  return (
    <>
      {upcomingMoveInDays.length > 0 ? (
        <DailyForecastCard
          chart={chart}
          category="move_in"
          categoryName="家庭"
          accentColor="text-pink-400"
          title="流日專屬入宅進移吉日預報"
          emptyMessage="近期無明顯入宅與裝修吉日，請保持穩健觀望。"
          actionGuide="此期間利於搬新居、安床、翻新或購置家宅大型電器實木家具。"
          dateBorderColors={{
            border: 'border-pink-500/20',
            bg: 'bg-pink-500/10',
            text: 'text-pink-400',
          }}
          emoji=""
          extraWarning={extraWarning}
        />
      ) : (
        <div className="glass-card text-center p-8">
          <Calendar className="mx-auto text-zinc-500 mb-3" size={32} />
          <h3 className="font-bold text-zinc-300 mb-1">
            近期無顯著家庭遷徙吉日
          </h3>
          <p className="text-xs text-zinc-500">
            近期流日能量對遷徙入宅偏弱。如欲搬遷，建議選擇農民曆不沖本人生肖與日支配偶宮之流日。
          </p>
        </div>
      )}
    </>
  );
}
