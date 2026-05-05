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
  const [submitted, setSubmitted] = useState(false);
  const [ticket, setTicket] = useState(null);

  const hotelPhone = process.env.NEXT_PUBLIC_HOTEL_PHONE || '+918218016643';

  async function handleSubmit() {
    if (!complaint.trim()) return;
    setSubmitting(true);
    try {
      const created = await guestApi.createTicket(token, {
        category: 'front_desk',
        subcategory: 'Complaint',
        description: complaint.trim(),
        priority: 'high',
      });
      addTicket(created);
      setTicket(created);
      setSubmitted(true);
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans pb-10">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex items-center gap-4 px-5 py-4">
          <button onClick={() => router.back()} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Guest Services</p>
            <h1 className="text-lg font-bold text-primary leading-tight">Complaints</h1>
          </div>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-lg mx-auto">

        {submitted ? (
          <div className="flex flex-col items-center text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">Complaint Received</h2>
            <p className="text-on-surface-variant text-sm mb-1">Reference #{ticket?.ticketNumber}</p>
            <p className="text-on-surface-variant text-sm mb-8">
              We take your feedback seriously. Our team will address this promptly.
            </p>
            <div className="flex gap-3 w-full max-w-xs">
              <button
                onClick={() => router.push(`/room/${token}`)}
                className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-primary font-semibold text-sm"
              >
                Home
              </button>
              <button
                onClick={() => router.push(`/room/${token}/tickets`)}
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm"
              >
                Track
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-on-surface-variant mb-6">
              We're sorry to hear you're having an issue. Please describe your concern and we'll resolve it as quickly as possible.
            </p>

            {/* Complaint text box */}
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant block mb-2">
                Your Complaint
              </label>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Please describe your complaint in detail..."
                rows={6}
                className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!complaint.trim() || submitting}
              className="w-full py-4 rounded-xl bg-primary text-on-primary font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 mb-8"
            >
              {submitting ? <Spinner size="sm" /> : (
                <>
                  <span className="material-symbols-outlined text-sm">send</span>
                  Submit Complaint
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-outline-variant/20" />
              <span className="text-xs text-on-surface-variant uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-outline-variant/20" />
            </div>

            {/* WhatsApp direct */}
            <a
              href={`https://wa.me/${hotelPhone.replace(/\D/g, '')}?text=Hi, I have a complaint regarding my stay in Room ${params.token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 w-full px-5 py-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl mb-4"
            >
              <span className="text-2xl">💬</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">Message us on WhatsApp</p>
                <p className="text-xs text-on-surface-variant">Chat directly with the hotel team</p>
              </div>
              <span className="material-symbols-outlined text-[#25D366]">arrow_forward</span>
            </a>

            {/* Direct call */}
            <a
              href={`tel:${hotelPhone}`}
              className="flex items-center gap-4 w-full px-5 py-4 bg-primary/5 border border-primary/20 rounded-2xl"
            >
              <span className="text-2xl">📞</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">Call the Front Desk</p>
                <p className="text-xs text-on-surface-variant">Speak to someone right now</p>
              </div>
              <span className="material-symbols-outlined text-primary">arrow_forward</span>
            </a>
          </>
        )}
      </main>
    </div>
  );
}
