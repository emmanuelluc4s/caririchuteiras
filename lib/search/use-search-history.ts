'use client'

import * as React from 'react'

const STORAGE_KEY = 'cc-search-history'
const MAX_ITEMS = 5

type StoredHistory = {
  items: string[]
  updatedAt: number
}

export function useSearchHistory() {
  const [history, setHistory] = React.useState<string[]>([])
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as StoredHistory
        if (Array.isArray(parsed.items)) {
          setHistory(parsed.items.slice(0, MAX_ITEMS))
        }
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true)
    }
  }, [])

  const addTerm = React.useCallback((term: string) => {
    const cleaned = term.trim()
    if (cleaned.length < 2 || cleaned.length > 100) return
    setHistory((prev) => {
      const filtered = prev.filter(
        (t) => t.toLowerCase() !== cleaned.toLowerCase(),
      )
      const next = [cleaned, ...filtered].slice(0, MAX_ITEMS)
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ items: next, updatedAt: Date.now() }),
        )
      } catch {}
      return next
    })
  }, [])

  const removeTerm = React.useCallback((term: string) => {
    setHistory((prev) => {
      const next = prev.filter((t) => t !== term)
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ items: next, updatedAt: Date.now() }),
        )
      } catch {}
      return next
    })
  }, [])

  const clear = React.useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }, [])

  return { history, addTerm, removeTerm, clear, loaded }
}
