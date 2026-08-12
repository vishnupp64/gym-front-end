import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Table, type Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { formatDateTime } from '../../utils/formatDate';
import { attendanceService } from '../../services/attendanceService';
import type { AttendanceRecord } from '../../types';

function extractError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function MyAttendance() {
  const [visits, setVisits] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await attendanceService.listMine();
        if (!cancelled) setVisits(res.data);
      } catch (err) {
        if (!cancelled) setError(extractError(err, 'Failed to load attendance'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = visits.filter((v) => {
      const d = new Date(v.checkInTime);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const completed = visits.filter((v) => v.checkOutTime);
    const avgMin =
      completed.length === 0
        ? 0
        : Math.round(
            completed.reduce(
              (sum, v) =>
                sum +
                (new Date(v.checkOutTime!).getTime() - new Date(v.checkInTime).getTime()) / 60000,
              0,
            ) / completed.length,
          );
    return { thisMonth: thisMonth.length, total: visits.length, avgMin };
  }, [visits]);

  const columns: Column<AttendanceRecord>[] = [
    { key: 'date', header: 'Date', render: (r) => r.date },
    { key: 'in', header: 'Check-in', render: (r) => formatDateTime(r.checkInTime) },
    {
      key: 'out',
      header: 'Check-out',
      render: (r) =>
        r.checkOutTime ? formatDateTime(r.checkOutTime) : <Badge tone="info">Active</Badge>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (r) => {
        if (!r.checkOutTime) return <span className="text-slate-400">—</span>;
        const m = Math.round(
          (new Date(r.checkOutTime).getTime() - new Date(r.checkInTime).getTime()) / 60000,
        );
        return <span className="font-medium">{m} min</span>;
      },
    },
  ];

  return (
    <>
      <PageHeader title="My Attendance" description="Your visit history." />

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">This month</p>
          <p className="mt-2 text-2xl font-bold">{stats.thisMonth} visits</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total visits</p>
          <p className="mt-2 text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Avg session</p>
          <p className="mt-2 text-2xl font-bold">{stats.avgMin}m</p>
        </Card>
      </div>

      <Table columns={columns} data={visits} rowKey={(r) => r.id} />
      {loading && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading…</p>}
      {!loading && visits.length === 0 && !error && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No visits recorded yet.</p>
      )}
    </>
  );
}
