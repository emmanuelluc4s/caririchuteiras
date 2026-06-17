'use client'

import * as React from 'react'
import { useAnalytics } from '@/lib/analytics/use-analytics'

type Props = {
  productId: string
  slug: string
  productName?: string
  productPrice?: number
  brand?: string
  category?: string
}

export function ProductViewTracker({
  productId,
  slug,
  productName,
  productPrice,
  brand,
  category,
}: Props) {
  const { track } = useAnalytics()
  const trackedRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (trackedRef.current === productId) return
    trackedRef.current = productId
    track('product_view', {
      productId,
      productName,
      productPrice,
      brand,
      category,
      metadata: { slug },
    })
  }, [productId, slug, productName, productPrice, brand, category, track])

  return null
}
