// src/components/DayunPage.tsx
// [AI MOD] 大運流年頁面 — 大運規則、排法、十神關係、流年斷應、太歲
import { BaziChart } from '../paipan';
import { PatternScores } from '../pattern';

interface Props {
  chart?: BaziChart;
  scores?: PatternScores;
  primaryPattern?: string;
  favorable?: string[];
  unfavorable?: string[];
  onNavigate?: (step: number) => void;
}

// 五行顏色映射
const WX_COLORS: Record<string, string> = {
  '木': '#22C55E',
  '火': '#EF4444',
  '土': '#F59E0B',
  '金': '#94A3B8',
  '水': '#3B82F6',
};

// 大運與十神關係
const DAYUN_SHISHEN = [
  {
    shishen: '財（正財/偏財）',
    strong: '得財機會多、男生的感情運好',
    weak: '父親健康或財務有狀況、伴侶狀況',
    icon: '💰',
  },
  {
    shishen: '官殺（正官/七殺）',
    strong: '工作運佳、被賞識、升職、女生桃花旺',
    weak: '工作壓力大、官司糾紛、女生婚姻困擾',
    icon: '⚖️',
  },
  {
    shishen: '食傷（食神/傷官）',
    strong: '文昌運好、才華被看見、女生子息運好',
    weak: '思慮過多、精神耗弱、女生擔憂孩子',
    icon: '🎨',
  },
  {
    shishen: '印（正印/偏印）',
    strong: '來自女性長輩壓力、不易招好員工',
    weak: '獲得功名、得到好下屬、女生子息運好',
    icon: '📚',
  },
  {
    shishen: '比劫（比肩/劫財）',
    strong: '犯小人、因朋友破財、注意婚姻桃花',
    weak: '兄弟姐妹陪伴、提供好建議',
    icon: '🤝',
  },
];

// 大運好壞判斷
const DAYUN_GOOD_BAD = [
  {
    type: '身強者',
    good: '財、官殺、食傷',
    bad: '印、比劫',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    type: '身弱者',
    good: '印、比劫',
    bad: '財、官殺、食傷',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    type: '從強格',
    good: '生我、同我（順勢）',
    bad: '剋我、我剋、我生',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    type: '從弱格',
    good: '剋我、我剋、我生（順勢）',
    bad: '生我、同我',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
];

// 流年斷應
const LIUNIAN_EFFECTS = [
  { type: '財星流年', effect: '得財或破財（視喜忌）', icon: '💰' },
  { type: '官殺流年', effect: '工作變動、升職或壓力', icon: '💼' },
  { type: '食傷流年', effect: '才華表現、創造力、子息', icon: '🎨' },
  { type: '印星貴人', effect: '長輩幫助、學習成長', icon: '📚' },
  { type: '比劫流年', effect: '人際關係、合夥或犯小人', icon: '👥' },
];

// 流年定盤
const LIUNIAN_PANDING = [
  { relation: '與日主同五行', strong: '不錯、順遂', weak: '辛苦、疲勞' },
  { relation: '生日主五行', strong: '辛苦、疲勞', weak: '不錯、順遂' },
  { relation: '剋日主五行', strong: '辛苦、疲勞', weak: '不錯、順遂' },
  { relation: '日主剋五行', strong: '不錯、順遂', weak: '辛苦、疲勞' },
  { relation: '日主生五行', strong: '不錯、順遂', weak: '辛苦、疲勞' },
];

// 流年定盤判定參考
const LIUNIAN_SUDDEN = [
  { aspect: '身體健康', symptom: '健康突然有狀況、開刀、住院' },
  { aspect: '工作學業', symptom: '壓力突然變大、責任暴增、成果不好' },
  { aspect: '感情家庭', symptom: '分手、離婚、口角' },
  { aspect: '金錢', symptom: '得財或破財（被騙、投資失利、合夥失敗）' },
];

// 太歲類型
const TAI_SUI_TYPES = [
  {
    type: '值太歲（本命年）',
    condition: '年支 = 流年支',
    effect: '運勢起伏大',
    icon: '🎯',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  {
    type: '沖太歲',
    condition: '年支與流年支相沖',
    effect: '變動、衝突',
    icon: '💥',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    type: '刑太歲',
    condition: '年支與流年支相刑',
    effect: '糾紛、不順',
    icon: '⚡',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
  {
    type: '害太歲',
    condition: '年支與流年支相害',
    effect: '人際摩擦',
    icon: '🔗',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    type: '破太歲',
    condition: '年支與流年支相破',
    effect: '計劃受阻',
    icon: '💔',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
];

// 地支互動與運勢
const ZHI_INTERACTION_EFFECTS = [
  {
    type: '沖',
    effect: '直接、明顯、短時間（變動、走動、車關、搬遷、受傷、分離）',
    color: 'text-red-400',
  },
  {
    type: '刑',
    effect: '心情壓抑起伏、長時間累積（人際衝突、車關、法律糾紛）',
    color: 'text-orange-400',
  },
  {
    type: '合',
    effect: '和合、合作、貴人相助、感情和諧',
    color: 'text-green-400',
  },
  {
    type: '害',
    effect: '暗中破壞、小人、人際摩擦',
    color: 'text-yellow-400',
  },
  {
    type: '破',
    effect: '計劃受阻、意外損失、關係破裂',
    color: 'text-purple-400',
  },
];

export default function DayunPage({ primaryPattern, favorable, unfavorable }: Props) {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* 頁面標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-serif font-bold display-title mb-3">大運流年解析</h1>
        <p className="text-sm text-zen-muted font-sans">十年大運、流年斷應、太歲化解的完整知識</p>
        <div className="gold-divider mt-4 mx-auto max-w-[200px]"></div>
      </div>

      {/* 當前命盤資訊 */}
      {primaryPattern && (
        <div className="glass-card">
          <h3 className="text-lg font-serif font-bold text-zen-text mb-4 flex items-center gap-2">
            <span>📊</span> 當前命盤狀態
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-5 text-center">
              <span className="text-xs text-zen-muted block mb-2 font-sans">主要格局</span>
              <span className="text-2xl font-bold text-zen-gold font-serif">{primaryPattern}</span>
            </div>
            {favorable && favorable.length > 0 && (
              <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-5 text-center">
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
              <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-5 text-center">
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

      {/* 一、大運基本規則 */}
      <section className="glass-card">
        <h3 className="text-xl font-serif font-bold text-zen-text mb-6 flex items-center gap-2">
          <span className="text-2xl">📅</span> 大運基本規則
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-5 hover:border-zen-gold/30 transition-all">
            <h4 className="font-serif font-bold text-zen-gold mb-2">大運週期</h4>
            <p className="text-sm text-zen-muted font-sans leading-relaxed">每十年換一次大運，一生約經歷 7-8 個大運</p>
          </div>
          <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-5 hover:border-zen-gold/30 transition-all">
            <h4 className="font-serif font-bold text-zen-gold mb-2">前五年 / 後五年</h4>
            <p className="text-sm text-zen-muted font-sans leading-relaxed">前五年以天干為主，後五年以地支為主（仍受另一部分影響）</p>
          </div>
          <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-5 hover:border-zen-jade/30 transition-all">
            <h4 className="font-serif font-bold text-zen-jade mb-2">順排</h4>
            <p className="text-sm text-zen-muted font-sans leading-relaxed">陽男、陰女（甲丙戊庚壬年干為陽男，乙丁己辛癸年干為陰女）</p>
          </div>
          <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-5 hover:border-zen-jade/30 transition-all">
            <h4 className="font-serif font-bold text-zen-sage mb-2">逆排</h4>
            <p className="text-sm text-zen-muted font-sans leading-relaxed">陰男、陽女（乙丁己辛癸年干為陰男，甲丙戊庚壬年干為陽女）</p>
          </div>
        </div>
      </section>

      {/* 二、大運排法步驟 */}
      <section className="glass-card">
        <h3 className="text-xl font-serif font-bold text-zen-text mb-6 flex items-center gap-2">
          <span className="text-2xl">📝</span> 大運排法步驟
        </h3>

        <div className="space-y-4">
          {[
            { step: 1, text: '確認年干陰陽', detail: '甲丙戊庚壬為陽，乙丁己辛癸為陰' },
            { step: 2, text: '判斷順排或逆排', detail: '陽男陰女順排，陰男陽女逆排' },
            { step: 3, text: '從月柱起算', detail: '順排從月柱往下排，逆排從月柱往上排' },
            { step: 4, text: '每十年一個大運', detail: '每柱代表十年，天干地支各管五年' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4 bg-zen-surface/60 border border-zen-border rounded-xl p-5 hover:border-zen-gold/20 transition-all">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zen-gold/15 border border-zen-gold/30 flex items-center justify-center">
                <span className="text-sm font-bold text-zen-gold font-serif">{item.step}</span>
              </div>
              <div>
                <h4 className="font-bold text-zen-text font-serif">{item.text}</h4>
                <p className="text-sm text-zen-muted font-sans">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 三、大運與十神關係 */}
      <section className="glass-card">
        <h3 className="text-xl font-serif font-bold text-zen-text mb-6 flex items-center gap-2">
          <span className="text-2xl">🔮</span> 大運與十神關係
        </h3>

        <div className="overflow-x-auto">
          <table className="zebra-table text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3">大運十神</th>
                <th className="px-4 py-3">身強影響</th>
                <th className="px-4 py-3">身弱影響</th>
              </tr>
            </thead>
            <tbody>
              {DAYUN_SHISHEN.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-4">
                    <span className="mr-2">{item.icon}</span>
                    <span className="font-bold text-zen-text font-serif">{item.shishen}</span>
                  </td>
                  <td className="px-4 py-4 text-zen-jade font-sans">{item.strong}</td>
                  <td className="px-4 py-4 text-zen-rose font-sans">{item.weak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 四、大運好壞判斷 */}
      <section className="glass-card">
        <h3 className="text-xl font-serif font-bold text-zen-text mb-6 flex items-center gap-2">
          <span className="text-2xl">⚖️</span> 大運好壞判斷
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DAYUN_GOOD_BAD.map((item, idx) => (
            <div
              key={idx}
              className={`${item.bgColor} border ${item.borderColor} rounded-xl p-5 hover:border-zen-gold/20 transition-all`}
            >
              <h4 className={`text-lg font-bold font-serif ${item.color} mb-3`}>{item.type}</h4>
              <div className="space-y-2 text-sm font-sans">
                <div>
                  <span className="text-zen-muted">好的大運（用神）：</span>
                  <span className="text-zen-jade font-medium">{item.good}</span>
                </div>
                <div>
                  <span className="text-zen-muted">不好的大運（忌神）：</span>
                  <span className="text-zen-rose font-medium">{item.bad}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 五、流年斷應 */}
      <section className="glass-card">
        <h3 className="text-lg font-bold text-zen-text mb-4 flex items-center gap-2">
          <span className="text-xl">📆</span> 流年斷應
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LIUNIAN_EFFECTS.map((item, idx) => (
            <div key={idx} className="bg-zen-surface/40 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h4 className="font-bold text-zen-text">{item.type}</h4>
                <p className="text-sm text-zen-muted">{item.effect}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 六、流年定盤 */}
      <section className="glass-card">
        <h3 className="text-lg font-bold text-zen-text mb-4 flex items-center gap-2">
          <span className="text-xl">🎯</span> 流年定盤判定
        </h3>

        <p className="text-sm text-zen-muted mb-4">
          流年五行與日主關係，決定該年運勢好壞
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zen-border">
                <th className="px-3 py-2 text-left text-zen-muted font-medium">流年五行</th>
                <th className="px-3 py-2 text-left text-zen-muted font-medium">身強</th>
                <th className="px-3 py-2 text-left text-zen-muted font-medium">身弱</th>
              </tr>
            </thead>
            <tbody>
              {LIUNIAN_PANDING.map((item, idx) => (
                <tr key={idx} className="border-b border-zen-border hover:bg-white/5">
                  <td className="px-3 py-2 font-bold text-zen-text">{item.relation}</td>
                  <td className="px-3 py-2 text-green-400">{item.strong}</td>
                  <td className="px-3 py-2 text-red-400">{item.weak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 突然有狀況判定 */}
        <div className="mt-4 bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <h4 className="font-bold text-red-400 mb-3">⚠️ 流年突然有狀況判定</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LIUNIAN_SUDDEN.map((item, idx) => (
              <div key={idx} className="bg-zen-surface/40 rounded-lg p-3">
                <span className="font-bold text-zen-text block mb-1">{item.aspect}</span>
                <span className="text-sm text-zen-muted">{item.symptom}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 七、太歲 */}
      <section className="glass-card">
        <h3 className="text-lg font-bold text-zen-text mb-4 flex items-center gap-2">
          <span className="text-xl">🌟</span> 太歲類型
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TAI_SUI_TYPES.map((item, idx) => (
            <div
              key={idx}
              className={`${item.bgColor} border ${item.borderColor} rounded-xl p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{item.icon}</span>
                <h4 className={`font-bold ${item.color}`}>{item.type}</h4>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-zen-muted">條件：{item.condition}</p>
                <p className="text-zen-text">影響：{item.effect}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 八、犯太歲注意事項 */}
      <section className="glass-card">
        <h3 className="text-lg font-bold text-zen-text mb-4 flex items-center gap-2">
          <span className="text-xl">⚠️</span> 犯太歲注意事項與化解
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 注意事項 */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <h4 className="font-bold text-red-400 mb-3">注意事項</h4>
            <ul className="space-y-2 text-sm text-zen-text">
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>當心車關、跌倒（行車、走路放慢）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>易有變動（職業、住所、人事）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>命盤中已有相刑或相沖，流年再來刑沖會加重</span>
              </li>
            </ul>
          </div>

          {/* 化解方法 */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
            <h4 className="font-bold text-green-400 mb-3">化解方法（主動觸發）</h4>
            <ul className="space-y-2 text-sm text-zen-text">
              <li className="flex items-start gap-2">
                <span className="text-green-400">1.</span>
                <span><strong>見血：</strong>牙醫診療（洗牙）、主動捐血</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">2.</span>
                <span><strong>車關：</strong>車輛維護、保養、更換零件</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">3.</span>
                <span><strong>破財：</strong>增加捐款、保本穩定投資</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">4.</span>
                <span><strong>走到不好的運：</strong>積極補充用神的能量</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 九、地支互動與運勢 */}
      <section className="glass-card">
        <h3 className="text-lg font-bold text-zen-text mb-4 flex items-center gap-2">
          <span className="text-xl">🔗</span> 地支互動與運勢
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ZHI_INTERACTION_EFFECTS.map((item, idx) => (
            <div key={idx} className="bg-zen-surface/40 rounded-xl p-4">
              <h4 className={`font-bold ${item.color} mb-2`}>{item.type}</h4>
              <p className="text-sm text-zen-text">{item.effect}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}