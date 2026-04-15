'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStaffStore } from '@/store/staffStore';
import { staffApi } from '@/lib/api';
import { subscribeToStaffTickets, unsubscribe } from '@/lib/realtime';
import TicketDetailPanel from '@/components/staff/TicketDetailPanel';
import Spinner from '@/components/ui/Spinner';
import { timeAgo } from '@/lib/utils';

const CATEGORIES = ['all', 'room_service', 'housekeeping', 'maintenance', 'front_desk', 'emergency'];
const CAT_LABELS = {
  all: 'All', room_service: 'Room Service', housekeeping: 'Housekeeping',
  maintenance: 'Maintenance', front_desk: 'Front Desk', emergency: 'Emergency',
};

const CATEGORY_ICONS = {
  room_service: 'room_service', housekeeping: 'cleaning_services',
  maintenance: 'build', front_desk: 'luggage', emergency: 'emergency_home',
};

function priorityBorder(priority) {
  switch (priority) {
    case 'emergency': return 'border-l-error';
    case 'high':      return 'border-l-primary';
    case 'medium':    return 'border-l-secondary-fixed-dim';
    default:          return 'border-l-tertiary';
  }
}

function priorityBadgeStyle(priority) {
  switch (priority) {
    case 'emergency': return { label: 'Urgent',  cls: 'text-error bg-error-container' };
    case 'high':      return { label: 'High',    cls: 'text-primary bg-primary-container' };
    case 'medium':    return { label: 'Medium',  cls: 'text-on-secondary-container bg-secondary-container' };
    default:          return { label: 'Low',     cls: 'text-tertiary bg-tertiary-fixed' };
  }
}

function iconBgStyle(priority) {
  switch (priority) {
    case 'emergency': return { bg: 'bg-error-container', icon: 'text-error' };
    case 'high':      return { bg: 'bg-primary-container/30', icon: 'text-primary' };
    case 'medium':    return { bg: 'bg-secondary-container/30', icon: 'text-on-secondary-container' };
    default:          return { bg: 'bg-tertiary-container/20', icon: 'text-tertiary' };
  }
}

export default function StaffTicketFeed() {
  const { token } = useAuthStore();
  const { tickets, total, filter, setTickets, setFilter, prependTicket, updateTicket, selectedTicket, soundEnabled } = useStaffStore();
  const [loading, setLoading] = useState(true);
  const [escalationAlerts, setEscalationAlerts] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    fetchTickets();

    const channel = subscribeToStaffTickets({
      onInsert: (ticket) => {
        prependTicket(ticket);
        if (soundEnabled && audioRef.current) audioRef.current.play().catch(() => {});
      },
      onUpdate: (ticket) => {
        updateTicket(ticket.id, { status: ticket.status, assignedTo: ticket.assigned_to });
      },
      onEscalation: (ticket) => {
        updateTicket(ticket.id, { status: 'escalated', priority: ticket.priority });
        const alertId = Date.now();
        setEscalationAlerts((prev) => [
          ...prev,
          { id: alertId, message: `Room ${ticket.room_id} escalated`, count: ticket.escalation_count },
        ]);
        setTimeout(() => setEscalationAlerts((prev) => prev.filter((a) => a.id !== alertId)), 8000);
        if (soundEnabled && audioRef.current) audioRef.current.play().catch(() => {});
      },
    });

    return () => unsubscribe(channel);
  }, [token]);

  useEffect(() => { if (token) fetchTickets(); }, [filter]);

  async function fetchTickets() {
    setLoading(true);
    const params = {};
    if (filter.category && filter.category !== 'all') params.category = filter.category;
    if (filter.status) params.status = filter.status;
    try {
      const data = await staffApi.getTickets(token, params);
      setTickets(data.tickets, data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div className="bg-background text-on-surface font-body min-h-screen pb-24">
      <audio ref={audioRef} src="/chime.mp3" preload="auto" />

      {/* Escalation Alerts */}
      {escalationAlerts.map((alert) => (
        <div key={alert.id} className="animate-slideInTop fixed top-20 left-4 right-4 z-50 bg-error text-on-error p-4 rounded-xl shadow-lg flex items-center gap-3">
          <span className="material-symbols-outlined animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <span className="font-label font-bold tracking-tight text-sm uppercase flex-1">
            ESCALATED — {alert.message}
          </span>
          <button onClick={() => setEscalationAlerts((p) => p.filter((a) => a.id !== alert.id))}>
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ))}

      <main className="pt-20 px-4">
        {/* Filter Pills */}
        <section className="mt-4 mb-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 whitespace-nowrap py-2">
            {CATEGORIES.map((cat) => {
              const isActive = filter.category === cat || (!filter.category && cat === 'all');
              return (
                <button
                  key={cat}
                  onClick={() => setFilter({ category: cat })}
                  className={`px-5 py-2.5 rounded-full font-label text-xs font-medium tracking-wide transition-colors ${
                    isActive
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface-variant ghost-border hover:bg-surface-container-high'
                  }`}
                >
                  {CAT_LABELS[cat]}
                  {cat === 'emergency' && tickets.filter((t) => t.category === 'emergency' && t.status !== 'completed').length > 0 && (
                    <span className="ml-1.5 bg-error text-on-error text-[10px] rounded-full px-1.5 py-0.5">
                      {tickets.filter((t) => t.category === 'emergency' && t.status !== 'completed').length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Ticket Feed */}
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl block mb-3">confirmation_number</span>
            <p className="text-on-surface-variant text-sm">No tickets found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const badge = priorityBadgeStyle(ticket.priority);
              const iconStyle = iconBgStyle(ticket.priority);
              const catIcon = CATEGORY_ICONS[ticket.category] || 'confirmation_number';
              return (
                <button
                  key={ticket.id}
                  onClick={() => useStaffStore.getState().selectTicket(ticket)}
                  className={`w-full text-left relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient ghost-border border-l-4 ${priorityBorder(ticket.priority)}`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${iconStyle.bg} flex items-center justify-center`}>
                          <span className={`material-symbols-outlined ${iconStyle.icon}`} style={ticket.priority === 'emergency' ? { fontVariationSettings: "'FILL' 1" } : {}}>{catIcon}</span>
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-bold text-on-surface">Room {ticket.room?.roomNumber}</h3>
                          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-label">
                            {ticket.subcategory || CAT_LABELS[ticket.category]}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-label font-bold uppercase tracking-wider px-2 py-1 rounded-md ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    {ticket.description && (
                      <p className="text-on-surface-variant text-xs mb-3 leading-relaxed line-clamp-2">{ticket.description}</p>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {timeAgo(ticket.createdAt)}
                      </span>
                      <span className="text-primary font-label text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">
                        {ticket.status === 'new' ? 'Respond Now' : ticket.status === 'acknowledged' ? 'In Progress' : 'View Details'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {selectedTicket && <TicketDetailPanel onUpdate={fetchTickets} />}
    </div>
  );
}
