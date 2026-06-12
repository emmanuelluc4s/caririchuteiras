'use client'

import { create } from 'zustand'

type State = {
  productSlug: string | null
  open: (slug: string) => void
  close: () => void
}

export const useQuickViewStore = create<State>((set) => ({
  productSlug: null,
  open: (slug) => set({ productSlug: slug }),
  close: () => set({ productSlug: null }),
}))
