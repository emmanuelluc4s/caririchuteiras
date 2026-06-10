'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/public/product/product-card'
import type { ProductCardData } from '@/lib/types/product-card'

type Props = {
  products: ProductCardData[]
}

export function NewArrivals({ products }: Props) {
  if (products.length === 0) return null

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20"
      aria-labelledby="new-arrivals-heading"
    >
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12">
        <div>
          <p className="text-neon mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <Sparkles className="h-4 w-4" />
            Recém-chegados
          </p>
          <h2
            id="new-arrivals-heading"
            className="font-display text-4xl uppercase tracking-tight md:text-6xl"
          >
            Lançamentos da <span className="text-neon">semana</span>
          </h2>
        </div>
        <Link
          href="/novidades"
          className="text-neon inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide transition-all hover:gap-3"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {products.slice(0, 8).map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.05, ease: 'easeOut' }}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
