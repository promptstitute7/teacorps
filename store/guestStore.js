'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGuestStore = create(
  persist(
    (set, get) => ({
      room: null,
      reservation: null,
      tickets: [],
      cart: [],
      dnd: false,

      // Phone-verified session per room token
      // { roomToken, phone, reservationId, guestName, checkOutDate }
      session: null,

      setRoom: (room, reservation) => set({ room, reservation }),
      setDnd: (dnd) => set({ dnd }),

      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null, room: null, reservation: null, tickets: [], cart: [], dnd: false }),

      setTickets: (tickets) => set({ tickets }),
      addTicket: (ticket) => set((s) => ({ tickets: [ticket, ...s.tickets] })),
      updateTicketStatus: (ticketId, status) =>
        set((s) => ({
          tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)),
        })),

      // Cart
      addToCart: (item) =>
        set((s) => {
          const existing = s.cart.find((c) => c.id === item.id);
          if (existing) {
            return { cart: s.cart.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c) };
          }
          return { cart: [...s.cart, { ...item, qty: 1 }] };
        }),
      removeFromCart: (itemId) =>
        set((s) => ({
          cart: s.cart
            .map((c) => c.id === itemId ? { ...c, qty: c.qty - 1 } : c)
            .filter((c) => c.qty > 0),
        })),
      clearCart: () => set({ cart: [] }),

      cartTotal: () => get().cart.reduce((sum, c) => sum + c.price * c.qty, 0),
      cartCount: () => get().cart.reduce((sum, c) => sum + c.qty, 0),
    }),
    {
      name: 'teacorps-guest',
      // Only persist session — room/tickets/cart are loaded fresh each visit
      partialize: (state) => ({ session: state.session }),
    }
  )
);
