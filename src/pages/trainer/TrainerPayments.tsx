import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, type Column } from '../../components/ui/Table';
import { formatCurrency, formatDate } from '../../utils/formatDate';
import { trainerPaymentService } from '../../services/trainerPaymentService';
import type { TrainerPayment, TrainerPaymentStatus } from '../../types';

const tone: Record<TrainerPaymentStatus, 'success' | 'warning'> = {
  PAID: 'success',
  PENDING: 'warning',
};

function extractError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function TrainerPayments() {
  const [payments, setPayments] = useState<TrainerPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await trainerPaymentService.listMine();
        if (!cancelled) setPayments(res.data);
      } catch (err) {
        if (!cancelled) setError(extractError(err, 'Failed to load payments'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'PAID');
    const pending = payments.filter((p) => p.status === 'PENDING');
    const earned = paid.reduce((s, p) => s + Number(p.amount), 0);
    const owed = pending.reduce((s, p) => s + Number(p.amount), 0);
    return { earned, owed, count: payments.length };
  }, [payments]);

  const columns: Column<TrainerPayment>[] = [
    {
      key: 'inv',
      header: 'Reference',
      render: (p) => (
        <span className="font-mono text-xs text-slate-500">SAL-{p.id.toUpperCase().slice(0, 8)}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (p) => (
        <span className="font-semibold tabular-nums">{formatCurrency(Number(p.amount))}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <Badge tone={tone[p.status]}>{p.status}</Badge>,
    },
    { key: 'date', header: 'Date', render: (p) => formatDate(p.paymentDate) },
    { key: 'notes', header: 'Notes', render: (p) => p.notes ?? '—' },
  ];

  return (
    <>
      <PageHeader title="My Salary" description="Your salary payment history and pending dues." />

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total paid</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{formatCurrency(stats.earned)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{formatCurrency(stats.owed)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Records</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{stats.count}</p>
        </Card>
      </div>

      <Table columns={columns} data={payments} rowKey={(p) => p.id} />
      {loading && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading…</p>}
      {!loading && payments.length === 0 && !error && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          No payments yet. Admin will record them here.
        </p>
      )}
    </>
  );
}
