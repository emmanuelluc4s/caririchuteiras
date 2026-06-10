'use client'

import * as React from 'react'
import { Star, MapPin, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { submitReviewAction } from '@/app/(public)/produto/[slug]/actions'
import { cn } from '@/lib/utils'

type Review = {
  id: string
  customerName: string
  city: string | null
  rating: number
  comment: string
  createdAt: Date
}

type Props = {
  productId: string
  averageRating: number
  totalReviews: number
  reviews: Review[]
}

export function ProductReviews({
  productId,
  averageRating,
  totalReviews,
  reviews,
}: Props) {
  const [ratingFilter, setRatingFilter] = React.useState<number | null>(null)
  const [page, setPage] = React.useState(1)
  const PAGE_SIZE = 6

  const filtered = ratingFilter
    ? reviews.filter((r) => r.rating === ratingFilter)
    : reviews
  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const canLoadMore = paginated.length < filtered.length

  const ratingCounts = React.useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    for (const r of reviews) counts[r.rating - 1]!++
    return counts
  }, [reviews])

  return (
    <section className="space-y-6" aria-labelledby="reviews-heading">
      <header className="space-y-1">
        <h2
          id="reviews-heading"
          className="font-display text-3xl uppercase tracking-tight md:text-4xl"
        >
          Avaliações
        </h2>
        <p className="text-sm text-gray-400">
          {totalReviews} avaliação{totalReviews !== 1 ? 'ões' : ''} de quem comprou
        </p>
      </header>

      {totalReviews === 0 ? (
        <div className="rounded-lg border border-border bg-bg-secondary p-8 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="font-medium text-foreground">Seja o primeiro a avaliar</p>
          <p className="mt-1 text-sm text-gray-400">
            Sua opinião ajuda outros clientes a decidir.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Resumo + filtros */}
          <div className="space-y-5">
            <div className="rounded-lg border border-border bg-bg-secondary p-5 text-center">
              <p className="font-display text-6xl leading-none text-neon">
                {averageRating.toFixed(1)}
              </p>
              <div
                className="my-2 flex justify-center gap-0.5"
                aria-label={`${averageRating} de 5 estrelas`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-5 w-5',
                      i < Math.round(averageRating)
                        ? 'fill-warning text-warning'
                        : 'text-gray-600',
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Baseado em {totalReviews} avaliação
                {totalReviews !== 1 ? 'ões' : ''}
              </p>
            </div>

            <div
              className="space-y-2"
              role="group"
              aria-label="Filtrar por estrelas"
            >
              <button
                type="button"
                onClick={() => {
                  setRatingFilter(null)
                  setPage(1)
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                  ratingFilter === null
                    ? 'bg-neon/15 text-neon'
                    : 'text-gray-100 hover:bg-bg-tertiary',
                )}
              >
                <span>Todas</span>
                <span className="text-xs text-gray-400">{totalReviews}</span>
              </button>
              {[5, 4, 3, 2, 1].map((r) => {
                const count = ratingCounts[r - 1] ?? 0
                if (count === 0) return null
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRatingFilter(r)
                      setPage(1)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                      ratingFilter === r
                        ? 'bg-neon/15 text-neon'
                        : 'text-gray-100 hover:bg-bg-tertiary',
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {r}{' '}
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    </span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lista */}
          <div className="space-y-4">
            <AnimatePresence>
              {paginated.map((review) => (
                <motion.article
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-lg border border-border bg-bg-secondary p-5"
                >
                  <header className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {review.customerName}
                      </p>
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
                  <p className="text-sm leading-relaxed text-gray-100">
                    {review.comment}
                  </p>
                  <p className="mt-3 text-[10px] uppercase tracking-wider text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </motion.article>
              ))}
            </AnimatePresence>

            {canLoadMore && (
              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Carregar mais avaliações
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <ReviewForm productId={productId} />
    </section>
  )
}

function ReviewForm({ productId }: { productId: string }) {
  const [pending, setPending] = React.useState(false)
  const [rating, setRating] = React.useState(0)
  const [hoverRating, setHoverRating] = React.useState(0)
  const formRef = React.useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    if (rating === 0) {
      toast.error('Selecione uma nota de 1 a 5 estrelas')
      return
    }
    setPending(true)
    formData.set('rating', String(rating))
    const result = await submitReviewAction(formData)
    setPending(false)
    if (result.ok) {
      toast.success(result.message)
      formRef.current?.reset()
      setRating(0)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="mt-8 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
      <h3 className="mb-1 font-display text-xl uppercase tracking-tight md:text-2xl">
        Deixe sua avaliação
      </h3>
      <p className="mb-5 text-xs text-gray-400">
        Será publicada após aprovação. Sem palavrões ou ofensas, por favor.
      </p>

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <input type="hidden" name="productId" value={productId} />
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] opacity-0"
        />

        <div>
          <Label className="mb-2 block text-xs uppercase tracking-wider text-gray-400">
            Nota *
          </Label>
          <div className="flex gap-1" role="radiogroup" aria-label="Nota">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    star <= (hoverRating || rating)
                      ? 'fill-warning text-warning'
                      : 'text-gray-600',
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="customerName"
              className="text-xs uppercase tracking-wider text-gray-400"
            >
              Seu nome *
            </Label>
            <input
              id="customerName"
              name="customerName"
              required
              minLength={2}
              maxLength={80}
              className="mt-1 h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
              placeholder="Ex: João Silva"
            />
          </div>
          <div>
            <Label
              htmlFor="city"
              className="text-xs uppercase tracking-wider text-gray-400"
            >
              Cidade (opcional)
            </Label>
            <input
              id="city"
              name="city"
              maxLength={80}
              className="mt-1 h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
              placeholder="Ex: Barbalha/CE"
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="comment"
            className="text-xs uppercase tracking-wider text-gray-400"
          >
            Comentário *
          </Label>
          <Textarea
            id="comment"
            name="comment"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            className="mt-1 border-border bg-bg-primary"
            placeholder="Como foi sua experiência com o produto?"
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto"
        >
          {pending ? 'Enviando...' : 'Enviar avaliação'}
        </Button>
      </form>
    </div>
  )
}
