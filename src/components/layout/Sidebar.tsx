import { NavLink } from 'react-router-dom';
import { X, Activity } from 'lucide-react';
import { cn } from '../../utils/cn';
import { APP_NAME } from '../../utils/constants';
import type { NavItem } from '../../routes/navConfig';
import type { Role } from '../../types';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  role: Role;
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Admin Portal',
  TRAINER: 'Trainer Portal',
  MEMBER: 'Member Portal',
};

export function Sidebar({ mobileOpen, onClose, items, role }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0',
          'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
          'flex flex-col transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30 shrink-0">
              <Activity size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-lg leading-tight text-slate-800 dark:text-slate-100 tracking-tight truncate">
                {APP_NAME}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 leading-tight">
                {ROLE_LABEL[role]}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-500" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={cn(
                      'transition-colors',
                      isActive
                        ? 'text-brand-600 dark:text-brand-300'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200',
                    )}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="m-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
          <p className="text-sm font-semibold">Need help?</p>
          <p className="mt-1 text-xs text-brand-100/90">
            Reach out to support for any account or billing question.
          </p>
          <button className="mt-3 inline-flex rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25 transition-colors">
            Contact support
          </button>
        </div>
      </aside>
    </>
  );
}
