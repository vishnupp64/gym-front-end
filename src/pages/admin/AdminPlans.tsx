import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { Check, Plus, Sparkles, Power } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/formatDate';
import { cn } from '../../utils/cn';
import { membershipPlanService } from '../../services/membershipPlanService';
import type { MembershipPlan } from '../../types';

type FormState = {
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: '',
  price: '',
  duration: '30',
  description: '',
  features: '',
  isActive: true,
};

function extractError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await membershipPlanService.list(false);
      setPlans(res.data);
    } catch (err) {
      setLoadError(extractError(err, 'Failed to load plans'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (p: MembershipPlan) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      duration: String(p.duration),
      description: p.description ?? '',
      features: (p.features ?? []).join('\n'),
      isActive: p.isActive ?? true,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.name.trim() || !form.price || !form.duration) {
      setFormError('Name, price and duration are required');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const features = form.features
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        duration: Number(form.duration),
        description: form.description.trim() || null,
        features,
        isActive: form.isActive,
      };
      if (editingId) {
        const res = await membershipPlanService.update(editingId, payload);
        setPlans((prev) => prev.map((p) => (p.id === editingId ? res.data : p)));
      } else {
        const res = await membershipPlanService.create(payload);
        setPlans((prev) => [...prev, res.data]);
      }
      closeForm();
    } catch (err) {
      setFormError(extractError(err, 'Failed to save plan'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (p: MembershipPlan) => {
    try {
      const res = await membershipPlanService.setActive(p.id, !(p.isActive ?? true));
      setPlans((prev) => prev.map((x) => (x.id === p.id ? res.data : x)));
    } catch (err) {
      setLoadError(extractError(err, 'Failed to update plan'));
    }
  };

  const handleDelete = async (p: MembershipPlan) => {
    if (!window.confirm(`Delete plan "${p.name}"? If members are on this plan, it will be disabled instead.`)) {
      return;
    }
    try {
      const res = await membershipPlanService.remove(p.id);
      if (res.data) {
        setPlans((prev) => prev.map((x) => (x.id === p.id ? (res.data as MembershipPlan) : x)));
      } else {
        setPlans((prev) => prev.filter((x) => x.id !== p.id));
      }
    } catch (err) {
      setLoadError(extractError(err, 'Failed to delete plan'));
    }
  };

  const sorted = useMemo(
    () =>
      [...plans].sort((a, b) => {
        if ((a.isActive ?? true) !== (b.isActive ?? true)) return (a.isActive ?? true) ? -1 : 1;
        return a.price - b.price;
      }),
    [plans],
  );

  return (
    <>
      <PageHeader
        title="Membership Plans"
        description="Configure pricing tiers offered to your members."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={openAdd}>
            New Plan
          </Button>
        }
      />

      {loadError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sorted.map((plan) => {
          const isActive = plan.isActive ?? true;
          return (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col',
                !isActive && 'opacity-60',
                plan.isPopular && 'ring-2 ring-brand-500/40 border-brand-500/30',
              )}
            >
              {plan.isPopular && (
                <Badge tone="brand" className="absolute -top-3 left-6">
                  <Sparkles size={12} /> Most popular
                </Badge>
              )}
              {!isActive && (
                <Badge tone="neutral" className="absolute -top-3 right-6">
                  Disabled
                </Badge>
              )}

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Billed every {plan.duration} days
                </p>
                {plan.description && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{plan.description}</p>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{formatCurrency(plan.price)}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  / {plan.duration === 30 ? 'month' : `${plan.duration} days`}
                </span>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {(plan.features ?? []).map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      <Check size={12} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button variant="outline" className="flex-1" onClick={() => openEdit(plan)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  leftIcon={<Power size={14} />}
                  onClick={() => handleToggleActive(plan)}
                >
                  {isActive ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  onClick={() => handleDelete(plan)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {loading && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading plans…</p>
      )}
      {!loading && plans.length === 0 && !loadError && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No plans yet. Create your first one.</p>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingId ? 'Edit plan' : 'New plan'}
        description="Set name, price, duration in days, and features (one per line)."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeForm} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} type="submit" isLoading={submitting}>
              {editingId ? 'Save changes' : 'Create plan'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formError && (
            <div className="sm:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              {formError}
            </div>
          )}
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Price (₹)"
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <Input
            label="Duration (days)"
            type="number"
            min={1}
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            required
          />
          <div className="sm:col-span-1 flex items-center gap-2 pt-6">
            <input
              id="plan-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <label htmlFor="plan-active" className="text-sm">Active (visible to members)</label>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Description
            </label>
            <textarea
              className="input-base min-h-[3rem]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Features (one per line)
            </label>
            <textarea
              className="input-base min-h-[6rem]"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder="Gym floor access&#10;1 group class / week&#10;Locker access"
            />
          </div>
          <button type="submit" hidden />
        </form>
      </Modal>
    </>
  );
}
