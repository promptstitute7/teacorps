'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStaffStore } from '@/store/staffStore';
import { staffApi } from '@/lib/api';
import TicketCard from '@/components/staff/TicketCard';
import TicketDetailPanel from '@/components/staff/TicketDetailPanel';
import Spinner from '@/components/ui/Spinner';

export default function MyTasksPage() {
  const { token, staff } = useAuthStore();
  const { selectedTicket } = useStaffStore();
  const [data, setData] = useState({ tickets: [], completedToday: 0 });
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      staffApi.getMyTickets(token),
      staffApi.getMe(token),
    ]).then(([taskData, meData]) => {
      setData(taskData);
      setMe(meData);
      setLoading(false);
    });
  }, [token]);

  async function refresh() {
    const taskData = await staffApi.getMyTickets(token);
    setData(taskData);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = [
    { label: 'Open Tasks',  value: data.tickets.length, icon: 'confirmation_number', color: 'text-primary bg-primary-container/30' },
    { label: 'Done Today',  value: data.completedToday,  icon: 'task_alt',           color: 'text-tertiary bg-tertiary-fixed' },
    { label: 'Avg Rating',  value: me?.avgRating ? `${me.avgRating}` : '—', icon: 'star', color: 'text-secondary bg-secondary-container' },
  ];

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-5 bg-background text-on-surface">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-label">My Work</p>
        <h2 className="font-serif text-xl font-bold text-on-surface">
          {staff?.name ? staff.name.split(' ')[0] : 'My'} Tasks
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-4 text-center shadow-ambient">
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: stat.label === 'Avg Rating' ? "'FILL' 1" : "'FILL' 0" }}>
                {stat.icon}
              </span>
            </div>
            <div className="font-serif text-xl font-bold text-on-surface">{stat.value}</div>
            <div className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      {me?.badges && me.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {me.badges.map((badge, i) => (
            <span key={i}
              className="px-3 py-1.5 bg-primary-container/20 border border-primary/10 rounded-full text-xs font-label font-bold text-primary tracking-wide">
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Tickets */}
      <div className="space-y-3">
        <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-[0.2em]">
          {data.tickets.length > 0 ? `${data.tickets.length} Open Tasks` : 'No open tasks — great work'}
        </p>
        {data.tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
        {data.tickets.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl mb-3"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              task_alt
            </span>
            <p className="text-on-surface-variant text-sm">Queue clear. All tasks resolved.</p>
          </div>
        )}
      </div>

      {selectedTicket && <TicketDetailPanel onUpdate={refresh} />}
    </div>
  );
}
