import { Outlet } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '../utils/constants';

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-950">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-12 text-white relative overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <Activity size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Run a better gym. Grow a stronger community.
          </h2>
          <p className="text-brand-100/90 max-w-md">
            Manage members, attendance, and payments from one polished dashboard built for modern fitness studios.
          </p>
          <div className="flex items-center gap-3">
            {['Members', 'Attendance', 'Payments', 'Reports'].map((t) => (
              <span key={t} className="rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-brand-100/70">
          &copy; {new Date().getFullYear()} {APP_NAME} &mdash; {APP_TAGLINE}
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
