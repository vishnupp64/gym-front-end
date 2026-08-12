import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import {
  Plus,
  Download,
  CreditCard,
  Wallet,
  Receipt,
  ClipboardCheck,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, type Column } from '../../components/ui/Table';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatCurrency, formatDate } from '../../utils/formatDate';
import { paymentService } from '../../services/paymentService';
import { memberService } from '../../services/memberService';
import { membershipPlanService } from '../../services/membershipPlanService';
import type { Member, MembershipPlan, Payment, PaymentMethod, PaymentStatus } from '../../types';

const statusTone: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  PAID: 'success',
  APPROVED: 'success',
  PENDING: 'warning',
  PENDING_VERIFICATION: 'warning',
  REJECTED: 'danger',
  FAILED: 'danger',
  REFUNDED: 'neutral',
};

function statusLabel(s: PaymentStatus) {
  return s === 'PENDING_VERIFICATION' ? 'Pending verification' : s.charAt(0) + s.slice(1).toLowerCase();
}

type FormState = {
  memberId: string;
  membershipPlanId: string;
  amount: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
  transactionId: string;
};

const emptyForm: FormState = {
  memberId: '',
  membershipPlanId: '',
  amount: '',
  paymentMethod: 'CASH',
  status: 'PAID',
  paymentDate: new Date().toISOString().slice(0, 10),
  transactionId: '',
};

function extractError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [pRes, mRes, planRes] = await Promise.all([
        paymentService.list(),
        memberService.list(),
        membershipPlanService.list(false),
      ]);
      setPayments(pRes.data);
      setMembers(mRes.data);
      setPlans(planRes.data);
    } catch (err) {
      setLoadError(extractError(err, 'Failed to load payments'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const pendingPayments = useMemo(
    () => payments.filter((p) => p.status === 'PENDING_VERIFICATION'),
    [payments],
  );

  const filtered = useMemo(
    () =>
      payments.filter((p) => {
        if (status !== 'all' && p.status !== status) return false;
        if (search && !p.memberName.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [payments, status, search],
  );

  const totals = useMemo(() => {
    const now = new Date();
    const thisMonth = payments.filter((p) => {
      if (p.status !== 'APPROVED' && p.status !== 'PAID') return false;
      const d = new Date(p.paymentDate);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const collected = thisMonth.reduce((sum, p) => sum + Number(p.amount), 0);
    const pending = pendingPayments.length;
    const rejected = payments.filter((p) => p.status === 'REJECTED').length;
    return { collected, pending, rejected };
  }, [payments, pendingPayments]);

  const openAdd = () => {
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.memberId || !form.amount) {
      setFormError('Member and amount are required');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await paymentService.create({
        memberId: form.memberId,
        membershipPlanId: form.membershipPlanId || undefined,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        status: form.status,
        paymentDate: form.paymentDate,
        transactionId: form.transactionId || undefined,
      });
      setPayments((prev) => [res.data, ...prev]);
      closeForm();
    } catch (err) {
      setFormError(extractError(err, 'Failed to save payment'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (p: Payment) => {
    setActionError(null);
    try {
      const res = await paymentService.approve(p.id);
      setPayments((prev) => prev.map((x) => (x.id === p.id ? res.data : x)));
    } catch (err) {
      setActionError(extractError(err, 'Failed to approve payment'));
    }
  };

  const openReject = (p: Payment) => {
    setRejectId(p.id);
    setRejectReason('');
    setRejectError(null);
  };

  const closeReject = () => {
    setRejectId(null);
    setRejectReason('');
    setRejectError(null);
  };

  const submitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || rejecting) return;
    if (!rejectReason.trim()) {
      setRejectError('Rejection reason is required');
      return;
    }
    setRejecting(true);
    try {
      const res = await paymentService.reject(rejectId, rejectReason.trim());
      setPayments((prev) => prev.map((x) => (x.id === rejectId ? res.data : x)));
      closeReject();
    } catch (err) {
      setRejectError(extractError(err, 'Failed to reject payment'));
    } finally {
      setRejecting(false);
    }
  };

  const columns: Column<Payment>[] = [
    {
      key: 'invoice',
      header: 'Invoice',
      render: (p) => (
        <span className="font-mono text-xs text-slate-500">INV-{p.id.toUpperCase().slice(0, 8)}</span>
      ),
    },
    {
      key: 'member',
      header: 'Member',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-sm font-semibold">
            {p.memberName[0]}
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">{p.memberName}</p>
            {p.planName && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{p.planName}</p>
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
    {
      key: 'txn',
      header: 'UPI Ref',
      render: (p) => (
        <span className="font-mono text-xs text-slate-500">{p.transactionId ?? '—'}</span>
      ),
    },
    { key: 'method', header: 'Method', render: (p) => <Badge tone="neutral">{p.paymentMethod}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <div className="flex flex-col items-start gap-1">
          <Badge tone={statusTone[p.status]}>{statusLabel(p.status)}</Badge>
          {p.rejectionReason && (
            <span className="text-xs text-rose-600 dark:text-rose-400 max-w-xs truncate" title={p.rejectionReason}>
              {p.rejectionReason}
            </span>
          )}
        </div>
      ),
    },
    { key: 'paymentDate', header: 'Date', render: (p) => formatDate(p.paymentDate) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) =>
        p.status === 'PENDING_VERIFICATION' ? (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<CheckCircle2 size={14} />}
              onClick={() => handleApprove(p)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              leftIcon={<XCircle size={14} />}
              onClick={() => openReject(p)}
            >
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Payments"
        description="UPI verifications, manual entries, and revenue."
        actions={
          <>
            <Button variant="outline" leftIcon={<Download size={16} />} disabled>
              Export
            </Button>
            <Button leftIcon={<Plus size={16} />} onClick={openAdd}>
              Record Payment
            </Button>
          </>
        }
      />

      {loadError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Collected this month</p>
              <p className="text-2xl font-bold tracking-tight">{formatCurrency(totals.collected)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending verification</p>
              <p className="text-2xl font-bold tracking-tight">{totals.pending}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Rejected</p>
              <p className="text-2xl font-bold tracking-tight">{totals.rejected}</p>
            </div>
          </div>
        </Card>
      </div>

      {pendingPayments.length > 0 && (
        <Card className="mb-6 border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/10">
          <div className="flex items-center gap-2 mb-3">
            <Receipt size={16} className="text-amber-600 dark:text-amber-300" />
            <h3 className="font-semibold">Pending UPI verifications ({pendingPayments.length})</h3>
          </div>
          <Table columns={columns} data={pendingPayments} rowKey={(p) => p.id} />
        </Card>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search member..." />
        <FilterDropdown
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Pending verification', value: 'PENDING_VERIFICATION' },
            { label: 'Approved', value: 'APPROVED' },
            { label: 'Paid', value: 'PAID' },
            { label: 'Rejected', value: 'REJECTED' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Failed', value: 'FAILED' },
            { label: 'Refunded', value: 'REFUNDED' },
          ]}
        />
      </div>

      <Table columns={columns} data={filtered} rowKey={(p) => p.id} />
      {loading && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading payments…</p>}

      {/* Reject reason modal */}
      <Modal
        open={rejectId !== null}
        onClose={closeReject}
        title="Reject payment"
        description="Provide a reason. The member will see this on their dashboard."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeReject} disabled={rejecting}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={submitReject}
              isLoading={rejecting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Reject payment
            </Button>
          </>
        }
      >
        <form onSubmit={submitReject} className="space-y-3">
          {rejectError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              {rejectError}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Reason
            </label>
            <textarea
              className="input-base min-h-[5rem]"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Could not match UPI reference in bank statement."
              required
            />
          </div>
          <button type="submit" hidden />
        </form>
      </Modal>

      {/* Manual record-payment modal */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title="Record payment"
        description="Add a manual payment entry (cash at counter, etc.)."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeForm} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} type="submit" isLoading={submitting}>
              Record payment
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
              Member
            </label>
            <select
              className="input-base"
              value={form.memberId}
              onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              required
            >
              <option value="">Select a member…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} — {m.email}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Plan (optional)
            </label>
            <select
              className="input-base"
              value={form.membershipPlanId}
              onChange={(e) => setForm({ ...form, membershipPlanId: e.target.value })}
            >
              <option value="">— none —</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatCurrency(p.price)} / {p.duration}d)
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Method</label>
            <select
              className="input-base"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
            <select
              className="input-base"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}
            >
              <option value="PAID">Paid</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="PENDING_VERIFICATION">Pending verification</option>
              <option value="REJECTED">Rejected</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
          <Input
            label="Transaction ID (optional)"
            value={form.transactionId}
            onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
            className="sm:col-span-2"
          />
          <button type="submit" hidden />
        </form>
      </Modal>
    </>
  );
}
