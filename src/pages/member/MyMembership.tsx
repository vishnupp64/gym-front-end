import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { Check, Calendar, Sparkles, Receipt } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatDate, formatCurrency } from '../../utils/formatDate';
import { cn } from '../../utils/cn';
import { memberService } from '../../services/memberService';
import { membershipPlanService } from '../../services/membershipPlanService';
import { paymentService } from '../../services/paymentService';
import type { Member, MembershipPlan, Payment } from '../../types';

function extractError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

function daysRemaining(expiryISO: string): number {
  const ms = new Date(expiryISO).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function MyMembership() {
  const [member, setMember] = useState<Member | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [latestPayment, setLatestPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [payOpen, setPayOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [mRes, pRes, payRes] = await Promise.all([
        memberService.me().catch(() => null),
        membershipPlanService.list(true),
        paymentService.listMine(),
      ]);
      if (mRes) setMember(mRes.data);
      setPlans(pRes.data);
      setLatestPayment(payRes.data[0] ?? null);
    } catch (err) {
      setLoadError(extractError(err, 'Failed to load membership'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const currentPlan = useMemo(
    () => plans.find((p) => p.name === member?.plan) ?? null,
    [plans, member],
  );

  const handleOpenPay = (planId: string) => {
    setSelectedPlanId(planId);
    setTransactionId('');
    setFormError(null);
    setPayOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!selectedPlanId) {
      setFormError('Select a plan');
      return;
    }
    if (!transactionId.trim()) {
      setFormError('Enter your UPI transaction / reference ID');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await paymentService.submit({
        membershipPlanId: selectedPlanId,
        transactionId: transactionId.trim(),
      });
      setPayOpen(false);
      setSuccessMsg('Payment submitted. Pending admin verification.');
      void load();
    } catch (err) {
      setFormError(extractError(err, 'Failed to submit payment'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="My Membership" description="Your current plan, status, and billing." />

      {loadError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {loadError}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Current plan</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                {member?.plan || 'No active plan'}
              </h2>
              {currentPlan && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {formatCurrency(currentPlan.price)} every {currentPlan.duration} days
                </p>
              )}
            </div>
            <Badge
              tone={
                member?.status === 'ACTIVE'
                  ? 'success'
                  : member?.status === 'PENDING'
                  ? 'warning'
                  : 'danger'
              }
            >
              {member?.status ?? '—'}
            </Badge>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar size={12} /> Joined
              </p>
              <p className="mt-1 font-semibold">{member ? formatDate(member.joinDate) : '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar size={12} /> Expires
              </p>
              <p className="mt-1 font-semibold">
                {member ? formatDate(member.expiryDate) : '—'}
                {member && (
                  <span className="ml-2 text-xs text-slate-500">
                    ({daysRemaining(member.expiryDate)} days remaining)
                  </span>
                )}
              </p>
            </div>
          </div>

          {currentPlan?.features && currentPlan.features.length > 0 && (
            <ul className="mt-6 space-y-2.5">
              {currentPlan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 mt-0.5">
                    <Check size={12} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col">
          <h3 className="text-base font-semibold">Last payment</h3>
          {latestPayment ? (
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex items-center justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-semibold">{formatCurrency(latestPayment.amount)}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <Badge
                  tone={
                    latestPayment.status === 'APPROVED' || latestPayment.status === 'PAID'
                      ? 'success'
                      : latestPayment.status === 'REJECTED' || latestPayment.status === 'FAILED'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {latestPayment.status.replace('_', ' ')}
                </Badge>
              </p>
              {latestPayment.transactionId && (
                <p className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Txn ID</span>
                  <span className="font-mono">{latestPayment.transactionId}</span>
                </p>
              )}
              {latestPayment.rejectionReason && (
                <p className="mt-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
                  <strong>Rejected:</strong> {latestPayment.rejectionReason}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No payments yet.</p>
          )}
          <div className="mt-auto pt-5">
            <Button
              className="w-full"
              leftIcon={<Receipt size={16} />}
              onClick={() => handleOpenPay(currentPlan?.id ?? plans[0]?.id ?? '')}
              disabled={plans.length === 0}
            >
              {member?.status === 'ACTIVE' ? 'Renew / Switch plan' : 'Activate membership'}
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-base font-semibold">Available plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isCurrent = currentPlan?.id === plan.id;
            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col',
                  isCurrent && 'ring-2 ring-brand-500/40 border-brand-500/30',
                )}
              >
                {isCurrent && (
                  <Badge tone="brand" className="absolute -top-3 left-6">
                    <Sparkles size={12} /> Your plan
                  </Badge>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {plan.duration} days
                  </p>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">{formatCurrency(plan.price)}</span>
                </div>
                <ul className="mt-5 space-y-2 flex-1">
                  {(plan.features ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 mt-0.5">
                        <Check size={12} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <Button className="w-full" onClick={() => handleOpenPay(plan.id)}>
                    {isCurrent ? 'Renew this plan' : 'Choose this plan'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {loading && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      )}

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Submit UPI payment"
        description="Pay via UPI and submit the transaction reference for admin verification."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} type="submit" isLoading={submitting}>
              Submit for verification
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              {formError}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Plan
            </label>
            <select
              className="input-base"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              required
            >
              <option value="">Select a plan…</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.price)} / {p.duration}d
                </option>
              ))}
            </select>
          </div>
          <Input
            label="UPI Transaction / Reference ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="e.g. 401234567890"
            required
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Once submitted, status will show as <strong>Pending Verification</strong>. Admin will approve or
            reject; membership extends automatically on approval.
          </p>
          <button type="submit" hidden />
        </form>
      </Modal>
    </>
  );
}
