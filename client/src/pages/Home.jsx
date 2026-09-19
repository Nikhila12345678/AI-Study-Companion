import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../services/api';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { Compass, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const { user } = useSelector((s) => s.auth);
  const [spaces, setSpaces] = useState(null);
  const [globalAnalytics, setGlobalAnalytics] = useState(null);

  useEffect(() => {
    api.get('/spaces').then((res) => setSpaces(res.data.spaces)).catch(() => setSpaces([]));
    api.get('/analytics/global').then((res) => setGlobalAnalytics(res.data.analytics)).catch(() => {});
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <p className="text-brand-500 font-medium text-sm">Welcome back</p>
        <h1 className="font-display text-3xl text-ink">{user?.name?.split(' ')[0]}, here's where you left off.</h1>
      </div>

      {globalAnalytics && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Active spaces" value={globalAnalytics.projectCount ?? spaces?.length ?? 0} />
          <StatCard label="Avg. mastery" value={`${Math.round((globalAnalytics.overallMastery?.avgScore || 0) * 100)}%`} />
          <StatCard label="Concepts tracked" value={globalAnalytics.overallMastery?.conceptCount || 0} />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-ink">Your Spaces</h2>
          <Link to="/spaces" className="text-sm text-brand-600 font-medium flex items-center gap-1">
            See all <ArrowRight size={14} />
          </Link>
        </div>

        {spaces === null ? (
          <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
        ) : spaces.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="Create your first Space"
            description="A Space is a broad learning area — like Machine Learning or Interview Prep. Projects live inside it."
            action={<Link to="/spaces" className="btn btn-sm bg-brand-500 text-white border-none">Create a Space</Link>}
          />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {spaces.slice(0, 6).map((space) => (
              <Link key={space._id} to={`/spaces/${space._id}`} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft hover:shadow-lg transition-shadow">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${space.color}22`, color: space.color }}>
                  <Sparkles size={17} />
                </div>
                <h3 className="font-medium text-ink">{space.name}</h3>
                <p className="text-sm text-ink/50 mt-1 line-clamp-2">{space.description || 'No description yet.'}</p>
                <p className="text-xs text-brand-500 mt-3">{space.projectCount} project{space.projectCount === 1 ? '' : 's'}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
      <p className="text-xs text-ink/50 uppercase tracking-wide">{label}</p>
      <p className="font-display text-2xl text-ink mt-1">{value}</p>
    </div>
  );
}
