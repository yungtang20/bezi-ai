export interface TimelineGuideline {
  type: string; // 'good' | 'bad'
  tenGodCategory: string; // '財星', '官殺', '食傷', '印星', '比劫'
  targetPattern: string; // '身強', '身弱', '從強', '從弱', 'all'
  impact: string;
  remedy?: string;
  relatedCategories?: string[]; // 'wealth', 'career', 'romance', 'family', 'health'
}

export const TIMELINE_GUIDELINES: TimelineGuideline[] = [
  // --- 好的大運與流年 ---
  {
    type: 'good',
    tenGodCategory: '財星',
    targetPattern: 'all',
    impact: '得財機會多、順利拓展財源，(男) 感情運與伴侶關係發展良好。',
    remedy: '1. 善用這段時期的正向財氣積累財富。\n2. 理性投資，將好運轉化為實質資產。\n3. 配帶五行相生之飾品，穩固並放大財運。',
    relatedCategories: ['wealth', 'romance', 'career', 'friends'],
  },
  {
    type: 'good',
    tenGodCategory: '官殺',
    targetPattern: 'all',
    impact: '工作事業運佳、容易被賞識、有升遷機會。(女) 桃花與感情運好。(男) 子息運好、孩子表現優異。',
    remedy: '1. 積極展現自我，主動承擔責任，有利升遷。\n2. (女) 可多參與社交活動，把握良緣。\n3. 適當佈置居家事業位，放大環境能量。',
    relatedCategories: ['career', 'romance', 'family', 'friends'],
  },
  {
    type: 'good',
    tenGodCategory: '食傷',
    targetPattern: 'all',
    impact: '文昌運好、才華被看見、被肯定、有機會出名。(女) 子息運好、易懷孕、孩子狀況良好。',
    remedy: '1. 進修學習新技能，將才華展露出來。\n2. 多參與創新與企劃，有利於名聲遠播。\n3. (女) 若有生育計畫，此階段最適宜。',
    relatedCategories: ['career', 'family', 'romance', 'friends'],
  },
  {
    type: 'good',
    tenGodCategory: '印星',
    targetPattern: 'all',
    impact: '易得長輩、貴人相助，學習力與吸收力強，逢凶化吉，能安穩蓄積能量。',
    remedy: '1. 多向長輩、導師請益，汲取經驗。\n2. 適合靜心學習、進修，考取執照認證。\n3. 抱持感恩之心，多行善事，貴人氣運會更旺。',
    relatedCategories: ['career', 'family', 'health', 'friends'],
  },
  {
    type: 'good',
    tenGodCategory: '比劫',
    targetPattern: 'all',
    impact: '人際發展佳，易得同儕、兄弟姊妹相助，合夥順利，自身能量與信心增強。',
    remedy: '1. 拓展人脈，多參與團體合作與社交聚會。\n2. 適合與信賴的夥伴合作創業或推進專案。\n3. 加強情緒管理，與團隊共享成果。',
    relatedCategories: ['family', 'wealth', 'career', 'friends'],
  },

  // --- 不好的運勢 (身強走印/比，身弱走財/官/食...) ---
  // 身強走印
  {
    type: 'bad',
    tenGodCategory: '印星',
    targetPattern: '身強',
    impact: '（印剋食傷）來自女性長輩壓力、擔憂女性長輩；思考、創意受影響、不易招到好員工、功名失利。(女) 懷孕困難或擔憂孩子。健康可能出現問題。',
    remedy: '1. 建議補充「財星」能量去剋制過旺的印。\n2. 不建議此期間備孕、懷孕。\n3. 多注意小孩狀況。\n4. 員工運較差（建議避免擴大招募）。\n5. 留意身體狀況、積極健檢。',
    relatedCategories: ['family', 'career', 'health', 'friends'],
  },
  // 身強走比劫
  {
    type: 'bad',
    tenGodCategory: '比劫',
    targetPattern: '身強',
    impact: '（比劫剋財）朋友手足關係讓你煩惱、犯小人、因朋友惹禍上身或破財。擔心男性長輩(父親)的身體。(男) 婚姻感情容易出問題、吵架或離婚。',
    remedy: '1. 補充「財星」、「食傷」、「官殺」的能量來平衡。\n2. 採取主動破財（例如捐款行善）或保本穩健投資。\n3. 留意身體狀況、積極健檢。',
    relatedCategories: ['family', 'wealth', 'romance', 'health', 'friends'],
  },
  // 身弱走財
  {
    type: 'bad',
    tenGodCategory: '財星',
    targetPattern: '身弱',
    impact: '（身弱不擔財）命盤若財多再走財運，容易漏財、因財惹禍、因為錢財而產生巨大壓力。男性長輩有狀況。(男) 伴侶容易給予較大壓力。',
    remedy: '1. 補充「比劫」(自身能量) 或是「印星」的能量。\n2. 凡事保守行事求穩，重大決定建議等到運勢轉好再做。\n3. 多多行善積德。',
    relatedCategories: ['wealth', 'family', 'romance', 'friends'],
  },
  // 身弱走官殺
  {
    type: 'bad',
    tenGodCategory: '官殺',
    targetPattern: '身弱',
    impact: '（官殺剋身）工作壓力大、容易有官司糾紛纏身、注意車關與意外。(女) 感情困擾、伴侶給予壓力。(男) 子息運較差，擔憂小孩。',
    remedy: '1. 補充「印星」(化殺生身) 或是自身的五行能量。\n2. 不要輕易做重大決定與轉換跑道。\n3. 行車注意安全，多多行善積德。',
    relatedCategories: ['career', 'romance', 'family', 'health', 'friends'],
  },
  // 身弱走食傷
  {
    type: 'bad',
    tenGodCategory: '食傷',
    targetPattern: '身弱',
    impact: '（食傷洩氣）容易思慮過多、鑽牛角尖、精神耗弱、狀態差或引發憂鬱。容易禍從口出。考試運較差。(女) 擔憂孩子。',
    remedy: '1. 補充「印星」能量去克制食傷並生扶自身。\n2. 學習靜心、冥想，減少胡思亂想，話到嘴邊留三分。\n3. 多多行善積德，注意身心健康。',
    relatedCategories: ['health', 'career', 'family', 'friends'],
  }
];

// 從十神對應到五大類（別名，與 getTenGodType 相同）
import { getTenGodCategory } from '../../constants';
export { getTenGodCategory };

export function getTimelineGuideline(tenGod: string, pattern: string, quality: 'good' | 'bad'): TimelineGuideline | undefined {
  const category = getTenGodCategory(tenGod);
  if (!category) return undefined;
  
  return TIMELINE_GUIDELINES.find(g => 
    g.type === quality && 
    g.tenGodCategory === category && 
    (g.targetPattern === 'all' || g.targetPattern === pattern)
  ) || TIMELINE_GUIDELINES.find(g => 
    g.type === quality && 
    g.tenGodCategory === category && 
    g.targetPattern === 'all'
  ); // fallback to all
}
