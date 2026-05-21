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
  const hotelPhone = process.env.NEXT_PUBLIC_HOTEL_PHONE || '+918218016643';

  async function handleEmergency(type) {
    if (loading || triggered) return;
    setLoading(true);
    try {
      const created = await guestApi.createTicket(token, {
        category: 'emergency',
        subcategory: type === 'medical' ? 'Medical Emergency' : 'Fire Emergency',
        description: `${type === 'medical' ? 'Medical' : 'Fire'} emergency from Room ${room?.roomNumber}`,
        priority: 'emergency',
      });
      addTicket(created); setTriggered(type);
      window.location.href = `tel:${hotelPhone}`;
    } catch (e) { alert(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col bg-red-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-red-50/95 border-b border-red-200/50" style={{ backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-4 px-5 py-4 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white border border-red-200/60 flex items-center justify-center text-red-400 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-red-400">Hotel Tea Square</p>
            <h1 className="text-base font-semibold text-red-700 leading-tight">Emergency Response</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-36 px-5 max-w-lg mx-auto flex flex-col">
        <p className="text-sm text-red-400/70 text-center mb-8 font-light">Rapid response team available 24/7.<br />Tap below to alert staff immediately.</p>

        {triggered && (
          <div className="mb-5 p-4 rounded-2xl bg-white border border-red-200/60 text-center shadow-sm">
            <span className="material-symbols-outlined text-2xl block mb-1 text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="font-semibold text-sm text-red-700">Alert sent — help is on the way.</p>
            <p className="text-xs text-red-400/70 mt-1 font-light">Staff are en route to your room.</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <button onClick={() => handleEmergency('medical')} disabled={loading || !!triggered}
            className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all active:scale-[0.98] bg-white ${triggered === 'medical' ? 'border-red-400' : 'border-red-200/60'} ${triggered && triggered !== 'medical' ? 'opacity-30' : ''}`}
            style={{ boxShadow: '0 2px 12px rgba(220,38,38,0.08)' }}>
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-base text-red-700">Medical Emergency</p>
              <p className="text-xs text-red-400/70 mt-0.5 font-light">Immediate medical assistance</p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-red-300 ml-auto">chevron_right</span>
          </button>

          <button onClick={() => handleEmergency('fire')} disabled={loading || !!triggered}
            className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all active:scale-[0.98] bg-white ${triggered === 'fire' ? 'border-orange-400' : 'border-orange-200/60'} ${triggered && triggered !== 'fire' ? 'opacity-30' : ''}`}
            style={{ boxShadow: '0 2px 12px rgba(234,88,12,0.08)' }}>
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-base text-orange-700">Fire Emergency</p>
              <p className="text-xs text-orange-400/70 mt-0.5 font-light">Evacuation protocols activated</p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-orange-300 ml-auto">chevron_right</span>
          </button>
        </div>

        <div className="mt-auto p-5 rounded-2xl bg-white border border-red-200/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-500">Live Line Available 24/7</span>
          </div>
          <button onClick={() => { window.location.href = `tel:${hotelPhone}`; }}
            className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-white"
            style={{ background: 'rgb(185,28,28)', boxShadow: '0 4px 16px rgba(185,28,28,0.3)' }}>
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
            Direct Line to Security
          </button>
          <p className="mt-3 text-center text-[11px] text-red-400/60 font-light">Average response time: under 2 minutes</p>
        </div>
      </main>
    </div>
  );
}
