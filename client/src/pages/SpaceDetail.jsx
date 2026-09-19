import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api } from '../services/api';
import { pushToast } from '../store/uiSlice';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { FolderKanban, Plus, X, Activity } from 'lucide-react';

export default function SpaceDetail() {
  const { spaceId } = useParams();
  const [data, setData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', learningGoal: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const load = () => api.get(`/spaces/${spaceId}/dashboard`).then((res) => setData(res.data)).catch((err) => dispatch(pushToast({ type: 'error', message: err.message })));
  useEffect(() => { load(); }, [spaceId]);

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/spaces/${spaceId}/projects`, form);
      setShowForm(false);
      setForm({ name: '', description: '', learningGoal: '' });
      navigate(`/projects/${res.data.project._id}/dashboard`);
    } catch (err) {
      dispatch(pushToast({ type: 'error', message: err.message }));
    }
  };

  if (!data) return <div className="p-8 max-w-5xl mx-auto grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">{data.space.name}</h1>
          <p className="text-sm text-ink/60">{data.space.description}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn bg-brand-500 hover:bg-brand-600 text-white border-none gap-1.5">
          <Plus size={16} /> New Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={createProject} className="rounded-2xl border border-brand-200 bg-white p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">New Project</h3>
            <button type="button" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <input required placeholder="Project name" className="input input-bordered w-full"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea placeholder="Description" className="textarea textarea-bordered w-full"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Learning goal — what do you want to be able to do?" className="input input-bordered w-full"
            value={form.learningGoal} onChange={(e) => setForm({ ...form, learningGoal: e.target.value })} />
          <button className="btn btn-sm bg-brand-500 text-white border-none">Create Project</button>
        </form>
      )}

      <div>
        <h2 className="font-display text-lg text-ink mb-3">Projects</h2>
        {data.projects.length === 0 ? (
          <EmptyState icon={FolderKanban} title="No projects yet" description="Create a project to start uploading material and learning." />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {data.projects.map((project) => (
              <Link key={project._id} to={`/projects/${project._id}/dashboard`} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft hover:shadow-lg transition-shadow">
                <h3 className="font-medium text-ink">{project.name}</h3>
                <p className="text-sm text-ink/50 mt-1 line-clamp-2">{project.description || 'No description yet.'}</p>
                {project.learningGoal && <p className="text-xs text-brand-600 mt-3">🎯 {project.learningGoal}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>

      {data.recentActivity?.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-ink mb-3 flex items-center gap-2"><Activity size={17} /> Recent activity</h2>
          <div className="rounded-2xl border border-brand-100 bg-white divide-y divide-brand-50">
            {data.recentActivity.map((e) => (
              <div key={e._id} className="px-4 py-2.5 text-sm text-ink/70 flex justify-between">
                <span>{e.type.replaceAll('_', ' ').toLowerCase()}</span>
                <span className="text-ink/40 text-xs">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
