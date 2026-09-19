import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function AdminAIEvaluations() {
  const [evaluations, setEvaluations] = useState(null);
  useEffect(() => { api.get('/admin/ai-evaluations').then((res) => setEvaluations(res.data.evaluations)); }, []);
  if (!evaluations) return <p className="text-sm text-ink/50">Loading…</p>;
  if (evaluations.length === 0) return <p className="text-sm text-ink/50">No evaluation runs yet. See docs/evaluation.md to run the offline suite.</p>;

  return (
    <div className="rounded-2xl border border-brand-100 bg-white divide-y divide-brand-50">
      {evaluations.map((e) => (
        <div key={e._id} className="px-4 py-2 flex justify-between text-sm">
          <span>{e.suite} — {e.caseName}</span>
          <span className={e.passed ? 'text-mastery-high' : 'text-mastery-low'}>{e.passed ? 'passed' : 'failed'}</span>
        </div>
      ))}
    </div>
  );
}
