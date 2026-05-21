'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { guestApi } from '@/lib/api';
import { useGuestStore } from '@/store/guestStore';
import Spinner from '@/components/ui/Spinner';
import GuestNav from '@/components/ui/GuestNav';

const OPTIONS = [
  { id: 'wifi_help',      label: 'WiFi Help',              icon: 'wifi',         desc: 'Password or connection issues' },
  { id: 'luggage_up',     label: 'Luggage Assistance',     icon: 'luggage',      desc: 'Help with bags & storage' },
  { id: 'early_checkout', label: 'Early Checkout',         icon: 'logout',       desc: 'Check out before scheduled time' },
  { id: 'late_checkout',  label: 'Late Checkout Request',  icon: 'more_time',    desc: 'Extend your checkout time' },
  { id: 'invoice',        label: 'Request Invoice / Bill', icon: 'receipt_long', desc: 'Get itemised billing' },
  { id: 'airport_cab',    label: 'Airport Cab',            icon: 'local_taxi',   desc: 'Arrange airport transfer' },
  { id: 'other',          label: 'Special Request',        icon: 'chat_bubble',  desc: 'Anything else we can help with' },
];

export default function FrontDeskPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { addTicket } = useGuestStore();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      const opt = OPTIONS.find(o => o.id === selected);
      const created = await guestApi.createTicket(token, { category: 'front_desk', subcategory: opt?.label, description: note || null });
      addTicket(created); setTicket(created);
    } catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  }

  if (ticket) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <h2 className="text-2xl font-semibold text-on-surface mb-2">Request Sent</h2>
      <p className="text-sm text-on-surface-variant mb-1">Ticket #{ticket.ticketNumber}</p>
      <p className="text-xs text-on-surface-variant mb-10">Reception will assist you shortly.</p>
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={() => router.push(`/room/${token}`)} className="flex-1 py-3 rounded-xl border border-outline-variant/40 text-on-surface-variant text-sm font-medium bg-white">Home</button>
        <button onClick={() => router.push(`/room/${token}/tickets`)} className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-sm font-semibold">Track</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 glass-nav border-b border-outline-variant/30">
        <div className="flex items-center gap-4 px-5 py-4 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white border border-outline-variant/40 flex items-center justify-center text-on-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">Guest Services</p>
            <h1 className="text-lg font-semibold text-primary leading-tight">Front Desk</h1>
          </div>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-lg mx-auto">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-4">How can we assist?</p>
        <div className="space-y-2 mb-6">
          {OPTIONS.map((opt) => {
            const sel = selected === opt.id;
            return (
              <button key={opt.id} onClick={() => setSelected(opt.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all ${
                  sel ? 'bg-primary/5 border-primary/30' : 'bg-white border-outline-variant/40 hover:border-primary/20'
                }`}
                style={{ boxShadow: sel ? '0 0 0 3px rgba(30,80,50,0.06)' : '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sel ? 'bg-primary' : 'bg-surface-container/60'}`}>
                  <span className={`material-symbols-outlined text-[18px] ${sel ? 'text-on-primary' : 'text-on-surface-variant'}`}
                    style={{ fontVariationSettings: sel ? "'FILL' 1" : "'FILL' 0" }}>{opt.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">{opt.label}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{opt.desc}</p>
                </div>
                {sel && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-[12px]">check</span>
                </div>}
              </button>
            );
          })}
        </div>
        <div className="bg-white rounded-xl border border-outline-variant/40 px-4 py-3 mb-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold mb-2">Additional details</p>
          <textarea placeholder="Anything else we should know..." value={note} onChange={e => setNote(e.target.value)} rows={2}
            className="w-full bg-transparent text-on-surface text-sm focus:outline-none resize-none placeholder:text-on-surface-variant/40" />
        </div>
      </main>

      <div className="fixed bottom-[72px] left-0 right-0 px-5">
        <button onClick={handleSubmit} disabled={!selected || submitting}
          className="w-full py-4 rounded-xl bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ boxShadow: selected ? '0 4px 16px rgba(30,80,50,0.25)' : 'none' }}>
          {submitting ? <Spinner size="sm" /> : (<><span className="material-symbols-outlined text-[16px]">send</span>Send Request</>)}
        </button>
      </div>
      <GuestNav token={token} active="services" />
    </div>
  );
}
