import { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { LayoutDashboard, FileText, BrainCircuit, MessageCircleQuestion, ListChecks, TrendingUp, LineChart } from 'lucide-react';
import { api } from '../services/api';
import { SkeletonLine } from '../components/Skeleton';

const TABS = [
  { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: 'materials', label: 'Materials', icon: FileText },
  { to: 'knowledge', label: 'Knowledge', icon: BrainCircuit },
  { to: 'tutor', label: 'AI Tutor', icon: MessageCircleQuestion },
  { to: 'quiz', label: 'Quiz', icon: ListChecks },
  { to: 'mastery', label: 'Mastery', icon: TrendingUp },
  { to: 'growth', label: 'Growth', icon: LineChart },
  { to: 'analytics', label: 'Analytics', icon: LineChart }
];

export default function ProjectLayout() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api.get(`/projects/${projectId}`)
      .then((res) => { if (active) setProject(res.data.project); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [projectId]);

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-brand-100 bg-white px-8 py-4">
        {error ? (
          <p className="text-mastery-low text-sm">{error}</p>
        ) : project ? (
          <>
            <p className="text-xs uppercase tracking-wide text-brand-500 font-medium">Project</p>
            <h1 className="font-display text-xl text-ink">{project.name}</h1>
            {project.learningGoal && <p className="text-sm text-ink/60 mt-0.5">Goal: {project.learningGoal}</p>}
          </>
        ) : (
          <SkeletonLine className="h-6 w-48" />
        )}
        <nav className="flex gap-1 mt-4 -mb-4 overflow-x-auto">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors ${
                  isActive ? 'border-brand-500 text-brand-600' : 'border-transparent text-ink/50 hover:text-ink/80'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <div className="flex-1 overflow-y-auto p-8">
        <Outlet context={{ project }} />
      </div>
    </div>
  );
}
