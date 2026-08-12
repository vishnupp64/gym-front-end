import { Bell, Menu, LogOut, UserCircle, Building2, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { SearchBar } from '../common/SearchBar';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useGym } from '../../context/GymContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const { gyms, activeGymId, setActiveGymId, feeSummary } = useGym();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const selectedGym = gyms.find((g) => g.id === activeGymId);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-600 dark:text-slate-300"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Multi-Gym Switcher Header Badge */}
      <div className="flex items-center gap-2">
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/70 dark:bg-brand-950/40 px-3 py-1.5 hover:bg-brand-100/70 transition-all text-left">
              <Building2 size={16} className="text-brand-600 dark:text-brand-400 shrink-0" />
              <div className="hidden sm:block">
                <span className="block text-xs font-bold text-brand-900 dark:text-brand-200 leading-none">
                  {activeGymId === 'ALL' ? '🌐 All Gyms Overview' : selectedGym?.name || 'Selected Gym'}
                </span>
                <span className="block text-[10px] text-brand-600/80 dark:text-brand-400/80 leading-none mt-0.5">
                  {activeGymId === 'ALL'
                    ? `${gyms.length} Gym Branches Registered`
                    : selectedGym?.city || 'Gym Location'}
                </span>
              </div>
              <ChevronDown size={14} className="text-brand-500 ml-1 shrink-0" />
            </button>
          }
        >
          <DropdownItem
            onClick={() => setActiveGymId('ALL')}
            className={activeGymId === 'ALL' ? 'font-bold bg-brand-50 text-brand-600' : ''}
          >
            🌐 All Gyms Aggregated Overview
          </DropdownItem>
          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
          {gyms.map((gym) => (
            <DropdownItem
              key={gym.id}
              onClick={() => setActiveGymId(gym.id)}
              className={activeGymId === gym.id ? 'font-bold bg-brand-50 text-brand-600' : ''}
            >
              🏋️ {gym.name} ({gym.code})
            </DropdownItem>
          ))}
        </Dropdown>
      </div>

      <div className="hidden md:block flex-1 max-w-sm ml-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search gyms, dues, members..." />
      </div>

      <div className="flex flex-1 md:flex-none items-center justify-end gap-2 ml-auto">
        <ThemeToggle />

        {/* Fee Reminder Badge Icon */}
        <button
          onClick={() => navigate(user?.role === 'MEMBER' ? '/member/fee-reminders' : '/admin/fee-reminders')}
          title="Multi-Gym Fee Reminders"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
        >
          <Bell size={18} />
          {feeSummary && feeSummary.overdueCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950 animate-pulse">
              {feeSummary.overdueCount}
            </span>
          )}
        </button>

        <Dropdown
          trigger={
            <span className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-2 pr-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-sm font-semibold">
                {user?.name?.[0] ?? 'A'}
              </span>
              <span className="hidden sm:block text-sm">
                <span className="block font-medium text-slate-800 dark:text-slate-100 leading-tight">
                  {user?.name ?? 'Admin User'}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 leading-tight">
                  {user?.role ?? 'ADMIN'}
                </span>
              </span>
            </span>
          }
        >
          <DropdownItem icon={<UserCircle size={14} />}>Profile</DropdownItem>
          <DropdownItem icon={<LogOut size={14} />} danger onClick={handleLogout}>
            Logout
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}

