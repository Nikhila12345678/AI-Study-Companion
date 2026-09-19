import { useDispatch, useSelector } from 'react-redux';
import { dismissToast } from '../store/uiSlice';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const STYLES = {
  success: 'bg-mastery-high/10 text-mastery-high border-mastery-high/30',
  error: 'bg-mastery-low/10 text-mastery-low border-mastery-low/30',
  info: 'bg-brand-100 text-brand-700 border-brand-300'
};

export default function Toasts() {
  const toasts = useSelector((s) => s.ui.toasts);
  const dispatch = useDispatch();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => {
        const Icon = ICONS[t.type || 'info'];
        return (
          <div key={t.id} className={`flex items-start gap-2 rounded-xl border px-4 py-3 shadow-soft ${STYLES[t.type || 'info']} bg-white`}>
            <Icon size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm flex-1">{t.message}</p>
            <button onClick={() => dispatch(dismissToast(t.id))} className="opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
