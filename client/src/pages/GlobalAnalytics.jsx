import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../services/api';

export default function GlobalAnalytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get('/analytics/global').then((res) => setAnalytics(res.data.analytics)).catch(() => setAnalytics(false));
  }, []);

  if (!analytics) return <div className="p-8"><p className="text-sm text-ink/50">Loading…</p></div>;

  const activity = analytics.activityByDay.map((d) => ({ date: d._id.slice(5), count: d.count }));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="font-display text-2xl text-ink">Global Analytics</h1>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Projects" value={analytics.projectCount} />
        <StatCard label="Avg. mastery" value={`${Math.round((analytics.overallMastery?.avgScore || 0) * 100)}%`} />
        <StatCard label="Concepts tracked" value={analytics.overallMastery?.conceptCount || 0} />
      </div>
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
        <p className="text-sm font-medium text-ink mb-2">Activity across all projects</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={activity}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE9FE" />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis fontSize={11} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#6B4EF0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
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
