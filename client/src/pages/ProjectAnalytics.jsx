import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../services/api';

export default function ProjectAnalytics() {
  const { projectId } = useParams();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get(`/projects/${projectId}/analytics`).then((res) => setAnalytics(res.data.analytics)).catch(() => setAnalytics(false));
  }, [projectId]);

  if (!analytics) return <p className="text-sm text-ink/50">Loading…</p>;

  const activity = analytics.activityByDay.map((d) => ({ date: d._id.slice(5), count: d.count }));
  const quizPerf = analytics.quizPerformance.map((q, i) => ({ attempt: i + 1, score: Math.round(q.overallScore * 100) }));

  return (
    <div className="space-y-8">
      <h2 className="font-display text-xl text-ink">Project Analytics</h2>

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Learning activity over time">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activity}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE9FE" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6B4EF0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Quiz performance over attempts">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={quizPerf}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE9FE" />
              <XAxis dataKey="attempt" fontSize={11} />
              <YAxis domain={[0, 100]} fontSize={11} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Line type="monotone" dataKey="score" stroke="#E88A3B" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div>
        <h3 className="font-display text-lg text-ink mb-3">Mastery by concept</h3>
        <div className="space-y-2">
          {analytics.masterySummary.map((m) => (
            <div key={m._id} className="flex items-center gap-3">
              <span className="text-sm w-40 truncate">{m.conceptName}</span>
              <div className="flex-1 h-2 rounded-full bg-brand-50 overflow-hidden">
                <div className="h-full bg-brand-500" style={{ width: `${m.score * 100}%` }} />
              </div>
              <span className="text-xs text-ink/50 w-10 text-right">{Math.round(m.score * 100)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-ink mb-3">AI activity</h3>
        <div className="grid grid-cols-3 gap-3">
          {analytics.aiActivity.map((a) => (
            <div key={a._id} className="rounded-xl border border-brand-100 bg-white p-3">
              <p className="text-xs text-ink/50 capitalize">{a._id.replaceAll('_', ' ')}</p>
              <p className="font-display text-xl text-ink">{a.count}</p>
              <p className="text-xs text-ink/40">{Math.round(a.avgLatencyMs)}ms avg · ${a.totalCostUsd.toFixed(4)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
      <p className="text-sm font-medium text-ink mb-2">{title}</p>
      {children}
    </div>
  );
}
