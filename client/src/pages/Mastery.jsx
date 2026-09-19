import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import EmptyState from '../components/EmptyState';
import { TrendingUp } from 'lucide-react';

function masteryColor(score) {
  if (score >= 0.75) return '#2FA372';
  if (score >= 0.5) return '#E0A72E';
  return '#E15B5B';
}

export default function Mastery() {
  const { projectId } = useParams();
  const [mastery, setMastery] = useState(null);

  useEffect(() => {
    api.get(`/projects/${projectId}/mastery`).then((res) => setMastery(res.data.mastery)).catch(() => setMastery([]));
  }, [projectId]);

  if (mastery === null) return <p className="text-sm text-ink/50">Loading…</p>;
  if (mastery.length === 0) {
    return <EmptyState icon={TrendingUp} title="No mastery data yet" description="Mastery estimates appear once you take quizzes or ask the Tutor questions." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl text-ink">Mastery</h2>
        <p className="text-sm text-ink/60">An evolving estimate, not a claim of perfect measurement.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {mastery.map((m) => (
          <div key={m.conceptId} className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-ink">{m.conceptName}</h4>
              <span className="text-sm font-medium" style={{ color: masteryColor(m.score) }}>{Math.round(m.score * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-brand-50 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${m.score * 100}%`, background: masteryColor(m.score) }} />
            </div>
            <p className="text-xs text-ink/40 mt-2">{m.evidenceCount} pieces of evidence · updated {new Date(m.lastUpdated).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
