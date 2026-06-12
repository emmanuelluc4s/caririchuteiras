'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, History, Trash2 } from 'lucide-react'
import { useRecentlyViewedStore } from '@/lib/recently-viewed/store'
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated'
import { formatBRL } from '@/lib/utils'

const DISABLED_PATHS = [
  '/admin',
  '/manutencao',
  '/comparar',
  '/privacidade',
  '/termos',
]

export function RecentlyViewedCarousel() {
  const hydrated = useHasHydrated()
  const pathname = usePathname()
  const items = useRecentlyViewedStore((s) => s.items)
  const clear = useRecentlyViewedStore((s) => s.clear)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
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
  }, [emblaApi, items.length])

  if (!hydrated || items.length < 2) return null
  if (DISABLED_PATHS.some((p) => pathname?.startsWith(p))) return null

  const currentSlugMatch = pathname?.match(/^\/produto\/([^/]+)/)
  const currentSlug = currentSlugMatch ? currentSlugMatch[1] : null
  const visibleItems = items.filter((i) => i.slug !== currentSlug)

  if (visibleItems.length < 2) return null

  return (
    <section
      className="border-y border-border bg-bg-secondary py-8 md:py-12"
      aria-label="Vistos recentemente"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-6">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neon">
              <History className="h-3.5 w-3.5" />
              Você viu há pouco
            </p>
            <h2 className="font-display text-2xl uppercase tracking-tight md:text-4xl">
              Volte e dê outra <span className="text-neon">olhada</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('Limpar histórico de produtos vistos?')) clear()
              }}
              aria-label="Limpar histórico"
              className="inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-danger"
            >
              <Trash2 className="h-3 w-3" />
              Limpar
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label="Anterior"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-all hover:border-neon hover:text-neon disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              aria-label="Próximo"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-all hover:border-neon hover:text-neon disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div ref={emblaRef} className="-mx-2 overflow-hidden">
          <div className="flex">
            {visibleItems.map((item) => (
              <div
                key={item.productId}
                className="min-w-0 flex-[0_0_45%] px-2 sm:flex-[0_0_30%] md:flex-[0_0_22%] lg:flex-[0_0_17%]"
              >
                <Link
                  href={`/produto/${item.slug}`}
                  className="group block overflow-hidden rounded-lg border border-border bg-bg-primary transition-all hover:border-neon/40 hover:neon-glow-sm"
                >
                  <div className="relative aspect-square bg-bg-tertiary">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-neon">
                      {item.brand}
                    </p>
                    <p className="line-clamp-2 min-h-[2rem] text-xs font-medium transition-colors group-hover:text-neon">
                      {item.name}
                    </p>
                    <p className="font-display text-lg leading-none text-neon">
                      {formatBRL(item.promoPrice ?? item.price)}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
