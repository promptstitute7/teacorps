'use client';
import { useParams, useRouter } from 'next/navigation';
import { useGuestStore } from '@/store/guestStore';
import { guestApi } from '@/lib/api';

const MENU_ITEMS = [
  { icon: 'room_service',       label: 'Room Service',  href: 'service'    },
  { icon: 'cleaning_services',  label: 'Housekeeping',  href: 'housekeeping' },
  { icon: 'construction',       label: 'Maintenance',   href: 'maintenance' },
  { icon: 'notifications',      label: 'Front Desk',    href: 'front-desk' },
  { icon: 'location_on',        label: 'Local Info',    href: 'local-info' },
  { icon: 'smart_toy',          label: 'AI Concierge',  href: 'concierge'  },
  { icon: 'confirmation_number',label: 'My Tickets',    href: 'tickets'    },
  { icon: 'emergency_home',     label: 'Emergency',     href: 'emergency', isEmergency: true },
];

const NAV_ITEMS = [
  { icon: 'home',                label: 'Home',      href: ''          },
  { icon: 'room_service',        label: 'Services',  href: 'service'   },
  { icon: 'smart_toy',           label: 'Concierge', href: 'concierge' },
  { icon: 'confirmation_number', label: 'Tickets',   href: 'tickets'   },
];

export default function GuestHome() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { room, reservation, dnd, setDnd } = useGuestStore();

  const hotelPhone = process.env.NEXT_PUBLIC_HOTEL_PHONE || '+91XXXXXXXXXX';
  const guestName = reservation?.guest?.name?.split(' ')[0] || null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  async function handleDnd() {
    const newDnd = !dnd;
    setDnd(newDnd);
    await guestApi.toggleDnd(token, newDnd).catch(console.error);
  }

  function handleMenuClick(item) {
    if (item.isCall) { window.location.href = `tel:${hotelPhone}`; return; }
    router.push(`/room/${token}/${item.href}`);
  }

  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 selection:bg-primary-container/30">

      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-ambient">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-2xl cursor-pointer hover:opacity-80 transition-opacity">menu</span>
            <h1 className="text-2xl font-serif tracking-widest text-primary">TEA CORP</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em]">Room</p>
              <p className="text-xl font-serif font-bold text-primary -mt-1 tracking-tight">
                {room ? room.roomNumber : '—'}
              </p>
            </div>
            <button
              onClick={handleDnd}
              className="w-10 h-10 rounded-full border border-outline-variant/20 flex items-center justify-center transition-colors"
              style={{ background: dnd ? 'rgb(var(--c-primary) / 0.10)' : 'transparent' }}
              title={dnd ? 'DND On — tap to turn off' : 'Turn on Do Not Disturb'}
            >
              <span className="material-symbols-outlined text-primary text-lg">
                {dnd ? 'do_not_disturb_on' : 'do_not_disturb_off'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-28 px-6 max-w-lg mx-auto">

        {/* Hero Greeting */}
        <section className="mb-10">
          <h2 className="text-[2.5rem] leading-[1.1] font-serif text-on-surface mb-2 tracking-tight">
            {greeting},<br />Room {room?.roomNumber || '—'}
          </h2>
          <p className="text-on-surface-variant font-light text-lg tracking-wide">
            Welcome to your Bangalore sanctuary.
          </p>
        </section>

        {/* DND Banner */}
        {dnd && (
          <div className="mb-8 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">do_not_disturb_on</span>
            Privacy Mode is ON. Housekeeping requests are paused.
          </div>
        )}

        {/* Featured Card */}
        <div className="relative w-full aspect-[16/9] mb-10 rounded-xl overflow-hidden group shadow-ambient-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-container/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 backdrop-blur-md bg-white/10 border border-white/20 p-4 rounded-xl">
            <p className="text-white/80 text-[10px] uppercase tracking-widest font-medium mb-1">Evening Highlight</p>
            <h3 className="text-white font-serif text-lg">Signature Monsoon Chai Service</h3>
          </div>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-2 gap-4">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item)}
              className="flex flex-col items-start p-5 bg-surface-container-lowest border border-outline-variant/15 rounded-xl hover:bg-surface-container-low transition-colors duration-300 active:scale-95"
            >
              <span
                className={`material-symbols-outlined mb-3 text-2xl ${item.isEmergency ? 'text-error' : 'text-primary'}`}
              >
                {item.icon}
              </span>
              <span className={`text-xs font-medium uppercase tracking-[0.15em] ${item.isEmergency ? 'text-error' : 'text-on-surface-variant'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Privacy Mode Toggle */}
        <section className="mt-12 mb-8">
          <div className="flex items-center justify-between p-6 bg-surface-container rounded-xl">
            <div className="flex flex-col">
              <span className="font-serif text-lg text-on-surface">Privacy Mode</span>
              <span className="text-xs text-on-surface-variant tracking-wider uppercase font-medium">Do Not Disturb</span>
            </div>
            <button
              onClick={handleDnd}
              className={`relative w-12 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${
                dnd ? 'bg-primary' : 'bg-outline-variant/30'
              }`}
            >
              <div className={`w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${
                dnd ? 'bg-on-primary translate-x-6' : 'bg-surface'
              }`} />
            </button>
          </div>
        </section>

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-2xl border-t border-outline-variant/15 shadow-ambient-up">
        <div className="flex justify-around items-center w-full pt-3 pb-8">
          {NAV_ITEMS.map((nav, i) => {
            const isActive = i === 0;
            return (
              <button
                key={nav.label}
                onClick={() => nav.href ? router.push(`/room/${token}/${nav.href}`) : null}
                className={`flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'text-primary font-bold -translate-y-0.5'
                    : 'text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary'
                }`}
              >
                <span
                  className="material-symbols-outlined mb-1"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {nav.icon}
                </span>
                <span className="text-[10px] uppercase tracking-widest font-medium">{nav.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
