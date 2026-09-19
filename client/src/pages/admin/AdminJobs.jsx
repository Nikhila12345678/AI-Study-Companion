import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const STATUS_COLOR = { completed: 'text-mastery-high', failed: 'text-mastery-low', queued: 'text-mastery-mid', processing: 'text-brand-500' };

export default function AdminJobs() {
  const [jobs, setJobs] = useState(null);
  useEffect(() => { api.get('/admin/background-jobs').then((res) => setJobs(res.data.jobs)); }, []);
  if (!jobs) return <p className="text-sm text-ink/50">Loading…</p>;

  return (
    <div className="rounded-2xl border border-brand-100 bg-white divide-y divide-brand-50">
      {jobs.map((j) => (
        <div key={j._id} className="px-4 py-2.5 flex justify-between items-center text-sm">
          <div>
            <p className="font-medium">{j.type.replaceAll('_', ' ')}</p>
            {j.error && <p className="text-xs text-mastery-low">{j.error}</p>}
          </div>
          <div className="text-right">
            <span className={`text-xs font-medium ${STATUS_COLOR[j.status]}`}>{j.status}</span>
            {j.retryCount > 0 && <p className="text-xs text-ink/40">retries: {j.retryCount}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
