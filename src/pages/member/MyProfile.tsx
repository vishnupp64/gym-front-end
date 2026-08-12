import { useState } from 'react';
import { Check } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PasswordChangeForm } from '../../components/common/PasswordChangeForm';
import { useAuth } from '../../hooks/useAuth';

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  emergencyContact: string;
  address: string;
};

export default function MyProfile() {
  const { user } = useAuth();

  const initialProfile: ProfileForm = {
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    dateOfBirth: '1995-04-12',
    emergencyContact: '+1 415 555 0199 (Sister)',
    address: '742 Evergreen Terrace, San Francisco, CA',
  };

  const [profile, setProfile] = useState<ProfileForm>(initialProfile);
  const [saved, setSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaved(false);
    setTimeout(() => {
      setSavingProfile(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 400);
  };

  const handleProfileCancel = () => {
    setProfile(initialProfile);
    setSaved(false);
  };

  return (
    <>
      <PageHeader title="My Profile" description="Update your personal information." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Details visible to staff and trainers.</CardDescription>
          <form
            onSubmit={handleProfileSubmit}
            className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Input
              label="Full name"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
            <Input
              label="Date of birth"
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
            />
            <Input
              label="Emergency contact"
              value={profile.emergencyContact}
              onChange={(e) =>
                setProfile({ ...profile, emergencyContact: e.target.value })
              }
              className="sm:col-span-2"
            />
            <Input
              label="Address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
              {saved && (
                <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                  <Check size={16} /> Saved
                </span>
              )}
              <Button
                variant="ghost"
                type="button"
                onClick={handleProfileCancel}
                disabled={savingProfile}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={savingProfile}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>

        <Card className="flex flex-col">
          <CardTitle>Security</CardTitle>
          <CardDescription>Update your password.</CardDescription>
          <div className="mt-6 flex-1">
            <PasswordChangeForm buttonClassName="mt-4 w-full" />
          </div>
        </Card>
      </div>
    </>
  );
}
