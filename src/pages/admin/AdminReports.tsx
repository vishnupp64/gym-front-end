import { Download } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { Card } from '../../components/ui/Card';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { useState } from 'react';

const revenue = [
  { month: 'Jan', value: 12400 },
  { month: 'Feb', value: 14800 },
  { month: 'Mar', value: 16200 },
  { month: 'Apr', value: 15400 },
  { month: 'May', value: 18900 },
  { month: 'Jun', value: 21300 },
  { month: 'Jul', value: 24800 },
  { month: 'Aug', value: 22100 },
  { month: 'Sep', value: 25600 },
  { month: 'Oct', value: 27200 },
  { month: 'Nov', value: 29800 },
  { month: 'Dec', value: 31200 },
];

const newMembers = [
  { month: 'Jan', value: 24 },
  { month: 'Feb', value: 31 },
  { month: 'Mar', value: 28 },
  { month: 'Apr', value: 35 },
  { month: 'May', value: 42 },
  { month: 'Jun', value: 38 },
  { month: 'Jul', value: 51 },
  { month: 'Aug', value: 44 },
  { month: 'Sep', value: 47 },
  { month: 'Oct', value: 53 },
  { month: 'Nov', value: 49 },
  { month: 'Dec', value: 60 },
];

export default function Reports() {
  const [range, setRange] = useState('12m');

  return (
    <>
      <PageHeader
        title="Reports"
        description="Insights into revenue, growth, and member behavior."
        actions={
          <>
            <FilterDropdown
              label="Range"
              value={range}
              onChange={setRange}
              options={[
                { label: 'Last 30 days', value: '30d' },
                { label: 'Last 3 months', value: '3m' },
                { label: 'Last 12 months', value: '12m' },
                { label: 'Year to date', value: 'ytd' },
              ]}
            />
            <Button leftIcon={<Download size={16} />}>Export PDF</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Revenue YTD', value: '₹268.4k' },
          { label: 'New members', value: '502' },
          { label: 'Churn rate', value: '4.2%' },
          { label: 'Avg LTV', value: '₹840' },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Revenue (12 months)"
          description="Total monthly revenue"
          data={revenue}
          dataKey="value"
          xKey="month"
          type="area"
        />
        <ChartCard
          title="New members"
          description="Sign-ups per month"
          data={newMembers}
          dataKey="value"
          xKey="month"
          type="bar"
        />
      </div>
    </>
  );
}
