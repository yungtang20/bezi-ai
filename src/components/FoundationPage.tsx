// src/components/FoundationPage.tsx
// [AI MOD] 基礎理論頁面 — 天干地支、十神、地支互動、格局、用神

interface Props {
  chart?: any;
  scores?: any;
  primaryPattern?: string;
  favorable?: string[];
  unfavorable?: string[];
  onNavigate?: (step: number) => void;
}

// 十天干資料
const TIAN_GAN = [
  { gan: '甲', element: '木', yinYang: '陽', desc: '大樹、參天' },
  { gan: '乙', element: '木', yinYang: '陰', desc: '花草、藤蔓' },
  { gan: '丙', element: '火', yinYang: '陽', desc: '太陽、烈火' },
  { gan: '丁', element: '火', yinYang: '陰', desc: '燈火、星火' },
  { gan: '戊', element: '土', yinYang: '陽', desc: '高山、厚土' },
  { gan: '己', element: '土', yinYang: '陰', desc: '田園、濕土' },
  { gan: '庚', element: '金', yinYang: '陽', desc: '刀劍、頑鐵' },
  { gan: '辛', element: '金', yinYang: '陰', desc: '珠玉、首飾' },
  { gan: '壬', element: '水', yinYang: '陽', desc: '江河、大海' },
  { gan: '癸', element: '水', yinYang: '陰', desc: '雨露、溪流' },
];

// 十二地支資料
const DI_ZHI = [
  { zhi: '子', element: '水', animal: '鼠', hour: '23-01', yinYang: '陽' },
  { zhi: '丑', element: '土', animal: '牛', hour: '01-03', yinYang: '陰' },
  { zhi: '寅', element: '木', animal: '虎', hour: '03-05', yinYang: '陽' },
  { zhi: '卯', element: '木', animal: '兔', hour: '05-07', yinYang: '陰' },
  { zhi: '辰', element: '土', animal: '龍', hour: '07-09', yinYang: '陽' },
  { zhi: '巳', element: '火', animal: '蛇', hour: '09-11', yinYang: '陰' },
  { zhi: '午', element: '火', animal: '馬', hour: '11-13', yinYang: '陽' },
  { zhi: '未', element: '土', animal: '羊', hour: '13-15', yinYang: '陰' },
  { zhi: '申', element: '金', animal: '猴', hour: '15-17', yinYang: '陽' },
  { zhi: '酉', element: '金', animal: '雞', hour: '17-19', yinYang: '陰' },
  { zhi: '戌', element: '土', animal: '狗', hour: '19-21', yinYang: '陽' },
  { zhi: '亥', element: '水', animal: '豬', hour: '21-23', yinYang: '陰' },
];

// 十神系統
const SHI_SHEN = [
  { name: '比肩', relation: '同五行同陰陽', trait: '獨立、自信、競爭、自尊心強', category: '同我' },
  { name: '劫財', relation: '同五行異陰陽', trait: '外向、冒險、不服輸、講義氣', category: '同我' },
  { name: '食神', relation: '我生者同陰陽', trait: '溫和、才華、享受、口才佳', category: '我生' },
  { name: '傷官', relation: '我生者異陰陽', trait: '聰明、叛逆、表現慾、創意強', category: '我生' },
  { name: '偏財', relation: '我剋者同陰陽', trait: '大方、交際、投機、善理財', category: '我剋' },
  { name: '正財', relation: '我剋者異陰陽', trait: '勤儉、保守、踏實、重信用', category: '我剋' },
  { name: '七殺', relation: '剋我者同陰陽', trait: '果斷、威嚴、壓力、魄力', category: '剋我' },
  { name: '正官', relation: '剋我者異陰陽', trait: '正直、責任、規矩、穩重', category: '剋我' },
  { name: '偏印', relation: '生我者同陰陽', trait: '內直、多學、孤僻、直覺強', category: '生我' },
  { name: '正印', relation: '生我者異陰陽', trait: '慈悲、智慧、依賴、有耐心', category: '生我' },
];

// 地支互動
const ZHI_INTERACTIONS = {
  liuhe: {
    name: '六合',
    desc: '和合、貴人、合作順利',
    pairs: [
      { pair: '子丑', meaning: '土水合，穩重踏實' },
      { pair: '寅亥', meaning: '木水相生，智慧成長' },
      { pair: '卯戌', meaning: '木火相生，熱情活力' },
      { pair: '辰酉', meaning: '金土相生，堅毅踏實' },
      { pair: '巳申', meaning: '火金相制，變化轉化' },
      { pair: '午未', meaning: '火土相生，光明包容' },
    ],
  },
  liuchong: {
    name: '六沖',
    desc: '衝突、變動、不安定',
    pairs: [
      { pair: '子午', meaning: '水火相沖，情緒波動' },
      { pair: '丑未', meaning: '土土相沖，根基動搖' },
      { pair: '寅申', meaning: '金木相沖，行動受阻' },
      { pair: '卯酉', meaning: '金木相沖，人際衝突' },
      { pair: '辰戌', meaning: '土土相沖，環境變遷' },
      { pair: '巳亥', meaning: '水火相沖，變化劇烈' },
    ],
  },
  sanxing: {
    name: '三刑',
    desc: '災厄、刑傷、不和',
    pairs: [
      { pair: '寅巳申', meaning: '無恩之刑，恩將仇報' },
      { pair: '丑戌未', meaning: '恃勢之刑，仗勢欺人' },
      { pair: '子卯', meaning: '無禮之刑，缺乏禮貌' },
      { pair: '辰辰/午午/酉酉/亥亥', meaning: '自刑，自我糾結' },
    ],
  },
  sanhe: {
    name: '三合',
    desc: '助力、格局、團結',
    pairs: [
      { pair: '申子辰', meaning: '水局，智慧流通' },
      { pair: '寅午戌', meaning: '火局，熱情奔放' },
      { pair: '巳酉丑', meaning: '金局，堅毅果斷' },
      { pair: '亥卯未', meaning: '木局，成長發展' },
    ],
  },
  sanhui: {
    name: '三會',
    desc: '季節能量、匯聚',
    pairs: [
      { pair: '寅卯辰', meaning: '木局，春季能量' },
      { pair: '巳午未', meaning: '火局，夏季能量' },
      { pair: '申酉戌', meaning: '金局，秋季能量' },
      { pair: '亥子丑', meaning: '水局，冬季能量' },
    ],
  },
};

// 格局判定
const PATTERNS = [
  {
    name: '身強',
    condition: '日主得令、得地、得勢',
    feature: '自信、主動、喜洩',
    favorable: '財、官殺、食傷',
    unfavorable: '印、比劫',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    name: '身弱',
    condition: '日主失令、失地',
    feature: '被動、依賴、喜生',
    favorable: '印、比劫',
    unfavorable: '財、官殺、食傷',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    name: '從強',
    condition: '日主極弱，順勢而為',
    feature: '極端、順應大勢',
    favorable: '生我、同我（順勢）',
    unfavorable: '剋我、我剋、我生',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    name: '從弱',
    condition: '日主極強，順勢而為',
    feature: '極端、不與對抗',
    favorable: '剋我、我剋、我生（順勢）',
    unfavorable: '生我、同我',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
];

// 五行顏色映射
const WX_COLORS: Record<string, string> = {
  '木': '#22C55E',
  '火': '#EF4444',
  '土': '#F59E0B',
  '金': '#94A3B8',
  '水': '#3B82F6',
};

// 十神分類顏色
const SHI_SHEN_CATEGORY: Record<string, string> = {
  '同我': 'text-cyan-400',
  '我生': 'text-green-400',
  '我剋': 'text-yellow-400',
  '剋我': 'text-red-400',
  '生我': 'text-purple-400',
};

export default function FoundationPage({ primaryPattern, favorable, unfavorable }: Props) {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* 頁面標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-serif font-bold display-title mb-3">八字基礎理論</h1>
        <p className="text-sm text-zen-muted font-sans">天干地支、十神、格局、用神的完整知識體系</p>
        <div className="gold-divider mt-4 mx-auto max-w-[200px]"></div>
      </div>

      {/* 當前命盤格局資訊 */}
      {primaryPattern && (
        <div className="glass-card">
          <h3 className="text-lg font-serif font-bold text-zen-text mb-4 flex items-center gap-2">
            <span>📊</span> 當前命盤格局
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zen-surface/60 rounded-xl p-5 text-center border border-zen-border">
              <span className="text-xs text-zen-muted block mb-2 font-sans">主要格局</span>
              <span className="text-2xl font-bold text-zen-gold font-serif">{primaryPattern}</span>
            </div>
            {favorable && favorable.length > 0 && (
              <div className="bg-zen-surface/60 rounded-xl p-5 text-center border border-zen-border">
                <span className="text-xs text-zen-muted block mb-2 font-sans">喜用五行</span>
                <div className="flex justify-center gap-3">
                  {favorable.map((el, i) => (
                    <span
                      key={i}
                      className="text-2xl font-bold font-serif"
                      style={{ color: WX_COLORS[el] || '#fff' }}
                    >
                      {el}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {unfavorable && unfavorable.length > 0 && (
              <div className="bg-zen-surface/60 rounded-xl p-5 text-center border border-zen-border">
                <span className="text-xs text-zen-muted block mb-2 font-sans">忌神五行</span>
                <div className="flex justify-center gap-3">
                  {unfavorable.map((el, i) => (
                    <span
                      key={i}
                      className="text-2xl font-bold font-serif"
                      style={{ color: WX_COLORS[el] || '#fff' }}
                    >
                      {el}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 一、天干地支系統 */}
      <section className="glass-card">
        <h3 className="text-xl font-serif font-bold text-zen-text mb-6 flex items-center gap-2">
          <span className="text-2xl">🌟</span> 天干地支系統
        </h3>

        {/* 十天干 */}
        <div className="mb-8">
          <h4 className="text-base font-serif font-bold text-zen-gold mb-4">十天干</h4>
          <div className="overflow-x-auto">
            <table className="zebra-table text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3">天干</th>
                  <th className="px-4 py-3">五行</th>
                  <th className="px-4 py-3">陰陽</th>
                  <th className="px-4 py-3">象徵</th>
                </tr>
              </thead>
              <tbody>
                {TIAN_GAN.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-bold text-lg font-serif" style={{ color: WX_COLORS[item.element] }}>
                      {item.gan}
                    </td>
                    <td className="px-4 py-3 font-sans" style={{ color: WX_COLORS[item.element] }}>
                      {item.element}
                    </td>
                    <td className="px-4 py-3 font-sans">{item.yinYang}</td>
                    <td className="px-4 py-3 text-zen-muted font-sans">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 十二地支 */}
        <div>
          <h4 className="text-base font-serif font-bold text-zen-gold mb-4">十二地支</h4>
          <div className="overflow-x-auto">
            <table className="zebra-table text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3">地支</th>
                  <th className="px-4 py-3">生肖</th>
                  <th className="px-4 py-3">五行</th>
                  <th className="px-4 py-3">陰陽</th>
                  <th className="px-4 py-3">時辰</th>
                </tr>
              </thead>
              <tbody>
                {DI_ZHI.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-bold text-lg font-serif" style={{ color: WX_COLORS[item.element] }}>
                      {item.zhi}
                    </td>
                    <td className="px-4 py-3 font-sans">{item.animal}</td>
                    <td className="px-4 py-3 font-sans" style={{ color: WX_COLORS[item.element] }}>
                      {item.element}
                    </td>
                    <td className="px-4 py-3 font-sans">{item.yinYang}</td>
                    <td className="px-4 py-3 text-zen-muted font-sans">{item.hour}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 二、十神系統 */}
      <section className="glass-card">
        <h3 className="text-xl font-serif font-bold text-zen-text mb-3 flex items-center gap-2">
          <span className="text-2xl">🔮</span> 十神系統
        </h3>
        <p className="text-sm text-zen-muted mb-6 font-sans leading-relaxed">
          十神是日主（天干）與其他干支的關係，依「生剋」原則分為五類
        </p>

        <div className="overflow-x-auto">
          <table className="zebra-table text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3">分類</th>
                <th className="px-4 py-3">十神</th>
                <th className="px-4 py-3">關係</th>
                <th className="px-4 py-3">性格特質</th>
              </tr>
            </thead>
            <tbody>
              {SHI_SHEN.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3">
                    <span className={`font-bold font-sans ${SHI_SHEN_CATEGORY[item.category] || 'text-zen-text'}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-zen-text font-serif">{item.name}</td>
                  <td className="px-4 py-3 font-sans">{item.relation}</td>
                  <td className="px-4 py-3 text-zen-muted font-sans">{item.trait}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 十神分類說明 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(SHI_SHEN_CATEGORY).map(([cat, color]) => (
            <div key={cat} className="bg-zen-surface/60 border border-zen-border rounded-xl p-4 text-center">
              <span className={`font-bold font-sans ${color}`}>{cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 三、地支互動 */}
      <section className="glass-card">
        <h3 className="text-xl font-serif font-bold text-zen-text mb-6 flex items-center gap-2">
          <span className="text-2xl">🔗</span> 地支互動關係
        </h3>

        <div className="space-y-8">
          {/* 六合 */}
          <div>
            <h4 className="text-base font-serif font-bold text-zen-jade mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zen-jade"></span> 六合 — {ZHI_INTERACTIONS.liuhe.desc}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ZHI_INTERACTIONS.liuhe.pairs.map((item, idx) => (
                <div key={idx} className="bg-zen-jade-dim border border-zen-jade/20 rounded-xl p-4 hover:border-zen-jade/40 transition-all">
                  <span className="text-lg font-bold text-zen-jade block mb-1 font-serif">{item.pair}</span>
                  <span className="text-xs text-zen-muted font-sans">{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 六沖 */}
          <div>
            <h4 className="text-base font-serif font-bold text-zen-rose mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zen-rose"></span> 六沖 — {ZHI_INTERACTIONS.liuchong.desc}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ZHI_INTERACTIONS.liuchong.pairs.map((item, idx) => (
                <div key={idx} className="bg-zen-rose-dim border border-zen-rose/20 rounded-xl p-4 hover:border-zen-rose/40 transition-all">
                  <span className="text-lg font-bold text-zen-rose block mb-1 font-serif">{item.pair}</span>
                  <span className="text-xs text-zen-muted font-sans">{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 三刑 */}
          <div>
            <h4 className="text-base font-serif font-bold text-amber-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> 三刑 — {ZHI_INTERACTIONS.sanxing.desc}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ZHI_INTERACTIONS.sanxing.pairs.map((item, idx) => (
                <div key={idx} className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 hover:border-amber-400/40 transition-all">
                  <span className="text-lg font-bold text-amber-400 block mb-1 font-serif">{item.pair}</span>
                  <span className="text-xs text-zen-muted font-sans">{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 三合 */}
          <div>
            <h4 className="text-base font-serif font-bold text-zen-sage mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zen-sage"></span> 三合 — {ZHI_INTERACTIONS.sanhe.desc}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ZHI_INTERACTIONS.sanhe.pairs.map((item, idx) => (
                <div key={idx} className="bg-zen-sage/5 border border-zen-sage/20 rounded-xl p-4 hover:border-zen-sage/40 transition-all">
                  <span className="text-lg font-bold text-zen-sage block mb-1 font-serif">{item.pair}</span>
                  <span className="text-xs text-zen-muted font-sans">{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 三會 */}
          <div>
            <h4 className="text-base font-serif font-bold text-purple-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span> 三會 — {ZHI_INTERACTIONS.sanhui.desc}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ZHI_INTERACTIONS.sanhui.pairs.map((item, idx) => (
                <div key={idx} className="bg-purple-400/5 border border-purple-400/20 rounded-xl p-4 hover:border-purple-400/40 transition-all">
                  <span className="text-lg font-bold text-purple-400 block mb-1 font-serif">{item.pair}</span>
                  <span className="text-xs text-zen-muted font-sans">{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 四、格局判定 */}
      <section className="glass-card">
        <h3 className="text-lg font-bold text-zen-text mb-4 flex items-center gap-2">
          <span className="text-xl">⚖️</span> 格局判定
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PATTERNS.map((pattern, idx) => (
            <div
              key={idx}
              className={`${pattern.bgColor} border ${pattern.borderColor} rounded-xl p-4`}
            >
              <h4 className={`text-lg font-bold ${pattern.color} mb-2`}>{pattern.name}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-zen-muted">條件：</span>
                  <span className="text-zen-text">{pattern.condition}</span>
                </div>
                <div>
                  <span className="text-zen-muted">特徵：</span>
                  <span className="text-zen-text">{pattern.feature}</span>
                </div>
                <div>
                  <span className="text-zen-muted">喜用：</span>
                  <span className="text-green-400">{pattern.favorable}</span>
                </div>
                <div>
                  <span className="text-zen-muted">忌神：</span>
                  <span className="text-red-400">{pattern.unfavorable}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 五、用神與喜忌 */}
      <section className="glass-card">
        <h3 className="text-lg font-bold text-zen-text mb-4 flex items-center gap-2">
          <span className="text-xl">🎯</span> 用神與喜忌
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zen-surface/40 rounded-xl p-4">
            <h4 className="font-bold text-zen-sage mb-3">用神</h4>
            <p className="text-sm text-zen-text leading-relaxed">
              命盤中最需要的五行，能平衡命局。找出用神是八字分析的核心，可透過日主強弱、月令、地支合會等來判斷。
            </p>
          </div>
          <div className="bg-zen-surface/40 rounded-xl p-4">
            <h4 className="font-bold text-green-400 mb-3">喜神</h4>
            <p className="text-sm text-zen-text leading-relaxed">
              輔助用神的五行，能生助用神或剋制忌神。喜神是大運流年中的加分項目。
            </p>
          </div>
          <div className="bg-zen-surface/40 rounded-xl p-4">
            <h4 className="font-bold text-red-400 mb-3">忌神</h4>
            <p className="text-sm text-zen-text leading-relaxed">
              對命局有害的五行，會破壞命盤平衡。遇到忌神大運流年時需特別注意。
            </p>
          </div>
          <div className="bg-zen-surface/40 rounded-xl p-4">
            <h4 className="font-bold text-zen-muted mb-3">閒神</h4>
            <p className="text-sm text-zen-text leading-relaxed">
              影響不大的五行，既非喜也非忌。在命盤中作用較小，可忽略不計。
            </p>
          </div>
        </div>

        {/* 五行補運建議 */}
        <div className="mt-4 bg-zen-sage/5 border border-zen-sage/20 rounded-xl p-4">
          <h4 className="font-bold text-zen-sage mb-2">💡 五行補運方向</h4>
          <ul className="text-sm text-zen-text space-y-1">
            <li>• <span className="text-green-400">木</span>：東方、綠色、植物、文教、慈善</li>
            <li>• <span className="text-red-400">火</span>：南方、紅色、能源、餐飲、科技</li>
            <li>• <span className="text-yellow-400">土</span>：中央、黃色、房地產、農業、陶瓷</li>
            <li>• <span className="text-slate-400">金</span>：西方、白色、金融、五金、法律</li>
            <li>• <span className="text-blue-400">水</span>：北方、黑色、物流、旅遊、漁業</li>
          </ul>
        </div>
      </section>
    </div>
  );
}