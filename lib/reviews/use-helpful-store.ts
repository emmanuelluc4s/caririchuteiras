'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type State = {
  helpful: Record<string, boolean>
  toggle: (reviewId: string) => void
  has: (reviewId: string) => boolean
}

export const useHelpfulStore = create<State>()(
  persist(
    (set, get) => ({
      helpful: {},

      toggle: (reviewId) => {
        set((state) => {
          const newHelpful = { ...state.helpful }
          if (newHelpful[reviewId]) {
            delete newHelpful[reviewId]
          } else {
            newHelpful[reviewId] = true
          }
          return { helpful: newHelpful }
        })
      },

      has: (reviewId) => Boolean(get().helpful[reviewId]),
    }),
    {
      name: 'cc-helpful-reviews',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ helpful: s.helpful }),
      version: 1,
    },
  ),
)
