'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { guestApi } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'medical',   label: 'Medical',   icon: 'local_hospital' },
  { id: 'food',      label: 'Dining',    icon: 'restaurant' },
  { id: 'transport', label: 'Transport', icon: 'local_taxi' },
  { id: 'shopping',  label: 'Shopping',  icon: 'shopping_bag' },
  { id: 'explore',   label: 'Explore',   icon: 'explore' },
  { id: 'atm',       label: 'ATM',       icon: 'atm' },
];

function GuestNav({ token, active }) {
  const items = [
    { key: 'home',      icon: 'home',                label: 'Home',      href: `/room/${token}` },
    { key: 'services',  icon: 'room_service',         label: 'Services',  href: `/room/${token}/service` },
    { key: 'concierge', icon: 'smart_toy',            label: 'Concierge', href: `/room/${token}/concierge` },
    { key: 'tickets',   icon: 'confirmation_number',  label: 'Requests',  href: `/room/${token}/tickets` },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl border-t border-outline-variant/15 shadow-ambient-up">
      <div className="flex justify-around items-center pt-3 pb-6">
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <Link key={item.key} href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary -translate-y-0.5' : 'text-on-surface-variant/60'}`}>
              <span className="material-symbols-outlined text-2xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className={`text-[10px] uppercase tracking-widest font-label ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function LocalInfoPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medical');

  useEffect(() => {
    guestApi.getLocalInfo().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const filtered = entries.filter((e) => e.category === activeTab);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center gap-4 px-6 py-4">
          <button onClick={() => router.back()} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-label">Curated Guide</p>
            <h1 className="font-serif text-xl font-bold text-primary leading-tight">Explore Bangalore</h1>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-6 pb-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-label font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant ghost-border hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-sm"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {cat.icon}
                </span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="pt-36 px-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl block mb-3">explore</span>
            <p className="text-on-surface-variant text-sm">No entries in this category yet.</p>
          </div>
        ) : (
          filtered.map((entry) => (
            <div key={entry.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-4 shadow-ambient space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-base font-bold text-on-surface">{entry.name}</h3>
                {entry.distanceNote && (
                  <span className="shrink-0 text-[10px] font-label font-bold text-primary bg-primary-container/30 border border-primary/10 px-2 py-1 rounded-full uppercase tracking-wider">
                    {entry.distanceNote}
                  </span>
                )}
              </div>

              {entry.description && (
                <p className="text-sm text-on-surface-variant leading-relaxed">{entry.description}</p>
              )}

              {entry.address && (
                <p className="text-xs text-on-surface-variant/70 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-outline">location_on</span>
                  {entry.address}
                </p>
              )}

              {(entry.phone || entry.googleMapsUrl) && (
                <div className="flex gap-3 pt-1 border-t border-outline-variant/10">
                  {entry.phone && (
                    <a href={`tel:${entry.phone}`}
                      className="flex items-center gap-1.5 text-xs text-primary font-label font-bold">
                      <span className="material-symbols-outlined text-sm">call</span>
                      {entry.phone}
                    </a>
                  )}
                  {entry.googleMapsUrl && (
                    <a href={entry.googleMapsUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-on-surface-variant font-label">
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      View on Maps
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </main>

      <GuestNav token={token} active="home" />
    </div>
  );
}
