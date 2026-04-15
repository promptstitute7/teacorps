'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { guestApi } from '@/lib/api';
import { useGuestStore } from '@/store/guestStore';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

const ISSUES = [
  { id: 'ac_heating',  label: 'AC / Heating issue',         icon: 'ac_unit' },
  { id: 'tv_remote',   label: 'TV / Remote not working',     icon: 'tv' },
  { id: 'lighting',    label: 'Lighting issue',              icon: 'lightbulb' },
  { id: 'hot_water',   label: 'Hot water / Plumbing',        icon: 'water_drop' },
  { id: 'electrical',  label: 'Electrical / Power outlet',   icon: 'bolt' },
  { id: 'room_lock',   label: 'Room lock / Key card issue',  icon: 'lock' },
  { id: 'other',       label: 'Other',                       icon: 'build' },
];

function GuestNav({ token, active }) {
  const items = [
    { key: 'home',      icon: 'home',                label: 'Home',      href: `/room/${token}` },
    { key: 'services',  icon: 'room_service',         label: 'Services',  href: `/room/${token}/service` },
    { key: 'concierge', icon: 'smart_toy',            label: 'Concierge', href: `/room/${token}/concierge` },
    { key: 'tickets',   icon: 'confirmation_number',  label: 'Requests',  href: `/room/${token}/tickets` },
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

export default function MaintenancePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { addTicket } = useGuestStore();

  const [selected, setSelected] = useState(null);
  const [urgency, setUrgency] = useState('normal');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);

  const autoPriority = ['room_lock', 'electrical'].includes(selected);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      const issue = ISSUES.find((i) => i.id === selected);
      const priority = autoPriority || urgency === 'urgent' ? 'high' : 'medium';
      const created = await guestApi.createTicket(token, {
        category: 'maintenance',
        subcategory: issue?.label,
        description: description || null,
        priority,
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
            check_circle
          </span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-on-surface mb-1">Request Sent</h2>
        <p className="text-on-surface-variant text-sm mb-2">Ticket #{ticket.ticketNumber}</p>
        <p className="text-on-surface-variant/60 text-xs mb-6">Our team will be with you shortly.</p>
        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={() => router.push(`/room/${token}`)}
            className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-primary font-label font-bold text-sm uppercase tracking-widest">
            Home
          </button>
          <button onClick={() => router.push(`/room/${token}/tickets`)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary font-label font-bold text-sm uppercase tracking-widest">
            Track
          </button>
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
            <h1 className="font-serif text-xl font-bold text-primary leading-tight">Maintenance</h1>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 space-y-3">
        <p className="text-xs text-on-surface-variant uppercase tracking-widest font-label mb-4">Select issue type</p>

        {ISSUES.map((issue) => {
          const isSelected = selected === issue.id;
          return (
            <button
              key={issue.id}
              onClick={() => setSelected(issue.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'bg-primary/5 border-primary/30'
                  : 'bg-surface-container-lowest border-outline-variant/15 hover:border-outline-variant/40'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-primary-container/40' : 'bg-surface-container-low'
              }`}>
                <span className={`material-symbols-outlined ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}
                  style={isSelected ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {issue.icon}
                </span>
              </div>
              <span className="font-label font-medium text-sm flex-1 text-on-surface">{issue.label}</span>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-sm">check</span>
                </div>
              )}
            </button>
          );
        })}

        {/* Urgency */}
        <div className="pt-2">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label mb-3">Urgency</p>
          <div className="flex gap-3">
            {[
              { key: 'normal', icon: 'schedule',  label: 'Normal' },
              { key: 'urgent', icon: 'bolt',       label: 'Urgent' },
            ].map((u) => (
              <button
                key={u.key}
                onClick={() => setUrgency(u.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-label font-bold text-xs uppercase tracking-widest transition-all ${
                  urgency === u.key
                    ? u.key === 'urgent'
                      ? 'bg-error/5 border-error/30 text-error'
                      : 'bg-primary/5 border-primary/30 text-primary'
                    : 'bg-surface-container-lowest border-outline-variant/15 text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-sm"
                  style={urgency === u.key ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {u.icon}
                </span>
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {autoPriority && (
          <div className="flex items-center gap-3 px-4 py-3 bg-error/5 border border-error/20 rounded-xl">
            <span className="material-symbols-outlined text-error text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
            <p className="text-error text-sm font-label">This issue is automatically high priority.</p>
          </div>
        )}

        {selected === 'other' && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label mb-2">Describe the issue</p>
            <textarea
              placeholder="Provide more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary py-3 text-on-surface placeholder:text-on-surface-variant/40 text-sm focus:outline-none resize-none transition-colors"
            />
          </div>
        )}
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
              Report Issue
            </>
          )}
        </button>
      </div>

      <GuestNav token={token} active="services" />
    </div>
  );
}
