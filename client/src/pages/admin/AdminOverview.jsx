import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function AdminOverview() {
  const [overview, setOverview] = useState(null);
  useEffect(() => { api.get('/admin/analytics').then((res) => setOverview(res.data.overview)); }, []);
  if (!overview) return <p className="text-sm text-ink/50">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total users" value={overview.userCount} />
        <StatCard label="Queued jobs" value={overview.jobFailures.find((j) => j._id === 'queued')?.count || 0} />
        <StatCard label="Failed jobs" value={overview.jobFailures.find((j) => j._id === 'failed')?.count || 0} />
      </div>
      <div>
        <h3 className="font-display text-lg text-ink mb-2">Event volume by type</h3>
        <div className="rounded-2xl border border-brand-100 bg-white divide-y divide-brand-50">
          {overview.eventVolume.map((e) => (
            <div key={e._id} className="px-4 py-2 flex justify-between text-sm">
              <span className="capitalize">{e._id.replaceAll('_', ' ').toLowerCase()}</span>
              <span className="text-ink/50">{e.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-display text-lg text-ink mb-2">AI usage by feature</h3>
        <div className="grid grid-cols-3 gap-3">
          {overview.aiUsageSummary.map((a) => (
            <div key={a._id} className="rounded-xl border border-brand-100 bg-white p-3">
              <p className="text-xs text-ink/50 capitalize">{a._id.replaceAll('_', ' ')}</p>
              <p className="font-display text-xl text-ink">{a.count}</p>
              <p className="text-xs text-ink/40">{Math.round(a.successRate * 100)}% success · ${a.totalCostUsd.toFixed(4)}</p>
            </div>
          ))}
        </div>
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
