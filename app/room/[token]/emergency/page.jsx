'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { guestApi } from '@/lib/api';
import { useGuestStore } from '@/store/guestStore';

export default function EmergencyPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { room, addTicket } = useGuestStore();
  const [triggered, setTriggered] = useState(null);
  const [loading, setLoading] = useState(false);
  const hotelPhone = process.env.NEXT_PUBLIC_HOTEL_PHONE || '+91XXXXXXXXXX';

  async function handleEmergency(type) {
    if (loading || triggered) return;
    setLoading(true);
    try {
      const created = await guestApi.createTicket(token, {
        category: 'emergency',
        subcategory: type === 'medical' ? 'Medical Emergency' : 'Fire Emergency',
        description: `${type === 'medical' ? 'Medical' : 'Fire'} emergency reported from Room ${room?.roomNumber}`,
        priority: 'emergency',
      });
      addTicket(created);
      setTriggered(type);
      window.location.href = `tel:${hotelPhone}`;
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <span className="font-serif text-sm tracking-[0.2em] uppercase text-primary font-semibold">Tea Corp Hotels</span>
            <h1 className="font-serif text-xl tracking-tight text-primary">Room {room?.roomNumber}</h1>
          </div>
        </div>
        <span className="material-symbols-outlined text-primary hover:opacity-80 cursor-pointer transition-opacity">notifications</span>
      </header>

      <main className="flex-grow pt-24 pb-32 px-6 flex flex-col">

        {/* Hero */}
        <section className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold text-primary mb-4">Emergency Response</h2>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-xs mx-auto">
            Our rapid response team is standing by 24/7.
          </p>
        </section>

        {/* Confirmation Banner */}
        {triggered && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
            <span className="material-symbols-outlined text-primary text-2xl block mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="text-primary font-semibold text-sm">Alert sent. Help is on the way.</p>
            <p className="text-on-surface-variant text-xs mt-1">Staff have been notified and are en route to your room.</p>
          </div>
        )}

        {/* Emergency Cards */}
        <div className="grid grid-cols-1 gap-6 mb-10">
          {/* Medical */}
          <button
            onClick={() => handleEmergency('medical')}
            disabled={loading || !!triggered}
            className={`group relative flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-xl border-2 transition-all duration-300 active:scale-95 shadow-[0_4px_24px_rgba(27,28,25,0.02)] ${
              triggered === 'medical' ? 'border-primary' : 'border-primary/20 hover:border-primary'
            } ${triggered && triggered !== 'medical' ? 'opacity-40' : ''}`}
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">medical_services</span>
            </div>
            <span className="font-serif text-xl font-semibold text-on-surface mb-1">Medical Emergency</span>
            <span className="text-on-surface-variant text-xs uppercase tracking-widest font-medium">Immediate Assistance</span>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-primary">emergency</span>
            </div>
          </button>

          {/* Fire */}
          <button
            onClick={() => handleEmergency('fire')}
            disabled={loading || !!triggered}
            className={`group relative flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-xl border-2 transition-all duration-300 active:scale-95 shadow-[0_4px_24px_rgba(27,28,25,0.02)] ${
              triggered === 'fire' ? 'border-primary' : 'border-primary/20 hover:border-primary'
            } ${triggered && triggered !== 'fire' ? 'opacity-40' : ''}`}
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl" style={{ color: '#301c1c' }}>local_fire_department</span>
            </div>
            <span className="font-serif text-xl font-semibold text-on-surface mb-1">Fire Emergency</span>
            <span className="text-on-surface-variant text-xs uppercase tracking-widest font-medium">Evacuation Protocols</span>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-primary">emergency</span>
            </div>
          </button>
        </div>

        {/* Direct Line */}
        <div className="mt-auto">
          <div className="p-6 bg-primary-container/10 rounded-xl border border-primary-container/20 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
              <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">Live Connection Available</span>
            </div>
            <button
              onClick={() => { window.location.href = `tel:${hotelPhone}`; }}
              className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-bold tracking-wide shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">shield_person</span>
              Direct Line to Security
            </button>
            <p className="mt-4 text-xs text-on-surface-variant italic">Average response time: Under 2 minutes</p>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-background/70 backdrop-blur-lg border-t border-outline-variant/15 shadow-ambient-up rounded-t-xl">
        {[
          { icon: 'home',         label: 'Home',      action: () => router.push(`/room/${token}`) },
          { icon: 'room_service', label: 'Service',   action: () => router.push(`/room/${token}/service`) },
          { icon: 'smart_toy',    label: 'Concierge', action: () => router.push(`/room/${token}/concierge`) },
          { icon: 'emergency',    label: 'SOS',       action: null, active: true },
        ].map((n) => (
          <button
            key={n.label}
            onClick={n.action}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
              n.active ? 'bg-primary-container/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined mb-1" style={n.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{n.icon}</span>
            <span className="text-[10px] font-medium tracking-wide uppercase">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
