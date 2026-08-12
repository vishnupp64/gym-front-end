import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { Plus, Edit2, Trash2, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, type Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { formatCurrency, formatDate } from '../../utils/formatDate';
import { trainerPaymentService } from '../../services/trainerPaymentService';
import { trainerService } from '../../services/trainerService';
import type { Trainer, TrainerPayment, TrainerPaymentStatus } from '../../types';

const tone: Record<TrainerPaymentStatus, 'success' | 'warning'> = {
  PAID: 'success',
  PENDING: 'warning',
};

type FormState = {
  trainerId: string;
  amount: string;
  status: TrainerPaymentStatus;
  paymentDate: string;
  notes: string;
};

const emptyForm: FormState = {
  trainerId: '',
  amount: '',
  status: 'PAID',
  paymentDate: new Date().toISOString().slice(0, 10),
  notes: '',
};

function extractError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function AdminTrainerPayments() {
  const [payments, setPayments] = useState<TrainerPayment[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [status, setStatus] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [pRes, tRes] = await Promise.all([trainerPaymentService.list(), trainerService.list()]);
      setPayments(pRes.data);
      setTrainers(tRes.data);
    } catch (err) {
      setLoadError(extractError(err, 'Failed to load trainer payments'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () => payments.filter((p) => (status === 'all' ? true : p.status === status)),
    [payments, status],
  );

  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'PAID');
    const pending = payments.filter((p) => p.status === 'PENDING');
    const paidTotal = paid.reduce((s, p) => s + Number(p.amount), 0);
    const owed = pending.reduce((s, p) => s + Number(p.amount), 0);
    return { paidTotal, owed, count: payments.length };
  }, [payments]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (p: TrainerPayment) => {
    setEditingId(p.id);
    setForm({
      trainerId: p.trainerId,
      amount: String(p.amount),
      status: p.status,
      paymentDate: p.paymentDate,
      notes: p.notes ?? '',
    });
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.trainerId || !form.amount) {
      setFormError('Trainer and amount are required');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        trainerId: form.trainerId,
        amount: Number(form.amount),
        status: form.status,
        paymentDate: form.paymentDate,
        notes: form.notes || undefined,
      };
      if (editingId) {
        const res = await trainerPaymentService.update(editingId, payload);
        setPayments((prev) => prev.map((x) => (x.id === editingId ? res.data : x)));
      } else {
        const res = await trainerPaymentService.create(payload);
        setPayments((prev) => [res.data, ...prev]);
      }
      closeForm();
    } catch (err) {
      setFormError(extractError(err, 'Failed to save payment'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: TrainerPayment) => {
    if (!window.confirm(`Delete this salary record for ${p.trainerName}?`)) return;
    try {
      await trainerPaymentService.remove(p.id);
      setPayments((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      setLoadError(extractError(err, 'Failed to delete payment'));
    }
  };

  const columns: Column<TrainerPayment>[] = [
    {
      key: 'trainer',
      header: 'Trainer',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-sm font-semibold">
            {p.trainerName[0]}
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">{p.trainerName}</p>
            {p.trainerEmail && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{p.trainerEmail}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (p) => (
        <span className="font-semibold tabular-nums">{formatCurrency(Number(p.amount))}</span>
      ),
    },
    { key: 'status', header: 'Status', render: (p) => <Badge tone={tone[p.status]}>{p.status}</Badge> },
    { key: 'date', header: 'Date', render: (p) => formatDate(p.paymentDate) },
    { key: 'notes', header: 'Notes', render: (p) => p.notes ?? '—' },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" leftIcon={<Edit2 size={14} />} onClick={() => openEdit(p)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            leftIcon={<Trash2 size={14} />}
            onClick={() => handleDelete(p)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Trainer Payments"
        description="Salary and bonus records for trainers."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={openAdd} disabled={trainers.length === 0}>
            Record Salary
          </Button>
        }
      />

      {loadError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Paid total</p>
              <p className="text-2xl font-bold tracking-tight">{formatCurrency(stats.paidTotal)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Outstanding</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{formatCurrency(stats.owed)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Records</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{stats.count}</p>
        </Card>
      </div>

      <div className="mb-5 flex justify-end">
        <FilterDropdown
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Paid', value: 'PAID' },
            { label: 'Pending', value: 'PENDING' },
          ]}
        />
      </div>

      <Table columns={columns} data={filtered} rowKey={(p) => p.id} />
      {loading && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading…</p>}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingId ? 'Edit salary record' : 'Record trainer salary'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeForm} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} type="submit" isLoading={submitting}>
              {editingId ? 'Save changes' : 'Record payment'}
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
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Trainer
            </label>
            <select
              className="input-base"
              value={form.trainerId}
              onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
              disabled={!!editingId}
              required
            >
              <option value="">Select a trainer…</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} — {t.specialization}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Amount (₹)"
            type="number"
            min={0}
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <Input
            label="Payment date"
            type="date"
            value={form.paymentDate}
            onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Status
            </label>
            <select
              className="input-base"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as TrainerPaymentStatus })}
            >
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <Input
            label="Notes / period (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. May 2026 salary"
          />
          <button type="submit" hidden />
        </form>
      </Modal>
    </>
  );
}
