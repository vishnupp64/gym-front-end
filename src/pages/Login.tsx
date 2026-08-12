import { type FormEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Shield, Dumbbell, User as UserIcon } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { APP_NAME } from '../utils/constants';
import { homePathForRole } from '../routes/roleRoutes';
import type { Role } from '../types';

interface LocationState {
  from?: { pathname: string };
}

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@sector47.app', password: 'Admin@12345', icon: Shield, tone: 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300' },
  { role: 'Trainer', email: 'liam@sector47.app', password: 'Trainer@123', icon: Dumbbell, tone: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' },
  { role: 'Member', email: 'maya@example.com', password: 'Member@123', icon: UserIcon, tone: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' },
] as const;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@sector47.app');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login({ email, password });
      const { user, token } = res.data;
      login(user, token);

      const state = location.state as LocationState | null;
      const fallback = homePathForRole(user.role as Role);
      const redirect = state?.from?.pathname && state.from.pathname !== '/login'
        ? state.from.pathname
        : fallback;
      navigate(redirect, { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sign in to your {APP_NAME} account.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={16} />}
          placeholder="you@gym.com"
        />
        <Input
          label="Password"
          type="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          placeholder="********"
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500/40" />
            Remember me
          </label>
          <a href="#" className="font-medium text-brand-600 hover:text-brand-700">
            Forgot password?
          </a>
        </div>
        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
          Sign in
        </Button>
      </form>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Demo accounts</p>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Tap to autofill</span>
        </div>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acc) => {
            const Icon = acc.icon;
            return (
              <button
                key={acc.role}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                  setError(null);
                }}
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-left hover:border-brand-300 dark:hover:border-brand-500/40 hover:bg-brand-50/40 dark:hover:bg-brand-500/5 transition-colors"
              >
                <span className={`grid h-9 w-9 place-items-center rounded-lg shrink-0 ${acc.tone}`}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{acc.role}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{acc.email}</p>
                </div>
                <code className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-mono text-slate-700 dark:text-slate-200">
                  {acc.password}
                </code>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
