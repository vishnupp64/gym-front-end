import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { useTheme } from '../../hooks/useTheme';

interface ChartCardProps {
  title: string;
  description?: string;
  data: Array<Record<string, number | string>>;
  dataKey: string;
  xKey: string;
  type?: 'area' | 'bar';
}

export function ChartCard({ title, description, data, dataKey, xKey, type = 'area' }: ChartCardProps) {
  const { theme } = useTheme();
  const stroke = theme === 'dark' ? '#cbd5e1' : '#475569';
  const grid = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const brand = '#6366f1';

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </CardHeader>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="brandFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={brand} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={brand} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey={xKey} stroke={stroke} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={stroke} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${grid}`,
                  background: theme === 'dark' ? '#0f172a' : '#ffffff',
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={brand}
                strokeWidth={2}
                fill="url(#brandFill)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey={xKey} stroke={stroke} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={stroke} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }}
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${grid}`,
                  background: theme === 'dark' ? '#0f172a' : '#ffffff',
                }}
              />
              <Bar dataKey={dataKey} fill={brand} radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
