'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, CartItemInput } from './types'
import { getCartItemKey } from './types'

const STORAGE_KEY = 'cc-cart'
const MAX_ITEMS = 20
const MAX_QUANTITY = 99

export type AddItemResult = 'added' | 'updated' | 'limit-reached'

type CartState = {
  items: CartItem[]
  couponCode: string | null
  isOpen: boolean
  addItem: (item: CartItemInput) => AddItemResult
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clear: () => void
  setCoupon: (code: string | null) => void
  open: () => void
  close: () => void
  toggle: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      isOpen: false,

      addItem: (input) => {
        const state = get()
        const newItem: CartItem = {
          ...input,
          quantity: input.quantity ?? 1,
          addedAt: Date.now(),
        }
        const key = getCartItemKey(newItem)
        const existingIndex = state.items.findIndex((i) => getCartItemKey(i) === key)

        if (existingIndex >= 0) {
          const existing = state.items[existingIndex]!
          const updated = [...state.items]
          updated[existingIndex] = {
            ...existing,
            quantity: Math.min(existing.quantity + (input.quantity ?? 1), MAX_QUANTITY),
          }
          set({ items: updated })
          return 'updated'
        }

        if (state.items.length >= MAX_ITEMS) {
          return 'limit-reached'
        }

        set({ items: [...state.items, newItem] })
        return 'added'
      },

      removeItem: (key) => {
        set((state) => ({
          items: state.items.filter((i) => getCartItemKey(i) !== key),
        }))
      },

      updateQuantity: (key, quantity) => {
        if (quantity < 1) {
          get().removeItem(key)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            getCartItemKey(i) === key ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY) } : i,
          ),
        }))
      },

      clear: () => set({ items: [], couponCode: null }),
      setCoupon: (code) => set({ couponCode: code }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Não persistir o estado de abertura do drawer
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode }),
      version: 1,
    },
  ),
)

// === Seletores derivados ===
export const selectItemsCount = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0)

export const selectSubtotal = (state: CartState) =>
  state.items.reduce((sum, i) => sum + (i.promoPrice ?? i.price) * i.quantity, 0)
