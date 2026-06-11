'use client'

import * as React from 'react'

export type SearchSuggestionProduct = {
  id: string
  slug: string
  name: string
  brand: string
  price: number
  promoPrice: number | null
  imageUrl?: string
  categoryName: string
}

export type SearchSuggestions = {
  query: string
  products: SearchSuggestionProduct[]
  categories: Array<{ slug: string; name: string }>
  brands: Array<{ value: string; count: number }>
}

const EMPTY: SearchSuggestions = {
  query: '',
  products: [],
  categories: [],
  brands: [],
}

export function useSearchSuggestions(query: string, debounceMs = 200) {
  const [suggestions, setSuggestions] = React.useState<SearchSuggestions>(EMPTY)
  const [loading, setLoading] = React.useState(false)
  const abortRef = React.useRef<AbortController | null>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    const cleanQuery = query.trim()

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (abortRef.current) abortRef.current.abort()

    if (cleanQuery.length < 2) {
      setSuggestions(EMPTY)
      setLoading(false)
      return
    }

    setLoading(true)

    timeoutRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(cleanQuery)}`,
          { signal: controller.signal },
        )
        if (!res.ok) throw new Error('Falha ao buscar sugestões')
        const data = (await res.json()) as SearchSuggestions
        setSuggestions(data)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('[search] error:', error)
          setSuggestions(EMPTY)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [query, debounceMs])

  return { suggestions, loading }
}

/**
 * Destaca o termo buscado em um texto.
 */
export function highlightMatch(text: string, query: string): React.ReactNode {
  const q = query.trim()
  if (!q) return text

  const regex = new RegExp(`(${escapeRegex(q)})`, 'ig')
  const parts = text.split(regex)

  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark
        key={i}
        className="rounded-sm bg-neon/30 px-0.5 font-semibold text-neon"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  )
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
