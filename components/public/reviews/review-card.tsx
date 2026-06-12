'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, ShieldCheck, ThumbsUp, Camera } from 'lucide-react'
import { useHelpfulStore } from '@/lib/reviews/use-helpful-store'
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated'
import { cn } from '@/lib/utils'

export type ReviewCardData = {
  id: string
  customerName: string
  city: string | null
  rating: number
  comment: string
  imageUrl: string | null
  isVerifiedPurchase: boolean
  createdAt: Date | string
  product?: {
    slug: string
    name: string
    brand: string
    imageUrl?: string
  }
}

type Props = {
  review: ReviewCardData
  showProduct?: boolean
  onImageClick?: (src: string, alt: string) => void
}

export function ReviewCard({
  review,
  showProduct = false,
  onImageClick,
}: Props) {
  const hydrated = useHasHydrated()
  const isHelpful = useHelpfulStore((s) => s.has(review.id))
  const toggleHelpful = useHelpfulStore((s) => s.toggle)

  const dateLabel = new Date(review.createdAt).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <article className="rounded-lg border border-border bg-bg-secondary p-5 transition-all hover:border-border/80">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-foreground">
              {review.customerName}
            </p>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                <ShieldCheck className="h-3 w-3" />
                Verificado
              </span>
            )}
          </div>
          {review.city && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              {review.city}
            </p>
          )}
        </div>
        <div
          className="flex shrink-0 gap-0.5"
          aria-label={`${review.rating} de 5 estrelas`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3.5 w-3.5',
                i < review.rating
                  ? 'fill-warning text-warning'
                  : 'text-gray-600',
              )}
            />
          ))}
        </div>
      </header>

      <p className="whitespace-pre-line text-sm leading-relaxed text-gray-100">
        {review.comment}
      </p>

      {review.imageUrl && (
        <button
          type="button"
          onClick={() =>
            onImageClick?.(
              review.imageUrl!,
              `Foto da avaliação de ${review.customerName}`,
            )
          }
          className="group relative mt-3 block h-24 w-24 cursor-zoom-in overflow-hidden rounded-md border border-border bg-bg-tertiary"
          aria-label="Ampliar foto da avaliação"
        >
          <Image
            src={review.imageUrl}
            alt={`Foto enviada por ${review.customerName}`}
            fill
            sizes="96px"
            className="object-cover transition-transform group-hover:scale-110"
            unoptimized
          />
          <div className="absolute inset-0 grid place-items-center bg-black/0 transition-colors group-hover:bg-black/30">
            <Camera className="h-5 w-5 text-white opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100" />
          </div>
        </button>
      )}

      {showProduct && review.product && (
        <Link
          href={`/produto/${review.product.slug}`}
          className="group mt-3 flex items-center gap-3 rounded-md border border-border bg-bg-primary/40 p-2 transition-colors hover:border-neon"
        >
          {review.product.imageUrl && (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-bg-tertiary">
              <Image
                src={review.product.imageUrl}
                alt={review.product.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-neon">
              {review.product.brand}
            </p>
            <p className="line-clamp-1 text-xs text-foreground transition-colors group-hover:text-neon">
              {review.product.name}
            </p>
          </div>
        </Link>
      )}

      <footer className="mt-4 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-gray-600">
          {dateLabel}
        </p>

        <button
          type="button"
          onClick={() => toggleHelpful(review.id)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] transition-all',
            hydrated && isHelpful
              ? 'border-neon bg-neon/10 text-neon'
              : 'border-border text-gray-400 hover:border-neon/40 hover:text-neon',
          )}
          aria-pressed={hydrated && isHelpful}
        >
          <ThumbsUp className="h-3 w-3" />
          {hydrated && isHelpful ? 'Útil' : 'Útil?'}
        </button>
      </footer>
    </article>
  )
}
