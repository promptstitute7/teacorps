'use client';
import { useParams, useRouter } from 'next/navigation';
import { useGuestStore } from '@/store/guestStore';
import { guestApi } from '@/lib/api';

const SERVICES = [
  { emoji: '🍽️', label: 'Room Service',  href: 'service',      color: 'bg-green-50 border-green-200' },
  { emoji: '🧹', label: 'Housekeeping',  href: 'housekeeping', color: 'bg-green-50 border-green-200' },
  { emoji: '🔧', label: 'Maintenance',   href: 'maintenance',  color: 'bg-amber-50 border-amber-200' },
  { emoji: '🛎️', label: 'Front Desk',    href: 'front-desk',   color: 'bg-green-50 border-green-200' },
  { emoji: '📍', label: 'Local Info',    href: 'local-info',   color: 'bg-green-50 border-green-200' },
  { emoji: '🚨', label: 'Emergency',     href: 'emergency',    color: 'bg-red-50 border-red-200', textColor: 'text-red-600' },
  { emoji: '💬', label: 'Complaints',    href: 'complaints',   color: 'bg-amber-50 border-amber-200' },
];

const NAV_ITEMS = [
  { icon: 'home',                label: 'Home',      href: '' },
  { icon: 'room_service',        label: 'Services',  href: 'service' },
  { icon: 'smart_toy',           label: 'Concierge', href: 'concierge' },
  { icon: 'confirmation_number', label: 'Requests',  href: 'tickets' },
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
    const newDnd = !dnd;
    setDnd(newDnd);
    await guestApi.toggleDnd(token, newDnd).catch(console.error);
  }

  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 font-sans">

      {/* Top Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm">
        <div className="flex justify-between items-center px-5 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Hotel Tea Square" className="h-10 w-10 object-contain" />
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Hotel Tea Square</p>
              <p className="text-lg font-bold text-primary leading-tight">Room {room?.roomNumber || '—'}</p>
            </div>
          </div>
          <button
            onClick={handleDnd}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
              dnd ? 'bg-primary/10 border-primary/30' : 'border-outline-variant/30'
            }`}
            title={dnd ? 'DND On' : 'Turn on Do Not Disturb'}
          >
            <span className="material-symbols-outlined text-primary text-lg">
              {dnd ? 'do_not_disturb_on' : 'do_not_disturb_off'}
            </span>
          </button>
        </div>
      </header>

      <main className="pt-20 px-5 max-w-lg mx-auto">

        {/* Greeting */}
        <section className="py-6">
          <p className="text-sm text-on-surface-variant font-medium">{greeting}{guestName ? `, ${guestName}` : ''}!</p>
          <h1 className="text-2xl font-bold text-on-surface mt-1">Welcome to Hotel Tea Square</h1>
          <p className="text-sm text-on-surface-variant mt-1">How can we make your stay better?</p>
        </section>

        {/* DND Banner */}
        {dnd && (
          <div className="mb-5 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">do_not_disturb_on</span>
            Privacy Mode is ON. Housekeeping requests are paused.
          </div>
        )}

        {/* Service Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {SERVICES.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(`/room/${token}/${item.href}`)}
              className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 ${item.color} active:scale-95 transition-all`}
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className={`text-sm font-semibold text-center ${item.textColor || 'text-on-surface'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* WhatsApp quick help */}
        <a
          href={`https://wa.me/${hotelPhone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-5 py-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl mb-6"
        >
          <span className="text-2xl">💬</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-on-surface">Chat with us on WhatsApp</p>
            <p className="text-xs text-on-surface-variant">Tap to message the hotel directly</p>
          </div>
          <span className="material-symbols-outlined text-[#25D366]">arrow_forward</span>
        </a>

      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full z-50 bg-white/95 backdrop-blur-2xl border-t border-outline-variant/20">
        <div className="flex justify-around items-center pt-2 pb-6">
          {NAV_ITEMS.map((nav, i) => {
            const isActive = i === 0;
            return (
              <button
                key={nav.label}
                onClick={() => nav.href ? router.push(`/room/${token}/${nav.href}`) : null}
                className={`flex flex-col items-center gap-1 px-3 py-1 transition-all ${
                  isActive ? 'text-primary' : 'text-on-surface-variant/60 hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {nav.icon}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest">{nav.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
