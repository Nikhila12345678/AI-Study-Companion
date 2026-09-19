import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { SkeletonCard } from '../components/Skeleton';
import { Sparkles, ArrowRight, TrendingUp, FileText } from 'lucide-react';

export default function ProjectDashboard() {
  const { projectId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/projects/${projectId}/dashboard`).then((res) => setData(res.data)).catch(() => setData(false));
  }, [projectId]);

  if (data === null) return <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>;
  if (data === false) return <p className="text-mastery-low">Could not load this project.</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <p className="text-xs text-ink/50 uppercase tracking-wide">Overall progress</p>
          <p className="font-display text-3xl text-ink mt-1">{Math.round(data.overallProgress * 100)}%</p>
          <div className="h-1.5 rounded-full bg-brand-100 mt-3 overflow-hidden">
            <div className="h-full bg-brand-500" style={{ width: `${data.overallProgress * 100}%` }} />
          </div>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <p className="text-xs text-ink/50 uppercase tracking-wide">Concepts tracked</p>
          <p className="font-display text-3xl text-ink mt-1">{data.conceptCount}</p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <p className="text-xs text-ink/50 uppercase tracking-wide">Materials</p>
          <p className="font-display text-3xl text-ink mt-1">{data.materials.length}</p>
        </div>
      </div>

      {data.recommendation && (
        <div className="rounded-2xl border border-tutor/30 bg-tutor-light p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-tutor text-white flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-tutor-dark font-medium">Next best action</p>
            <h3 className="font-display text-lg text-ink mt-0.5">{data.recommendation.title}</h3>
            <p className="text-sm text-ink/70 mt-1">{data.recommendation.reason}</p>
          </div>
          <Link to="../quiz" className="btn btn-sm bg-tutor hover:bg-tutor-dark text-white border-none shrink-0">
            Go <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="font-display text-lg text-ink mb-3 flex items-center gap-2"><TrendingUp size={17} /> Needs attention</h2>
          {data.importantConcepts.length === 0 ? (
            <p className="text-sm text-ink/50">No mastery data yet — take a quiz to get started.</p>
          ) : (
            <div className="space-y-2">
              {data.importantConcepts.map((c) => (
                <div key={c.conceptId} className="rounded-xl border border-brand-100 bg-white p-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">{c.conceptName}</span>
                  <span className="text-sm text-ink/50">{Math.round(c.score * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-display text-lg text-ink mb-3 flex items-center gap-2"><FileText size={17} /> Materials</h2>
          {data.materials.length === 0 ? (
            <Link to="../materials" className="text-sm text-brand-600 font-medium">Upload your first PDF →</Link>
          ) : (
            <div className="space-y-2">
              {data.materials.map((m) => (
                <div key={m._id} className="rounded-xl border border-brand-100 bg-white p-3 flex items-center justify-between text-sm">
                  <span className="truncate">{m.originalName}</span>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    READY: 'bg-mastery-high/10 text-mastery-high',
    FAILED: 'bg-mastery-low/10 text-mastery-low'
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || 'bg-brand-100 text-brand-600'}`}>{status.toLowerCase()}</span>;
}
