'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStaffStore } from '@/store/staffStore';
import { staffApi } from '@/lib/api';
import { timeAgo, CATEGORY_LABELS, STATUS_LABELS } from '@/lib/utils';

const CAT_ICONS = {
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

function priorityBadge(priority) {
  switch (priority) {
    case 'emergency': return { label: 'Urgent',  cls: 'text-error bg-error-container' };
    case 'high':      return { label: 'High',    cls: 'text-primary bg-primary-container' };
    case 'medium':    return { label: 'Medium',  cls: 'text-on-secondary-container bg-secondary-container' };
    default:          return { label: 'Low',     cls: 'text-tertiary bg-tertiary-fixed' };
  }
}

export default function TicketCard({ ticket }) {
  const { token, staff } = useAuthStore();
  const { selectTicket, updateTicket } = useStaffStore();
  const [actioning, setActioning] = useState(false);

  const slaMs = ticket.slaDeadline ? new Date(ticket.slaDeadline) - Date.now() : null;
  const slaMinutes = slaMs ? Math.ceil(slaMs / 60000) : null;
  const slaExceeded = slaMinutes !== null && slaMinutes <= 0;
  const slaCritical = slaMinutes !== null && slaMinutes <= 5 && slaMinutes > 0;

  const badge = priorityBadge(ticket.priority);
  const catIcon = CAT_ICONS[ticket.category] || 'confirmation_number';

  async function acknowledge(e) {
    e.stopPropagation();
    setActioning(true);
    try {
      await staffApi.updateTicket(token, ticket.id, { status: 'acknowledged' });
      updateTicket(ticket.id, { status: 'acknowledged' });
    } catch (err) { console.error(err); }
    finally { setActioning(false); }
  }

  async function assignToMe(e) {
    e.stopPropagation();
    setActioning(true);
    try {
      await staffApi.updateTicket(token, ticket.id, {
        assigned_to: staff.id,
        status: ticket.status === 'new' ? 'acknowledged' : ticket.status,
      });
      updateTicket(ticket.id, {
        assignedTo: staff.id,
        status: ticket.status === 'new' ? 'acknowledged' : ticket.status,
      });
    } catch (err) { console.error(err); }
    finally { setActioning(false); }
  }

  return (
    <button
      onClick={() => selectTicket(ticket)}
      className={`w-full text-left relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient ghost-border border-l-4 ${priorityBorder(ticket.priority)}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              ticket.priority === 'emergency' ? 'bg-error-container' :
              ticket.priority === 'high' ? 'bg-primary-container/30' :
              'bg-secondary-container/30'
            }`}>
              <span className={`material-symbols-outlined ${
                ticket.priority === 'emergency' ? 'text-error' :
                ticket.priority === 'high' ? 'text-primary' : 'text-on-secondary-container'
              }`}
                style={ticket.priority === 'emergency' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {catIcon}
              </span>
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-on-surface">Room {ticket.room?.roomNumber}</h3>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-label">
                {ticket.subcategory || CATEGORY_LABELS[ticket.category]}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-label font-bold uppercase tracking-wider px-2 py-1 rounded-md ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {ticket.description && (
          <p className="text-on-surface-variant text-xs mb-3 leading-relaxed line-clamp-2 italic">
            "{ticket.description}"
          </p>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {timeAgo(ticket.createdAt)}
            </span>
            {slaMs !== null && (
              <span className={`flex items-center gap-1 font-medium ${
                slaExceeded ? 'text-error' : slaCritical ? 'text-primary' : ''
              }`}>
                <span className="material-symbols-outlined text-sm">timer</span>
                {slaExceeded ? 'SLA exceeded' : `${slaMinutes}m left`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {ticket.status === 'new' && (
              <button
                disabled={actioning}
                onClick={acknowledge}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-label font-bold uppercase tracking-widest border border-primary/20 disabled:opacity-50"
              >
                Acknowledge
              </button>
            )}
            {!ticket.assignedTo && ticket.status !== 'completed' && (
              <button
                disabled={actioning}
                onClick={assignToMe}
                className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-label font-bold uppercase tracking-widest border border-outline-variant/30 disabled:opacity-50"
              >
                Assign Me
              </button>
            )}
            <span className={`text-[10px] font-label font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
              ticket.status === 'completed' ? 'text-tertiary bg-tertiary-fixed' :
              ticket.status === 'escalated' ? 'text-error bg-error-container' :
              ticket.status === 'in_progress' ? 'text-on-secondary-container bg-secondary-container' :
              'text-on-surface-variant bg-surface-container'
            }`}>
              {STATUS_LABELS[ticket.status]}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
