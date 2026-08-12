import { Plus, ClipboardList } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatDate';

interface WorkoutPlanItem {
  id: string;
  title: string;
  memberName: string;
  description: string;
  exercises: number;
  createdAt: string;
}

const mock: WorkoutPlanItem[] = [
  { id: 'w1', title: 'Strength Foundation &mdash; Week 4', memberName: 'Maya Chen', description: 'Compound lifts focus, progressive overload.', exercises: 8, createdAt: '2026-05-10' },
  { id: 'w2', title: 'Endurance Build', memberName: 'Daniel Okafor', description: 'Z2 cardio + tempo intervals.', exercises: 6, createdAt: '2026-05-08' },
  { id: 'w3', title: 'Mobility & Recovery', memberName: 'Aisha Patel', description: 'Daily mobility drills + active recovery.', exercises: 10, createdAt: '2026-05-04' },
  { id: 'w4', title: 'Hypertrophy Block', memberName: 'Ethan Walker', description: 'Upper/lower split, 4-day rotation.', exercises: 12, createdAt: '2026-04-29' },
];

export default function TrainerWorkouts() {
  return (
    <>
      <PageHeader
        title="Workout Plans"
        description="Create and manage workout programs for your members."
        actions={<Button leftIcon={<Plus size={16} />}>New Plan</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {mock.map((p) => (
          <Card key={p.id} className="hover:shadow-soft transition-shadow flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 shrink-0">
                <ClipboardList size={18} />
              </div>
              <Badge tone="neutral">{p.exercises} exercises</Badge>
            </div>

            <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{p.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">For {p.memberName}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 flex-1">{p.description}</p>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-xs text-slate-400">Created {formatDate(p.createdAt)}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
