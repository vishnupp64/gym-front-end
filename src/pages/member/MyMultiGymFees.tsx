import React, { useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  Building2,
  CreditCard,
  Download,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';

interface PersonalGymMembership {
  id: string;
  gymName: string;
  gymCode: string;
  location: string;
  planName: string;
  feeAmount: number;
  dueDate: string;
  billingCycle: string;
  status: 'PAID' | 'DUE_SOON' | 'OVERDUE';
  lastPaymentDate?: string;
  receiptId?: string;
}

const INITIAL_MEMBERSHIPS: PersonalGymMembership[] = [
  {
    id: 'my-1',
    gymName: 'FitZone Downtown',
    gymCode: 'FZ-01',
    location: '102 Main Street, Central Plaza',
    planName: 'Basic Monthly Access',
    feeAmount: 999,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    billingCycle: 'Monthly',
    status: 'DUE_SOON',
    lastPaymentDate: '2026-07-15',
    receiptId: 'REC-FZ1-8891',
  },
  {
    id: 'my-2',
    gymName: 'CrossFit Apex',
    gymCode: 'CF-02',
    location: '505 Innovation Way, Sector 47',
    planName: 'Unlimited WOD Pass',
    feeAmount: 1799,
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    billingCycle: 'Monthly',
    status: 'OVERDUE',
    lastPaymentDate: '2026-07-02',
    receiptId: 'REC-CF2-4410',
  },
];

export default function MyMultiGymFees() {
  const [memberships, setMemberships] = useState<PersonalGymMembership[]>(INITIAL_MEMBERSHIPS);
  const [selectedGym, setSelectedGym] = useState<PersonalGymMembership | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showAddGymModal, setShowAddGymModal] = useState(false);

  // Pay form
  const [payMethod, setPayMethod] = useState('UPI');
  const [txnId, setTxnId] = useState('');
  const [receiptSuccess, setReceiptSuccess] = useState(false);

  // Add gym form
  const [newGymName, setNewGymName] = useState('');
  const [newPlan, setNewPlan] = useState('');
  const [newFee, setNewFee] = useState('1200');
  const [newDueDate, setNewDueDate] = useState('');

  const totalMonthlySpend = memberships.reduce((acc, m) => acc + m.feeAmount, 0);
  const pendingCount = memberships.filter((m) => m.status !== 'PAID').length;

  const handlePayClick = (item: PersonalGymMembership) => {
    setSelectedGym(item);
    setTxnId(`UPI-${Math.floor(100000 + Math.random() * 900000)}`);
    setReceiptSuccess(false);
    setShowPayModal(true);
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGym) return;

    setMemberships((prev) =>
      prev.map((m) =>
        m.id === selectedGym.id
          ? {
              ...m,
              status: 'PAID',
              lastPaymentDate: new Date().toISOString().slice(0, 10),
              receiptId: `REC-${selectedGym.gymCode}-${Math.floor(1000 + Math.random() * 9000)}`,
            }
          : m
      )
    );

    setReceiptSuccess(true);
    setTimeout(() => {
      setShowPayModal(false);
      setReceiptSuccess(false);
    }, 1800);
  };

  const handleAddMembership = (e: React.FormEvent) => {
    e.preventDefault();
    const newM: PersonalGymMembership = {
      id: `my-${Date.now()}`,
      gymName: newGymName || 'Powerhouse Gym',
      gymCode: `GYM-${Math.floor(10 + Math.random() * 90)}`,
      location: 'City Center Branch',
      planName: newPlan || 'Standard Pass',
      feeAmount: Number(newFee),
      dueDate: newDueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      billingCycle: 'Monthly',
      status: 'DUE_SOON',
    };

    setMemberships([...memberships, newM]);
    setShowAddGymModal(false);
    setNewGymName('');
    setNewPlan('');
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Gym Fees & Reminders"
        description="Manage your personal memberships, fee due dates, and payment history across all your gyms."
        actions={
          <button
            onClick={() => setShowAddGymModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700 transition-colors"
          >
            <Plus size={18} /> Add Gym Membership
          </button>
        }
      />

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Gyms Enrolled</span>
            <Building2 size={20} className="text-brand-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {memberships.length} Gyms
          </p>
          <p className="mt-1 text-xs text-slate-500">Multiple active gym subscriptions</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Monthly Fee Budget</span>
            <CreditCard size={20} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            ₹{totalMonthlySpend.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">Across all registered fitness clubs</p>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">
              Action Needed
            </span>
            <BellRing size={20} className="text-amber-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-950 dark:text-amber-100">
            {pendingCount} Pending Dues
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400 font-medium">
            Pay now to keep your gym access uninterrupted
          </p>
        </div>
      </div>

      {/* List of Gym Memberships & Fee Status */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
          My Gym Subscriptions ({memberships.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memberships.map((item) => {
            const isOverdue = item.status === 'OVERDUE';
            const isDueSoon = item.status === 'DUE_SOON';
            const isPaid = item.status === 'PAID';

            return (
              <div
                key={item.id}
                className={`rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-all ${
                  isOverdue
                    ? 'border-rose-300 dark:border-rose-900/80 ring-1 ring-rose-500/20'
                    : isDueSoon
                    ? 'border-amber-300 dark:border-amber-900/80'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-extrabold text-base">
                      {item.gymCode}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">
                        {item.gymName}
                      </h4>
                      <p className="text-xs text-slate-500">{item.location}</p>
                    </div>
                  </div>

                  {isOverdue && (
                    <span className="rounded-full bg-rose-100 dark:bg-rose-950/80 px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300">
                      🚨 OVERDUE
                    </span>
                  )}
                  {isDueSoon && (
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                      ⏳ DUE SOON
                    </span>
                  )}
                  {isPaid && (
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      ✅ PAID
                    </span>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plan:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.planName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fee Amount:</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      ₹{item.feeAmount} / {item.billingCycle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Next Due Date:</span>
                    <span
                      className={`font-bold ${
                        isOverdue ? 'text-rose-600' : isDueSoon ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.dueDate}
                    </span>
                  </div>
                  {item.lastPaymentDate && (
                    <div className="flex justify-between border-t border-slate-200/60 dark:border-slate-800 pt-2 text-[11px]">
                      <span className="text-slate-400">Last Receipt:</span>
                      <span className="text-emerald-600 font-mono font-semibold">
                        {item.receiptId} ({item.lastPaymentDate})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={isPaid}
                    onClick={() => handlePayClick(item)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all ${
                      isPaid
                        ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-500'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    {isPaid ? 'Fee Paid in Full' : `Pay ₹${item.feeAmount} Fee`}
                  </button>

                  {item.receiptId && (
                    <button
                      onClick={() => alert(`Receipt #${item.receiptId} downloaded!`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600"
                    >
                      <Download size={14} /> Receipt
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pay Modal */}
      {showPayModal && selectedGym && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleConfirmPay}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Pay Fee: {selectedGym.gymName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {receiptSuccess ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-center font-semibold text-sm">
                🎉 Payment successful! Gym fee settled.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 flex justify-between">
                  <span className="text-slate-500">Total Fee:</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                    ₹{selectedGym.feeAmount}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Payment Method:
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="BANK_TRANSFER">Bank NetBanking</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Transaction Ref No:
                  </label>
                  <input
                    type="text"
                    required
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 font-mono text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                  >
                    <CheckCircle2 size={14} /> Submit Payment
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Modal: Add Gym Membership */}
      {showAddGymModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddMembership}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus size={20} className="text-brand-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Add Another Gym Membership
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddGymModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gym Name:
                </label>
                <input
                  type="text"
                  required
                  value={newGymName}
                  onChange={(e) => setNewGymName(e.target.value)}
                  placeholder="e.g. Gold Gym Club"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Plan Tier:
                </label>
                <input
                  type="text"
                  required
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  placeholder="e.g. Annual VIP Pass"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Fee (₹):
                  </label>
                  <input
                    type="number"
                    required
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Renewal Due Date:
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddGymModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
              >
                <Plus size={14} /> Save Gym Membership
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
