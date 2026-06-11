'use client'

import * as React from 'react'
import { useAnalytics } from '@/lib/analytics/use-analytics'

type Props = {
  query: string
  total: number
}

export function SearchPageTracker({ query, total }: Props) {
  const { track } = useAnalytics()
  const trackedRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (query.length < 2) return
    const key = `${query}|${total}`
    if (trackedRef.current === key) return
    trackedRef.current = key
    track('search', { metadata: { query, total, source: 'page' } })
  }, [query, total, track])

  return null
}
