// ReferenceTablePage — knowledge base shell.
// 理論速查殼牌：標籤切換 + 搜尋，內容區塊委派給各 Tab 子元件。
import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { UncertaintyNotice } from './shared';
import BasicTab from './reference/BasicTab';
import WealthTab from './reference/WealthTab';
import CareerTab from './reference/CareerTab';
import RomanceTab from './reference/RomanceTab';
import HealthTab from './reference/HealthTab';
import FamilyTab from './reference/FamilyTab';
import FriendsTab from './reference/FriendsTab';
import TimelineTab from './reference/TimelineTab';
import FengShuiSystemGuide from './FengShuiSystemGuide';

const REF_TABS = [
  {
    key: 'basic',
    number: '01',
    label: '八字基礎',
    description: '天干、地支、五行與十神',
  },
  {
    key: 'wealth',
    number: '02',
    label: '財富',
    description: '財星、求財方式與財位',
  },
  {
    key: 'career',
    number: '03',
    label: '事業',
    description: '職業適配、轉職與職場互動',
  },
  {
    key: 'romance',
    number: '04',
    label: '感情',
    description: '夫妻星、桃花與關係模式',
  },
  {
    key: 'health',
    number: '05',
    label: '健康',
    description: '五行體質與生活照顧方向',
  },
  {
    key: 'family',
    number: '06',
    label: '家庭',
    description: '六親、子女與家庭互動',
  },
  {
    key: 'friends',
    number: '07',
    label: '人際',
    description: '朋友、合作與相處策略',
  },
  {
    key: 'timeline',
    number: '08',
    label: '大運流年',
    description: '時間節奏、喜忌與補運',
  },
  {
    key: 'fengshui',
    number: '09',
    label: '風水軟裝',
    description: '飛星、選房、內局與商業空間',
  },
];

interface TabMeta {
  key: string;
  number: string;
  label: string;
  description: string;
}

const TAB_COMPONENT: Record<string, React.FC<any>> = {
  basic: BasicTab,
  wealth: WealthTab,
  career: CareerTab,
  romance: RomanceTab,
  health: HealthTab,
  family: FamilyTab,
  friends: FriendsTab,
  timeline: TimelineTab,
  fengshui: FengShuiTab,
};

/** 風水軟裝 tab — 風水系統速查手冊（獨立於八字系統）＋ 流年飛星。 */
function FengShuiTab() {
  return (
    <div className="space-y-6">
      <UncertaintyNotice>
        風水是獨立系統：佈局不看身強身弱、不看八字忌神，命主只看日柱天干五行。以下內容來自風水課講義，與八字篇章互相不推導。
      </UncertaintyNotice>
      <FengShuiSystemGuide />
    </div>
  );
}

/** 古籍延伸書單 — 徐玉蘭老師推薦的深入閱讀四本（口徑來源仍是知識庫，不是古籍）。 */
function ClassicsSection() {
  const books = [
    { title: '三命通會', note: '明代命理經典，體系最全' },
    { title: '窮通寶鑑', note: '調候經典，五行寒燥喜忌' },
    { title: '滴天髓', note: '命理要訣，通關與氣勢' },
    { title: '命理探原', note: '入門體系完整，適合初學' },
  ];
  return (
    <section
      aria-labelledby="classics-title"
      className="mt-10 border-t border-zen-border pt-6"
    >
      <h2 id="classics-title" className="text-lg font-bold text-zen-text">
        古籍延伸書單
      </h2>
      <p className="mt-2 text-sm text-zen-muted leading-relaxed">
        以下是徐玉蘭老師推薦的深入閱讀書單。界線：古籍僅供概念查證，本站分析口徑以知識庫（課程講義）為準。
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {books.map((b) => (
          <li
            key={b.title}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <strong className="block text-sm font-bold text-zen-text">
              {b.title}
            </strong>
            <span className="mt-1 block text-xs leading-5 text-zen-muted">
              {b.note}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ReferenceTablePage({
  onNavigate,
}: {
  onNavigate?: (step: number) => void;
}) {
  const initialTab =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('currentRefTab') || 'basic'
      : 'basic';
  const [activeRefTab, setActiveRefTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [decorElement, setDecorElement] = useState<
    '金' | '木' | '水' | '火' | '土'
  >('金');
  const [decorGender, setDecorGender] = useState<'男' | '女'>('男');
  const [referenceFSYear, setReferenceFSYear] = useState(2026);

  useEffect(() => {
    const tab = sessionStorage.getItem('currentRefTab');
    if (tab) {
      setActiveRefTab(tab);
      sessionStorage.removeItem('currentRefTab');
    }
  }, []);

  const TabComp = TAB_COMPONENT[activeRefTab] || BasicTab;

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-500 pb-20">
      {/* 頁面標題 */}
      <div className="text-center mb-4">
        <span className="text-xs font-bold tracking-[0.24em] text-amber-300/80">
          LEARN
        </span>
        <h1 className="mt-3 text-3xl font-bold display-title mb-3 md:text-4xl">
          學習
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-zinc-400">
          從基礎概念開始，也可以直接選擇目前最想理解的生活主題。每一章都保留原始講義對照與理論資料。
        </p>
      </div>

      <div className="glass-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-serif font-bold text-zen-text flex items-center gap-2">
            <span className="w-1.5 h-6 bg-zen-gold inline-block rounded-full"></span>
            理論速查
          </h2>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋理論關鍵字..."
              className="w-full bg-zen-surface border border-zen-border text-zen-text pl-10 pr-4 py-2.5 rounded-full focus:outline-none focus:border-zen-gold text-sm font-sans"
            />
            <Search
              className="absolute left-3 top-2.5 text-zen-muted"
              size={16}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-zen-muted hover:text-zen-text"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* 課程章節導航 */}
        <div
          className="mb-8 grid gap-2 border-b border-zen-border pb-5 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="課程章節"
        >
          {REF_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-pressed={activeRefTab === tab.key}
              onClick={() => {
                setActiveRefTab(tab.key);
                sessionStorage.setItem('currentRefTab', tab.key);
              }}
              className={`min-h-24 rounded-xl border px-4 py-3 text-left transition-all font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                activeRefTab === tab.key
                  ? 'bg-zen-gold/15 text-zen-gold border-zen-gold/35'
                  : 'text-zen-muted border-white/10 hover:text-zen-text hover:bg-zen-surface/60'
              }`}
            >
              <span className="block text-[10px] font-bold tracking-widest opacity-60">
                CHAPTER {tab.number}
              </span>
              <span className="mt-1 block text-sm font-bold">{tab.label}</span>
              <span className="mt-1 block text-[11px] font-normal leading-5 opacity-70">
                {tab.description}
              </span>
            </button>
          ))}
        </div>

        <TabComp
          decorElement={decorElement}
          setDecorElement={setDecorElement}
          decorGender={decorGender}
          setDecorGender={setDecorGender}
          referenceFSYear={referenceFSYear}
          setReferenceFSYear={setReferenceFSYear}
        />

        <ClassicsSection />
      </div>
    </div>
  );
}
