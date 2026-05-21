'use client';
import { useParams, useRouter } from 'next/navigation';
import { useGuestStore } from '@/store/guestStore';
import { guestApi } from '@/lib/api';
import GuestNav from '@/components/ui/GuestNav';

const SERVICES = [
  { emoji: '🍽️', label: 'Room Service',  href: 'service' },
  { emoji: '🧹', label: 'Housekeeping',  href: 'housekeeping' },
  { emoji: '🔧', label: 'Maintenance',   href: 'maintenance' },
  { emoji: '🛎️', label: 'Front Desk',    href: 'front-desk' },
  { emoji: '📍', label: 'Local Info',    href: 'local-info' },
  { emoji: '💬', label: 'Complaints',    href: 'complaints' },
];

export default function GuestHome() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { room, reservation, dnd, setDnd } = useGuestStore();

  const hotelPhone = process.env.NEXT_PUBLIC_HOTEL_PHONE || '+918218016643';
  const guestName = reservation?.guest?.name?.split(' ')[0] || null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  async function handleDnd() {
    const next = !dnd;
    setDnd(next);
    await guestApi.toggleDnd(token, next).catch(console.error);
  }

  return (
    <div className="min-h-screen pb-28 bg-background">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/95 glass-nav border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-5 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-outline-variant/40 shadow-sm bg-white">
              <img src="/logo.jpg" alt="Hotel Tea Square" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                Hotel Tea Square
              </p>
              <p className="text-base font-bold text-primary leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Room {room?.roomNumber || '—'}
              </p>
            </div>
          </div>
          <button onClick={handleDnd}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
              dnd ? 'bg-primary/10 border-primary/40' : 'bg-white border-outline-variant/40 shadow-sm'
            }`}>
            <span className="material-symbols-outlined text-[18px] text-primary"
              style={{ fontVariationSettings: dnd ? "'FILL' 1" : "'FILL' 0" }}>
              {dnd ? 'do_not_disturb_on' : 'do_not_disturb_off'}
            </span>
          </button>
        </div>
      </header>

      <main className="pt-16 max-w-lg mx-auto">

        {/* Hero greeting */}
        <div className="px-5 pt-7 pb-5">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-secondary mb-1">
            {greeting}{guestName ? `, ${guestName}` : ''}
          </p>
          <h1 className="text-[26px] font-semibold text-on-surface leading-snug">
            Welcome to<br />Hotel Tea Square
          </h1>
          <p className="text-sm text-on-surface-variant mt-1.5">How can we make your stay exceptional?</p>
          <div className="gold-divider mt-4" />
        </div>

        {/* DND banner */}
        {dnd && (
          <div className="mx-5 mb-4 px-4 py-3 rounded-xl bg-primary/8 border border-primary/20 flex items-center gap-3">
            <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>do_not_disturb_on</span>
            <p className="text-xs font-medium text-primary">Privacy Mode ON — Housekeeping paused</p>
          </div>
        )}

        {/* Service grid */}
        <div className="px-5 grid grid-cols-2 gap-3 mb-4">
          {SERVICES.map((s) => (
            <button key={s.label} onClick={() => router.push(`/room/${token}/${s.href}`)}
              className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-white border border-outline-variant/40 text-left transition-all active:scale-[0.97] shadow-sm hover:shadow-md hover:border-primary/20">
              <span className="text-2xl leading-none">{s.emoji}</span>
              <span className="text-sm font-semibold text-on-surface">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Emergency — full width */}
        <div className="px-5 mb-4">
          <button onClick={() => router.push(`/room/${token}/emergency`)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-red-50 border border-red-200/70 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="text-sm font-semibold text-red-700">Emergency</p>
                <p className="text-[11px] text-red-400">24/7 rapid response</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-red-300">chevron_right</span>
          </button>
        </div>

        {/* WhatsApp */}
        <div className="px-5 mb-8">
          <a href={`https://wa.me/${hotelPhone.replace(/\D/g, '')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl bg-white border border-outline-variant/30 shadow-sm transition-all active:scale-[0.99]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#25D366]/10">
              <span className="text-lg">💬</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface">Chat on WhatsApp</p>
              <p className="text-xs text-on-surface-variant">Message the hotel directly</p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#25D366]">arrow_forward</span>
          </a>
        </div>

      </main>

      <GuestNav token={token} active="home" />
    </div>
  );
}
