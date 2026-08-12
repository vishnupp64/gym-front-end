import { Salad } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatDate';

interface Meal {
  time: string;
  name: string;
  kcal: number;
}

interface DietPlan {
  id: string;
  title: string;
  trainer: string;
  description: string;
  targetKcal: number;
  meals: Meal[];
  createdAt: string;
}

const plans: DietPlan[] = [
  {
    id: 'd1',
    title: 'Lean Bulk &mdash; Phase 1',
    trainer: 'Coach Liam',
    description: 'High protein, moderate carbs, controlled surplus of ~300 kcal.',
    targetKcal: 2600,
    meals: [
      { time: '07:30', name: 'Oats, berries, whey', kcal: 520 },
      { time: '11:00', name: 'Chicken & rice bowl', kcal: 700 },
      { time: '15:00', name: 'Greek yogurt + almonds', kcal: 380 },
      { time: '19:00', name: 'Salmon, sweet potato, greens', kcal: 720 },
      { time: '22:00', name: 'Casein shake', kcal: 280 },
    ],
    createdAt: '2026-05-12',
  },
];

export default function MyDiets() {
  return (
    <>
      <PageHeader title="My Diet Plans" description="Nutrition plans designed for your goals." />

      <div className="space-y-5">
        {plans.map((p) => {
          const total = p.meals.reduce((acc, m) => acc + m.kcal, 0);
          return (
            <Card key={p.id}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 shrink-0">
                    <Salad size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{p.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">by {p.trainer}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge tone="success">{p.targetKcal} kcal target</Badge>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Daily total: {total} kcal</p>
                </div>
              </div>

              <ul className="mt-5 divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                {p.meals.map((m, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                        {m.time}
                      </span>
                      <span className="font-medium">{m.name}</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">{m.kcal} kcal</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 text-xs text-slate-400">Created {formatDate(p.createdAt)}</div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
