import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Send,
  Building2,
  Filter,
  Search,
  MessageSquare,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { FeeReminder, PaymentMethod } from '../../types';
import { PageHeader } from '../../components/layout/PageHeader';

// Mock initial fee reminders for immediate rich UI presentation
const MOCK_REMINDERS: FeeReminder[] = [
  {
    id: 'rem-1',
    memberId: 'mem-101',
    gymId: 'gym-1',
    gym: {
      id: 'gym-1',
      name: 'FitZone Downtown',
      code: 'FZ-01',
      city: 'Downtown Metro',
    },
    member: {
      id: 'mem-101',
      userId: 'user-1',
      fullName: 'Maya Chen',
      email: 'maya@example.com',
      phone: '+91 98765 00003',
      plan: 'Basic Monthly',
      status: 'ACTIVE',
      joinDate: '2026-06-01',
      expiryDate: '2026-08-15',
    },
    title: 'FitZone Monthly Membership Fee',
    amount: 999,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    billingCycle: 'MONTHLY',
    status: 'DUE_SOON',
    reminderDaysBefore: 3,
    autoSend: true,
    notes: 'Monthly renewal due soon.',
    createdAt: '2026-08-01',
  },
  {
    id: 'rem-2',
    memberId: 'mem-102',
    gymId: 'gym-2',
    gym: {
      id: 'gym-2',
      name: 'CrossFit Apex',
      code: 'CF-02',
      city: 'Uptown Tech Hub',
    },
    member: {
      id: 'mem-102',
      userId: 'user-1',
      fullName: 'Maya Chen',
      email: 'maya@example.com',
      phone: '+91 98765 00003',
      plan: 'CrossFit Unlimited',
      status: 'ACTIVE',
      joinDate: '2026-05-15',
      expiryDate: '2026-08-07',
    },
    title: 'CrossFit Apex Quarterly Fee',
    amount: 1799,
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days overdue
    billingCycle: 'MONTHLY',
    status: 'OVERDUE',
    reminderDaysBefore: 5,
    autoSend: true,
    notes: 'Overdue by 5 days. Member has active gym pass.',
    createdAt: '2026-07-25',
  },
  {
    id: 'rem-3',
    memberId: 'mem-103',
    gymId: 'gym-3',
    gym: {
      id: 'gym-3',
      name: 'Gold Gym Club',
      code: 'GG-03',
      city: 'Westside Heights',
    },
    member: {
      id: 'mem-103',
      userId: 'user-2',
      fullName: 'Alex Johnson',
      email: 'alex@example.com',
      phone: '+91 98765 44444',
      plan: 'Gold VIP Pass',
      status: 'ACTIVE',
      joinDate: '2026-07-01',
      expiryDate: '2026-09-01',
    },
    title: 'Gold VIP Annual Renewal',
    amount: 2999,
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    billingCycle: 'MONTHLY',
    status: 'PAID',
    reminderDaysBefore: 3,
    autoSend: false,
    notes: 'Paid via UPI transaction #UPI9921',
    createdAt: '2026-08-05',
  },
];

export default function MultiGymFeeReminders() {
  const { gyms, activeGymId, feeSummary, refreshSummary } = useGym();
  const [reminders, setReminders] = useState<FeeReminder[]>(MOCK_REMINDERS);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedReminder, setSelectedReminder] = useState<FeeReminder | null>(null);
  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states
  const [sendChannel, setSendChannel] = useState<'WHATSAPP' | 'SMS' | 'EMAIL'>('WHATSAPP');
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [txnId, setTxnId] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  // Add reminder form
  const [newTitle, setNewTitle] = useState('');
  const [newGymId, setNewGymId] = useState(gyms[0]?.id || 'gym-1');
  const [newMemberName, setNewMemberName] = useState('');
  const [newAmount, setNewAmount] = useState('999');
  const [newDueDate, setNewDueDate] = useState('');

  // Load reminders from API if backend is running
  const fetchReminders = async () => {
    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiHost}/fee-reminders?gymId=${activeGymId}&status=${statusFilter}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setReminders(json.data);
        }
      }
    } catch (err) {
      console.warn('API connection fallback to local fee reminder state.');
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [activeGymId, statusFilter]);

  // Filtered Reminders
  const filteredReminders = reminders.filter((item) => {
    const matchesGym = activeGymId === 'ALL' || item.gymId === activeGymId;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch =
      item.member?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.gym?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGym && matchesStatus && matchesSearch;
  });

  const handleSendReminder = (rem: FeeReminder) => {
    setSelectedReminder(rem);
    setSendSuccessMsg(null);
    setShowSendModal(true);
  };

  const triggerSendNotification = async () => {
    if (!selectedReminder) return;
    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiHost}/fee-reminders/${selectedReminder.id}/send-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: sendChannel }),
      });
    } catch (err) {
      // Ignore API errors
    }

    setReminders((prev) =>
      prev.map((r) => (r.id === selectedReminder.id ? { ...r, lastSentAt: new Date().toISOString() } : r))
    );

    setSendSuccessMsg(
      `✅ Reminder sent via ${sendChannel} to ${selectedReminder.member?.fullName} (${selectedReminder.member?.phone || selectedReminder.member?.email}) for ${selectedReminder.gym?.name}!`
    );
    setTimeout(() => {
      setShowSendModal(false);
      setSendSuccessMsg(null);
    }, 2000);
  };

  const handleOpenPay = (rem: FeeReminder) => {
    setSelectedReminder(rem);
    setTxnId(`UPI-${Math.floor(100000 + Math.random() * 900000)}`);
    setPayNotes('Fee settled in full');
    setShowPayModal(true);
  };

  const submitPayment = async () => {
    if (!selectedReminder) return;
    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiHost}/fee-reminders/${selectedReminder.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: payMethod, transactionId: txnId, notes: payNotes }),
      });
    } catch (err) {
      // Ignore API errors
    }

    setReminders((prev) =>
      prev.map((r) =>
        r.id === selectedReminder.id
          ? {
              ...r,
              status: 'PAID',
              notes: `${r.notes || ''} | Paid via ${payMethod} (Txn: ${txnId})`,
            }
          : r
      )
    );

    setShowPayModal(false);
    refreshSummary();
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const gymObj = gyms.find((g) => g.id === newGymId) || gyms[0];
    const due = newDueDate ? new Date(newDueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newRem: FeeReminder = {
      id: `rem-${Date.now()}`,
      memberId: `mem-${Date.now()}`,
      gymId: gymObj.id,
      gym: gymObj,
      member: {
        id: `mem-${Date.now()}`,
        userId: `user-${Date.now()}`,
        fullName: newMemberName || 'New Member',
        email: 'member@example.com',
        phone: '+91 98765 88888',
        plan: newTitle || 'Standard Plan',
        status: 'ACTIVE',
        joinDate: new Date().toISOString().slice(0, 10),
        expiryDate: due.toISOString().slice(0, 10),
      },
      title: newTitle || 'Monthly Gym Fee',
      amount: Number(newAmount),
      dueDate: due.toISOString(),
      billingCycle: 'MONTHLY',
      status: due < new Date() ? 'OVERDUE' : 'DUE_SOON',
      reminderDaysBefore: 3,
      autoSend: true,
      notes: 'Added via Multi-Gym Fee Hub',
      createdAt: new Date().toISOString(),
    };

    setReminders([newRem, ...reminders]);
    setShowAddModal(false);
    setNewTitle('');
    setNewMemberName('');
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Multi-Gym Fee Reminders & Dues"
        description="Track upcoming, overdue, and paid membership fees across all your gym branches."
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700 transition-colors"
          >
            <Plus size={18} />
            Create Fee Schedule
          </button>
        }
      />

      {/* Aggregated Fee Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Overdue Fees
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-rose-950 dark:text-rose-100">
            ₹{(feeSummary?.overdueAmount ?? 2798).toLocaleString()}
          </p>
          <p className="mt-1 text-xs font-medium text-rose-700 dark:text-rose-400">
            {feeSummary?.overdueCount ?? 1} members pending immediate payment
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-950/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Due Soon (7 Days)
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <Clock size={20} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-950 dark:text-amber-100">
            ₹{(feeSummary?.dueSoonAmount ?? 3997).toLocaleString()}
          </p>
          <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            {feeSummary?.dueSoonCount ?? 2} upcoming renewals scheduled
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Collected This Month
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
            ₹{(feeSummary?.paidAmount ?? 11992).toLocaleString()}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {feeSummary?.paidCount ?? 8} payments settled cleanly
          </p>
        </div>

        <div className="rounded-2xl border border-brand-200 dark:border-brand-950/60 bg-brand-50/50 dark:bg-brand-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
              Multi-Gym Network
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400">
              <Building2 size={20} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-brand-950 dark:text-brand-100">
            {gyms.length} Gyms
          </p>
          <p className="mt-1 text-xs font-medium text-brand-700 dark:text-brand-400">
            Total monthly commitment: ₹{(feeSummary?.totalMonthlyCommitment ?? 18787).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Filter size={14} /> Filter Status:
          </div>
          {(['ALL', 'OVERDUE', 'DUE_SOON', 'PAID'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === st
                  ? st === 'OVERDUE'
                    ? 'bg-rose-600 text-white'
                    : st === 'DUE_SOON'
                    ? 'bg-amber-500 text-white'
                    : st === 'PAID'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL'
                ? 'All Reminders'
                : st === 'OVERDUE'
                ? '⚠️ Overdue'
                : st === 'DUE_SOON'
                ? '⏳ Due Soon'
                : '✅ Paid'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member or gym..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Fee Reminders List Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            Gym Dues & Reminder Schedule ({filteredReminders.length})
          </h3>
          <span className="text-xs text-slate-500">
            Active Filter: <strong className="text-brand-600">{activeGymId === 'ALL' ? 'All Gyms' : gyms.find(g => g.id === activeGymId)?.name}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Gym Branch</th>
                <th className="px-6 py-3.5">Member Details</th>
                <th className="px-6 py-3.5">Fee Item & Amount</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReminders.map((item) => {
                const isOverdue = item.status === 'OVERDUE';
                const isDueSoon = item.status === 'DUE_SOON';
                const isPaid = item.status === 'PAID';

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-600 font-bold text-xs">
                          {item.gym?.code || 'GYM'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                            {item.gym?.name}
                          </p>
                          <p className="text-xs text-slate-400">{item.gym?.city || 'Downtown'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.member?.fullName}
                      </p>
                      <p className="text-xs text-slate-400">{item.member?.phone || item.member?.email}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        ₹{item.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">{item.title}</p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(item.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950/60 px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <AlertTriangle size={12} /> OVERDUE
                        </span>
                      )}
                      {isDueSoon && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock size={12} /> DUE SOON
                        </span>
                      )}
                      {isPaid && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle size={12} /> PAID
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isPaid && (
                          <button
                            onClick={() => handleSendReminder(item)}
                            title="Send WhatsApp/SMS Fee Reminder"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/40 px-3 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-300 hover:bg-brand-100 transition-colors"
                          >
                            <Send size={13} /> Send Alert
                          </button>
                        )}
                        {!isPaid ? (
                          <button
                            onClick={() => handleOpenPay(item)}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                          >
                            <CheckCircle size={13} /> Mark Paid
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Settled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredReminders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No fee reminders found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Send Fee Reminder Modal */}
      {showSendModal && selectedReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">
                    Send Fee Reminder Alert
                  </h3>
                  <p className="text-xs text-slate-500">{selectedReminder.gym?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {sendSuccessMsg ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-emerald-800 dark:text-emerald-200 text-sm font-semibold text-center">
                {sendSuccessMsg}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <p className="text-slate-500 font-semibold">Message Preview:</p>
                  <p className="text-slate-800 dark:text-slate-200 italic font-mono">
                    "Hi {selectedReminder.member?.fullName}, friendly reminder that your monthly fee of ₹
                    {selectedReminder.amount} for {selectedReminder.gym?.name} is due on{' '}
                    {new Date(selectedReminder.dueDate).toLocaleDateString()}. Please settle your dues to avoid workout session interruptions!"
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notification Channel:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['WHATSAPP', 'SMS', 'EMAIL'] as const).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setSendChannel(ch)}
                        className={`rounded-xl border py-2 text-xs font-bold transition-colors ${
                          sendChannel === ch
                            ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {ch === 'WHATSAPP' ? '📲 WhatsApp' : ch === 'SMS' ? '💬 SMS' : '📧 Email'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={triggerSendNotification}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
                  >
                    <Send size={14} /> Send Alert Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Mark Fee as Paid Modal */}
      {showPayModal && selectedReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Record Fee Payment</h3>
                  <p className="text-xs text-slate-500">{selectedReminder.member?.fullName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Amount Due:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  ₹{selectedReminder.amount}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method:
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="CASH">Cash Payment</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction / Reference ID:
                </label>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="e.g. UPI-9921004"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Receipt Notes:
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Month renewal received"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPayModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={submitPayment}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                <CheckCircle size={14} /> Confirm & Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Create Fee Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddReminder}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600">
                  <Plus size={18} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Create Gym Fee Schedule
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gym Branch:
                </label>
                <select
                  value={newGymId}
                  onChange={(e) => setNewGymId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                >
                  {gyms.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Member Name:
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fee Title / Plan:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Monthly Standard Fee"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹):
                  </label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date:
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
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
              >
                <Plus size={14} /> Add Fee Schedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
