'use client'

import * as React from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/public/product/product-card'
import type { ProductCardData } from '@/lib/types/product-card'

type Props = {
  title: string
  subtitle?: string
  eyebrow?: string
  products: ProductCardData[]
  seeAllHref?: string
  seeAllLabel?: string
}

export function FeaturedProducts({
  title,
  subtitle,
  eyebrow = 'Destaques',
  products,
  seeAllHref,
  seeAllLabel = 'Ver tudo',
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    skipSnaps: false,
    dragFree: true,
    containScroll: 'trimSnaps',
  })
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  React.useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi])

  if (products.length === 0) return null

  const headingId = `${title.replace(/\s+/g, '-').toLowerCase()}-heading`

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20"
      aria-labelledby={headingId}
    >
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-10">
        <div>
          {eyebrow && (
            <p className="text-neon mb-2 text-xs uppercase tracking-[0.2em]">{eyebrow}</p>
          )}
          <h2
            id={headingId}
            className="font-display text-3xl uppercase tracking-tight md:text-5xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 max-w-xl text-sm text-gray-400 md:text-base">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-neon hidden items-center gap-2 text-sm font-semibold uppercase tracking-wide transition-all hover:gap-3 md:inline-flex"
            >
              {seeAllLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label="Anterior"
              className="border-border text-foreground hover:border-neon hover:text-neon hover:neon-glow-sm grid h-10 w-10 place-items-center rounded-full border transition-all disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              aria-label="Próximo"
              className="border-border text-foreground hover:border-neon hover:text-neon hover:neon-glow-sm grid h-10 w-10 place-items-center rounded-full border transition-all disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div ref={emblaRef} className="-mx-2 overflow-hidden">
        <div className="flex">
          {products.map((p) => (
            <div
              key={p.id}
              className="min-w-0 flex-[0_0_70%] px-2 sm:flex-[0_0_45%] md:flex-[0_0_32%] lg:flex-[0_0_24%]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      {seeAllHref && (
        <div className="mt-6 text-center md:hidden">
          <Link
            href={seeAllHref}
            className="text-neon inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
          >
            {seeAllLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  )
}
