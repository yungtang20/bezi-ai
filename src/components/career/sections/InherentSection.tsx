// src/components/career/sections/InherentSection.tsx
// 先天職場角色與工作型態 — 命盤十神分布與日主強弱判斷。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  makeSection,
} from '../../../components/shared';

const MAX_ACTIONS = 3;

interface InherentSectionProps {
  maxGod: string;
  secGod: string | null;
  roleData: { role: string; suitable: string; advice: string } | undefined;
  careerInfo:
    | {
        suitableCareers: string;
        partnerAdvice: string;
      }
    | undefined;
  chartYearZhi: string;
  dmElement: string;
  isContinuum: boolean;
  patternLabel: string;
}

export function InherentSection({
  maxGod,
  secGod,
  roleData,
  careerInfo,
  chartYearZhi,
  dmElement,
  isContinuum,
  patternLabel,
}: InherentSectionProps) {
  const zodiacTeammates =
    chartYearZhi === '申' || chartYearZhi === '子' || chartYearZhi === '辰'
      ? '猴、鼠、龍'
      : chartYearZhi === '巳' || chartYearZhi === '酉' || chartYearZhi === '丑'
        ? '蛇、雞、牛'
        : chartYearZhi === '寅' ||
            chartYearZhi === '午' ||
            chartYearZhi === '戌'
          ? '虎、馬、狗'
          : chartYearZhi === '亥' ||
              chartYearZhi === '卯' ||
              chartYearZhi === '未'
            ? '豬、兔、羊'
            : '與您地支三合之生肖';

  const sections = [
    makeSection(
      '核心職能角色',
      2,
      `您的命局中最具主導力的事業能量為：${maxGod}${secGod ? `，與輔助星 ${secGod}` : ''}。`,
      {
        evidence: (
          <div className="flex items-start gap-4 p-3 bg-black/30 rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0"></div>
            <div>
              <p className="text-xs text-zen-muted font-bold">核心職能角色</p>
              <p className="text-base font-bold text-white leading-tight mt-1">
                {roleData?.role || '獨立開拓宿主'}{' '}
                <span className="text-xs text-zen-muted font-normal ml-1">
                  ({maxGod}特質)
                </span>
              </p>
            </div>
          </div>
        ),
        timeWindow:
          '系統已為您盤點命盤中之十神能量比重，並取前二名進行深度定位分析。',
        actions: [
          '確認主次十神類型',
          '對照核心職能角色',
          '評估適合工作環境',
        ].slice(0, MAX_ACTIONS),
      }
    ),
    makeSection(
      '合適行業與具體工作',
      3,
      `以 ${maxGod} 為主導能量，您適合的行業與具體工作如下。`,
      {
        evidence: careerInfo ? (
          <div className="p-4 bg-zen-surface/60 rounded-xl border border-zen-border space-y-2">
            <p className="text-xs text-blue-400 font-bold flex items-center gap-1">
              合適行業與具體工作：
            </p>
            <p className="text-sm text-zinc-200 leading-relaxed bg-black/40 p-3.5 rounded-lg border border-white/5 font-sans">
              {careerInfo.suitableCareers}
            </p>
          </div>
        ) : (
          <p className="text-xs text-zen-muted">暫無對應行業建議。</p>
        ),
        timeWindow: '依命盤主次十神判斷，長期適用。',
        actions: [
          '對照合適行業',
          '評估具體工作內容',
          '選擇符合特質的跑道',
        ].slice(0, MAX_ACTIONS),
      }
    ),
    makeSection(
      '合適環境與專家建議',
      3,
      roleData
        ? `根據 ${maxGod} 特質，您的合適環境型態與專家核心建議如下。`
        : '暫無環境與專家建議。',
      {
        evidence: roleData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
              <p className="text-xs text-zinc-400 font-bold"> 合適環境型態</p>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {roleData.suitable}
              </p>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
              <p className="text-xs text-zinc-400 font-bold"> 專家核心建議</p>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {roleData.advice}
              </p>
            </div>
          </div>
        ) : null,
        timeWindow: '先天命盤固定，長期適用。',
        actions: ['評估合適環境型態', '採納專家核心建議', '調整職場配置'].slice(
          0,
          MAX_ACTIONS
        ),
      }
    ),
    makeSection(
      '團隊合夥與分工指導',
      3,
      careerInfo
        ? `以下為 ${maxGod} 特質的團隊合夥與分工指導建議。`
        : '暫無分工指導建議。',
      {
        evidence: careerInfo ? (
          <div className="p-4 bg-zen-surface/60 rounded-xl border border-zen-border space-y-2">
            <p className="text-xs text-blue-400 font-bold flex items-center gap-1 font-sans">
              團隊合夥與分工指導建議：
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5 font-sans">
              {careerInfo.partnerAdvice}
            </p>
          </div>
        ) : null,
        timeWindow: '依命盤十神組合判斷，長期適用。',
        actions: ['對照合作夥伴條件', '明確分工邊界', '避免忌合組合'].slice(
          0,
          MAX_ACTIONS
        ),
      }
    ),
    makeSection(
      '專屬職場生肖神隊友',
      3,
      `根據您命盤的年支「${chartYearZhi}」，生肖為 ${zodiacTeammates} 的合作夥伴，彼此磁場天然契合，極易達成共識！`,
      {
        evidence: (
          <div className="p-4 bg-blue-950/10 rounded-xl border border-blue-500/10 space-y-3 font-sans">
            <h4 className="text-xs font-bold text-blue-400">
              {' '}
              專屬職場生肖神隊友
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              根據您命盤的年支，若遇到生肖為 <strong>{zodiacTeammates}</strong>{' '}
              的合作夥伴，彼此磁場天然契合，極易達成共識！
            </p>
          </div>
        ),
        timeWindow: '依年支地支三合判斷，長期適用。',
        actions: [
          '尋找對應生肖夥伴',
          '建立自然契合關係',
          '達成共識與共贏',
        ].slice(0, MAX_ACTIONS),
      }
    ),
  ];

  return (
    <div className="space-y-6">
      {sections.map((grammar, idx) => (
        <ContentSection key={idx} grammar={grammar} defaultOpen={idx === 0} />
      ))}
      <UncertaintyNotice>
        職場角色與工作型態依命盤先天結構推斷，實際發展尚受大運、流年與個人選擇影響，僅供參考，非絕對斷語。
      </UncertaintyNotice>
    </div>
  );
}
