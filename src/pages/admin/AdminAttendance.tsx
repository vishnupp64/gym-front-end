import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { CalendarCheck, CheckCircle2, LogIn, Edit2 } from 'lucide-react';
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

export default function AdminAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [date, setDate] = useState<string>('');

  const [markOpen, setMarkOpen] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [markDate, setMarkDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');

  const load = async (opts?: { date?: string }) => {
    setLoading(true);
    setLoadError(null);
    try {
      const [aRes, mRes] = await Promise.all([
        attendanceService.list({ date: opts?.date }),
        members.length === 0 ? memberService.list() : Promise.resolve({ data: members }),
      ]);
      setRecords(aRes.data);
      if ('data' in mRes && Array.isArray(mRes.data) && members.length === 0) {
        setMembers(mRes.data as Member[]);
      }
    } catch (err) {
      setLoadError(extractError(err, 'Failed to load attendance'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load({ date: date || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

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
    return { today: todayList.length, insideNow };
  }, [records]);

  const openMark = () => {
    setMemberId('');
    setMarkDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    setFormError(null);
    setMarkOpen(true);
  };

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
      const res = await attendanceService.checkIn({ memberId, notes, date: markDate });
      setRecords((prev) => [res.data, ...prev]);
      setMarkOpen(false);
    } catch (err) {
      setFormError(extractError(err, 'Failed to mark attendance'));
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (r: AttendanceRecord) => {
    setEditingId(r.id);
    setEditCheckIn(r.checkInTime.slice(0, 16));
    setEditCheckOut(r.checkOutTime ? r.checkOutTime.slice(0, 16) : '');
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const res = await attendanceService.update(editingId, {
        checkInTime: editCheckIn ? new Date(editCheckIn).toISOString() : undefined,
        checkOutTime: editCheckOut ? new Date(editCheckOut).toISOString() : null,
      });
      setRecords((prev) => prev.map((x) => (x.id === editingId ? res.data : x)));
      setEditingId(null);
    } catch (err) {
      setLoadError(extractError(err, 'Failed to update attendance'));
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
          <span className="font-medium text-slate-800 dark:text-slate-100">{r.memberName}</span>
        </div>
      ),
    },
    { key: 'date', header: 'Date', render: (r) => r.date },
    { key: 'checkInTime', header: 'Check-in', render: (r) => formatDateTime(r.checkInTime) },
    {
      key: 'checkOutTime',
      header: 'Check-out',
      render: (r) =>
        r.checkOutTime ? formatDateTime(r.checkOutTime) : <Badge tone="info">In gym</Badge>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (r) => {
        if (!r.checkOutTime) return <span className="text-slate-400">—</span>;
        const mins = Math.round(
          (new Date(r.checkOutTime).getTime() - new Date(r.checkInTime).getTime()) / 60000,
        );
        return <span className="font-medium">{mins} min</span>;
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <Button size="sm" variant="ghost" leftIcon={<Edit2 size={14} />} onClick={() => openEdit(r)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Track check-ins and visits."
        actions={<Button leftIcon={<LogIn size={16} />} onClick={openMark}>Mark attendance</Button>}
      />

      {loadError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300">
              <CalendarCheck size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Check-ins today</p>
              <p className="text-2xl font-bold tracking-tight">{stats.today}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Active right now</p>
              <p className="text-2xl font-bold tracking-tight">{stats.insideNow}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300">
              <LogIn size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total shown</p>
              <p className="text-2xl font-bold tracking-tight">{records.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search member..." />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Filter date" />
      </div>

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
          <Input
            label="Date"
            type="date"
            value={markDate}
            onChange={(e) => setMarkDate(e.target.value)}
          />
          <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button type="submit" hidden />
        </form>
      </Modal>

      <Modal
        open={editingId !== null}
        onClose={() => setEditingId(null)}
        title="Edit attendance"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button onClick={submitEdit} type="submit">
              Save
            </Button>
          </>
        }
      >
        <form onSubmit={submitEdit} className="space-y-3">
          <Input
            label="Check-in"
            type="datetime-local"
            value={editCheckIn}
            onChange={(e) => setEditCheckIn(e.target.value)}
          />
          <Input
            label="Check-out (blank = still in gym)"
            type="datetime-local"
            value={editCheckOut}
            onChange={(e) => setEditCheckOut(e.target.value)}
          />
          <button type="submit" hidden />
        </form>
      </Modal>
    </>
  );
}
