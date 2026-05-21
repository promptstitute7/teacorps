'use client';
import { useState, useEffect, useRef } from 'react';
import { staffApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { subscribeToStaffChat, unsubscribe } from '@/lib/realtime';

function formatTime(ts) {
  const d = new Date(ts);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatFullTime(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDateLabel(ts) {
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
    const d = formatDateLabel(msg.createdAt);
    if (d !== currentDate) {
      groups.push({ type: 'date', label: d });
      currentDate = d;
    }
    groups.push({ type: 'message', ...msg });
  }
  return groups;
}

export default function StaffChatPage() {
  const { token, staff } = useAuthStore();
  const [chatList, setChatList] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null); // { roomId, roomNumber, reservationId }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat list
  useEffect(() => {
    staffApi.getChatList(token)
      .then(setChatList)
      .catch(console.error)
      .finally(() => setLoadingList(false));
  }, [token]);

  // Realtime: new messages come in → update list + active conversation
  useEffect(() => {
    const channel = subscribeToStaffChat({
      onMessage: (msg) => {
        // Update the active conversation if it matches
        if (selectedRoom && msg.reservation_id === selectedRoom.reservationId) {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
        // Refresh chat list to update unread counts + last message
        staffApi.getChatList(token).then(setChatList).catch(console.error);
      },
    });
    return () => unsubscribe(channel);
  }, [token, selectedRoom]);

  // Load messages when room selected
  useEffect(() => {
    if (!selectedRoom) return;
    setLoadingMessages(true);
    setMessages([]);
    staffApi.getChatMessages(token, selectedRoom.roomId)
      .then(data => {
        setMessages(data.messages || []);
        // Clear unread for this room in the list
        setChatList(prev => prev.map(r =>
          r.roomId === selectedRoom.roomId ? { ...r, unread: 0 } : r
        ));
      })
      .catch(console.error)
      .finally(() => setLoadingMessages(false));
  }, [selectedRoom?.roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const body = input.trim();
    if (!body || sending || !selectedRoom) return;
    setSending(true);
    setInput('');

    const temp = { id: `tmp-${Date.now()}`, senderType: 'staff', senderName: staff?.name, body, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, temp]);

    try {
      const created = await staffApi.sendChatMessage(token, selectedRoom.roomId, body);
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
    <div className="flex h-[calc(100vh-128px)] overflow-hidden">

      {/* Room list sidebar */}
      <div className={`${selectedRoom ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-outline-variant/20 bg-surface shrink-0`}>
        <div className="px-5 py-4 border-b border-outline-variant/15">
          <h2 className="text-base font-semibold text-on-surface">Guest Chats</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Active conversations</p>
        </div>

        {loadingList ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : chatList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            <p className="text-sm text-on-surface-variant">No conversations yet</p>
            <p className="text-xs text-on-surface-variant/60 mt-1">Guests who message from their room will appear here</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {chatList.map(room => (
              <button
                key={room.roomId}
                onClick={() => setSelectedRoom({ roomId: room.roomId, roomNumber: room.roomNumber, reservationId: room.reservationId })}
                className={`w-full flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10 transition-colors text-left ${
                  selectedRoom?.roomId === room.roomId
                    ? 'bg-primary/8'
                    : 'hover:bg-surface-container-low'
                }`}>
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{room.roomNumber}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold text-on-surface">Room {room.roomNumber}</p>
                    <p className="text-[10px] text-on-surface-variant/50">
                      {room.lastMessage ? formatTime(room.lastMessage.createdAt) : ''}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-on-surface-variant truncate">
                      {room.lastMessage
                        ? `${room.lastMessage.senderType === 'staff' ? 'You: ' : ''}${room.lastMessage.body}`
                        : 'No messages yet'}
                    </p>
                    {room.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                        {room.unread > 9 ? '9+' : room.unread}
                      </span>
                    )}
                  </div>
                  {room.guestName && (
                    <p className="text-[10px] text-on-surface-variant/50 mt-0.5">{room.guestName}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conversation panel */}
      <div className={`${selectedRoom ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}>
        {!selectedRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
            <p className="text-base font-semibold text-on-surface-variant/50">Select a conversation</p>
            <p className="text-sm text-on-surface-variant/30 mt-1">Choose a room from the left to start chatting</p>
          </div>
        ) : (
          <>
            {/* Conversation header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/15 bg-surface shrink-0">
              <button
                onClick={() => setSelectedRoom(null)}
                className="md:hidden w-8 h-8 rounded-full bg-white border border-outline-variant/40 flex items-center justify-center text-on-surface-variant shadow-sm mr-1">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{selectedRoom.roomNumber}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Room {selectedRoom.roomNumber}</p>
                <p className="text-xs text-on-surface-variant">
                  {chatList.find(r => r.roomId === selectedRoom.roomId)?.guestName || 'Guest'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <p className="text-sm text-on-surface-variant">No messages yet</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">Send the first message to the guest</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {grouped.map((item, idx) => {
                    if (item.type === 'date') {
                      return (
                        <div key={`date-${idx}`} className="flex items-center gap-3 py-3">
                          <div className="flex-1 h-px bg-outline-variant/20" />
                          <span className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-widest">{item.label}</span>
                          <div className="flex-1 h-px bg-outline-variant/20" />
                        </div>
                      );
                    }

                    const isStaff = item.senderType === 'staff';
                    return (
                      <div key={item.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'} mb-1`}>
                        {!isStaff && (
                          <div className="w-7 h-7 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center mr-2 mt-auto mb-1 shrink-0">
                            <span className="text-xs font-bold text-secondary">G</span>
                          </div>
                        )}
                        <div className={`max-w-[70%] flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isStaff
                              ? 'bg-primary text-on-primary rounded-br-md'
                              : 'bg-white border border-outline-variant/30 text-on-surface rounded-bl-md shadow-sm'
                          }`}>
                            {item.body}
                          </div>
                          <p className="text-[10px] text-on-surface-variant/40 mt-0.5 mx-1">
                            {isStaff && item.senderName ? `${item.senderName} · ` : ''}{formatFullTime(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-outline-variant/15 bg-surface shrink-0">
              <div className="flex items-end gap-3">
                <div className="flex-1 bg-background border border-outline-variant/40 rounded-2xl px-4 py-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Reply to guest..."
                    rows={1}
                    className="w-full bg-transparent text-sm text-on-surface resize-none focus:outline-none leading-relaxed placeholder:text-on-surface-variant/40"
                    style={{ maxHeight: '100px', overflowY: 'auto' }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 shrink-0"
                  style={{ boxShadow: input.trim() ? '0 4px 12px rgba(30,80,50,0.3)' : 'none' }}>
                  <span className="material-symbols-outlined text-[18px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
