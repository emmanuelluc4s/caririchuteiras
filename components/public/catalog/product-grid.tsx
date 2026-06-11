'use client'

import { motion } from 'framer-motion'
import { ProductCard } from '@/components/public/product/product-card'
import { EmptyResults } from './empty-results'
import { useCatalogFilters } from '@/lib/catalog/use-filters'
import type { ProductCardData } from '@/lib/types/product-card'

type Props = {
  products: ProductCardData[]
  total: number
}

export function ProductGrid({ products, total }: Props) {
  const { isPending } = useCatalogFilters()

  if (products.length === 0 && !isPending) {
    return <EmptyResults />
  }

  return (
    <div className="relative">
      {isPending && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-bg-primary/40 backdrop-blur-[1px] transition-opacity"
        />
      )}

      <motion.div
        layout
        className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4"
        aria-busy={isPending}
      >
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.2) }}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </motion.div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Mostrando {products.length} de {total} produto{total !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
