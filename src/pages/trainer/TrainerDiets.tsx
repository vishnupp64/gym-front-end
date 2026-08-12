import { Plus, Salad } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatDate';

interface DietPlanItem {
  id: string;
  title: string;
  memberName: string;
  description: string;
  calories: number;
  createdAt: string;
}

const mock: DietPlanItem[] = [
  { id: 'd1', title: 'Lean Bulk &mdash; Phase 1', memberName: 'Maya Chen', description: 'High protein, moderate carbs, controlled surplus.', calories: 2600, createdAt: '2026-05-12' },
  { id: 'd2', title: 'Cut &mdash; 4 weeks', memberName: 'Daniel Okafor', description: 'Calorie deficit with protein-sparing modifications.', calories: 1900, createdAt: '2026-05-09' },
  { id: 'd3', title: 'Maintenance', memberName: 'Aisha Patel', description: 'Balanced macros for recovery and performance.', calories: 2200, createdAt: '2026-05-06' },
];

export default function TrainerDiets() {
  return (
    <>
      <PageHeader
        title="Diet Plans"
        description="Nutrition programs you&apos;ve built for your members."
        actions={<Button leftIcon={<Plus size={16} />}>New Diet Plan</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {mock.map((p) => (
          <Card key={p.id} className="hover:shadow-soft transition-shadow flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 shrink-0">
                <Salad size={18} />
              </div>
              <Badge tone="success">{p.calories} kcal</Badge>
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
