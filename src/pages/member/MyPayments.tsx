import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, type Column } from '../../components/ui/Table';
import { formatDate, formatCurrency } from '../../utils/formatDate';
import { paymentService } from '../../services/paymentService';
import type { Payment, PaymentStatus } from '../../types';

const tone: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  PAID: 'success',
  APPROVED: 'success',
  PENDING: 'warning',
  PENDING_VERIFICATION: 'warning',
  REJECTED: 'danger',
  FAILED: 'danger',
  REFUNDED: 'neutral',
};

function label(status: PaymentStatus): string {
  if (status === 'PENDING_VERIFICATION') return 'Pending verification';
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function extractError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function MyPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await paymentService.listMine();
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
    const successful = payments.filter((p) => p.status === 'APPROVED' || p.status === 'PAID');
    const lifetime = successful.reduce((sum, p) => sum + Number(p.amount), 0);
    const pending = payments.filter(
      (p) => p.status === 'PENDING' || p.status === 'PENDING_VERIFICATION',
    ).length;
    const rejected = payments.filter((p) => p.status === 'REJECTED').length;
    return { lifetime, pending, rejected };
  }, [payments]);

  const columns: Column<Payment>[] = [
    {
      key: 'inv',
      header: 'Invoice',
      render: (p) => (
        <span className="font-mono text-xs text-slate-500">INV-{p.id.toUpperCase().slice(0, 8)}</span>
      ),
    },
    { key: 'plan', header: 'Plan', render: (p) => p.planName ?? '—' },
    {
      key: 'amount',
      header: 'Amount',
      render: (p) => (
        <span className="font-semibold tabular-nums">{formatCurrency(Number(p.amount))}</span>
      ),
    },
    {
      key: 'txn',
      header: 'UPI Ref',
      render: (p) => (
        <span className="font-mono text-xs text-slate-500">{p.transactionId ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <div className="flex flex-col items-start gap-1">
          <Badge tone={tone[p.status]}>{label(p.status)}</Badge>
          {p.status === 'REJECTED' && p.rejectionReason && (
            <span className="text-xs text-rose-600 dark:text-rose-400">{p.rejectionReason}</span>
          )}
        </div>
      ),
    },
    { key: 'date', header: 'Date', render: (p) => formatDate(p.paymentDate) },
  ];

  return (
    <>
      <PageHeader title="Payment History" description="Your invoices, status, and billing." />

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Lifetime spend</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{formatCurrency(stats.lifetime)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{stats.pending}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Rejected</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{stats.rejected}</p>
        </Card>
      </div>

      <Table columns={columns} data={payments} rowKey={(p) => p.id} />
      {loading && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading payments…</p>}
      {!loading && payments.length === 0 && !error && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          No payments yet. Submit one from My Membership.
        </p>
      )}
    </>
  );
}
