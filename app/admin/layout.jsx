'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const NAV = [
  { href: '/admin',          icon: 'dashboard', label: 'Dashboard' },
  { href: '/admin/rooms',    icon: 'bed',       label: 'Rooms'     },
  { href: '/admin/staff',    icon: 'badge',     label: 'Staff'     },
  { href: '/admin/settings', icon: 'settings',  label: 'Settings'  },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, staff, clearAuth } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token && pathname !== '/admin/login') { router.replace('/admin/login'); return; }
    if (token && staff && !['manager', 'admin'].includes(staff.role)) router.replace('/admin/login');
  }, [token, staff, pathname, hydrated]);

  if (!hydrated && pathname !== '/admin/login') return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (!token || pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-background text-on-surface flex">

      {/* Sidebar */}
      <aside className="w-72 h-screen sticky top-0 bg-surface-container-low border-r border-outline-variant/15 flex flex-col px-6 py-8 z-50">
        <div className="mb-12">
          <img src="/logo.jpg" alt="Tea Corps" className="h-10 w-10 object-contain" />
          <p className="text-[10px] font-label tracking-[0.2em] text-on-surface-variant uppercase mt-1">Management Console</p>
        </div>

        <nav className="flex-1 space-y-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-primary-container/20 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-outline-variant/15">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center text-primary font-serif font-bold">
              {staff?.name?.[0] || 'A'}
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">{staff?.name}</p>
              <p className="text-[10px] text-on-surface-variant capitalize">{staff?.role}</p>
            </div>
          </div>
          <button
            onClick={() => { clearAuth(); router.push('/admin/login'); }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-error-container/20 hover:text-error w-full transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Log out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
