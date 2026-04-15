'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { guestApi } from '@/lib/api';
import { useGuestStore } from '@/store/guestStore';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

const OPTIONS = [
  { id: 'clean_room',         label: 'Clean my room now',  icon: 'cleaning_services' },
  { id: 'fresh_towels',       label: 'Fresh towels',        icon: 'dry' },
  { id: 'change_linen',       label: 'Change bed linen',    icon: 'bed' },
  { id: 'restock_toiletries', label: 'Restock toiletries',  icon: 'soap' },
  { id: 'dnd',                label: 'Do Not Disturb',      icon: 'do_not_disturb_on' },
  { id: 'schedule',           label: 'Schedule cleaning',   icon: 'calendar_clock' },
];

function GuestNav({ token, active }) {
  const items = [
    { key: 'home',      icon: 'home',                 label: 'Home',      href: `/room/${token}` },
    { key: 'services',  icon: 'room_service',          label: 'Services',  href: `/room/${token}/service` },
    { key: 'concierge', icon: 'smart_toy',             label: 'Concierge', href: `/room/${token}/concierge` },
    { key: 'tickets',   icon: 'confirmation_number',   label: 'Requests',  href: `/room/${token}/tickets` },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl border-t border-outline-variant/15 shadow-ambient-up">
      <div className="flex justify-around items-center pt-3 pb-6">
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <Link key={item.key} href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary -translate-y-0.5' : 'text-on-surface-variant/60'}`}>
              <span className="material-symbols-outlined text-2xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className={`text-[10px] uppercase tracking-widest font-label ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function HousekeepingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { addTicket, setDnd } = useGuestStore();

  const [selected, setSelected] = useState(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);

    if (selected === 'dnd') {
      setDnd(true);
      await guestApi.toggleDnd(token, true).catch(console.error);
      setTicket({ ticketNumber: 'DND', status: 'completed' });
      setSubmitting(false);
      return;
    }

    try {
      const option = OPTIONS.find((o) => o.id === selected);
      const description = selected === 'schedule' && scheduleTime
        ? `Schedule cleaning at ${scheduleTime}`
        : note || option?.label;

      const created = await guestApi.createTicket(token, {
        category: 'housekeeping',
        subcategory: option?.label,
        description,
      });
      addTicket(created);
      setTicket(created);
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (ticket) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-container/30 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {ticket.ticketNumber === 'DND' ? 'do_not_disturb_on' : 'check_circle'}
          </span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-on-surface mb-1">
          {ticket.ticketNumber === 'DND' ? 'Do Not Disturb On' : 'Request Sent'}
        </h2>
        {ticket.ticketNumber !== 'DND' && (
          <p className="text-on-surface-variant text-sm mb-6">Ticket #{ticket.ticketNumber}</p>
        )}
        <div className="flex gap-3 w-full max-w-xs mt-4">
          <button
            onClick={() => router.push(`/room/${token}`)}
            className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-primary font-label font-bold text-sm uppercase tracking-widest"
          >
            Home
          </button>
          {ticket.ticketNumber !== 'DND' && (
            <button
              onClick={() => router.push(`/room/${token}/tickets`)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary font-label font-bold text-sm uppercase tracking-widest"
            >
              Track
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center gap-4 px-6 py-4">
          <button onClick={() => router.back()} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-label">Guest Services</p>
            <h1 className="font-serif text-xl font-bold text-primary leading-tight">Housekeeping</h1>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 space-y-3">
        <p className="text-xs text-on-surface-variant uppercase tracking-widest font-label mb-4">Select a service</p>

        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'bg-primary/5 border-primary/30 text-on-surface'
                  : 'bg-surface-container-lowest border-outline-variant/15 text-on-surface hover:border-outline-variant/40'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-primary-container/40' : 'bg-surface-container-low'
              }`}>
                <span className={`material-symbols-outlined ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}
                  style={isSelected ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {opt.icon}
                </span>
              </div>
              <span className="font-label font-medium text-sm flex-1">{opt.label}</span>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-sm">check</span>
                </div>
              )}
            </button>
          );
        })}

        {selected === 'schedule' && (
          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary py-3 text-on-surface focus:outline-none transition-colors"
          />
        )}

        <div className="pt-2">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label mb-2">Additional notes (optional)</p>
          <textarea
            placeholder="Any special instructions..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary py-3 text-on-surface placeholder:text-on-surface-variant/40 text-sm focus:outline-none resize-none transition-colors"
          />
        </div>
      </main>

      {/* CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-6 pb-2">
        <button
          onClick={handleSubmit}
          disabled={!selected || submitting}
          className="w-full py-4 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary font-label font-bold text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {submitting ? <Spinner size="sm" /> : (
            <>
              <span className="material-symbols-outlined text-sm">send</span>
              Submit Request
            </>
          )}
        </button>
      </div>

      <GuestNav token={token} active="services" />
    </div>
  );
}
