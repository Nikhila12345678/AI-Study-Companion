import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import EmptyState from '../components/EmptyState';
import { ArrowUpRight, ArrowDownRight, Minus, LineChart as LineChartIcon } from 'lucide-react';

const TREND = {
  improving: { icon: ArrowUpRight, color: '#2FA372', label: 'Improving' },
  stable: { icon: Minus, color: '#8368FA', label: 'Stable' },
  requires_attention: { icon: ArrowDownRight, color: '#E15B5B', label: 'Requires attention' }
};

export default function Growth() {
  const { projectId } = useParams();
  const [growth, setGrowth] = useState(null);

  useEffect(() => {
    api.get(`/projects/${projectId}/growth`).then((res) => setGrowth(res.data.growth)).catch(() => setGrowth([]));
  }, [projectId]);

  if (growth === null) return <p className="text-sm text-ink/50">Loading…</p>;
  if (growth.length === 0) {
    return <EmptyState icon={LineChartIcon} title="No growth data yet" description="Growth trends build up as your mastery history accumulates." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl text-ink">Growth</h2>
        <p className="text-sm text-ink/60">How your understanding of each concept has changed, from real learning events.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {growth.map((g) => {
          const trend = TREND[g.trend];
          const Icon = trend.icon;
          const chartData = g.history.map((h, i) => ({ i, score: Math.round(h.score * 100) }));
          return (
            <div key={g.conceptId} className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-ink">{g.conceptName}</h4>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: trend.color }}>
                  <Icon size={13} /> {trend.label}
                </span>
              </div>
              <p className="text-xs text-ink/50 mb-2">
                {Math.round(g.startScore * 100)}% → {Math.round(g.currentScore * 100)}%
              </p>
              {chartData.length > 1 && (
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="i" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip formatter={(v) => `${v}%`} labelFormatter={() => ''} />
                    <Line type="monotone" dataKey="score" stroke={trend.color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
