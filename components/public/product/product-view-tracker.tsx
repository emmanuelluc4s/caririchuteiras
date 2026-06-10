'use client'

import * as React from 'react'
import { useAnalytics } from '@/lib/analytics/use-analytics'

export function ProductViewTracker({
  productId,
  slug,
}: {
  productId: string
  slug: string
}) {
  const { track } = useAnalytics()
  const trackedRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (trackedRef.current === productId) return
    trackedRef.current = productId
    track('product_view', { productId, metadata: { slug } })
  }, [productId, slug, track])

  return null
}
