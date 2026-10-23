// src/components/dashboard/PeopleCards.tsx
// [P2] 我的親人卡片：在「我的命盤」profile 頁管理家人成員（增 / 刪 / 載入重排）。
// 資料層複用 SynastryPage 的 partners 儲存（relationship='家人'），不另建第二份 convention。
import React, { useEffect, useState } from 'react';
import { calculateChart } from '../../paipan';
import { PartnerChart } from '../../matchmaking';
import { savePartner, deletePartner } from '../../storage';
import { BIRTH_CITIES, cityLongitude } from '../../lib/trueSolarCities';

interface Props {
  onLoad?: (p: PartnerChart) => void;
}

const RELATION_LABEL: Record<string, string> = {
  '家人': '家人',
  '伴侶': '伴侶',
  '合作夥伴': '合作夥伴',
  '其他': '其他',
};

export default function PeopleCards({ onLoad }: Props) {
  const [people, setPeople] = useState<PartnerChart[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    import('../../storage')
      .then(({ getPartners }) => getPartners())
      .then((list) => setPeople(list.filter((p) => p.relationship === '家人')))
      .catch((e) => console.error('[PeopleCards] load failed:', e));
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length >= 7) formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
    else if (digits.length >= 5) formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    setDate(formatted);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    setTime(digits.length >= 3 ? digits.slice(0, 2) : digits);
  };

  const resetForm = () => {
    setName(''); setGender('female'); setDate(''); setTime(''); setCity(''); setError('');
    setIsAdding(false);
  };

  const handleAdd = async () => {
    if (!name.trim() || date.length !== 10 || time === '' || time.length > 2) {
      setError('請填寫姓名、完整生日與時辰（00-23）');
      return;
    }
    const hour = parseInt(time, 10);
    if (isNaN(hour) || hour > 23) {
      setError('時辰需為 00-23');
      return;
    }
    const [y, m, d] = date.split('-').map(Number);
    try {
      const chart = calculateChart(y, m, d, hour, gender === 'male' ? '男' : '女', false, cityLongitude(city));
      const person: PartnerChart = {
        id: Date.now().toString(),
        name: name.trim(),
        relationship: '家人',
        gender: gender === 'male' ? '男' : '女',
        birthDate: date,
        birthTime: String(hour),
        birthCity: city || undefined,
        chart,
      };
      await savePartner(person);
      const list = await import('../../storage').then((m) => m.getPartners());
      setPeople(list.filter((p) => p.relationship === '家人'));
      resetForm();
    } catch (e) {
      setError('排盤失敗，請確認日期是否有效');
      console.error('[PeopleCards] add failed:', e);
    }
  };

  const handleDelete = async (id: string) => {
    await deletePartner(id);
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="pt-1 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-zinc-500">家人成員保存在此裝置；點「載入重排」可檢視該成員的完整命盤。</p>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-[11px] text-zen-gold hover:text-zen-gold/80 border border-zen-gold/30 hover:border-zen-gold/50 px-2 py-0.5 rounded transition-colors"
          >
            + 新增成員
          </button>
        )}
      </div>

      {isAdding && (
        <div className="glass-card p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs outline-none focus:border-zen-gold/50 placeholder:text-zinc-600"
            />
            <div className="flex gap-1.5">
              {(['female', 'male'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 rounded-lg border text-xs py-1.5 transition-colors ${
                    gender === g
                      ? 'border-zen-gold/60 bg-zen-gold/15 text-zen-gold'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {g === 'male' ? '男' : '女'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="生日 YYYYMMDD"
              value={date}
              onChange={handleDateChange}
              className="bg-white/5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs outline-none focus:border-zen-gold/50 placeholder:text-zinc-600"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="時辰 00-23"
              value={time}
              onChange={handleTimeChange}
              className="bg-white/5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs outline-none focus:border-zen-gold/50 placeholder:text-zinc-600"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {BIRTH_CITIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setCity(city === c.name ? '' : c.name)}
                className={`px-2 py-0.5 rounded border text-[10px] transition-colors ${
                  city === c.name
                    ? 'border-zen-gold/60 bg-zen-gold/15 text-zen-gold'
                    : 'border-white/10 bg-white/5 text-zinc-500 hover:bg-white/10'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          {error && <p className="text-[11px] text-rose-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 rounded-lg bg-zen-gold/20 hover:bg-zen-gold/30 border border-zen-gold/40 text-zen-gold text-xs py-1.5 transition-colors"
            >
              儲存
            </button>
            <button
              onClick={resetForm}
              className="flex-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 text-xs py-1.5 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {people.length === 0 && !isAdding && (
        <p className="text-[11px] text-zinc-600 text-center py-2">尚無家人成員，點上方「+ 新增成員」開始。</p>
      )}

      {people.map((p) => (
        <div
          key={p.id}
          className="glass-card p-3 flex items-center justify-between gap-2"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-zinc-100">{p.name}</span>
              <span className="text-[10px] text-zinc-500">
                {RELATION_LABEL[p.relationship] ?? p.relationship} · {p.gender} · {p.birthDate.replace(/-/g, '/')} {p.birthTime.padStart(2, '0')}:00
                {p.birthCity ? `（${p.birthCity}）` : ''}
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 font-serif mt-0.5">
              {p.chart.year.gan}{p.chart.year.zhi} {p.chart.month.gan}{p.chart.month.zhi} {p.chart.day.gan}{p.chart.day.zhi} {p.chart.hour.gan ? p.chart.hour.gan + p.chart.hour.zhi : ''}
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => onLoad?.(p)}
              className="text-[11px] text-zen-gold border border-zen-gold/40 hover:bg-zen-gold/10 px-2 py-1 rounded transition-colors"
            >
              載入重排
            </button>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-[11px] text-zinc-500 border border-white/10 hover:bg-white/10 hover:text-rose-400 px-2 py-1 rounded transition-colors"
              aria-label={`刪除 ${p.name}`}
            >
              刪除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
