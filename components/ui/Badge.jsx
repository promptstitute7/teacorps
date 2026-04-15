import { cn } from '@/lib/utils';

const variants = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  acknowledged: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  escalated: 'bg-red-500/10 text-red-400 border-red-500/20',
  emergency: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function Badge({ label, variant = 'new', className }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
      variants[variant] || variants.new,
      className
    )}>
      {label}
    </span>
  );
}
