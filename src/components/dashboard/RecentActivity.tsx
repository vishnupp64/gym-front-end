import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ActivityItem {
  id: string;
  name: string;
  action: string;
  time: string;
  tone: 'success' | 'info' | 'warning' | 'neutral';
}

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-sm font-semibold">
                {item.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.action}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={item.tone}>{item.time}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
