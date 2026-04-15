'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { guestApi } from '@/lib/api';
import { useGuestStore } from '@/store/guestStore';

const QUICK_ACTIONS = ['Local Recommendations', 'Request Amenity', 'Book Service', 'Checkout Info'];

export default function ConciergePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { room } = useGuestStore();

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Good day! I'm your AI Butler for Tea Corp Hotels. How may I make your stay in Room ${room?.roomNumber || ''} more exceptional?`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: msg,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const { reply } = await guestApi.conciergeChat(token, msg, history);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: reply,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: 'I apologise — I seem to be unavailable at the moment. Please call reception for immediate assistance.', time: '' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-ambient">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-primary hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-serif font-bold tracking-tight text-primary">AI Butler</span>
                <span className="material-symbols-outlined text-primary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-on-surface-variant/70">Concierge Service</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center border border-outline-variant/20">
            <span className="font-serif text-primary font-bold">{room?.roomNumber?.[0] || 'G'}</span>
          </div>
        </div>
      </header>

      {/* Chat Canvas */}
      <main className="flex-1 mt-[88px] mb-[180px] px-6 space-y-8 overflow-y-auto py-6">
        {/* Date Marker */}
        <div className="flex justify-center">
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant/40 bg-surface-container-low px-3 py-1 rounded-full">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end self-end max-w-[85%] ml-auto' : 'items-start max-w-[85%]'}`}>
            {msg.role === 'assistant' ? (
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0_4px_24px_rgba(27,28,25,0.02)] border border-outline-variant/10">
                <p className="text-sm leading-relaxed text-on-surface">{msg.content}</p>
              </div>
            ) : (
              <div className="bg-primary-container/30 p-4 rounded-xl border border-primary/10 shadow-[0_4px_16px_rgba(123,88,8,0.05)]">
                <p className="text-sm leading-relaxed text-on-primary-container">{msg.content}</p>
              </div>
            )}
            {msg.time && (
              <span className={`mt-2 text-[10px] font-label text-on-surface-variant/50 ${msg.role === 'user' ? 'mr-1 text-right' : 'ml-1'}`}>
                {msg.time}
              </span>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex items-center gap-2 opacity-60">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-75" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-150" />
            </div>
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-primary">AI Butler is typing...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Bottom Shell */}
      <div className="fixed bottom-0 w-full z-50">
        {/* Quick Actions */}
        <div className="px-6 pb-3 flex gap-2 overflow-x-auto no-scrollbar bg-background/80 backdrop-blur-md pt-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => sendMessage(action)}
              className="whitespace-nowrap px-4 py-2 rounded-full bg-surface-container-lowest border border-outline-variant/20 text-[11px] font-label font-bold uppercase tracking-wider text-primary shadow-sm hover:bg-surface-container-low transition-colors"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="bg-background/90 backdrop-blur-2xl px-6 pt-3 pb-10 border-t border-outline-variant/15 shadow-ambient-up">
          <div className="relative flex items-center bg-surface-container-lowest rounded-full border border-outline-variant/20 px-4 py-3">
            <button className="text-on-surface-variant/40 mr-2">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-on-surface-variant/40 placeholder:font-light font-body outline-none"
              placeholder="Message your Butler..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-lg active:scale-95 transition-transform disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </button>
          </div>
        </div>

        {/* Bottom Nav */}
        <nav className="bg-background/90 backdrop-blur-2xl border-t border-outline-variant/15 flex justify-around items-center w-full pt-3 pb-8 shadow-ambient-up">
          {[
            { icon: 'home',                label: 'Home',      action: () => router.push(`/room/${token}`) },
            { icon: 'room_service',        label: 'Services',  action: () => router.push(`/room/${token}/service`) },
            { icon: 'smart_toy',           label: 'Concierge', active: true },
            { icon: 'confirmation_number', label: 'Tickets',   action: () => router.push(`/room/${token}/tickets`) },
          ].map((n) => (
            <button
              key={n.label}
              onClick={n.action}
              className={`flex flex-col items-center justify-center transition-all ${
                n.active ? 'text-primary font-bold -translate-y-0.5' : 'text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined mb-1" style={n.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{n.icon}</span>
              <span className="text-[10px] uppercase tracking-widest font-medium">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
