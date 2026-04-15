'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStaffStore } from '@/store/staffStore';
import { staffApi, guestApi } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';
import { formatTime, STATUS_LABELS, CATEGORY_LABELS, timeAgo } from '@/lib/utils';

const STATUSES = [
  { key: 'new',         icon: 'fiber_new',     label: 'New' },
  { key: 'acknowledged',icon: 'check_circle',   label: 'Acknowledged' },
  { key: 'in_progress', icon: 'engineering',    label: 'In Progress' },
  { key: 'escalated',   icon: 'priority_high',  label: 'Escalated' },
  { key: 'completed',   icon: 'task_alt',       label: 'Completed' },
  { key: 'cancelled',   icon: 'cancel',         label: 'Cancelled' },
];


export default function TicketDetailPanel({ onUpdate }) {
  const { token, staff } = useAuthStore();
  const { selectedTicket, clearSelection, updateTicket } = useStaffStore();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!selectedTicket) return;
    setLoading(true);
    setNote('');
    setStatus(selectedTicket.status);
    guestApi.getTicket(selectedTicket.id)
      .then((t) => { setTicket(t); setStatus(t.status); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedTicket?.id]);

  async function handleSave() {
    setSaving(true);
    try {
      const updates = {};
      if (status !== ticket.status) updates.status = status;
      if (note.trim()) updates.note = note.trim();
      if (Object.keys(updates).length > 0) {
        const updated = await staffApi.updateTicket(token, ticket.id, updates);
        setTicket(updated);
        updateTicket(ticket.id, { status: updated.status });
        setNote('');
        onUpdate?.();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function assignToMe() {
    setSaving(true);
    try {
      const updated = await staffApi.updateTicket(token, ticket.id, {
        assigned_to: staff.id,
        status: ticket.status === 'new' ? 'acknowledged' : ticket.status,
      });
      setTicket(updated);
      updateTicket(ticket.id, { assignedTo: staff.id, status: updated.status });
      setStatus(updated.status);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!selectedTicket) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[60]"
        onClick={clearSelection}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 h-[82vh] bg-surface rounded-t-[32px] z-[70] shadow-[0_-16px_48px_rgba(27,28,25,0.12)] flex flex-col overflow-hidden">
        {/* Handlebar */}
        <div className="w-full flex justify-center pt-4 pb-2 shrink-0">
          <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full" />
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : !ticket ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-on-surface-variant text-sm">Could not load ticket.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 pb-8 no-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary tracking-[0.2em] font-label">
                    ROOM {ticket.room?.roomNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-label ${
                    ticket.priority === 'emergency' ? 'bg-error text-on-error' :
                    ticket.priority === 'high' ? 'bg-primary-container text-on-primary-container' :
                    'bg-secondary-container text-on-secondary-container'
                  }`}>
                    {ticket.priority?.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-on-surface leading-tight">
                  {ticket.subcategory || CATEGORY_LABELS[ticket.category]}
                </h2>
              </div>
              <button
                onClick={clearSelection}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Assignment */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low mb-6 border border-outline-variant/10">
              <div className="w-11 h-11 rounded-full bg-primary-container/30 flex items-center justify-center text-primary font-bold text-sm">
                {ticket.assignedStaff ? ticket.assignedStaff.name[0] : '?'}
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-label">
                  Assigned Staff
                </p>
                <p className="text-sm font-bold text-on-surface">
                  {ticket.assignedStaff ? ticket.assignedStaff.name : 'Unassigned'}
                </p>
              </div>
              {!ticket.assignedStaff && (
                <button
                  onClick={assignToMe}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-label font-bold tracking-wide border border-primary/20 disabled:opacity-50"
                >
                  Assign to Me
                </button>
              )}
            </div>

            {/* Description */}
            {ticket.description && (
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary font-label">Description</h4>
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-on-surface-variant leading-relaxed text-sm italic">
                    "{ticket.description}"
                  </p>
                  <div className="mt-3 pt-3 border-t border-outline-variant/10 flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="text-xs font-medium">{timeAgo(ticket.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Items ordered */}
            {ticket.items && ticket.items.length > 0 && (
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary font-label">Items Ordered</h4>
                <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 divide-y divide-outline-variant/10">
                  {ticket.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center px-4 py-3 text-sm">
                      <span className="text-on-surface">{item.name} × {item.qty}</span>
                      {item.price && <span className="text-primary font-bold">₹{item.price * item.qty}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status grid */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary font-label">Update Status</h4>
              <div className="grid grid-cols-2 gap-3">
                {STATUSES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStatus(s.key)}
                    className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border font-label font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${
                      status === s.key
                        ? 'border-primary/20 text-primary bg-primary/5'
                        : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm"
                      style={status === s.key ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {s.icon}
                    </span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal note */}
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary font-label">Internal Notes</h4>
              <div className="relative">
                <textarea
                  placeholder="Add a private note for the team..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary focus:ring-0 py-3 px-0 text-sm text-on-surface placeholder:text-on-surface-variant/40 resize-none outline-none transition-colors"
                />
              </div>
            </div>

            {/* Timeline */}
            {ticket.events && ticket.events.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary font-label">Timeline</h4>
                <div className="space-y-3">
                  {ticket.events.map((e) => (
                    <div key={e.id} className="flex items-start gap-3 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-container mt-1.5 shrink-0" />
                      <div className="text-on-surface-variant">
                        <span className="text-outline">{formatTime(e.createdAt)}</span>
                        <span className="ml-2">
                          {e.eventType === 'created' && 'Ticket created by guest'}
                          {e.eventType === 'acknowledged' && 'Acknowledged by staff'}
                          {e.eventType === 'assigned' && 'Assigned to staff'}
                          {e.eventType === 'status_changed' && `→ ${STATUS_LABELS[e.newValue] || e.newValue}`}
                          {e.eventType === 'completed' && 'Marked completed'}
                          {e.eventType === 'escalated' && 'Escalated to manager'}
                          {e.eventType === 'rated' && `Rated ${e.newValue}/5`}
                        </span>
                        {e.note && <span className="text-outline"> — {e.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-label font-bold text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Spinner size="sm" /> : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
