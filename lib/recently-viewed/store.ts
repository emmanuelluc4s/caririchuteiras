'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  RECENTLY_VIEWED_MAX,
  RECENTLY_VIEWED_STORAGE_KEY,
  type RecentlyViewedItem,
} from './types'

type State = {
  items: RecentlyViewedItem[]
  add: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void
  clear: () => void
}

export const useRecentlyViewedStore = create<State>()(
  persist(
    (set) => ({
      items: [],

      add: (item) => {
        set((state) => {
          const filtered = state.items.filter(
            (i) => i.productId !== item.productId,
          )
          const next: RecentlyViewedItem[] = [
            { ...item, viewedAt: Date.now() },
            ...filtered,
          ].slice(0, RECENTLY_VIEWED_MAX)
          return { items: next }
        })
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: RECENTLY_VIEWED_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      version: 1,
    },
  ),
)
