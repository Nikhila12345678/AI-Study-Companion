import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useDispatch } from 'react-redux';
import { pushToast } from '../store/uiSlice';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { Compass, Plus, Sparkles, X } from 'lucide-react';

export default function Spaces() {
  const [spaces, setSpaces] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const dispatch = useDispatch();

  const load = () => api.get('/spaces').then((res) => setSpaces(res.data.spaces)).catch(() => setSpaces([]));
  useEffect(() => { load(); }, []);

  const createSpace = async (e) => {
    e.preventDefault();
    try {
      await api.post('/spaces', form);
      setForm({ name: '', description: '' });
      setShowForm(false);
      load();
    } catch (err) {
      dispatch(pushToast({ type: 'error', message: err.message }));
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Spaces</h1>
          <p className="text-sm text-ink/60">Broad learning areas that hold your Projects.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn bg-brand-500 hover:bg-brand-600 text-white border-none gap-1.5">
          <Plus size={16} /> New Space
        </button>
      </div>

      {showForm && (
        <form onSubmit={createSpace} className="rounded-2xl border border-brand-200 bg-white p-5 mb-6 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">New Space</h3>
            <button type="button" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <input required placeholder="e.g. Machine Learning" className="input input-bordered w-full"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea placeholder="What's this space about?" className="textarea textarea-bordered w-full"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn btn-sm bg-brand-500 text-white border-none">Create</button>
        </form>
      )}

      {spaces === null ? (
        <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : spaces.length === 0 ? (
        <EmptyState icon={Compass} title="No spaces yet" description="Create one to start organizing your learning." />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {spaces.map((space) => (
            <Link key={space._id} to={`/spaces/${space._id}`} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft hover:shadow-lg transition-shadow">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${space.color}22`, color: space.color }}>
                <Sparkles size={17} />
              </div>
              <h3 className="font-medium text-ink">{space.name}</h3>
              <p className="text-sm text-ink/50 mt-1 line-clamp-2">{space.description || 'No description yet.'}</p>
              <p className="text-xs text-brand-500 mt-3">{space.projectCount} project{space.projectCount === 1 ? '' : 's'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
