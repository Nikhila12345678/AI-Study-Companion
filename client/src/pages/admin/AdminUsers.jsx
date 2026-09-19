import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [journey, setJourney] = useState(null);

  useEffect(() => { api.get('/admin/users').then((res) => setUsers(res.data.users)); }, []);

  const openUser = async (id) => {
    const res = await api.get(`/admin/users/${id}`);
    setJourney(res.data);
  };

  if (!users) return <p className="text-sm text-ink/50">Loading…</p>;

  if (journey) {
    return (
      <div>
        <button onClick={() => setJourney(null)} className="text-sm text-brand-600 mb-4">← Back to users</button>
        <h3 className="font-display text-lg text-ink mb-1">{journey.user.name}</h3>
        <p className="text-sm text-ink/50 mb-4">{journey.user.email} · avg mastery {Math.round((journey.masterySummary.avgScore || 0) * 100)}%</p>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-sm mb-2">Projects ({journey.projects.length})</h4>
            <div className="space-y-1">{journey.projects.map((p) => <div key={p._id} className="text-sm rounded-lg bg-brand-50 px-3 py-1.5">{p.name}</div>)}</div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">Recent activity</h4>
            <div className="space-y-1">{journey.activity.slice(0, 10).map((e) => <div key={e._id} className="text-xs text-ink/60">{e.type.replaceAll('_', ' ').toLowerCase()}</div>)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-white divide-y divide-brand-50">
      {users.map((u) => (
        <button key={u._id} onClick={() => openUser(u._id)} className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-brand-50/50">
          <div>
            <p className="text-sm font-medium">{u.name}</p>
            <p className="text-xs text-ink/50">{u.email}</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-600 capitalize">{u.role}</span>
        </button>
      ))}
    </div>
  );
}
