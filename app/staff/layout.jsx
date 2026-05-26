'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useStaffStore } from '@/store/staffStore';

// Prevents redirect-to-login before Zustand persist hydrates from localStorage

const NAV = [
  { href: '/staff',          icon: 'confirmation_number', label: 'Tickets'  },
  { href: '/staff/rooms',    icon: 'grid_view',            label: 'Rooms'    },
  { href: '/staff/chat',     icon: 'chat',                label: 'Chat'     },
  { href: '/staff/my-tasks', icon: 'task_alt',             label: 'My Tasks' },
];

const DEPT_LABEL = {
  housekeeping: 'Housekeeping', maintenance: 'Maintenance',
  reception: 'Reception', all: 'All Departments',
};

export default function StaffLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, staff, clearAuth } = useAuthStore();
  const { soundEnabled, toggleSound } = useStaffStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  function handleLogout() {
    clearAuth();
    setDrawerOpen(false);
    router.replace('/staff/login');
  }

  useEffect(() => {
    if (!hydrated) return;
    if (!token && pathname !== '/staff/login') router.replace('/staff/login');
  }, [token, pathname, hydrated]);

  // While Zustand is hydrating from localStorage, show a blank loading screen
  // (avoids false redirect to login before token is restored)
  if (!hydrated && pathname !== '/staff/login') return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (!token || pathname === '/staff/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">

      {/* Top Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-ambient">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setDrawerOpen(true)} className="text-primary hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <img src="/logo.jpg" alt="Tea Corps" className="h-9 w-9 object-contain" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSound}
              className="text-primary hover:opacity-80 transition-opacity"
              title={soundEnabled ? 'Mute alerts' : 'Unmute alerts'}
            >
              <span className="material-symbols-outlined">{soundEnabled ? 'volume_up' : 'volume_off'}</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center border border-outline-variant/20">
              <span className="font-serif text-primary text-sm font-bold">{staff?.name?.[0] || 'S'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Drawer Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Slide-out Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-72 z-[70] bg-surface shadow-xl flex flex-col transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/15">
          <div className="flex items-center justify-between mb-4">
            <img src="/logo.jpg" alt="Tea Corps" className="h-8 w-8 object-contain" />
            <button onClick={() => setDrawerOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-container/40 flex items-center justify-center border border-outline-variant/20">
              <span className="font-serif text-primary text-lg font-bold">{staff?.name?.[0] || 'S'}</span>
            </div>
            <div>
              <p className="font-serif text-on-surface font-bold">{staff?.name || 'Staff'}</p>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest">
                {DEPT_LABEL[staff?.department] || staff?.department || staff?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {item.icon}
                </span>
                <span className="font-label text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}

          {staff?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span className="font-label text-sm font-medium">Admin Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/15 space-y-1">
          <button
            onClick={toggleSound}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">{soundEnabled ? 'volume_up' : 'volume_off'}</span>
            <span className="font-label text-sm font-medium">{soundEnabled ? 'Mute Alerts' : 'Unmute Alerts'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error-container/30 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 pt-16 overflow-hidden">{children}</div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-2xl border-t border-outline-variant/15 shadow-ambient-up">
        <div className="flex justify-around items-center w-full pt-3 pb-6 px-4">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center transition-all ${
                  active
                    ? 'text-primary font-bold -translate-y-0.5'
                    : 'text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary'
                }`}
              >
                <span
                  className="material-symbols-outlined mb-1"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] uppercase tracking-widest font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
