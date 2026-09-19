import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function AdminActivity() {
  const [events, setEvents] = useState(null);
  const [type, setType] = useState('');

  useEffect(() => { api.get('/admin/activity', { params: type ? { type } : {} }).then((res) => setEvents(res.data.events)); }, [type]);

  return (
    <div>
      <input placeholder="Filter by event type (e.g. QUIZ_COMPLETED)" value={type} onChange={(e) => setType(e.target.value)} className="input input-bordered input-sm mb-3 w-80" />
      {!events ? <p className="text-sm text-ink/50">Loading…</p> : (
        <div className="rounded-2xl border border-brand-100 bg-white divide-y divide-brand-50">
          {events.map((e) => (
            <div key={e._id} className="px-4 py-2 flex justify-between text-sm">
              <span>{e.type.replaceAll('_', ' ').toLowerCase()}</span>
              <span className="text-ink/40 text-xs">{new Date(e.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
