'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGuestStore } from '@/store/guestStore';
import { guestApi } from '@/lib/api';
import { subscribeToGuestTickets, unsubscribe } from '@/lib/realtime';

// ── Phone Verify Screen ───────────────────────────────────────────────────────
function PhoneVerifyScreen({ token, onVerified }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await guestApi.verifyPhone(token, phone.trim());
      onVerified({ phone: phone.trim(), ...data });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-outline-variant/40 shadow-sm bg-white mb-4">
            <img src="/logo.jpg" alt="Hotel Tea Square" className="w-full h-full object-cover" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">Hotel Tea Square</p>
          <h1 className="text-2xl font-semibold text-primary mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>Welcome</h1>
          <p className="text-sm text-on-surface-variant mt-2 text-center leading-relaxed">
            Enter the mobile number you provided at check-in to access your room portal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl border border-outline-variant/40 px-4 py-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-2">Mobile Number</p>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter your 10-digit number"
              type="tel"
              inputMode="numeric"
              required
              autoFocus
              className="w-full bg-transparent text-on-surface text-base focus:outline-none placeholder:text-on-surface-variant/40 tracking-widest"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200/60">
              <span className="material-symbols-outlined text-[16px] text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button type="submit" disabled={!phone.trim() || loading}
            className="w-full py-4 rounded-xl bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ boxShadow: phone.trim() ? '0 4px 16px rgba(30,80,50,0.25)' : 'none' }}>
            {loading
              ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <><span className="material-symbols-outlined text-[16px]">arrow_forward</span>Enter Room Portal</>
            }
          </button>
        </form>

        <p className="text-center text-[11px] text-on-surface-variant/50 mt-6">
          If you haven't checked in yet, please contact the front desk.
        </p>
      </div>
    </div>
  );
}

// ── Stay Ended Screen ─────────────────────────────────────────────────────────
function StayEndedScreen({ onRetry }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-3xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
      </div>
      <h2 className="text-xl font-semibold text-on-surface mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Your stay has ended</h2>
      <p className="text-sm text-on-surface-variant mb-8 max-w-xs leading-relaxed">
        This room portal is no longer active. Thank you for staying with Hotel Tea Square.
      </p>
      <div className="w-14 h-14 rounded-xl overflow-hidden border border-outline-variant/30 mx-auto">
        <img src="/logo.jpg" alt="Hotel Tea Square" className="w-full h-full object-cover" />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary mt-3">Hotel Tea Square</p>
      <button onClick={onRetry} className="mt-8 text-xs text-on-surface-variant underline underline-offset-2">
        Try a different number
      </button>
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function RoomLayout({ children }) {
  const params = useParams();
  const token = params.token;
  const { session, setSession, clearSession, setRoom, updateTicketStatus } = useGuestStore();

  // 'loading' | 'verify' | 'ended' | 'ready'
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let channel = null;

    async function checkSession() {
      // No session, or session belongs to a different room
      if (!session || session.roomToken !== token) {
        setStatus('verify');
        return;
      }

      // Session has passed checkout date
      if (new Date() > new Date(session.checkOutDate)) {
        clearSession();
        setStatus('ended');
        return;
      }

      // Re-verify with server (catches staff-triggered checkouts)
      try {
        await guestApi.verifyPhone(token, session.phone);
        const { room, reservation } = await guestApi.getRoom(token);
        setRoom(room, reservation);
        channel = subscribeToGuestTickets(room.id, {
          onUpdate: (ticket) => updateTicketStatus(ticket.id, ticket.status),
        });
        setStatus('ready');
      } catch {
        clearSession();
        setStatus('ended');
      }
    }

    checkSession();
    return () => unsubscribe(channel);
  }, [token]);

  async function handleVerified(sessionData) {
    const newSession = {
      roomToken: token,
      phone: sessionData.phone,
      reservationId: sessionData.reservationId,
      guestName: sessionData.guestName,
      checkOutDate: sessionData.checkOutDate,
    };
    setSession(newSession);

    try {
      const { room, reservation } = await guestApi.getRoom(token);
      setRoom(room, reservation);
    } catch { /* non-fatal */ }

    setStatus('ready');
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (status === 'verify') return <PhoneVerifyScreen token={token} onVerified={handleVerified} />;
  if (status === 'ended') return <StayEndedScreen onRetry={() => setStatus('verify')} />;

  return <>{children}</>;
}
