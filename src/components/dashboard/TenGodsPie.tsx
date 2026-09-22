import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartDatum } from '../../lib/chartTransform';

const COLORS = ['#8fbc8f', '#d4a853', '#d99a78', '#7aa8c2', '#c7c7c7', '#b98b5f', '#8e9aaf', '#d47b6d', '#9b8fc4', '#a8b58a'];

export default function TenGodsPie({ data }: { data: ChartDatum[] }) {
  if (!data.length) return <p className="text-xs text-zen-muted">尚無命盤分析資料</p>;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const visible = data.filter(item => item.value / total >= 0.05);
  const other = data.filter(item => item.value / total < 0.05).reduce((sum, item) => sum + item.value, 0);
  const chartData = other ? [...visible, { name: '其他', value: other }] : visible;
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={185}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={38} outerRadius={68} paddingAngle={2}>
            {chartData.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(value: unknown) => [`${typeof value === 'number' ? Math.round((value / total) * 100) : 0}%`, '比例']} contentStyle={{ background: '#171a18', border: '1px solid rgba(212,168,83,.25)', borderRadius: 8 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-zinc-400">
        {chartData.map((item, index) => <span key={item.name}><i className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: COLORS[index % COLORS.length] }} />{item.name}</span>)}
      </div>
    </div>
  );
}
