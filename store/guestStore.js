'use client';
import { create } from 'zustand';

export const useGuestStore = create((set, get) => ({
  room: null,
  reservation: null,
  tickets: [],
  cart: [],
  dnd: false,

  setRoom: (room, reservation) => set({ room, reservation }),
  setDnd: (dnd) => set({ dnd }),

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
}));
