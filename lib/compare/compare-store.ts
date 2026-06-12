'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  COMPARE_MAX_ITEMS,
  COMPARE_STORAGE_KEY,
  type CompareItem,
} from './types'

type AddResult = 'added' | 'limit-reached' | 'already-in'
type ToggleResult = 'added' | 'removed' | 'limit-reached'

type CompareState = {
  items: CompareItem[]
  toggle: (productId: string) => ToggleResult
  add: (productId: string) => AddResult
  remove: (productId: string) => void
  clear: () => void
  has: (productId: string) => boolean
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (productId) => {
        const state = get()
        if (state.has(productId)) {
          state.remove(productId)
          return 'removed'
        }
        if (state.items.length >= COMPARE_MAX_ITEMS) {
          return 'limit-reached'
        }
        set({
          items: [...state.items, { productId, addedAt: Date.now() }],
        })
        return 'added'
      },

      add: (productId) => {
        const state = get()
        if (state.has(productId)) return 'already-in'
        if (state.items.length >= COMPARE_MAX_ITEMS) return 'limit-reached'
        set({
          items: [...state.items, { productId, addedAt: Date.now() }],
        })
        return 'added'
      },

      remove: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },

      clear: () => set({ items: [] }),

      has: (productId) => get().items.some((i) => i.productId === productId),
    }),
    {
      name: COMPARE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      version: 1,
    },
  ),
)

export const selectCompareIds = (state: CompareState) =>
  state.items.map((i) => i.productId)

export const selectCompareCount = (state: CompareState) => state.items.length
