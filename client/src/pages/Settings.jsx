import { useSelector } from 'react-redux';

export default function Settings() {
  const { user } = useSelector((s) => s.auth);
  return (
    <div className="p-8 max-w-lg mx-auto space-y-6">
      <h1 className="font-display text-2xl text-ink">Settings</h1>
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft space-y-3">
        <div>
          <p className="text-xs text-ink/50">Name</p>
          <p className="text-sm font-medium">{user?.name}</p>
        </div>
        <div>
          <p className="text-xs text-ink/50">Email</p>
          <p className="text-sm font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs text-ink/50">Role</p>
          <p className="text-sm font-medium capitalize">{user?.role}</p>
        </div>
      </div>
    </div>
  );
}
