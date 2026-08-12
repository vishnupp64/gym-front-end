import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

const tones: Record<Tone, string> = {
  neutral:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 ring-slate-200 dark:ring-slate-700',
  success:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-500/30',
  warning:
    'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 ring-amber-200 dark:ring-amber-500/30',
  danger:
    'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 ring-rose-200 dark:ring-rose-500/30',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300 ring-sky-200 dark:ring-sky-500/30',
  brand:
    'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 ring-brand-200 dark:ring-brand-500/30',
};

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
