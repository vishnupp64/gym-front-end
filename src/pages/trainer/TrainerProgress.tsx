import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { Badge } from '../../components/ui/Badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

const progressTrend = [
  { week: 'W1', value: 42 },
  { week: 'W2', value: 49 },
  { week: 'W3', value: 56 },
  { week: 'W4', value: 61 },
  { week: 'W5', value: 67 },
  { week: 'W6', value: 73 },
  { week: 'W7', value: 78 },
];

const members = [
  { id: '1', name: 'Maya Chen', metric: 'Squat 1RM', last: 95, current: 112, delta: 17.9 },
  { id: '2', name: 'Daniel Okafor', metric: 'Body fat %', last: 22, current: 19, delta: -13.6 },
  { id: '3', name: 'Aisha Patel', metric: '5K time (min)', last: 28, current: 25, delta: -10.7 },
  { id: '4', name: 'Ethan Walker', metric: 'Bench 1RM', last: 70, current: 78, delta: 11.4 },
];

export default function TrainerProgress() {
  return (
    <>
      <PageHeader
        title="Member Progress"
        description="Track strength, body composition, and conditioning milestones."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ChartCard
            title="Average member progress"
            description="Composite score over the last 7 weeks"
            data={progressTrend}
            dataKey="value"
            xKey="week"
            type="area"
          />
        </div>
        <Card>
          <h3 className="text-base font-semibold mb-4">Top performers</h3>
          <ul className="space-y-3">
            {members.map((m) => {
              const positive = m.delta >= 0;
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{m.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.metric}</p>
                  </div>
                  <Badge tone={positive ? 'success' : 'info'}>
                    {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(m.delta).toFixed(1)}%
                  </Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
