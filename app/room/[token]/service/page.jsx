'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { guestApi } from '@/lib/api';
import { useGuestStore } from '@/store/guestStore';
import Spinner from '@/components/ui/Spinner';
import GuestNav from '@/components/ui/GuestNav';

export default function RoomServicePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { addTicket } = useGuestStore();

  const [step, setStep] = useState(0);
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState({});
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    guestApi.getMenu(token).then(d => { setMenu(d.categories); setActiveCategory(d.categories[0]?.id); })
      .catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const addItem = (item) => setCart(c => ({ ...c, [item.id]: { ...item, qty: (c[item.id]?.qty || 0) + 1 } }));
  const removeItem = (id) => setCart(c => {
    const u = { ...c };
    if (u[id].qty <= 1) delete u[id]; else u[id] = { ...u[id], qty: u[id].qty - 1 };
    return u;
  });

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const activeItems = menu.find(c => c.id === activeCategory)?.items || [];

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const created = await guestApi.createTicket(token, {
        category: 'room_service',
        subcategory: menu.find(c => c.id === activeCategory)?.name || 'Food & Beverage',
        items: cartItems.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
        description: note || null,
      });
      addTicket(created); setTicket(created); setStep(2);
    } catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center"><Spinner size="lg" /></div>
  );

  return (
    <div className="min-h-screen bg-background pb-32">

      {/* Header */}
      <header className="fixed top-0 z-50 left-0 right-0 bg-background/95 glass-nav border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
              className="w-8 h-8 rounded-full bg-white border border-outline-variant/40 flex items-center justify-center text-on-surface-variant shadow-sm">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">Room Service</p>
              <h1 className="text-base font-semibold text-primary leading-tight">
                {step === 0 ? 'Our Menu' : step === 1 ? 'Review Order' : 'Order Placed'}
              </h1>
            </div>
          </div>
          {step === 0 && cartCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
              <span className="text-xs font-bold text-primary">{cartCount}</span>
            </div>
          )}
        </div>
      </header>

      {/* STEP 0: Browse */}
      {step === 0 && (
        <>
          <div className="pt-20 px-5 pb-3 max-w-lg mx-auto">
            <div className="rounded-xl px-4 py-3 bg-secondary/8 border border-secondary/20">
              {[
                { icon: 'schedule',     text: '45 minutes preparation time' },
                { icon: 'restaurant',   text: 'Alacarte: 6 PM – 8 PM only' },
                { icon: 'lunch_dining', text: 'Order by 12 PM lunch / 6 PM dinner' },
                { icon: 'info',         text: 'Inform us of any allergies' },
              ].map(r => (
                <div key={r.text} className="flex items-center gap-2 text-xs py-0.5 text-secondary font-medium">
                  <span className="material-symbols-outlined text-[13px] text-secondary">{r.icon}</span>{r.text}
                </div>
              ))}
            </div>
          </div>

          <nav className="sticky top-[65px] z-40 bg-background/96 border-b border-outline-variant/20"
            style={{ backdropFilter: 'blur(12px)' }}>
            <div className="flex overflow-x-auto hide-scrollbar px-5 max-w-lg mx-auto">
              {menu.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className="flex-shrink-0 text-xs font-semibold tracking-wide px-4 py-3.5 border-b-2 transition-all"
                  style={{
                    color: activeCategory === cat.id ? 'rgb(var(--c-primary))' : 'rgb(var(--c-on-surface-variant))',
                    borderBottomColor: activeCategory === cat.id ? 'rgb(var(--c-primary))' : 'transparent',
                  }}>
                  {cat.name}
                </button>
              ))}
            </div>
          </nav>

          <section className="px-5 pt-3 space-y-2 max-w-lg mx-auto">
            {activeItems.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-4 rounded-xl bg-white border border-outline-variant/40 shadow-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="text-sm font-semibold text-on-surface pr-2">{item.name}</h3>
                    <span className="text-sm font-bold text-primary shrink-0">₹{item.price}</span>
                  </div>
                  {item.description && <p className="text-xs text-on-surface-variant leading-relaxed">{item.description}</p>}
                </div>
                {cart[item.id] ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => removeItem(item.id)}
                      className="w-7 h-7 rounded-full bg-white border border-outline-variant/40 flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">remove</span>
                    </button>
                    <span className="text-sm font-bold text-on-surface w-5 text-center">{cart[item.id].qty}</span>
                    <button onClick={() => addItem(item)}
                      className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary">
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => addItem(item)}
                    className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 active:scale-90 transition-transform">
                    <span className="material-symbols-outlined text-[14px]">add</span>
                  </button>
                )}
              </div>
            ))}
            <div className="h-6" />
          </section>

          {cartCount > 0 && (
            <div className="fixed bottom-[72px] left-0 right-0 px-5 z-40">
              <div className="rounded-2xl px-5 py-3.5 flex items-center justify-between max-w-lg mx-auto bg-primary"
                style={{ boxShadow: '0 8px 32px rgba(30,80,50,0.3)' }}>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-on-primary/60">Order Total</p>
                  <p className="text-lg font-bold text-on-primary">₹{cartTotal.toLocaleString('en-IN')}</p>
                </div>
                <button onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase active:scale-95 transition-transform bg-white/15 text-on-primary border border-white/20">
                  View Tray · {cartCount}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* STEP 1: Review */}
      {step === 1 && (
        <div className="pt-20 px-5 pb-6 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold text-on-surface mb-5">Review Your Order</h2>
          <div className="rounded-2xl overflow-hidden border border-outline-variant/40 mb-4 bg-white shadow-sm">
            {cartItems.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: idx < cartItems.length - 1 ? '1px solid rgba(196,218,198,0.4)' : 'none' }}>
                <div>
                  <span className="text-sm font-medium text-on-surface">{item.name}</span>
                  <span className="text-xs text-on-surface-variant ml-2">× {item.qty}</span>
                </div>
                <span className="text-sm font-semibold text-primary">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-between px-5 py-4 bg-surface-container-low border-t border-outline-variant/20">
              <span className="text-sm font-semibold text-on-surface">Total</span>
              <span className="text-lg font-bold text-primary">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-outline-variant/40 px-4 py-3 mb-2 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold mb-2">Special instructions</p>
            <textarea placeholder="Allergies, preferences, special requests..." value={note} onChange={e => setNote(e.target.value)} rows={3}
              className="w-full bg-transparent text-on-surface text-sm focus:outline-none resize-none placeholder:text-on-surface-variant/40" />
          </div>
          <p className="text-xs text-on-surface-variant mb-8">Estimated preparation time: ~45 minutes</p>
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-4 rounded-xl bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ boxShadow: '0 4px 16px rgba(30,80,50,0.25)' }}>
            {submitting ? <Spinner size="sm" /> : (<><span className="material-symbols-outlined text-[16px]">check_circle</span>Place Order</>)}
          </button>
        </div>
      )}

      {/* STEP 2: Confirmation */}
      {step === 2 && ticket && (
        <div className="pt-20 px-5 pb-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 mt-8">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="text-2xl font-semibold text-on-surface mb-1">Order Placed</h2>
          <p className="text-sm text-on-surface-variant mb-10">Reference #{ticket.ticketNumber}</p>
          <div className="w-full space-y-3 mb-10">
            {[
              { key: 'new',          label: 'Order Received',         icon: 'receipt' },
              { key: 'acknowledged', label: 'Acknowledged by Kitchen', icon: 'done' },
              { key: 'in_progress',  label: 'Being Prepared',          icon: 'restaurant' },
              { key: 'completed',    label: 'Delivered to your room',  icon: 'delivery_dining' },
            ].map((s, i) => {
              const order = ['new', 'acknowledged', 'in_progress', 'completed'];
              const done = i <= order.indexOf(ticket.status);
              return (
                <div key={s.key} className="flex items-center gap-4 text-left">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-primary' : 'bg-white border border-outline-variant/40'}`}>
                    <span className={`material-symbols-outlined text-[16px] ${done ? 'text-on-primary' : 'text-on-surface-variant/40'}`}
                      style={{ fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0" }}>{s.icon}</span>
                  </div>
                  <span className={`text-sm font-medium ${done ? 'text-on-surface' : 'text-on-surface-variant/40'}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => router.push(`/room/${token}`)} className="flex-1 py-3 rounded-xl border border-outline-variant/40 text-on-surface-variant text-sm font-medium bg-white">Home</button>
            <button onClick={() => router.push(`/room/${token}/tickets`)} className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-sm font-semibold">My Requests</button>
          </div>
        </div>
      )}

      <GuestNav token={token} active="services" />
    </div>
  );
}
