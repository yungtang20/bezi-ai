import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartDatum } from '../../lib/chartTransform';

export default function FiveElementsRadar({ data }: { data: ChartDatum[] }) {
  if (!data.length || data.every(item => !Number.isFinite(item.value))) return <p className="text-xs text-zen-muted">尚無命盤分析資料</p>;
  return (
    <ResponsiveContainer width="100%" height={210}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(212,168,83,.18)" />
        <PolarAngleAxis dataKey="name" tick={{ fill: '#d6d3d1', fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip contentStyle={{ background: '#171a18', border: '1px solid rgba(212,168,83,.25)', borderRadius: 8 }} />
        <Radar dataKey="value" stroke="#8fbc8f" fill="#8fbc8f" fillOpacity={0.35} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
