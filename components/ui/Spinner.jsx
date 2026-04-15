import { cn } from '@/lib/utils';

export default function Spinner({ size = 'md', className }) {
  return (
    <div className={cn(
      'border-2 border-dark-border border-t-gold rounded-full animate-spin',
      size === 'sm' && 'w-4 h-4',
      size === 'md' && 'w-6 h-6',
      size === 'lg' && 'w-10 h-10',
      className
    )} />
  );
}
