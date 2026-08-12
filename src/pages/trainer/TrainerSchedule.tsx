import { Plus, Clock } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface Slot {
  time: string;
  member?: string;
  kind?: string;
}

const days = [
  { day: 'Mon', slots: [{ time: '07:00', member: 'Maya Chen', kind: 'Strength' }, { time: '10:00', member: 'Daniel Okafor', kind: 'HIIT' }] },
  { day: 'Tue', slots: [{ time: '08:00', member: 'Aisha Patel', kind: 'Mobility' }, { time: '17:30', member: 'Ethan Walker', kind: 'Strength' }] },
  { day: 'Wed', slots: [{ time: '06:30', member: 'Sophia Reyes', kind: 'HIIT' }] },
  { day: 'Thu', slots: [{ time: '09:00', member: 'Maya Chen', kind: 'Strength' }, { time: '19:00', member: 'Marcus Liu', kind: 'Endurance' }] },
  { day: 'Fri', slots: [{ time: '07:00', member: 'Daniel Okafor', kind: 'HIIT' }, { time: '18:00', member: 'Aisha Patel', kind: 'Mobility' }] },
  { day: 'Sat', slots: [{ time: '10:00', member: 'Group Class', kind: 'Bootcamp' }] },
  { day: 'Sun', slots: [] as Slot[] },
];

export default function TrainerSchedule() {
  return (
    <>
      <PageHeader
        title="Schedule"
        description="Your training schedule for this week."
        actions={<Button leftIcon={<Plus size={16} />}>Add Session</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        {days.map((d) => (
          <Card key={d.day} className="p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">{d.day}</p>
            <ul className="mt-3 space-y-2">
              {d.slots.length === 0 || !d.slots[0]?.member ? (
                <li className="text-sm text-slate-400 italic">No sessions</li>
              ) : (
                d.slots.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-slate-100 dark:border-slate-800 p-2.5"
                  >
                    <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Clock size={12} /> {s.time}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100">{s.member}</p>
                    {s.kind && <Badge tone="info" className="mt-1.5">{s.kind}</Badge>}
                  </li>
                ))
              )}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
