import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { Plus, MoreVertical, Mail, Phone } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, type Column } from '../../components/ui/Table';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatDate } from '../../utils/formatDate';
import { memberService } from '../../services/memberService';
import { MemberDetailModal } from '../../components/members/MemberDetailModal';
import type { Member, MembershipStatus } from '../../types';

const statusTone: Record<MembershipStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  EXPIRED: 'danger',
  FROZEN: 'neutral',
  CANCELLED: 'danger',
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  plan: string;
  status: MembershipStatus;
  joinDate: string;
  expiryDate: string;
};

const emptyForm: FormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  plan: 'Basic',
  status: 'ACTIVE',
  joinDate: new Date().toISOString().slice(0, 10),
  expiryDate: '',
};

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [plan, setPlan] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [viewing, setViewing] = useState<Member | null>(null);

  const loadMembers = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await memberService.list();
      setMembers(res.data);
    } catch (err) {
      setLoadError(extractErrorMessage(err, 'Failed to load members'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (status !== 'all' && m.status !== status) return false;
      if (plan !== 'all' && m.plan !== plan) return false;
      if (search && !m.fullName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [members, search, status, plan]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (m: Member) => {
    setEditingId(m.id);
    setForm({
      fullName: m.fullName,
      email: m.email,
      phone: m.phone,
      password: '',
      plan: m.plan,
      status: m.status,
      joinDate: m.joinDate,
      expiryDate: m.expiryDate,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.fullName.trim() || !form.email.trim() || !form.expiryDate) return;
    if (!editingId && (!form.password || form.password.length < 6)) {
      setFormError('Password is required (min 6 characters)');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        const { password: _pw, ...rest } = form;
        const res = await memberService.update(editingId, rest);
        setMembers((prev) => prev.map((m) => (m.id === editingId ? res.data : m)));
      } else {
        const res = await memberService.create(form);
        setMembers((prev) => [res.data, ...prev]);
      }
      closeForm();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Failed to save member'));
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Member>[] = [
    {
      key: 'member',
      header: 'Member',
      render: (m) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-sm font-semibold">
            {m.fullName[0]}
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">{m.fullName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">ID #{m.id.padStart(5, '0')}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (m) => (
        <div className="space-y-0.5">
          <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Mail size={12} /> {m.email}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Phone size={12} /> {m.phone}
          </p>
        </div>
      ),
    },
    { key: 'plan', header: 'Plan', render: (m) => <Badge tone="brand">{m.plan}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (m) => <Badge tone={statusTone[m.status]}>{m.status}</Badge>,
    },
    { key: 'joinDate', header: 'Joined', render: (m) => formatDate(m.joinDate) },
    { key: 'expiryDate', header: 'Expires', render: (m) => formatDate(m.expiryDate) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (m) => (
        <Dropdown
          trigger={
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <MoreVertical size={16} />
            </span>
          }
        >
          <DropdownItem onClick={() => setViewing(m)}>👤 View Profile & Break Logs</DropdownItem>
          <DropdownItem onClick={() => openEdit(m)}>Edit Details</DropdownItem>
          <DropdownItem danger onClick={() => setViewing(m)}>
            {m.status === 'FROZEN' ? '▶️ Resume Membership' : '⏸️ Freeze / Pause Membership'}
          </DropdownItem>
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Members"
        description="Manage your gym members, plans, and statuses."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={openAdd}>
            Add Member
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name..." />
        <div className="flex flex-wrap gap-2">
          <FilterDropdown
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Expired', value: 'EXPIRED' },
              { label: 'Frozen', value: 'FROZEN' },
            ]}
          />
          <FilterDropdown
            label="Plan"
            value={plan}
            onChange={setPlan}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Basic', value: 'Basic' },
              { label: 'Standard', value: 'Standard' },
              { label: 'Premium', value: 'Premium' },
            ]}
          />
        </div>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {loadError}
        </div>
      )}

      <Table columns={columns} data={filtered} rowKey={(m) => m.id} />
      {loading && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading members…</p>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingId ? 'Edit member' : 'Add member'}
        description={
          editingId
            ? 'Update this member’s details.'
            : 'Create a new member profile.'
        }
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeForm} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} type="submit" isLoading={submitting}>
              {editingId ? 'Save changes' : 'Add member'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formError && (
            <div className="sm:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              {formError}
            </div>
          )}
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {!editingId && (
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              hint="Min 6 characters. The member will use this to log in."
            />
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Plan
            </label>
            <select
              className="input-base"
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
            >
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Status
            </label>
            <select
              className="input-base"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as MembershipStatus })
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="EXPIRED">Expired</option>
              <option value="FROZEN">Frozen</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <Input
            label="Join date"
            type="date"
            value={form.joinDate}
            onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
          />
          <Input
            label="Expiry date"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            className="sm:col-span-2"
          />
          <button type="submit" hidden />
        </form>
      </Modal>

      {viewing && (
        <MemberDetailModal
          member={viewing}
          onClose={() => setViewing(null)}
          onUpdateMember={() => {
            void loadMembers();
            setViewing(null);
          }}
        />
      )}
    </>
  );
}
