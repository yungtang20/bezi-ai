import {
  BriefcaseBusiness,
  CalendarDays,
  Coins,
  Heart,
  HeartPulse,
  House,
  LineChart,
  Sparkles,
  Users,
} from 'lucide-react';

interface ExplorePageProps {
  onNavigate: (step: number) => void;
}

const LIFE_TOPICS = [
  { key: 'career', title: '工作與方向', question: '最近適合轉職、爭取機會，還是先累積？', icon: BriefcaseBusiness, tone: 'text-emerald-300 bg-emerald-500/10' },
  { key: 'wealth', title: '財富與選擇', question: '現在的財務節奏適合積極還是保守？', icon: Coins, tone: 'text-amber-300 bg-amber-500/10' },
  { key: 'romance', title: '感情與姻緣', question: '關係裡容易出現什麼模式與課題？', icon: Heart, tone: 'text-rose-300 bg-rose-500/10' },
  { key: 'health', title: '身心與作息', question: '近期可以優先照顧哪些生活習慣？', icon: HeartPulse, tone: 'text-teal-300 bg-teal-500/10' },
  { key: 'family', title: '家人與家庭', question: '如何理解家人互動與家庭變動？', icon: House, tone: 'text-orange-300 bg-orange-500/10' },
  { key: 'friends', title: '人際與合作', question: '哪些相處方式更適合你？', icon: Users, tone: 'text-violet-300 bg-violet-500/10' },
] as const;

const TIME_TOPICS = [
  { step: 6, title: '人生趨勢', description: '查看大運與流年的長期節奏', icon: LineChart },
  { step: 8, title: '近期日子', description: '查看流月、流日與今天的記錄', icon: CalendarDays },
  { step: 9, title: '關係合盤', description: '從雙方命盤觀察互動模式', icon: Users },
] as const;

export default function ExplorePage({ onNavigate }: ExplorePageProps) {
  const openTopic = (key: string) => {
    sessionStorage.setItem('currentSpecialtyTab', key);
    onNavigate(7);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 pb-24 pt-3 md:pt-8">
      <header className="max-w-2xl">
        <span className="text-xs font-bold tracking-[0.24em] text-amber-300/80">EXPLORE</span>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">你現在想理解什麼？</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400 md:text-base">
          從生活中的問題開始。每個主題會先整理你的重點，再提供原因、行動方向與講義來源。
        </p>
      </header>

      <section aria-labelledby="life-topic-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="life-topic-title" className="text-lg font-bold text-zinc-100">生活主題</h2>
            <p className="mt-1 text-xs text-zinc-500">選一個最接近你目前問題的方向</p>
          </div>
          <Sparkles className="text-amber-300/60" size={20} aria-hidden="true" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LIFE_TOPICS.map(({ key, title, question, icon: Icon, tone }) => (
            <button
              key={key}
              type="button"
              onClick={() => openTopic(key)}
              className="group min-h-40 rounded-2xl border border-white/10 bg-zinc-950/45 p-5 text-left transition hover:-translate-y-0.5 hover:border-amber-300/30 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <span className={`inline-flex rounded-xl p-2.5 ${tone}`}><Icon size={20} aria-hidden="true" /></span>
              <strong className="mt-4 block text-base text-white">{title}</strong>
              <span className="mt-2 block text-sm leading-6 text-zinc-400">{question}</span>
              <span className="mt-4 block text-xs font-bold text-amber-300 opacity-80 transition group-hover:opacity-100">查看我的分析 →</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="time-topic-title">
        <h2 id="time-topic-title" className="mb-4 text-lg font-bold text-zinc-100">時間與關係</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {TIME_TOPICS.map(({ step, title, description, icon: Icon }) => (
            <button
              key={step}
              type="button"
              onClick={() => onNavigate(step)}
              className="flex min-h-24 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <span className="rounded-xl bg-white/5 p-2.5 text-zinc-300"><Icon size={20} aria-hidden="true" /></span>
              <span>
                <strong className="block text-sm text-zinc-100">{title}</strong>
                <span className="mt-1 block text-xs leading-5 text-zinc-500">{description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
