'use client'

import { create } from 'zustand'

type SearchModalState = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useSearchModal = create<SearchModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
