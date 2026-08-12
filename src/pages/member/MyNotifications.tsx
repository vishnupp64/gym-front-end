import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

interface Item {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  tone: 'info' | 'success' | 'warning';
}

const initial: Item[] = [
  { id: 'n1', title: 'New workout plan assigned', message: 'Coach Liam published "Strength Foundation &mdash; Week 4".', createdAt: '2026-05-22T08:00:00Z', isRead: false, tone: 'success' },
  { id: 'n2', title: 'Payment receipt', message: 'Your monthly Premium payment of ₹89 was successful.', createdAt: '2026-05-12T10:00:00Z', isRead: false, tone: 'info' },
  { id: 'n3', title: 'Class rescheduled', message: 'Saturday Yoga Flow moved to 10:30 (was 10:00).', createdAt: '2026-05-09T16:00:00Z', isRead: true, tone: 'warning' },
  { id: 'n4', title: 'Membership renewing soon', message: 'Your plan renews on Sep 12. Manage settings any time.', createdAt: '2026-05-01T09:00:00Z', isRead: true, tone: 'info' },
];

export default function MyNotifications() {
  const [items, setItems] = useState<Item[]>(initial);

  const markAllRead = () => setItems((arr) => arr.map((i) => ({ ...i, isRead: true })));

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Updates from the gym, your coach, and your account."
        actions={
          <Button variant="outline" size="sm" leftIcon={<Check size={14} />} onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />

      <Card>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((n) => (
            <li
              key={n.id}
              className={cn(
                'flex items-start gap-3 py-3 first:pt-0 last:pb-0',
                !n.isRead && 'relative',
              )}
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 shrink-0">
                <Bell size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn('font-medium', !n.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300')}>
                    {n.title}
                  </p>
                  {!n.isRead && <Badge tone={n.tone}>New</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
