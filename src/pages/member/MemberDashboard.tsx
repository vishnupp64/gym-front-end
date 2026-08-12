import { CalendarCheck, ClipboardList, Salad, Flame, BellRing, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const weeklyVisits = [
  { day: 'Mon', value: 1 },
  { day: 'Tue', value: 1 },
  { day: 'Wed', value: 0 },
  { day: 'Thu', value: 1 },
  { day: 'Fri', value: 1 },
  { day: 'Sat', value: 1 },
  { day: 'Sun', value: 0 },
];

export default function MemberDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description="Your multi-gym training week & fee reminders at a glance."
      />

      {/* Multi-Gym Fee Reminder Alert Card */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 p-5 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
            <BellRing size={24} className="text-white" />
          </div>
          <div>
            <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Multi-Gym Fee Hub
            </span>
            <h3 className="text-lg font-extrabold leading-snug">
              2 Gym Fees Due (FitZone & CrossFit Apex)
            </h3>
            <p className="text-xs text-amber-100">
              CrossFit Apex fee is 5 days overdue! Settle your dues to avoid workout pass suspension.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/member/fee-reminders')}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-50 shadow transition-all"
        >
          Pay Dues Now <ChevronRight size={14} />
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-6 text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-brand-100">Active membership</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Multi-Gym Premium Pass</h2>
            <p className="mt-1 text-sm text-brand-100/90">
              Access at FitZone Downtown & CrossFit Apex
            </p>
          </div>
          <Button
            onClick={() => navigate('/member/fee-reminders')}
            variant="secondary"
            className="bg-white/15 text-white hover:bg-white/25 border-0"
          >
            My Gym Dues
          </Button>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Visits this month" value="18" delta={12.5} icon={CalendarCheck} tone="brand" />
        <StatCard label="Workout streak" value="6 days" delta={20} icon={Flame} tone="amber" />
        <StatCard label="Active workouts" value="2" icon={ClipboardList} tone="emerald" />
        <StatCard label="Active diet plan" value="1" icon={Salad} tone="rose" />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ChartCard
            title="Check-ins this week"
            description="Your weekly visit pattern"
            data={weeklyVisits}
            dataKey="value"
            xKey="day"
            type="bar"
          />
        </div>
        <Card>
          <h3 className="text-base font-semibold mb-4">Upcoming sessions</h3>
          <ul className="space-y-3">
            {[
              { time: 'Tomorrow 09:00', title: 'PT with Coach Liam', kind: 'Strength' },
              { time: 'Thu 17:30', title: 'HIIT Bootcamp', kind: 'Class' },
              { time: 'Sat 10:00', title: 'Yoga Flow', kind: 'Class' },
            ].map((s) => (
              <li
                key={s.time}
                className="rounded-xl border border-slate-100 dark:border-slate-800 px-3 py-2.5"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.time}</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{s.title}</p>
                <Badge tone="info" className="mt-1.5">{s.kind}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
