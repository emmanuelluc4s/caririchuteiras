'use client'

import * as React from 'react'
import { useRecentlyViewedStore } from '@/lib/recently-viewed/store'

type Props = {
  productId: string
  slug: string
  name: string
  brand: string
  imageUrl?: string
  price: number
  promoPrice?: number
}

/**
 * Componente "fantasma" — adiciona o produto no histórico ao montar.
 */
export function RecentlyViewedTracker(props: Props) {
  const add = useRecentlyViewedStore((s) => s.add)
  const trackedRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (trackedRef.current === props.productId) return
    trackedRef.current = props.productId
    add({
      productId: props.productId,
      slug: props.slug,
      name: props.name,
      brand: props.brand,
      imageUrl: props.imageUrl,
      price: props.price,
      promoPrice: props.promoPrice,
    })
  }, [
    props.productId,
    props.slug,
    props.name,
    props.brand,
    props.imageUrl,
    props.price,
    props.promoPrice,
    add,
  ])

  return null
}
