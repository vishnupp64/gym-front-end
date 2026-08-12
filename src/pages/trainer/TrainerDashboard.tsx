import { Users, ClipboardList, Salad, CalendarCheck } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';

const weeklySessions = [
  { day: 'Mon', sessions: 6 },
  { day: 'Tue', sessions: 8 },
  { day: 'Wed', sessions: 7 },
  { day: 'Thu', sessions: 9 },
  { day: 'Fri', sessions: 10 },
  { day: 'Sat', sessions: 12 },
  { day: 'Sun', sessions: 4 },
];

const today = [
  { time: '07:00', name: 'Maya Chen', kind: 'Strength' },
  { time: '09:30', name: 'Daniel Okafor', kind: 'Conditioning' },
  { time: '13:00', name: 'Aisha Patel', kind: 'HIIT' },
  { time: '17:30', name: 'Ethan Walker', kind: 'Mobility' },
];

export default function TrainerDashboard() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name ?? 'Coach'}`}
        description="Your schedule, members, and plans at a glance."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Assigned members" value="24" delta={4.2} icon={Users} tone="brand" />
        <StatCard label="Active workout plans" value="38" delta={2.1} icon={ClipboardList} tone="emerald" />
        <StatCard label="Diet plans" value="22" delta={1.5} icon={Salad} tone="amber" />
        <StatCard label="Sessions this week" value="56" delta={6.4} icon={CalendarCheck} tone="rose" />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ChartCard
            title="Weekly sessions"
            description="This week"
            data={weeklySessions}
            dataKey="sessions"
            xKey="day"
            type="bar"
          />
        </div>
        <Card>
          <h3 className="text-base font-semibold mb-4">Today&apos;s sessions</h3>
          <ul className="space-y-3">
            {today.map((s) => (
              <li
                key={s.time}
                className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 px-2.5 py-1 text-xs font-semibold tabular-nums">
                    {s.time}
                  </span>
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
                <Badge tone="info">{s.kind}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
