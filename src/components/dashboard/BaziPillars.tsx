import { memo } from 'react';
import { BaziChart } from '../../paipan';

function BaziPillars({ chart }: { chart: BaziChart }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(['year', 'month', 'day', 'hour'] as const).map((key, index) => {
        const pillar = chart[key];
        return <div key={key} className="rounded-lg border border-white/10 bg-black/20 p-2 text-center">
          <div className="text-[10px] text-zinc-500">{['年柱', '月柱', '日柱', '時柱'][index]}</div>
          <div className="font-serif text-xl text-amber-300">{pillar.gan || '—'}{pillar.zhi || '—'}</div>
          <div className="text-[10px] text-zinc-400">{pillar.tenGod || '—'}</div>
        </div>;
      })}
    </div>
  );
}

export default memo(BaziPillars);
