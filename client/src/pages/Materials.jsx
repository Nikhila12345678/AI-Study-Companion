import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useDispatch } from 'react-redux';
import { pushToast } from '../store/uiSlice';
import EmptyState from '../components/EmptyState';
import { FileText, UploadCloud, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

const STATUS_LABEL = {
  UPLOADED: 'Uploaded', QUEUED: 'Queued', PROCESSING: 'Processing', EXTRACTING: 'Extracting text',
  CHUNKING: 'Chunking', EXTRACTING_CONCEPTS: 'Extracting concepts', INDEXING: 'Indexing', READY: 'Ready', FAILED: 'Failed'
};
const IN_PROGRESS = new Set(['UPLOADED', 'QUEUED', 'PROCESSING', 'EXTRACTING', 'CHUNKING', 'EXTRACTING_CONCEPTS', 'INDEXING']);

export default function Materials() {
  const { projectId } = useParams();
  const [materials, setMaterials] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);
  const dispatch = useDispatch();

  const load = useCallback(() => api.get(`/projects/${projectId}/materials`).then((res) => setMaterials(res.data.materials)), [projectId]);
  useEffect(() => { load(); }, [load]);

  // Poll while anything is still processing, so status updates without a refresh —
  // background work continues even if the tab is closed and reopened.
  useEffect(() => {
    if (!materials?.some((m) => IN_PROGRESS.has(m.status))) return;
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [materials, load]);

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/projects/${projectId}/materials`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch(pushToast({ type: 'success', message: 'Upload received — processing in the background.' }));
      load();
    } catch (err) {
      dispatch(pushToast({ type: 'error', message: err.message }));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const deleteMaterial = async (id) => {
    try {
      await api.delete(`/materials/${id}`);
      load();
    } catch (err) {
      dispatch(pushToast({ type: 'error', message: err.message }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">Materials</h2>
          <p className="text-sm text-ink/60">Upload PDFs — the Tutor and Quiz ground everything in what you add here.</p>
        </div>
        <label className="btn bg-brand-500 hover:bg-brand-600 text-white border-none gap-1.5 cursor-pointer">
          <UploadCloud size={16} /> {uploading ? 'Uploading…' : 'Upload PDF'}
          <input ref={fileInput} type="file" accept="application/pdf" className="hidden" onChange={onFileChange} disabled={uploading} />
        </label>
      </div>

      {materials === null ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : materials.length === 0 ? (
        <EmptyState icon={FileText} title="No materials yet" description="Upload a PDF to start building your knowledge base." />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {materials.map((m) => (
            <div key={m._id} className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-ink truncate">{m.originalName}</p>
                  <p className="text-xs text-ink/50">{(m.fileSizeBytes / 1024).toFixed(0)} KB · {new Date(m.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => deleteMaterial(m._id)} className="text-ink/30 hover:text-mastery-low"><Trash2 size={15} /></button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {IN_PROGRESS.has(m.status) && <RefreshCw size={13} className="animate-spin text-brand-500" />}
                {m.status === 'FAILED' && <AlertTriangle size={13} className="text-mastery-low" />}
                <span className={`text-xs ${m.status === 'READY' ? 'text-mastery-high' : m.status === 'FAILED' ? 'text-mastery-low' : 'text-brand-500'}`}>
                  {STATUS_LABEL[m.status]}{m.statusMessage ? ` — ${m.statusMessage}` : ''}
                </span>
              </div>
              {m.status === 'READY' && (
                <p className="text-xs text-ink/40 mt-1">{m.pageCount} pages · {m.chunkCount} chunks · {m.conceptCount} concepts</p>
              )}
              {m.status === 'FAILED' && m.failureReason && (
                <p className="text-xs text-mastery-low mt-1">{m.failureReason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
