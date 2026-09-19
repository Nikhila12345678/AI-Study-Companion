import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong loading this.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl border border-mastery-low/30 bg-mastery-low/5">
      <AlertTriangle className="text-mastery-low mb-3" size={26} />
      <p className="text-sm text-ink/70 max-w-sm mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-sm btn-outline border-mastery-low text-mastery-low hover:bg-mastery-low hover:text-white">
          Try again
        </button>
      )}
    </div>
  );
}
