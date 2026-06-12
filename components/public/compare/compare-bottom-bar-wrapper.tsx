'use client'

import * as React from 'react'
import { useCompareStore } from '@/lib/compare/compare-store'
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated'
import { CompareBottomBar } from './compare-bottom-bar'

type ProductThumb = {
  id: string
  slug: string
  name: string
  brand: string
  imageUrl?: string
}

/**
 * Busca miniaturas via API toda vez que o store muda.
 * Server-side seria impossível porque o store é client.
 */
export function CompareBottomBarWrapper() {
  const hydrated = useHasHydrated()
  const items = useCompareStore((s) => s.items)
  const [thumbnails, setThumbnails] = React.useState<ProductThumb[]>([])

  React.useEffect(() => {
    if (!hydrated || items.length === 0) {
      setThumbnails([])
      return
    }
    const ids = items.map((i) => i.productId).join(',')
    let cancelled = false

    fetch(`/api/compare/thumbnails?ids=${encodeURIComponent(ids)}`)
      .then((r) => r.json())
      .then((data: { thumbnails?: ProductThumb[] }) => {
        if (!cancelled && Array.isArray(data.thumbnails)) {
          setThumbnails(data.thumbnails)
        }
      })
      .catch(() => {
        // silencioso
      })

    return () => {
      cancelled = true
    }
  }, [items, hydrated])

  return <CompareBottomBar thumbnails={thumbnails} />
}
