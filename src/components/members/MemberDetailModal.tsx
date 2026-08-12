import React, { useState } from 'react';
import {
  PauseCircle,
  MapPin,
  Phone,
  Mail,
  ShieldAlert,
  Building2,
} from 'lucide-react';
import { Member, MembershipBreak, Payment, AttendanceRecord } from '../../types';

interface MemberDetailModalProps {
  member: Member | null;
  onClose: () => void;
  onUpdateMember?: () => void;
}

export function MemberDetailModal({ member, onClose, onUpdateMember }: MemberDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'payments' | 'breaks' | 'attendance'>('info');

  // Freeze Modal State
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeDuration, setFreezeDuration] = useState<number>(15); // 15, 30, 60
  const [customDays, setCustomDays] = useState<string>('15');
  const [freezeReason, setFreezeReason] = useState<string>('Travel / Vacation');
  const [isSubmittingFreeze, setIsSubmittingFreeze] = useState(false);
  const [freezeMsg, setFreezeMsg] = useState<string | null>(null);

  // Mock Payments & Breaks for display
  const [breaks, setBreaks] = useState<MembershipBreak[]>(
    member?.breaks || [
      {
        id: 'brk-1',
        memberId: member?.id || 'm-1',
        startDate: '2026-07-01',
        endDate: '2026-07-16',
        durationDays: 15,
        reason: 'Summer vacation break',
        status: 'COMPLETED',
        createdAt: '2026-07-01',
      },
    ]
  );

  const mockPayments: Payment[] = [
    {
      id: 'p-101',
      memberId: member?.id || 'm-1',
      memberName: member?.fullName || 'Member',
      gymName: member?.gymName || 'FitZone Downtown',
      planName: member?.plan || 'General Membership',
      amount: member?.feeAmount || 1000,
      paymentMethod: 'UPI',
      status: 'APPROVED',
      paymentDate: '2026-08-01',
      transactionId: 'UPI-99210041',
    },
    {
      id: 'p-100',
      memberId: member?.id || 'm-1',
      memberName: member?.fullName || 'Member',
      gymName: member?.gymName || 'FitZone Downtown',
      planName: member?.plan || 'General Membership',
      amount: member?.feeAmount || 1000,
      paymentMethod: 'CASH',
      status: 'APPROVED',
      paymentDate: '2026-07-01',
      transactionId: 'CASH-REC-102',
    },
  ];

  const mockAttendance: AttendanceRecord[] = [
    { id: 'att-1', memberId: member?.id || 'm-1', memberName: member?.fullName || 'Member', checkInTime: '2026-08-11T09:30:00Z', date: '2026-08-11' },
    { id: 'att-2', memberId: member?.id || 'm-1', memberName: member?.fullName || 'Member', checkInTime: '2026-08-09T18:15:00Z', date: '2026-08-09' },
    { id: 'att-3', memberId: member?.id || 'm-1', memberName: member?.fullName || 'Member', checkInTime: '2026-08-08T07:45:00Z', date: '2026-08-08' },
    { id: 'att-4', memberId: member?.id || 'm-1', memberName: member?.fullName || 'Member', checkInTime: '2026-08-05T17:00:00Z', date: '2026-08-05' },
  ];

  if (!member) return null;

  const currentExpiry = new Date(member.expiryDate);
  const activeDaysToFreeze = freezeDuration === -1 ? Number(customDays) || 15 : freezeDuration;
  const calculatedNewExpiry = new Date(currentExpiry.valueOf() + activeDaysToFreeze * 24 * 60 * 60 * 1000);

  const handleConfirmFreeze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFreeze(true);

    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiHost}/breaks/${member.id}/freeze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationDays: activeDaysToFreeze,
          reason: freezeReason,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setFreezeMsg(json.message);
      }
    } catch (err) {
      setFreezeMsg(`Membership paused locally for ${activeDaysToFreeze} days!`);
    }

    const newBrk: MembershipBreak = {
      id: `brk-${Date.now()}`,
      memberId: member.id,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: calculatedNewExpiry.toISOString().slice(0, 10),
      durationDays: activeDaysToFreeze,
      reason: freezeReason,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    setBreaks([newBrk, ...breaks]);
    setTimeout(() => {
      setIsSubmittingFreeze(false);
      setShowFreezeModal(false);
      setFreezeMsg(null);
      if (onUpdateMember) onUpdateMember();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header Badge & Profile Summary */}
        <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-white font-extrabold text-2xl border border-white/20">
                {member.fullName?.[0] ?? 'M'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold tracking-tight text-white">
                    {member.fullName}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      member.status === 'FROZEN'
                        ? 'bg-amber-400 text-amber-950'
                        : member.status === 'ACTIVE'
                        ? 'bg-emerald-400 text-emerald-950'
                        : 'bg-rose-400 text-rose-950'
                    }`}
                  >
                    {member.status === 'FROZEN' ? '⏸️ PAUSED / FROZEN' : member.status}
                  </span>
                </div>
                <p className="text-xs text-brand-200 mt-1 flex items-center gap-2">
                  <Building2 size={13} /> Branch: <strong>{member.gymName || 'Downtown Branch'}</strong> | Plan: {member.plan}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFreezeModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow transition-colors"
            >
              <PauseCircle size={15} /> Pause / Freeze Membership
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-white/10 mt-6 pt-3 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'info' ? 'bg-white/20 text-white font-bold' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              👤 Overview & Info
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'payments' ? 'bg-white/20 text-white font-bold' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              💳 Payment History
            </button>
            <button
              onClick={() => setActiveTab('breaks')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'breaks' ? 'bg-white/20 text-white font-bold' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              ⏸️ Break Periods ({breaks.length})
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'attendance' ? 'bg-white/20 text-white font-bold' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              📅 Attendance Log
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'info' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Personal Information</h4>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail size={14} className="text-slate-400" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone size={14} className="text-slate-400" />
                    <span>{member.phone || 'No phone recorded'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{member.address || '742 Evergreen Terrace'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <ShieldAlert size={14} className="text-rose-500" />
                    <span>Emergency Contact: {member.emergencyContact || 'Sister (+91 98765 99999)'}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Membership & Fee Schedule</h4>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Joining Date:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{member.joinDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Current Expiry Date:</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">{member.expiryDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Monthly Fee Amount:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">₹{member.feeAmount || 1000}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Total Days Paused/Frozen:</span>
                    <span className="font-bold text-amber-600">{member.totalFrozenDays || 15} Days</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Plan</th>
                    <th className="p-2.5">Amount</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5">Txn ID</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="p-2.5 font-medium">{p.paymentDate}</td>
                      <td className="p-2.5">{p.planName}</td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">₹{p.amount}</td>
                      <td className="p-2.5">{p.paymentMethod}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">{p.transactionId}</td>
                      <td className="p-2.5">
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold text-[10px]">
                          APPROVED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'breaks' && (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-200">Membership Freeze / Break History</h4>
                  <p className="text-amber-700 dark:text-amber-400 text-[11px]">
                    Break periods automatically extend member renewal and due dates.
                  </p>
                </div>
                <button
                  onClick={() => setShowFreezeModal(true)}
                  className="rounded-xl bg-amber-600 text-white px-3 py-1.5 font-bold hover:bg-amber-700"
                >
                  + Add Break Period
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5">Start Date</th>
                      <th className="p-2.5">End Date</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5">Reason</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {breaks.map((b) => (
                      <tr key={b.id}>
                        <td className="p-2.5">{b.startDate}</td>
                        <td className="p-2.5">{b.endDate}</td>
                        <td className="p-2.5 font-bold text-amber-600">{b.durationDays} Days</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{b.reason || 'Pause'}</td>
                        <td className="p-2.5">
                          <span
                            className={`rounded-full px-2 py-0.5 font-bold text-[10px] ${
                              b.status === 'ACTIVE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 p-3 border border-brand-200 dark:border-brand-900/50 flex justify-between items-center">
                <div>
                  <span className="font-bold text-brand-900 dark:text-brand-200">Attendance Score: Regular Gym-Goer</span>
                  <p className="text-brand-700 dark:text-brand-400 text-[11px]">18 check-ins recorded this month</p>
                </div>
                <span className="rounded-full bg-brand-600 text-white px-3 py-1 font-extrabold text-xs">
                  High Engagement
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Check-In Time</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mockAttendance.map((a) => (
                      <tr key={a.id}>
                        <td className="p-2.5 font-medium">{a.date}</td>
                        <td className="p-2.5">{new Date(a.checkInTime).toLocaleTimeString()}</td>
                        <td className="p-2.5 text-emerald-600 font-bold">Verified Check-In</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Close Profile
          </button>
        </div>
      </div>

      {/* Nested Modal: Freeze / Pause Membership */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleConfirmFreeze}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <PauseCircle size={20} />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Pause / Freeze Membership
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFreezeModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {freezeMsg ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-center font-semibold text-xs">
                {freezeMsg}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Freeze Duration:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 60, -1].map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setFreezeDuration(d)}
                        className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                          freezeDuration === d
                            ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {d === 15 ? '15 Days' : d === 30 ? '1 Month' : d === 60 ? '2 Months' : 'Custom'}
                      </button>
                    ))}
                  </div>
                </div>

                {freezeDuration === -1 && (
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Custom Days Count:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Break:
                  </label>
                  <input
                    type="text"
                    required
                    value={freezeReason}
                    onChange={(e) => setFreezeReason(e.target.value)}
                    placeholder="e.g. Travel, Injury, Personal Break"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2"
                  />
                </div>

                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-900/50 space-y-1">
                  <span className="block font-bold text-amber-900 dark:text-amber-200">
                    Expiry Adjustment Calculation:
                  </span>
                  <div className="flex justify-between text-[11px] text-amber-800 dark:text-amber-300">
                    <span>Current Expiry: {member.expiryDate}</span>
                    <span>➜ New Expiry: {calculatedNewExpiry.toISOString().slice(0, 10)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFreezeModal(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFreeze}
                    className="inline-flex items-center gap-1 rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2 font-bold text-white shadow"
                  >
                    <PauseCircle size={14} /> Confirm Freeze
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
