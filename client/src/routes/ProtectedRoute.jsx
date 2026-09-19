import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { fetchMe } from '../store/authSlice';

export default function ProtectedRoute() {
  const dispatch = useDispatch();
  const { status } = useSelector((s) => s.auth);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchMe());
  }, [status, dispatch]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-pulse text-brand-500 font-display text-lg">Loading your workspace…</div>
      </div>
    );
  }
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  return <Outlet />;
}
