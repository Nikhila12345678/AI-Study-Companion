import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AdminHealth() {
  const [health, setHealth] = useState(null);
  useEffect(() => { api.get('/admin/system-health').then((res) => setHealth(res.data)); }, []);
  if (!health) return <p className="text-sm text-ink/50">Loading…</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <HealthCard label="Database" ok={health.dbOk} />
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
        <p className="text-xs text-ink/50 uppercase tracking-wide">Background jobs</p>
        <p className="font-display text-2xl text-ink mt-1">{health.backgroundJobs.queued} queued</p>
        <p className="text-xs text-mastery-low mt-1">{health.backgroundJobs.failed} failed</p>
      </div>
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
        <p className="text-xs text-ink/50 uppercase tracking-wide">AI failure rate (last 200)</p>
        <p className="font-display text-2xl text-ink mt-1">{Math.round(health.aiFailureRate * 100)}%</p>
      </div>
    </div>
  );
}

function HealthCard({ label, ok }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft flex items-center gap-3">
      {ok ? <CheckCircle2 className="text-mastery-high" /> : <AlertTriangle className="text-mastery-low" />}
      <div>
        <p className="text-xs text-ink/50 uppercase tracking-wide">{label}</p>
        <p className="font-medium text-ink">{ok ? 'Healthy' : 'Issue detected'}</p>
      </div>
    </div>
  );
}
