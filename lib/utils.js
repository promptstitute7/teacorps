import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const PRIORITY_COLORS = {
  emergency: 'text-red-500 bg-red-500/10 border-red-500/30',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  low: 'text-green-400 bg-green-400/10 border-green-400/30',
};

export const STATUS_LABELS = {
  new: 'New',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  escalated: 'Escalated',
};

export const CATEGORY_ICONS = {
  room_service: '🍽️',
  housekeeping: '🧹',
  maintenance: '🔧',
  front_desk: '🛎️',
  emergency: '🆘',
};

export const CATEGORY_LABELS = {
  room_service: 'Room Service',
  housekeeping: 'Housekeeping',
  maintenance: 'Maintenance',
  front_desk: 'Front Desk',
  emergency: 'Emergency',
};
