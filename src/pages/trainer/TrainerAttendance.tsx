import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { LogIn } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, type Column } from '../../components/ui/Table';
import { SearchBar } from '../../components/common/SearchBar';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatDateTime } from '../../utils/formatDate';
import { attendanceService } from '../../services/attendanceService';
import { memberService } from '../../services/memberService';
import type { AttendanceRecord, Member } from '../../types';

function extractError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function TrainerAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [markOpen, setMarkOpen] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [aRes, mRes] = await Promise.all([attendanceService.list(), memberService.list()]);
      setRecords(aRes.data);
      setMembers(mRes.data);
    } catch (err) {
      setError(extractError(err, 'Failed to load attendance'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () =>
      records.filter((r) =>
        search ? r.memberName.toLowerCase().includes(search.toLowerCase()) : true,
      ),
    [records, search],
  );

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayList = records.filter((r) => r.date === today);
    const insideNow = todayList.filter((r) => !r.checkOutTime).length;
    return { today: todayList.length, insideNow, total: records.length };
  }, [records]);

  const submitMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!memberId) {
      setFormError('Select a member');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await attendanceService.checkIn({ memberId, notes });
      setRecords((prev) => [res.data, ...prev]);
      setMarkOpen(false);
      setMemberId('');
      setNotes('');
    } catch (err) {
      setFormError(extractError(err, 'Failed to mark attendance'));
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'member',
      header: 'Member',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-sm font-semibold">
            {r.memberName[0]}
          </div>
          <span className="font-medium">{r.memberName}</span>
        </div>
      ),
    },
    { key: 'date', header: 'Date', render: (r) => r.date },
    { key: 'checkInTime', header: 'Check-in', render: (r) => formatDateTime(r.checkInTime) },
    {
      key: 'checkOutTime',
      header: 'Check-out',
      render: (r) =>
        r.checkOutTime ? formatDateTime(r.checkOutTime) : <Badge tone="info">Active</Badge>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Member check-ins."
        actions={
          <Button leftIcon={<LogIn size={16} />} onClick={() => setMarkOpen(true)}>
            Mark attendance
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Today</p>
          <p className="mt-2 text-2xl font-bold">{stats.today}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Active right now</p>
          <p className="mt-2 text-2xl font-bold">{stats.insideNow}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total recorded</p>
          <p className="mt-2 text-2xl font-bold">{stats.total}</p>
        </Card>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search member..." />
      <div className="mt-5" />
      <Table columns={columns} data={filtered} rowKey={(r) => r.id} />
      {loading && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading…</p>}

      <Modal
        open={markOpen}
        onClose={() => setMarkOpen(false)}
        title="Mark attendance"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMarkOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submitMark} type="submit" isLoading={submitting}>
              Mark
            </Button>
          </>
        }
      >
        <form onSubmit={submitMark} className="space-y-3">
          {formError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              {formError}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Member</label>
            <select
              className="input-base"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
            >
              <option value="">Select a member…</option>
              {members
                .filter((m) => m.status === 'ACTIVE')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} — {m.email}
                  </option>
                ))}
            </select>
          </div>
          <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button type="submit" hidden />
        </form>
      </Modal>
    </>
  );
}
