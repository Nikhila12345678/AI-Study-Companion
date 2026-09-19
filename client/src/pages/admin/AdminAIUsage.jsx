import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function AdminAIUsage() {
  const [recent, setRecent] = useState(null);
  useEffect(() => { api.get('/admin/ai-usage').then((res) => setRecent(res.data.recent)); }, []);
  if (!recent) return <p className="text-sm text-ink/50">Loading…</p>;

  return (
    <div className="rounded-2xl border border-brand-100 bg-white overflow-x-auto">
      <table className="table table-sm">
        <thead><tr><th>Feature</th><th>Model</th><th>Latency</th><th>Tokens (in/out)</th><th>Cost</th><th>Status</th></tr></thead>
        <tbody>
          {recent.map((u) => (
            <tr key={u._id}>
              <td className="capitalize">{u.feature.replaceAll('_', ' ')}</td>
              <td>{u.model}</td>
              <td>{u.latencyMs}ms</td>
              <td>{u.inputTokensEst}/{u.outputTokensEst}</td>
              <td>${u.estimatedCostUsd.toFixed(5)}</td>
              <td>{u.success ? <span className="text-mastery-high">ok</span> : <span className="text-mastery-low" title={u.errorMessage}>failed</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
