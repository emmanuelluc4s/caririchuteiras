'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Camera, ShieldCheck, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ReviewCard, type ReviewCardData } from './review-card'
import { ReviewImageLightbox } from './review-image-lightbox'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Filters = {
  rating?: number
  withImage?: boolean
  verifiedOnly?: boolean
}

type Props = {
  initialItems: ReviewCardData[]
  initialTotalPages: number
  initialFilters: Filters
}

export function GlobalReviewsList({
  initialItems,
  initialTotalPages,
  initialFilters,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = React.useState<ReviewCardData[]>(initialItems)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(initialTotalPages)
  const [loading, setLoading] = React.useState(false)
  const [lightbox, setLightbox] = React.useState<{
    src: string
    alt: string
  } | null>(null)

  const ratingFilter = initialFilters.rating ?? null
  const withImageFilter = Boolean(initialFilters.withImage)
  const verifiedFilter = Boolean(initialFilters.verifiedOnly)

  const initialMountRef = React.useRef(true)

  function applyFilters(next: {
    rating?: number | null
    withImage?: boolean
    verifiedOnly?: boolean
  }) {
    const params = new URLSearchParams(searchParams.toString())
    if (next.rating !== undefined) {
      if (next.rating === null) params.delete('rating')
      else params.set('rating', String(next.rating))
    }
    if (next.withImage !== undefined) {
      if (next.withImage) params.set('withImage', '1')
      else params.delete('withImage')
    }
    if (next.verifiedOnly !== undefined) {
      if (next.verifiedOnly) params.set('verifiedOnly', '1')
      else params.delete('verifiedOnly')
    }

    const query = params.toString()
    router.replace(query ? `/avaliacoes?${query}` : '/avaliacoes', {
      scroll: false,
    })
  }

  React.useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false
      return
    }

    let cancelled = false
    setLoading(true)

    const params = new URLSearchParams({ page: '1' })
    if (ratingFilter) params.set('rating', String(ratingFilter))
    if (withImageFilter) params.set('withImage', '1')
    if (verifiedFilter) params.set('verifiedOnly', '1')

    fetch(`/api/reviews?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setItems(data.items ?? [])
        setTotalPages(data.totalPages ?? 1)
        setPage(1)
      })
      .catch(() => {
        if (!cancelled) toast.error('Erro ao carregar avaliações')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [ratingFilter, withImageFilter, verifiedFilter])

  async function loadMore() {
    setLoading(true)
    const next = page + 1
    const params = new URLSearchParams({ page: String(next) })
    if (ratingFilter) params.set('rating', String(ratingFilter))
    if (withImageFilter) params.set('withImage', '1')
    if (verifiedFilter) params.set('verifiedOnly', '1')

    try {
      const res = await fetch(`/api/reviews?${params.toString()}`)
      const data = await res.json()
      setItems((prev) => [...prev, ...(data.items ?? [])])
      setPage(next)
      setTotalPages(data.totalPages ?? 1)
    } catch {
      toast.error('Erro ao carregar mais')
    } finally {
      setLoading(false)
    }
  }

  const hasFilters = ratingFilter !== null || withImageFilter || verifiedFilter
  const canLoadMore = page < totalPages

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="shrink-0 text-xs uppercase tracking-wider text-gray-400">
          Filtros:
        </span>

        {[5, 4, 3, 2, 1].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() =>
              applyFilters({ rating: ratingFilter === r ? null : r })
            }
            aria-pressed={ratingFilter === r}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all',
              ratingFilter === r
                ? 'border-neon bg-neon/10 text-neon'
                : 'border-border text-gray-100 hover:border-neon/40',
            )}
          >
            {r}★
          </button>
        ))}

        <button
          type="button"
          onClick={() => applyFilters({ withImage: !withImageFilter })}
          aria-pressed={withImageFilter}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
            withImageFilter
              ? 'border-neon bg-neon/10 text-neon'
              : 'border-border text-gray-100 hover:border-neon/40',
          )}
        >
          <Camera className="h-3 w-3" />
          Com fotos
        </button>

        <button
          type="button"
          onClick={() => applyFilters({ verifiedOnly: !verifiedFilter })}
          aria-pressed={verifiedFilter}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
            verifiedFilter
              ? 'border-neon bg-neon/10 text-neon'
              : 'border-border text-gray-100 hover:border-neon/40',
          )}
        >
          <ShieldCheck className="h-3 w-3" />
          Verificadas
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={() => router.replace('/avaliacoes', { scroll: false })}
            className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-danger"
          >
            <X className="h-3 w-3" />
            Limpar tudo
          </button>
        )}
      </div>

      <div className={cn('transition-opacity', loading && 'opacity-50')}>
        {items.length === 0 && !loading ? (
          <div className="rounded-lg border border-border bg-bg-secondary p-12 text-center">
            <p className="text-sm text-gray-400">
              Nenhuma avaliação com esses filtros.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {items.map((review) => (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ReviewCard
                    review={review}
                    showProduct
                    onImageClick={(src, alt) => setLightbox({ src, alt })}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {canLoadMore && (
        <div className="pt-4 text-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? 'Carregando...' : 'Carregar mais avaliações'}
          </Button>
        </div>
      )}

      <ReviewImageLightbox
        src={lightbox?.src ?? null}
        alt={lightbox?.alt ?? ''}
        onClose={() => setLightbox(null)}
      />
    </section>
  )
}
