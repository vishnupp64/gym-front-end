import { ChevronDown } from 'lucide-react';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { cn } from '../../utils/cn';

interface Option {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
}

export function FilterDropdown({ label, value, options, onChange, className }: FilterDropdownProps) {
  const current = options.find((o) => o.value === value)?.label || label;
  return (
    <Dropdown
      className={className}
      align="left"
      trigger={
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700',
            'bg-white dark:bg-slate-900 px-3.5 h-10 text-sm text-slate-700 dark:text-slate-200',
            'hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
          )}
        >
          <span className="text-slate-500 dark:text-slate-400">{label}:</span>
          <span className="font-medium">{current}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </span>
      }
    >
      {options.map((opt) => (
        <DropdownItem
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={value === opt.value ? 'font-semibold text-brand-600 dark:text-brand-400' : ''}
        >
          {opt.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
