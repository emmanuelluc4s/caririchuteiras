'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import {
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'

type Testimonial = {
  id: string
  customerName: string
  city: string | null
  rating: number
  comment: string
  imageUrl: string | null
  isVerifiedPurchase: boolean
  product: {
    slug: string
    name: string
    brand: string
  }
}

type Props = {
  reviews: Testimonial[]
}

export function TestimonialsCarousel({ reviews }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
  })
  const [canPrev, setCanPrev] = React.useState(false)
  const [canNext, setCanNext] = React.useState(false)

  React.useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev())
      setCanNext(emblaApi.canScrollNext())
    }
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, reviews.length])

  if (reviews.length === 0) return null

  return (
    <section className="border-t border-border bg-bg-secondary py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neon">
              <MessageSquare className="h-3.5 w-3.5" />
              Quem comprou aprovou
            </p>
            <h2 className="font-display text-3xl uppercase tracking-tight md:text-5xl">
              O que a galera <span className="text-neon">tá dizendo</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/avaliacoes"
              className="text-xs uppercase tracking-wider text-neon hover:underline"
            >
              Ver todas →
            </Link>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              aria-label="Anterior"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-all hover:border-neon hover:text-neon disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              aria-label="Próximo"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-all hover:border-neon hover:text-neon disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div ref={emblaRef} className="-mx-2 overflow-hidden">
          <div className="flex">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="min-w-0 flex-[0_0_85%] px-2 sm:flex-[0_0_55%] md:flex-[0_0_42%] lg:flex-[0_0_32%]"
              >
                <article className="flex h-full flex-col rounded-xl border border-border bg-bg-primary p-5 md:p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < r.rating ? 'fill-warning text-warning' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    {r.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                        <ShieldCheck className="h-3 w-3" />
                        Verificado
                      </span>
                    )}
                  </div>

                  <p className="mb-3 line-clamp-4 flex-1 text-sm leading-relaxed text-gray-100">
                    &ldquo;{r.comment}&rdquo;
                  </p>

                  {r.imageUrl && (
                    <div className="relative mb-3 h-32 w-full overflow-hidden rounded-md border border-border bg-bg-tertiary">
                      <Image
                        src={r.imageUrl}
                        alt={`Foto de ${r.customerName}`}
                        fill
                        sizes="(max-width: 768px) 80vw, 33vw"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {r.customerName}
                      </p>
                      {r.city && (
                        <p className="truncate text-[10px] text-gray-400">
                          {r.city}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/produto/${r.product.slug}`}
                      className="whitespace-nowrap text-[10px] uppercase tracking-wide text-neon hover:underline"
                    >
                      Ver produto →
                    </Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
