import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button onClick={() => setOpen((v) => !v)} className="outline-none">
        {trigger}
      </button>
      {open && (
        <div
          className={cn(
            'absolute z-30 mt-2 min-w-[180px] rounded-xl border border-slate-200 dark:border-slate-800',
            'bg-white dark:bg-slate-900 shadow-soft py-1 animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  danger?: boolean;
}

export function DropdownItem({ onClick, children, className, icon, danger }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
        'hover:bg-slate-50 dark:hover:bg-slate-800',
        danger
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-slate-700 dark:text-slate-200',
        className,
      )}
    >
      {icon && <span className="text-slate-400">{icon}</span>}
      {children}
    </button>
  );
}
