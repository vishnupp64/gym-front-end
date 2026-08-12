import { ClipboardList } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/formatDate';

interface Plan {
  id: string;
  title: string;
  trainer: string;
  description: string;
  exercises: { name: string; sets: number; reps: string }[];
  createdAt: string;
}

const plans: Plan[] = [
  {
    id: 'w1',
    title: 'Strength Foundation &mdash; Week 4',
    trainer: 'Coach Liam',
    description: 'Compound lifts with progressive overload. Focus on form on big three.',
    exercises: [
      { name: 'Back squat', sets: 4, reps: '6-8' },
      { name: 'Bench press', sets: 4, reps: '6-8' },
      { name: 'Romanian deadlift', sets: 3, reps: '8-10' },
      { name: 'Pull-ups', sets: 3, reps: 'AMRAP' },
    ],
    createdAt: '2026-05-10',
  },
  {
    id: 'w2',
    title: 'Conditioning &mdash; HIIT',
    trainer: 'Coach Liam',
    description: 'Two 25-min interval sessions per week.',
    exercises: [
      { name: 'Assault bike intervals', sets: 6, reps: '30s on / 30s off' },
      { name: 'Kettlebell swings', sets: 4, reps: '20' },
      { name: 'Burpees', sets: 4, reps: '10' },
    ],
    createdAt: '2026-05-04',
  },
];

export default function MyWorkouts() {
  return (
    <>
      <PageHeader title="My Workout Plans" description="Training programs assigned by your coach." />

      <div className="space-y-5">
        {plans.map((p) => (
          <Card key={p.id}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 shrink-0">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{p.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">by {p.trainer}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.description}</p>
                </div>
              </div>
              <Badge tone="brand">{p.exercises.length} exercises</Badge>
            </div>

            <ul className="mt-5 divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
              {p.exercises.map((e, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-100">{e.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                    {e.sets} &times; {e.reps}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">Created {formatDate(p.createdAt)}</span>
              <Button size="sm">Start workout</Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
