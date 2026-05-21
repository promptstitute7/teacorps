'use client';
import Link from 'next/link';

const NAV = [
  { key: 'home',      icon: 'home',               label: 'Home',     sub: '' },
  { key: 'services',  icon: 'room_service',        label: 'Services', sub: 'service' },
  { key: 'chat',      icon: 'chat',               label: 'Chat',     sub: 'chat' },
  { key: 'concierge', icon: 'smart_toy',           label: 'AI',       sub: 'concierge' },
  { key: 'tickets',   icon: 'confirmation_number', label: 'Requests', sub: 'tickets' },
];

export default function GuestNav({ token, active }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav bg-background/95 border-t border-outline-variant/30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
      <div className="flex justify-around items-center pt-2 pb-3 max-w-lg mx-auto">
        {NAV.map((item) => {
          const isActive = item.key === active;
          const href = item.sub ? `/room/${token}/${item.sub}` : `/room/${token}`;
          return (
            <Link key={item.key} href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-1">
              <span className="material-symbols-outlined text-[22px] transition-colors"
                style={{
                  color: isActive ? 'rgb(var(--c-primary))' : 'rgb(var(--c-on-surface-variant) / 0.5)',
                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
                }}>
                {item.icon}
              </span>
              <span className="text-[9px] font-semibold tracking-[0.08em] uppercase transition-colors"
                style={{ color: isActive ? 'rgb(var(--c-primary))' : 'rgb(var(--c-on-surface-variant) / 0.45)' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
