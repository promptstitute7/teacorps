'use client';
import { create } from 'zustand';

export const useStaffStore = create((set, get) => ({
  tickets: [],
  total: 0,
  rooms: [],
  selectedTicket: null,
  filter: { category: '', status: '' },
  soundEnabled: true,

  setTickets: (tickets, total) => set({ tickets, total }),
  setRooms: (rooms) => set({ rooms }),
  selectTicket: (ticket) => set({ selectedTicket: ticket }),
  clearSelection: () => set({ selectedTicket: null }),

  setFilter: (filter) => set((s) => ({ filter: { ...s.filter, ...filter } })),

  // Real-time: prepend new ticket
  prependTicket: (ticket) =>
    set((s) => ({ tickets: [ticket, ...s.tickets.filter((t) => t.id !== ticket.id)] })),

  // Real-time: update ticket in list
  updateTicket: (ticketId, changes) =>
    set((s) => ({
      tickets: s.tickets.map((t) => t.id === ticketId ? { ...t, ...changes } : t),
      selectedTicket:
        s.selectedTicket?.id === ticketId ? { ...s.selectedTicket, ...changes } : s.selectedTicket,
    })),

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
}));
