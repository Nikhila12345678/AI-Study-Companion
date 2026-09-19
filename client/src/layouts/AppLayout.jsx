import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Home, Layers, BarChart3, Settings, ShieldCheck, Sparkles, LogOut } from 'lucide-react';
import { logout } from '../store/authSlice';
import Toasts from '../components/Toasts';

const NAV = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/spaces', label: 'Spaces', icon: Layers },
  { to: '/analytics', label: 'Global Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export default function AppLayout() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="w-60 shrink-0 border-r border-brand-100 bg-white flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 font-display text-lg text-ink border-b border-brand-100">
          <Sparkles size={20} className="text-tutor" />
          Study Companion
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-500 text-white shadow-soft' : 'text-ink/70 hover:bg-brand-50'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-ink text-white' : 'text-ink/70 hover:bg-brand-50'
                }`
              }
            >
              <ShieldCheck size={17} />
              Admin
            </NavLink>
          )}
        </nav>
        <div className="p-3 border-t border-brand-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-ink/50 truncate">{user?.email}</p>
            </div>
            <button
              onClick={async () => { await dispatch(logout()); navigate('/login'); }}
              className="text-ink/40 hover:text-mastery-low"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
      <Toasts />
    </div>
  );
}
