'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { guestApi } from '@/lib/api';
import { useGuestStore } from '@/store/guestStore';
import Spinner from '@/components/ui/Spinner';

export default function ComplaintsPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { addTicket } = useGuestStore();
  const [complaint, setComplaint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);
  const hotelPhone = process.env.NEXT_PUBLIC_HOTEL_PHONE || '+918218016643';

  async function handleSubmit() {
    if (!complaint.trim()) return;
    setSubmitting(true);
    try {
      const created = await guestApi.createTicket(token, { category: 'front_desk', subcategory: 'Complaint', description: complaint.trim(), priority: 'high' });
      addTicket(created); setTicket(created);
    } catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 glass-nav border-b border-outline-variant/30">
        <div className="flex items-center gap-4 px-5 py-4 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white border border-outline-variant/40 flex items-center justify-center text-on-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">Guest Services</p>
            <h1 className="text-lg font-semibold text-primary leading-tight">Complaints</h1>
          </div>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-lg mx-auto">
        {ticket ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-2xl font-semibold text-on-surface mb-2">Complaint Received</h2>
            <p className="text-sm text-on-surface-variant mb-1">Reference #{ticket.ticketNumber}</p>
            <p className="text-xs text-on-surface-variant mb-10 max-w-xs">We take your feedback seriously and will address this promptly.</p>
            <div className="flex gap-3 w-full max-w-xs">
              <button onClick={() => router.push(`/room/${token}`)} className="flex-1 py-3 rounded-xl border border-outline-variant/40 text-on-surface-variant text-sm font-medium bg-white">Home</button>
              <button onClick={() => router.push(`/room/${token}/tickets`)} className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-sm font-semibold">Track</button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">We're sorry you're having an issue. Describe your concern and we'll resolve it immediately.</p>

            <div className="bg-white rounded-2xl border border-outline-variant/40 px-4 py-4 mb-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-3">Your Complaint</p>
              <textarea value={complaint} onChange={e => setComplaint(e.target.value)}
                placeholder="Please describe your complaint in detail..."
                rows={5}
                className="w-full bg-transparent text-on-surface text-sm focus:outline-none resize-none leading-relaxed placeholder:text-on-surface-variant/40" />
            </div>

            <button onClick={handleSubmit} disabled={!complaint.trim() || submitting}
              className="w-full py-4 rounded-xl bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 mb-8"
              style={{ boxShadow: complaint.trim() ? '0 4px 16px rgba(30,80,50,0.25)' : 'none' }}>
              {submitting ? <Spinner size="sm" /> : (<><span className="material-symbols-outlined text-[16px]">send</span>Submit Complaint</>)}
            </button>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 gold-divider" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/40">or</span>
              <div className="flex-1 gold-divider" />
            </div>

            <a href={`https://wa.me/${hotelPhone.replace(/\D/g,'')}?text=Hi, I have a complaint regarding my stay`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl bg-white border border-outline-variant/30 shadow-sm mb-3 active:scale-[0.99] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center"><span className="text-xl">💬</span></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">Message on WhatsApp</p>
                <p className="text-xs text-on-surface-variant">Chat directly with the hotel team</p>
              </div>
              <span className="material-symbols-outlined text-[18px] text-[#25D366]">arrow_forward</span>
            </a>

            <a href={`tel:${hotelPhone}`}
              className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl bg-white border border-outline-variant/30 shadow-sm active:scale-[0.99] transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center"><span className="text-xl">📞</span></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">Call the Front Desk</p>
                <p className="text-xs text-on-surface-variant">Speak to someone right now</p>
              </div>
              <span className="material-symbols-outlined text-[18px] text-primary/50">arrow_forward</span>
            </a>
          </>
        )}
      </main>
    </div>
  );
}
