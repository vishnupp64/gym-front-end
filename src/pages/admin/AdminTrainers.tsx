import { useState } from 'react';
import { Plus, Mail, Phone, Star, Calendar } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import type { Trainer } from '../../types';

const initialTrainers: Trainer[] = [
  { id: 't1', userId: 'tu1', fullName: 'Coach Liam', email: 'liam@sector47.app', phone: '+1 415 555 0188', specialization: 'HIIT & Conditioning', yearsOfExperience: 7, rating: 4.9 },
  { id: 't2', userId: 'tu2', fullName: 'Coach Priya', email: 'priya@sector47.app', phone: '+1 415 555 0192', specialization: 'Strength Training', yearsOfExperience: 10, rating: 4.8 },
  { id: 't3', userId: 'tu3', fullName: 'Coach Naomi', email: 'naomi@sector47.app', phone: '+1 415 555 0144', specialization: 'Yoga & Mobility', yearsOfExperience: 6, rating: 4.95 },
  { id: 't4', userId: 'tu4', fullName: 'Coach Marcus', email: 'marcus@sector47.app', phone: '+1 415 555 0177', specialization: 'Spin & Endurance', yearsOfExperience: 5, rating: 4.7 },
  { id: 't5', userId: 'tu5', fullName: 'Coach Hana', email: 'hana@sector47.app', phone: '+1 415 555 0162', specialization: 'Functional Fitness', yearsOfExperience: 8, rating: 4.85 },
  { id: 't6', userId: 'tu6', fullName: 'Coach Diego', email: 'diego@sector47.app', phone: '+1 415 555 0119', specialization: 'CrossFit', yearsOfExperience: 9, rating: 4.9 },
];

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  yearsOfExperience: number;
  rating: number;
};

const emptyForm: FormState = {
  fullName: '',
  email: '',
  phone: '',
  specialization: '',
  yearsOfExperience: 0,
  rating: 5,
};

export default function Trainers() {
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [viewing, setViewing] = useState<Trainer | null>(null);
  const [scheduling, setScheduling] = useState<Trainer | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const openAdd = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) return;
    const nextNum =
      trainers.reduce(
        (max, t) => Math.max(max, Number(t.id.replace(/^t/, '')) || 0),
        0,
      ) + 1;
    setTrainers((prev) => [
      ...prev,
      { id: `t${nextNum}`, userId: `tu${nextNum}`, ...form },
    ]);
    setFormOpen(false);
    setForm(emptyForm);
  };

  const submitSchedule = () => {
    if (!scheduling || !scheduleDate || !scheduleTime) return;
    alert(
      `Session booked with ${scheduling.fullName} on ${scheduleDate} at ${scheduleTime}.`,
    );
    setScheduling(null);
    setScheduleDate('');
    setScheduleTime('');
  };

  return (
    <>
      <PageHeader
        title="Trainers"
        description="Your team of certified coaches."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={openAdd}>
            Add Trainer
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {trainers.map((t) => (
          <Card key={t.id} className="hover:shadow-soft transition-shadow">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xl font-bold">
                {t.fullName.split(' ').map((p) => p[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{t.fullName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t.specialization}</p>
                  </div>
                  <Badge tone="brand">{t.yearsOfExperience}y exp</Badge>
                </div>

                <div className="mt-3 flex items-center gap-1 text-sm">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{(t.rating ?? 0).toFixed(2)}</span>
                  <span className="text-slate-400">/ 5.00</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Mail size={12} /> {t.email}
              </p>
              <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Phone size={12} /> {t.phone}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setScheduling(t)}
              >
                Schedule
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setViewing(t)}
              >
                View profile
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add trainer"
        description="Create a new trainer profile."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add trainer</Button>
          </>
        }
      >
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <Input
            label="Specialization"
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            placeholder="e.g. Strength Training"
          />
          <Input
            label="Years of experience"
            type="number"
            min={0}
            value={form.yearsOfExperience}
            onChange={(e) =>
              setForm({ ...form, yearsOfExperience: Number(e.target.value) })
            }
          />
          <Input
            label="Rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          />
          <button type="submit" hidden />
        </form>
      </Modal>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.fullName}
        description={viewing?.specialization}
        size="md"
        footer={
          <Button variant="ghost" onClick={() => setViewing(null)}>
            Close
          </Button>
        }
      >
        {viewing && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xl font-bold">
                {viewing.fullName.split(' ').map((p) => p[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {viewing.fullName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewing.specialization}
                </p>
              </div>
            </div>
            <Row label="Email" value={viewing.email} />
            <Row label="Phone" value={viewing.phone} />
            <Row
              label="Experience"
              value={`${viewing.yearsOfExperience} years`}
            />
            <Row label="Rating" value={`${(viewing.rating ?? 0).toFixed(2)} / 5.00`} />
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(scheduling)}
        onClose={() => setScheduling(null)}
        title={`Schedule a session`}
        description={
          scheduling ? `Book time with ${scheduling.fullName}` : undefined
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setScheduling(null)}>
              Cancel
            </Button>
            <Button
              leftIcon={<Calendar size={16} />}
              onClick={submitSchedule}
              disabled={!scheduleDate || !scheduleTime}
            >
              Book session
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
          />
          <Input
            label="Time"
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-100">{value}</span>
    </div>
  );
}
