import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PasswordChangeForm } from '../../components/common/PasswordChangeForm';
import { useTheme } from '../../hooks/useTheme';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState<'profile' | 'organization' | 'security' | 'appearance'>('profile');

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'organization', label: 'Organization' },
    { key: 'security', label: 'Security' },
    { key: 'appearance', label: 'Appearance' },
  ] as const;

  return (
    <>
      <PageHeader title="Settings" description="Manage your account and gym preferences." />

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
            {tab === t.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600 dark:bg-brand-400" />
            )}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Card className="max-w-2xl">
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Update your name and contact details.</CardDescription>
          <form className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full name" defaultValue="Alex Morgan" />
            <Input label="Email" type="email" defaultValue="alex@sector47.app" />
            <Input label="Phone" defaultValue="+1 415 555 0100" />
            <Input label="Role" defaultValue="Administrator" disabled />
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save changes</Button>
            </div>
          </form>
        </Card>
      )}

      {tab === 'organization' && (
        <Card className="max-w-2xl">
          <CardTitle>Organization</CardTitle>
          <CardDescription>Public details shown to your members.</CardDescription>
          <form className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Gym name" defaultValue="Sector 47" />
            <Input label="Timezone" defaultValue="America/Los_Angeles" />
            <Input label="Address" defaultValue="123 Market St" className="sm:col-span-2" />
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save changes</Button>
            </div>
          </form>
        </Card>
      )}

      {tab === 'security' && (
        <Card className="max-w-md">
          <CardTitle>Update password</CardTitle>
          <CardDescription>Change the password for this admin account.</CardDescription>
          <div className="mt-6">
            <PasswordChangeForm buttonClassName="mt-2 w-full" />
          </div>
        </Card>
      )}

      {tab === 'appearance' && (
        <Card className="max-w-2xl">
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how the dashboard looks for you.</CardDescription>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {(['light', 'dark'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                  theme === mode
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`h-20 rounded-xl mb-3 ${
                    mode === 'light' ? 'bg-white border border-slate-200' : 'bg-slate-900'
                  }`}
                />
                <p className="font-medium capitalize">{mode}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {mode === 'light' ? 'Bright and crisp' : 'Easy on the eyes'}
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
