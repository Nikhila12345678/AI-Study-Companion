import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import EmptyState from '../components/EmptyState';
import { BrainCircuit, Search } from 'lucide-react';

const IMPORTANCE_COLOR = { high: 'bg-mastery-low/10 text-mastery-low', medium: 'bg-mastery-mid/10 text-mastery-mid', low: 'bg-brand-100 text-brand-600' };

export default function Knowledge() {
  const { projectId } = useParams();
  const [concepts, setConcepts] = useState(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.get(`/projects/${projectId}/knowledge`).then((res) => setConcepts(res.data.concepts)).catch(() => setConcepts([]));
  }, [projectId]);

  const runSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const res = await api.get(`/projects/${projectId}/knowledge/search`, { params: { q: query } });
      setSearchResults(res.data.results);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl text-ink">Knowledge</h2>
        <p className="text-sm text-ink/60">The processed, searchable representation of your materials — not the raw PDFs.</p>
      </div>

      <form onSubmit={runSearch} className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your knowledge base…" className="input input-bordered flex-1" />
        <button className="btn bg-brand-500 hover:bg-brand-600 text-white border-none gap-1.5"><Search size={15} /> Search</button>
      </form>

      {searchResults && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-ink/40">{searching ? 'Searching…' : `${searchResults.length} results`}</p>
          {searchResults.map((r, i) => (
            <div key={i} className="rounded-xl border border-brand-100 bg-white p-3">
              <p className="text-xs text-brand-500 mb-1">{r.materialName} · p.{r.page} · match {(r.score * 100).toFixed(0)}%</p>
              <p className="text-sm text-ink/80">{r.text.slice(0, 240)}…</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="font-display text-lg text-ink mb-3">Concepts</h3>
        {concepts === null ? (
          <p className="text-sm text-ink/50">Loading…</p>
        ) : concepts.length === 0 ? (
          <EmptyState icon={BrainCircuit} title="No concepts extracted yet" description="Concepts appear automatically once a material finishes processing." />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {concepts.map((c) => (
              <div key={c._id} className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-ink">{c.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${IMPORTANCE_COLOR[c.importance]}`}>{c.importance}</span>
                </div>
                <p className="text-sm text-ink/60">{c.description}</p>
                {c.sourcePages?.length > 0 && (
                  <p className="text-xs text-ink/40 mt-2">
                    Source: {c.sourcePages.map((p) => `${p.materialName} p.${p.page}`).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
