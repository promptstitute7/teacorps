import { cn } from '@/lib/utils';

export default function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <input
        className={cn(
          'w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500',
          'focus:outline-none focus:border-gold/60 transition-colors',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
