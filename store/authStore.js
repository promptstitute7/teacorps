'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      staff: null,
      setAuth: (token, staff) => set({ token, staff }),
      clearAuth: () => set({ token: null, staff: null }),
    }),
    { name: 'teacorps-auth' }
  )
);
