import { useState } from 'react';
import { Mail, Phone, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/common/SearchBar';

interface AssignedMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  plan: string;
  attendanceRate: number;
  progress: number;
}

const mock: AssignedMember[] = [
  { id: '1', fullName: 'Maya Chen', email: 'maya@example.com', phone: '+1 415 555 0102', plan: 'Premium', attendanceRate: 92, progress: 78 },
  { id: '2', fullName: 'Daniel Okafor', email: 'daniel@example.com', phone: '+44 20 7946 0958', plan: 'Standard', attendanceRate: 76, progress: 54 },
  { id: '3', fullName: 'Aisha Patel', email: 'aisha@example.com', phone: '+91 22 5550 1230', plan: 'Premium', attendanceRate: 88, progress: 69 },
  { id: '4', fullName: 'Ethan Walker', email: 'ethan@example.com', phone: '+1 312 555 0177', plan: 'Basic', attendanceRate: 64, progress: 41 },
];

export default function TrainerMembers() {
  const [search, setSearch] = useState('');
  const filtered = mock.filter((m) => m.fullName.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Assigned Members"
        description="Members currently in your training roster."
      />

      <div className="mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search member..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((m) => (
          <Card key={m.id} className="hover:shadow-soft transition-shadow">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-lg font-semibold shrink-0">
                {m.fullName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{m.fullName}</p>
                <Badge tone="brand" className="mt-1">{m.plan}</Badge>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2"><Mail size={12} /> {m.email}</p>
              <p className="flex items-center gap-2"><Phone size={12} /> {m.phone}</p>
            </div>

            <div className="mt-4 space-y-3">
              <ProgressBar label="Attendance" value={m.attendanceRate} tone="emerald" />
              <ProgressBar label="Progress" value={m.progress} tone="brand" />
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Workout
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Diet
              </Button>
              <Button variant="secondary" size="sm" leftIcon={<TrendingUp size={14} />}>
                Progress
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function ProgressBar({ label, value, tone }: { label: string; value: number; tone: 'brand' | 'emerald' }) {
  const color = tone === 'emerald' ? 'bg-emerald-500' : 'bg-brand-500';
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="font-medium text-slate-700 dark:text-slate-200">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
