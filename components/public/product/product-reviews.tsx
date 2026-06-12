'use client'

import * as React from 'react'
import { Camera, ShieldCheck, MessageSquare, X, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Image from 'next/image'
import { submitReviewAction } from '@/app/(public)/produto/[slug]/actions'
import { compressImage } from '@/lib/storage/compress-image'
import {
  MAX_IMAGE_SIZE,
  ALLOWED_TYPES,
} from '@/lib/storage/upload-review-image'
import { RatingDistribution } from '@/components/public/reviews/rating-distribution'
import {
  ReviewCard,
  type ReviewCardData,
} from '@/components/public/reviews/review-card'
import { ReviewImageLightbox } from '@/components/public/reviews/review-image-lightbox'
import { cn } from '@/lib/utils'

type Props = {
  productId: string
  productSlug: string
  initialDistribution: Record<number, number>
  initialAverage: number
  initialTotal: number
  initialReviews: ReviewCardData[]
  totalInitialPages: number
}

export function ProductReviews({
  productId,
  productSlug,
  initialDistribution,
  initialAverage,
  initialTotal,
  initialReviews,
  totalInitialPages,
}: Props) {
  const [items, setItems] = React.useState<ReviewCardData[]>(initialReviews)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(totalInitialPages)
  const [loading, setLoading] = React.useState(false)

  const [ratingFilter, setRatingFilter] = React.useState<number | null>(null)
  const [withImageFilter, setWithImageFilter] = React.useState(false)
  const [verifiedFilter, setVerifiedFilter] = React.useState(false)

  const [lightbox, setLightbox] = React.useState<{
    src: string
    alt: string
  } | null>(null)

  const initialMountRef = React.useRef(true)

  React.useEffect(() => {
    // Skip primeira renderização — initialReviews já estão lá
    if (initialMountRef.current) {
      initialMountRef.current = false
      return
    }

    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({ productId, page: '1' })
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
  }, [productId, ratingFilter, withImageFilter, verifiedFilter])

  async function loadMore() {
    setLoading(true)
    const next = page + 1
    const params = new URLSearchParams({ productId, page: String(next) })
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

  const canLoadMore = page < totalPages

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
          {initialTotal} avaliaç{initialTotal === 1 ? 'ão' : 'ões'} de quem
          comprou
        </p>
      </header>

      {initialTotal === 0 ? (
        <div className="rounded-lg border border-border bg-bg-secondary p-8 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="font-medium text-foreground">Seja o primeiro a avaliar</p>
          <p className="mt-1 text-sm text-gray-400">
            Sua opinião ajuda outros clientes a decidir.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
            <RatingDistribution
              distribution={initialDistribution}
              total={initialTotal}
              average={initialAverage}
              selectedRating={ratingFilter}
              onSelectRating={setRatingFilter}
            />

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <FilterChip
                active={withImageFilter}
                onClick={() => setWithImageFilter((v) => !v)}
                icon={<Camera className="h-3 w-3" />}
                label="Com fotos"
              />
              <FilterChip
                active={verifiedFilter}
                onClick={() => setVerifiedFilter((v) => !v)}
                icon={<ShieldCheck className="h-3 w-3" />}
                label="Compradores verificados"
              />
              {(ratingFilter || withImageFilter || verifiedFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setRatingFilter(null)
                    setWithImageFilter(false)
                    setVerifiedFilter(false)
                  }}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-danger"
                >
                  <X className="h-3 w-3" />
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          <div
            className={cn(
              'space-y-4 transition-opacity',
              loading && 'opacity-50',
            )}
          >
            <AnimatePresence>
              {items.length === 0 && !loading ? (
                <div className="rounded-lg border border-border bg-bg-secondary p-8 text-center">
                  <p className="text-sm text-gray-400">
                    Nenhuma avaliação com esses filtros.
                  </p>
                </div>
              ) : (
                items.map((review) => (
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
                      onImageClick={(src, alt) => setLightbox({ src, alt })}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {canLoadMore && (
            <div className="pt-2 text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Carregar mais avaliações'}
              </Button>
            </div>
          )}
        </>
      )}

      <ReviewForm productId={productId} productSlug={productSlug} />

      <ReviewImageLightbox
        src={lightbox?.src ?? null}
        alt={lightbox?.alt ?? ''}
        onClose={() => setLightbox(null)}
      />
    </section>
  )
}

function FilterChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        active
          ? 'border-neon bg-neon/10 text-neon'
          : 'border-border text-gray-100 hover:border-neon/40 hover:text-neon',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function ReviewForm({
  productId,
  productSlug,
}: {
  productId: string
  productSlug: string
}) {
  const [pending, setPending] = React.useState(false)
  const [rating, setRating] = React.useState(0)
  const [hoverRating, setHoverRating] = React.useState(0)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const formRef = React.useRef<HTMLFormElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Tipo inválido. Use JPG, PNG ou WebP.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Imagem muito grande. Máximo 5MB.')
      e.target.value = ''
      return
    }

    try {
      const compressed = await compressImage(file)
      setImageFile(compressed)
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target?.result as string)
      reader.readAsDataURL(compressed)
    } catch {
      toast.error('Erro ao processar imagem')
    }
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(formData: FormData) {
    if (rating === 0) {
      toast.error('Selecione uma nota de 1 a 5 estrelas')
      return
    }

    setPending(true)
    formData.set('rating', String(rating))
    formData.set('productSlug', productSlug)
    if (imageFile) {
      formData.set('image', imageFile)
    } else {
      formData.delete('image')
    }

    const result = await submitReviewAction(formData)
    setPending(false)

    if (result.ok) {
      toast.success(result.message)
      formRef.current?.reset()
      setRating(0)
      removeImage()
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
        Sua avaliação será publicada após aprovação. Sem palavrões ou ofensas,
        por favor.
      </p>

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <input type="hidden" name="productId" value={productId} />
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

        <div>
          <Label className="mb-2 block text-xs uppercase tracking-wider text-gray-400">
            Foto (opcional)
          </Label>

          {imagePreview ? (
            <div className="relative inline-block">
              <Image
                src={imagePreview}
                alt="Pré-visualização"
                width={120}
                height={120}
                className="h-30 w-30 rounded-md border border-border object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remover foto"
                className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-border bg-bg-primary text-gray-400 transition-all hover:border-danger hover:bg-danger hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="image"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-bg-primary px-4 py-3 text-sm text-gray-100 transition-all hover:border-neon hover:text-neon"
            >
              <Camera className="h-4 w-4" />
              Adicionar foto
              <input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
          )}
          <p className="mt-1 text-[10px] text-gray-500">
            JPG, PNG ou WebP até 5MB. A imagem é comprimida automaticamente.
          </p>
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
