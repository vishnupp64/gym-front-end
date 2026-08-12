import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  tone?: 'brand' | 'emerald' | 'amber' | 'rose';
}

const tones: Record<NonNullable<StatCardProps['tone']>, string> = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
};

export function StatCard({ label, value, delta, icon: Icon, tone = 'brand' }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="hover:shadow-soft transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {value}
          </p>
          {typeof delta === 'number' && (
            <div className="mt-3 flex items-center gap-1 text-xs font-medium">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5',
                  positive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
                )}
              >
                {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(delta)}%
              </span>
              <span className="text-slate-500 dark:text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('grid h-11 w-11 place-items-center rounded-xl', tones[tone])}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}
