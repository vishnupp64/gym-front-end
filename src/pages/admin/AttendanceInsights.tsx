import { useState, useEffect } from 'react';
import {
  Send,
  TrendingUp,
  Clock,
  Search,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { PageHeader } from '../../components/layout/PageHeader';

interface InactiveMember {
  memberId: string;
  fullName: string;
  email: string;
  phone?: string;
  gymName: string;
  visitCount30Days: number;
  lastVisitDate: string;
  daysSinceLastVisit: number;
  status: string;
}

const MOCK_INACTIVE_MEMBERS: InactiveMember[] = [
  {
    memberId: 'm-201',
    fullName: 'Robert Taylor',
    email: 'robert@example.com',
    phone: '+91 98765 77711',
    gymName: 'FitZone Downtown',
    visitCount30Days: 1,
    lastVisitDate: '2026-07-20',
    daysSinceLastVisit: 23,
    status: 'ACTIVE',
  },
  {
    memberId: 'm-202',
    fullName: 'Samantha Miller',
    email: 'samantha@example.com',
    phone: '+91 98765 77722',
    gymName: 'CrossFit Apex',
    visitCount30Days: 0,
    lastVisitDate: '2026-07-12',
    daysSinceLastVisit: 31,
    status: 'ACTIVE',
  },
  {
    memberId: 'm-203',
    fullName: 'David Lee',
    email: 'david@example.com',
    phone: '+91 98765 77733',
    gymName: 'Gold Gym Club',
    visitCount30Days: 2,
    lastVisitDate: '2026-07-28',
    daysSinceLastVisit: 15,
    status: 'ACTIVE',
  },
];

export default function AttendanceInsights() {
  const { activeGymId } = useGym();
  const [inactiveMembers, setInactiveMembers] = useState<InactiveMember[]>(MOCK_INACTIVE_MEMBERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentAlertMsg, setSentAlertMsg] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiHost}/attendance/insights?gymId=${activeGymId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data.inactiveMembers) {
          setInactiveMembers(json.data.inactiveMembers);
        }
      }
    } catch (err) {
      console.warn('Attendance insights local fallback active');
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [activeGymId]);

  const filteredMembers = inactiveMembers.filter((m) =>
    m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.gymName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendReengagement = (m: InactiveMember) => {
    setSentAlertMsg(`📲 Re-engagement WhatsApp alert sent to ${m.fullName} (${m.phone || m.email})!`);
    setTimeout(() => setSentAlertMsg(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Attendance Insights & Inactive Member Alerts"
        description="Analyze member workout frequency, track peak check-in hours, and re-engage inactive gym members."
      />

      {sentAlertMsg && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-center font-bold text-xs">
          {sentAlertMsg}
        </div>
      )}

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              High Attendance (12+ / mo)
            </span>
            <Flame size={20} className="text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">65 Members</p>
          <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Dedicated daily & 4x/week gym-goers
          </p>
        </div>

        <div className="rounded-2xl border border-brand-200 dark:border-brand-950/60 bg-brand-50/50 dark:bg-brand-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
              Moderate (4 - 11 / mo)
            </span>
            <TrendingUp size={20} className="text-brand-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-brand-950 dark:text-brand-100">42 Members</p>
          <p className="mt-1 text-xs font-medium text-brand-700 dark:text-brand-400">
            Average 1-2 visits per week
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Inactive / At-Risk (&lt; 4 visits)
            </span>
            <ShieldAlert size={20} className="text-rose-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-rose-950 dark:text-rose-100">
            {inactiveMembers.length} Members
          </p>
          <p className="mt-1 text-xs font-medium text-rose-700 dark:text-rose-400">
            No check-in recorded in past 14+ days
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-950/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Peak Hours Trend
            </span>
            <Clock size={20} className="text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-950 dark:text-amber-100">6 PM - 9 PM</p>
          <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            Highest check-in traffic window
          </p>
        </div>
      </div>

      {/* Filter and Inactive List Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              At-Risk / Inactive Member Detection ({filteredMembers.length})
            </h3>
            <p className="text-xs text-slate-500">
              Members with low or zero visits in the last 30 days. Send motivational re-engagement messages.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member or gym..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">30-Day Check-Ins</th>
                <th className="px-4 py-3">Last Active Date</th>
                <th className="px-4 py-3">Days Inactive</th>
                <th className="px-4 py-3 text-right">Re-Engage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMembers.map((m) => (
                <tr key={m.memberId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {m.fullName}
                    <span className="block text-[11px] font-normal text-slate-400">{m.email}</span>
                  </td>
                  <td className="px-4 py-3">{m.gymName}</td>
                  <td className="px-4 py-3 font-bold text-rose-600">{m.visitCount30Days} Visits</td>
                  <td className="px-4 py-3">{m.lastVisitDate}</td>
                  <td className="px-4 py-3 font-extrabold text-rose-700 dark:text-rose-400">
                    ⚠️ {m.daysSinceLastVisit} Days
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleSendReengagement(m)}
                      className="inline-flex items-center gap-1 rounded-xl bg-brand-600 hover:bg-brand-700 px-3 py-1.5 text-[11px] font-bold text-white shadow"
                    >
                      <Send size={12} /> Send Alert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
