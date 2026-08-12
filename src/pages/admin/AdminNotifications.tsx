import { useState } from 'react';
import { Bell, Send, Check } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { FilterDropdown } from '../../components/common/FilterDropdown';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  audience: 'ALL' | 'MEMBERS' | 'TRAINERS';
  sentAt: string;
  isRead?: boolean;
}

const mock: NotificationItem[] = [
  { id: 'n1', title: 'New summer schedule', message: 'Updated class timings start next Monday.', audience: 'ALL', sentAt: '2026-05-22T10:00:00Z' },
  { id: 'n2', title: 'Payment reminder', message: '14 members have invoices due this week.', audience: 'MEMBERS', sentAt: '2026-05-21T09:00:00Z' },
  { id: 'n3', title: 'Trainer briefing', message: 'Monthly briefing scheduled for Friday 5 PM.', audience: 'TRAINERS', sentAt: '2026-05-20T15:00:00Z' },
];

export default function AdminNotifications() {
  const [audience, setAudience] = useState('ALL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Broadcast announcements to members and trainers."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <h3 className="text-base font-semibold mb-4">Send a notification</h3>
          <div className="space-y-4">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief headline" />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="input-base resize-none"
                placeholder="Notification body..."
              />
            </div>
            <FilterDropdown
              label="Audience"
              value={audience}
              onChange={setAudience}
              options={[
                { label: 'Everyone', value: 'ALL' },
                { label: 'Members only', value: 'MEMBERS' },
                { label: 'Trainers only', value: 'TRAINERS' },
              ]}
            />
            <Button className="w-full" leftIcon={<Send size={16} />}>
              Send
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-base font-semibold mb-4">Recent broadcasts</h3>
          <ul className="space-y-3">
            {mock.map((n) => (
              <li
                key={n.id}
                className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-4"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 shrink-0">
                  <Bell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{n.title}</p>
                    <Badge tone={n.audience === 'ALL' ? 'brand' : 'info'}>{n.audience}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(n.sentAt).toLocaleString()}
                  </p>
                </div>
                <Check size={16} className="text-emerald-500 shrink-0 mt-1" />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
