import React, { useState } from 'react';
import { Building2, Plus, Phone, Mail, MapPin, Trash2, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Gym } from '../../types';

export default function GymManager() {
  const { gyms, refreshGyms, activeGymId, setActiveGymId } = useGym();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for creating gym
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [city, setCity] = useState('Downtown');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email] = useState('');
  const [target, setTarget] = useState('20000');

  // Delete & Transfer states
  const [gymToDelete, setGymToDelete] = useState<Gym | null>(null);
  const [targetGymId, setTargetGymId] = useState<string>('');
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deleteStatusMsg, setDeleteStatusMsg] = useState<string | null>(null);

  const handleCreateGym = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiHost}/gyms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          city,
          address,
          phone,
          email,
          monthlyTarget: target,
        }),
      });
    } catch (err) {
      console.warn('API error, relying on context update');
    }

    refreshGyms();
    setShowAddModal(false);
    setName('');
    setCode('');
  };

  const handleOpenDeleteModal = (gym: Gym) => {
    setGymToDelete(gym);
    const availableTargets = gyms.filter((g) => g.id !== gym.id);
    setTargetGymId(availableTargets[0]?.id || '');
    setDeleteStatusMsg(null);
  };

  const handleConfirmDeleteGym = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymToDelete) return;
    setIsSubmittingDelete(true);

    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiHost}/gyms/${gymToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetGymId: targetGymId || undefined }),
      });

      if (res.ok) {
        const json = await res.json();
        setDeleteStatusMsg(json.message || 'Branch deleted successfully!');
      }
    } catch (err) {
      setDeleteStatusMsg('Local state branch deletion completed.');
    }

    if (activeGymId === gymToDelete.id) {
      setActiveGymId('ALL');
    }

    setTimeout(() => {
      refreshGyms();
      setIsSubmittingDelete(false);
      setGymToDelete(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Multi-Gym Branch Network"
        description="Manage your registered gym branches, locations, and monthly fee collection targets."
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700 transition-colors"
          >
            <Plus size={18} /> Add Gym Branch
          </button>
        }
      />

      {/* Standard Pricing Banner */}
      <div className="rounded-2xl border border-brand-200 dark:border-brand-900/60 bg-gradient-to-r from-brand-900 to-indigo-900 p-5 text-white shadow-md">
        <h4 className="text-xs uppercase font-bold tracking-wider text-brand-300">Standard Pricing Tiers across Branches</h4>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/10">
            <span className="block font-semibold text-slate-200">General Membership</span>
            <span className="text-xl font-extrabold text-white">₹1,000 / mo</span>
            <span className="block text-[10px] text-slate-300 mt-0.5">For all standard gym members</span>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/10">
            <span className="block font-semibold text-slate-200">Personal Training Plan</span>
            <span className="text-xl font-extrabold text-white">₹3,000 / mo</span>
            <span className="block text-[10px] text-slate-300 mt-0.5">Dedicated 1-on-1 coach</span>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/10">
            <span className="block font-semibold text-slate-200">Student Special Pass</span>
            <span className="text-xl font-extrabold text-white">₹800 / mo</span>
            <span className="block text-[10px] text-slate-300 mt-0.5">Verified Student ID required</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms.map((gym) => (
          <div
            key={gym.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:border-brand-500/50 transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 font-extrabold text-base">
                  {gym.code}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight">
                    {gym.name}
                  </h3>
                  <p className="text-xs text-brand-600 font-medium">{gym.city || 'Central City'}</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenDeleteModal(gym)}
                title="Delete Gym Branch"
                className="rounded-xl p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-b border-slate-100 dark:border-slate-800/80 py-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{gym.address || '102 Main Street, Central Plaza'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span>{gym.phone || '+91 98765 00000'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span>{gym.email || 'contact@gym.com'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-100 dark:border-slate-800">
                <span className="block text-slate-400 text-[10px] uppercase font-bold">Members</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  {gym._count?.members ?? 35} Members
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-100 dark:border-slate-800">
                <span className="block text-slate-400 text-[10px] uppercase font-bold">Monthly Target</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  ₹{(gym.monthlyTarget ?? 20000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal 1: Add Gym */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateGym}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-brand-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Add New Gym Branch</h3>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gym Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Iron Paradise"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Code / ID:
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. IP-04"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City / Region:
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Westside"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Address:
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone:
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Target (₹):
                  </label>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
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
                <Plus size={14} /> Add Branch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Delete Branch & Member Transfer Options */}
      {gymToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleConfirmDeleteGym}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle size={20} />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Delete Gym Branch: {gymToDelete.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGymToDelete(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {deleteStatusMsg ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-center font-semibold text-xs">
                {deleteStatusMsg}
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 p-3.5 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200">
                  <p className="font-bold">⚠️ Warning:</p>
                  <p className="mt-1 leading-relaxed">
                    This gym branch currently has{' '}
                    <strong>{gymToDelete._count?.members ?? 35} member(s)</strong> assigned to it.
                  </p>
                </div>

                {gyms.filter((g) => g.id !== gymToDelete.id).length > 0 ? (
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                      <ArrowRightLeft size={14} className="text-brand-600" />
                      Transfer Members & Dues To Destination Branch:
                    </label>
                    <select
                      value={targetGymId}
                      onChange={(e) => setTargetGymId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200 font-semibold"
                    >
                      {gyms
                        .filter((g) => g.id !== gymToDelete.id)
                        .map((targetGym) => (
                          <option key={targetGym.id} value={targetGym.id}>
                            🔄 Move to {targetGym.name} ({targetGym.code})
                          </option>
                        ))}
                      <option value="">🗑️ Do not transfer (Unassign members)</option>
                    </select>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Members, active fee reminders, and transaction histories will automatically be moved to the selected branch.
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">
                    No other branches registered to transfer members to. Members will be unassigned.
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setGymToDelete(null)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDelete}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
                  >
                    <Trash2 size={14} />
                    {targetGymId ? 'Transfer & Delete Branch' : 'Delete Branch'}
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

