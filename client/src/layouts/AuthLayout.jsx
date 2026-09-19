import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="flex items-center gap-2 font-display text-xl">
          <Sparkles size={22} className="text-tutor" />
          AI Study Companion
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-4xl leading-tight mb-4">A learning partner that remembers what you're working on.</h1>
          <p className="text-brand-100/90 text-sm leading-relaxed">
            Upload your material, ask the Tutor grounded questions with real citations, and watch your mastery grow — one concept at a time.
          </p>
        </div>
        <p className="text-xs text-brand-100/70">Persistent · Contextual · Measurable</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
