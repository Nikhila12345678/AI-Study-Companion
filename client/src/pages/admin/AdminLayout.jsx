import { NavLink, Outlet } from 'react-router-dom';
import { Users, Activity, BarChart3, Bot, ShieldCheck, Server, ClipboardCheck } from 'lucide-react';

const TABS = [
  { to: '', label: 'Overview', icon: BarChart3, end: true },
  { to: 'users', label: 'Users', icon: Users },
  { to: 'activity', label: 'Activity', icon: Activity },
  { to: 'ai-usage', label: 'AI Usage', icon: Bot },
  { to: 'ai-evaluations', label: 'AI Evaluations', icon: ClipboardCheck },
  { to: 'jobs', label: 'Background Jobs', icon: Server },
  { to: 'health', label: 'System Health', icon: ShieldCheck }
];

export default function AdminLayout() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="font-display text-2xl text-ink mb-1">Admin Dashboard</h1>
      <p className="text-sm text-ink/60 mb-6">Platform-level visibility into users, learning activity, and AI quality.</p>
      <div className="flex gap-1 mb-6 border-b border-brand-100">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium border-b-2 -mb-px ${isActive ? 'border-brand-500 text-brand-600' : 'border-transparent text-ink/50 hover:text-ink/80'}`}>
            <Icon size={15} /> {label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
