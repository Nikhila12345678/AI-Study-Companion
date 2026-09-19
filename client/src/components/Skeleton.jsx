export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-brand-100/70 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft space-y-3">
      <SkeletonLine className="h-4 w-2/3" />
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-4/5" />
    </div>
  );
}
