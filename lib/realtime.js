'use client';
import { createClient } from '@supabase/supabase-js';

let _supabase = null;

function getClient() {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[realtime] Supabase env vars missing — live updates disabled');
    return null;
  }
  _supabase = createClient(url, key);
  return _supabase;
}

/**
 * Subscribe to all ticket inserts + updates for staff view.
 * @param {{ onInsert, onUpdate, onEscalation }} handlers
 * @returns channel (pass to unsubscribe() on cleanup)
 */
export function subscribeToStaffTickets({ onInsert, onUpdate, onEscalation } = {}) {
  const client = getClient();
  if (!client) return null;

  const channel = client
    .channel('staff-tickets')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'tickets' },
      (payload) => onInsert?.(payload.new),
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'tickets' },
      (payload) => {
        const next = payload.new;
        const prev = payload.old;
        if (next.escalation_count > (prev?.escalation_count ?? 0)) {
          onEscalation?.(next);
        } else {
          onUpdate?.(next);
        }
      },
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to ticket updates for a specific room (guest view).
 * @param {string} roomId  — Prisma room.id (UUID)
 * @param {{ onUpdate }} handlers
 * @returns channel
 */
export function subscribeToGuestTickets(roomId, { onUpdate } = {}) {
  const client = getClient();
  if (!client || !roomId) return null;

  const channel = client
    .channel(`guest-tickets-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tickets',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => onUpdate?.(payload.new),
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to new messages for a specific reservation (guest view).
 * @param {string} reservationId
 * @param {{ onMessage }} handlers
 * @returns channel
 */
export function subscribeToGuestChat(reservationId, { onMessage } = {}) {
  const client = getClient();
  if (!client || !reservationId) return null;

  const channel = client
    .channel(`guest-chat-${reservationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `reservation_id=eq.${reservationId}`,
      },
      (payload) => onMessage?.(payload.new),
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to all new messages across all rooms (staff view).
 * @param {{ onMessage }} handlers
 * @returns channel
 */
export function subscribeToStaffChat({ onMessage } = {}) {
  const client = getClient();
  if (!client) return null;

  const channel = client
    .channel('staff-chat')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => onMessage?.(payload.new),
    )
    .subscribe();

  return channel;
}

export function unsubscribe(channel) {
  if (!channel) return;
  getClient()?.removeChannel(channel);
}
