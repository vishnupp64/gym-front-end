import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PasswordChangeForm } from '../../components/common/PasswordChangeForm';
import { useAuth } from '../../hooks/useAuth';

export default function TrainerSettings() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title="Settings" description="Manage your trainer profile." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update the details displayed to members and admins.</CardDescription>

          <form className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full name" defaultValue={user?.name ?? ''} />
            <Input label="Email" type="email" defaultValue={user?.email ?? ''} />
            <Input label="Phone" defaultValue={user?.phone ?? ''} />
            <Input label="Specialization" defaultValue="HIIT & Conditioning" />
            <Input label="Years of experience" type="number" defaultValue={7} />
            <Input label="Hourly rate" type="number" defaultValue={50} />
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save changes</Button>
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
