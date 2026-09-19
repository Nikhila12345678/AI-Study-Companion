import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-white shadow-soft flex items-center justify-center mb-4 text-brand-500">
          <Icon size={22} />
        </div>
      )}
      <h3 className="font-display text-lg text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink/60 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
