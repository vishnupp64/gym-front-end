import { useState } from 'react';
import { AxiosError } from 'axios';
import { Check } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { authService } from '../../services/authService';

interface PasswordChangeFormProps {
  buttonClassName?: string;
}

export function PasswordChangeForm({ buttonClassName }: PasswordChangeFormProps) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!form.current || !form.next || !form.confirm) {
      setError('Please fill in all password fields.');
      return;
    }
    if (form.next.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (form.next !== form.confirm) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: form.current,
        newPassword: form.next,
      });
      setForm({ current: '', next: '', confirm: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string } | undefined)?.message || err.message
          : err instanceof Error
            ? err.message
            : 'Failed to update password';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Current password"
        type="password"
        placeholder="********"
        value={form.current}
        onChange={(e) => setForm({ ...form, current: e.target.value })}
      />
      <Input
        label="New password"
        type="password"
        placeholder="********"
        value={form.next}
        onChange={(e) => setForm({ ...form, next: e.target.value })}
        hint="Min 6 characters."
      />
      <Input
        label="Confirm new password"
        type="password"
        placeholder="********"
        value={form.confirm}
        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        error={error ?? undefined}
      />
      {saved && (
        <p className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
          <Check size={16} /> Password updated
        </p>
      )}
      <Button type="submit" className={buttonClassName ?? 'mt-2'} isLoading={saving}>
        Update password
      </Button>
    </form>
  );
}
