import { cn } from '@/lib/utils';

export default function Button({ children, variant = 'primary', size = 'md', className, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all active:scale-95',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-3 text-sm',
        size === 'lg' && 'px-6 py-4 text-base',
        variant === 'primary' && 'bg-gold text-black hover:bg-gold-light disabled:opacity-50',
        variant === 'secondary' && 'bg-dark-card border border-dark-border text-white hover:border-gold disabled:opacity-50',
        variant === 'ghost' && 'text-gray-400 hover:text-white hover:bg-dark-muted disabled:opacity-50',
        variant === 'danger' && 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50',
        disabled && 'cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
