'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { guestApi } from '@/lib/api';
import { useGuestStore } from '@/store/guestStore';
import Spinner from '@/components/ui/Spinner';

export default function RoomServicePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { addTicket } = useGuestStore();

  const [step, setStep] = useState(0); // 0=browse, 1=review, 2=tracking
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState({});
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    guestApi.getMenu(token)
      .then((data) => {
        setMenu(data.categories);
        setActiveCategory(data.categories[0]?.id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  function addItem(item) {
    setCart((c) => ({ ...c, [item.id]: { ...item, qty: (c[item.id]?.qty || 0) + 1 } }));
  }

  function removeItem(itemId) {
    setCart((c) => {
      const updated = { ...c };
      if (updated[itemId].qty <= 1) delete updated[itemId];
      else updated[itemId] = { ...updated[itemId], qty: updated[itemId].qty - 1 };
      return updated;
    });
  }

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const activeItems = menu.find((c) => c.id === activeCategory)?.items || [];

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const created = await guestApi.createTicket(token, {
        category: 'room_service',
        subcategory: menu.find((c) => c.id === activeCategory)?.name || 'Food & Beverage',
        items: cartItems.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        description: note || null,
      });
      addTicket(created);
      setTicket(created);
      setStep(2);
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pb-32">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl flex justify-between items-center w-full px-6 py-4 shadow-ambient-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : router.back()} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-primary font-serif text-sm tracking-[0.2em] uppercase">
            {step === 0 ? 'Curated Indulgence' : step === 1 ? 'Review Order' : 'Order Placed'}
          </span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">notifications</span>
      </header>

      {/* Step 0: Browse */}
      {step === 0 && (
        <>
          <section className="px-6 pt-6 pb-4">
            <h1 className="font-serif text-3xl text-on-surface tracking-tight mb-2 italic">Room Service</h1>
            <p className="text-on-surface-variant text-sm font-light leading-relaxed mb-4">
              Hotel Tea Square — freshly prepared to your door.
            </p>
            {/* Menu rules */}
            <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 space-y-1">
              {[
                { icon: 'schedule',      text: 'Allow 45 minutes preparation time' },
                { icon: 'restaurant',    text: 'Alacarte orders: 6 PM – 8 PM only' },
                { icon: 'lunch_dining',  text: 'Order by 12 PM for lunch, 6 PM for dinner' },
                { icon: 'info',          text: 'Inform us of any allergies when ordering' },
              ].map((r) => (
                <div key={r.text} className="flex items-center gap-2 text-xs text-primary/80">
                  <span className="material-symbols-outlined text-sm">{r.icon}</span>
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Category Tabs */}
          <nav className="sticky top-[64px] z-40 bg-surface/80 backdrop-blur-md py-4 mb-2">
            <div className="flex overflow-x-auto hide-scrollbar px-6 gap-6 items-baseline">
              {menu.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 text-sm font-medium tracking-wide uppercase pb-1 transition-colors ${
                    activeCategory === cat.id
                      ? 'text-primary border-b border-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </nav>

          {/* Items */}
          <section className="px-6 grid grid-cols-1 gap-3">
            {activeItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-4 rounded-xl bg-white border border-outline-variant/20">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm text-on-surface">{item.name}</h3>
                    <span className="font-bold text-sm text-primary ml-2 shrink-0">₹{item.price}</span>
                  </div>
                  {item.description && (
                    <p className="text-on-surface-variant text-xs leading-relaxed">{item.description}</p>
                  )}
                </div>
                {cart[item.id] ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="font-bold text-sm text-on-surface w-5 text-center">{cart[item.id].qty}</span>
                    <button
                      onClick={() => addItem(item)}
                      className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addItem(item)}
                    className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                )}
              </div>
            ))}
          </section>

          {/* Floating Cart Bar */}
          {cartCount > 0 && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] z-50 max-w-lg">
              <div className="bg-surface-container-lowest/80 glass-nav shadow-lg border border-outline-variant/15 rounded-2xl px-6 py-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant font-medium tracking-widest uppercase">Order Total</span>
                  <span className="font-serif text-xl text-primary font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="bg-primary text-on-primary px-6 py-3 rounded-xl text-xs font-bold tracking-widest uppercase shadow-md active:scale-95 transition-transform"
                >
                  View Tray
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Step 1: Review */}
      {step === 1 && (
        <div className="px-6 py-6">
          <h2 className="font-serif text-2xl text-on-surface mb-6">Review Order</h2>
          <div className="space-y-0 bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden mb-6">
            {cartItems.map((item, idx) => (
              <div key={item.id} className={`flex items-center justify-between px-6 py-4 ${idx < cartItems.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                <div>
                  <span className="text-on-surface text-sm font-medium">{item.name}</span>
                  <span className="text-on-surface-variant text-sm ml-2">x{item.qty}</span>
                </div>
                <span className="font-serif text-primary">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-between px-6 py-4 bg-surface-container-low">
              <span className="font-serif text-on-surface">Total</span>
              <span className="font-serif text-xl text-primary font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <textarea
            placeholder="Special instructions... (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full bg-surface-container-lowest border-b border-outline-variant/40 px-0 py-3 text-on-surface placeholder-on-surface-variant/50 text-sm focus:outline-none focus:border-primary transition-colors resize-none mb-2"
          />
          <p className="text-xs text-on-surface-variant mb-8">Estimated preparation time: ~45 minutes</p>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-tr from-primary to-primary-container text-on-primary rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
          >
            {submitting ? <Spinner size="sm" /> : (
              <>
                <span className="material-symbols-outlined text-sm">check_circle</span>
                PLACE ORDER
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Tracking */}
      {step === 2 && ticket && (
        <div className="px-6 py-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="font-serif text-2xl text-on-surface mb-1">Order Placed</h2>
          <p className="text-on-surface-variant text-sm mb-10">Reference #{ticket.ticketNumber}</p>

          <div className="w-full space-y-4 mb-10">
            {[
              { key: 'new',          label: 'Order Received',        icon: 'receipt' },
              { key: 'acknowledged', label: 'Acknowledged by Kitchen',icon: 'done' },
              { key: 'in_progress',  label: 'Being Prepared',         icon: 'restaurant' },
              { key: 'completed',    label: 'Delivered',              icon: 'delivery_dining' },
            ].map((s, i) => {
              const order = ['new', 'acknowledged', 'in_progress', 'completed'];
              const current = order.indexOf(ticket.status);
              const done = i <= current;
              return (
                <div key={s.key} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-sm">{s.icon}</span>
                  </div>
                  <span className={`text-sm font-medium ${done ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>{s.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 w-full">
            <button onClick={() => router.push(`/room/${token}`)} className="flex-1 py-3 border border-outline-variant/20 rounded-xl text-on-surface-variant text-sm font-medium tracking-wide hover:border-primary/30 transition-colors">
              Home
            </button>
            <button onClick={() => router.push(`/room/${token}/tickets`)} className="flex-1 py-3 bg-primary/10 text-primary rounded-xl text-sm font-medium tracking-wide">
              My Requests
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-background/70 backdrop-blur-lg border-t border-outline-variant/15 shadow-ambient-up">
        {[
          { icon: 'home',         label: 'Home',      action: () => router.push(`/room/${token}`) },
          { icon: 'room_service', label: 'Service',   action: null, active: true },
          { icon: 'smart_toy',    label: 'Concierge', action: () => router.push(`/room/${token}/concierge`) },
          { icon: 'emergency',    label: 'SOS',       action: () => router.push(`/room/${token}/emergency`) },
        ].map((n) => (
          <button
            key={n.label}
            onClick={n.action}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
              n.active
                ? 'bg-primary-container/10 text-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined" style={n.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{n.icon}</span>
            <span className="text-[10px] font-medium tracking-wide uppercase mt-1">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
