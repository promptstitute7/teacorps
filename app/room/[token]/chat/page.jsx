'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { guestApi } from '@/lib/api';
import { useGuestStore } from '@/store/guestStore';
import { subscribeToGuestChat, unsubscribe } from '@/lib/realtime';
import GuestNav from '@/components/ui/GuestNav';

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function groupByDate(messages) {
  const groups = [];
  let currentDate = null;
  for (const msg of messages) {
    const d = formatDate(msg.createdAt);
    if (d !== currentDate) {
      groups.push({ type: 'date', label: d });
      currentDate = d;
    }
    groups.push({ type: 'message', ...msg });
  }
  return groups;
}

export default function GuestChatPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { reservation } = useGuestStore();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const reservationId = reservation?.id;

  useEffect(() => {
    guestApi.getMessages(token)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!reservationId) return;
    const channel = subscribeToGuestChat(reservationId, {
      onMessage: (msg) => {
        setMessages(prev => {
          // Avoid duplicate if we already added it optimistically
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      },
    });
    return () => unsubscribe(channel);
  }, [reservationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    setInput('');

    // Optimistic
    const temp = { id: `tmp-${Date.now()}`, senderType: 'guest', body, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, temp]);

    try {
      const created = await guestApi.sendMessage(token, body);
      setMessages(prev => prev.map(m => m.id === temp.id ? created : m));
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== temp.id));
      setInput(body);
      alert(e.message);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const grouped = groupByDate(messages);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 glass-nav border-b border-outline-variant/30">
        <div className="flex items-center gap-4 px-5 py-4 max-w-lg mx-auto">
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white border border-outline-variant/40 flex items-center justify-center text-on-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">Hotel Tea Square</p>
              <h1 className="text-base font-semibold text-primary leading-tight">Front Desk</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-on-surface-variant font-medium">Online</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 pt-20 pb-32 px-4 max-w-lg mx-auto w-full overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 rounded-full bg-primary/8 border border-primary/15 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-primary/50" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            </div>
            <p className="text-sm font-semibold text-on-surface mb-1">Start a conversation</p>
            <p className="text-xs text-on-surface-variant max-w-[220px]">Our front desk team is here to help with anything during your stay.</p>
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {grouped.map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${idx}`} className="flex items-center gap-3 py-3">
                    <div className="flex-1 h-px bg-outline-variant/30" />
                    <span className="text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest">{item.label}</span>
                    <div className="flex-1 h-px bg-outline-variant/30" />
                  </div>
                );
              }

              const isGuest = item.senderType === 'guest';
              return (
                <div key={item.id} className={`flex ${isGuest ? 'justify-end' : 'justify-start'} mb-1`}>
                  {!isGuest && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-2 mt-auto mb-1 shrink-0">
                      <span className="material-symbols-outlined text-[12px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
                    </div>
                  )}
                  <div className={`max-w-[75%] ${isGuest ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isGuest && item.senderName && (
                      <p className="text-[10px] font-semibold text-primary mb-0.5 ml-1">{item.senderName}</p>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isGuest
                        ? 'bg-primary text-on-primary rounded-br-md'
                        : 'bg-white border border-outline-variant/40 text-on-surface rounded-bl-md shadow-sm'
                    }`}>
                      {item.body}
                    </div>
                    <p className={`text-[10px] mt-0.5 ${isGuest ? 'text-right text-on-surface-variant/40' : 'text-left text-on-surface-variant/40'} mx-1`}>
                      {formatTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input bar */}
      <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-background/98 border-t border-outline-variant/30 px-4 py-3"
        style={{ backdropFilter: 'blur(16px)' }}>
        <div className="flex items-end gap-3 max-w-lg mx-auto">
          <div className="flex-1 bg-white border border-outline-variant/40 rounded-2xl px-4 py-3 shadow-sm">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full bg-transparent text-sm text-on-surface resize-none focus:outline-none leading-relaxed placeholder:text-on-surface-variant/40"
              style={{ maxHeight: '100px', overflowY: 'auto' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 shrink-0"
            style={{ background: 'rgb(var(--c-primary))', boxShadow: input.trim() ? '0 4px 12px rgba(30,80,50,0.3)' : 'none' }}>
            <span className="material-symbols-outlined text-[18px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </div>

      <GuestNav token={token} active="chat" />
    </div>
  );
}
