'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Check,
  X,
  Star,
  ShieldCheck,
  ShieldOff,
  Trash2,
  MapPin,
  Camera,
  Search,
  ExternalLink,
  ImageOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  approveReviewAction,
  rejectReviewAction,
  toggleVerifiedAction,
  deleteReviewAction,
  bulkApproveAction,
  bulkRejectAction,
  bulkDeleteAction,
} from '@/app/admin/(authenticated)/avaliacoes/actions'
import { AdminPagination } from '@/components/admin/shared/admin-pagination'
import { ReviewImageLightbox } from '@/components/public/reviews/review-image-lightbox'
import type { AdminRole } from '@/lib/admin/types'

export type AdminReviewItem = {
  id: string
  customerName: string
  city: string | null
  rating: number
  comment: string
  imageUrl: string | null
  isApproved: boolean
  isVerifiedPurchase: boolean
  createdAt: Date | string
  product: {
    id: string
    slug: string
    name: string
    brand: string
    imageUrl?: string
  }
}

type Props = {
  items: AdminReviewItem[]
  stats: {
    pending: number
    approved: number
    withImage: number
    verified: number
  }
  currentPage: number
  totalPages: number
  userRole: AdminRole
}

export function ReviewsModerationPanel({
  items,
  stats,
  currentPage,
  totalPages,
  userRole,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [pending, setPending] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null)
  const [confirmBulkDelete, setConfirmBulkDelete] = React.useState(false)
  const [lightbox, setLightbox] = React.useState<{
    src: string
    alt: string
  } | null>(null)
  const [searchValue, setSearchValue] = React.useState(
    searchParams.get('q') ?? '',
  )

  const isAdmin = userRole === 'admin'
  const canModerate = userRole === 'admin' || userRole === 'editor'

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map((i) => i.id)))
    }
  }

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all' && value !== '') params.set(key, value)
    else params.delete(key)
    params.delete('pagina')
    const q = params.toString()
    router.push(q ? `/admin/avaliacoes?${q}` : '/admin/avaliacoes')
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateFilter('q', searchValue.trim() || null)
  }

  async function handleSingleAction(
    actionFn: (id: string) => Promise<{ ok: boolean; error?: string }>,
    successMsg: string,
    id: string,
  ) {
    setPending(true)
    const result = await actionFn(id)
    setPending(false)
    if (result.ok) {
      toast.success(successMsg)
      router.refresh()
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  async function handleBulkAction(
    actionFn: (ids: string[]) => Promise<{
      ok: boolean
      error?: string
      data?: { count: number }
    }>,
    successMsg: string,
  ) {
    if (selected.size === 0) return
    setPending(true)
    const result = await actionFn(Array.from(selected))
    setPending(false)
    if (result.ok && result.data) {
      toast.success(`${successMsg}: ${result.data.count}`)
      setSelected(new Set())
      router.refresh()
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  async function handleSingleDelete(id: string) {
    setConfirmDelete(null)
    await handleSingleAction(deleteReviewAction, 'Avaliação excluída', id)
  }

  async function handleBulkDelete() {
    setConfirmBulkDelete(false)
    await handleBulkAction(bulkDeleteAction, 'Avaliações excluídas')
  }

  const status = searchParams.get('status') ?? 'pending'

  return (
    <>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatPill
          label="Pendentes"
          value={stats.pending}
          tone={stats.pending > 0 ? 'warning' : 'neutral'}
          active={status === 'pending'}
          onClick={() => updateFilter('status', 'pending')}
        />
        <StatPill
          label="Aprovadas"
          value={stats.approved}
          tone="success"
          active={status === 'approved'}
          onClick={() => updateFilter('status', 'approved')}
        />
        <StatPill
          label="Com fotos"
          value={stats.withImage}
          tone="neutral"
          icon={<Camera className="h-3.5 w-3.5" />}
        />
        <StatPill
          label="Verificadas"
          value={stats.verified}
          tone="neutral"
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
        />
      </section>

      <section className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar por nome do cliente, produto ou comentário..."
            className="h-10 w-full rounded-md border border-border bg-bg-secondary pl-10 pr-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {[5, 4, 3, 2, 1].map((r) => {
            const active = searchParams.get('rating') === String(r)
            return (
              <button
                key={r}
                type="button"
                onClick={() =>
                  updateFilter('rating', active ? null : String(r))
                }
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                  active
                    ? 'border-neon bg-neon/10 text-neon'
                    : 'border-border text-gray-100 hover:border-neon/40',
                )}
              >
                {r}★
              </button>
            )
          })}
          <button
            type="button"
            onClick={() =>
              updateFilter(
                'withImage',
                searchParams.get('withImage') === '1' ? null : '1',
              )
            }
            aria-pressed={searchParams.get('withImage') === '1'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
              searchParams.get('withImage') === '1'
                ? 'border-neon bg-neon/10 text-neon'
                : 'border-border text-gray-100 hover:border-neon/40',
            )}
          >
            <Camera className="h-3 w-3" />
            Com fotos
          </button>
        </div>
      </section>

      {selected.size > 0 && canModerate && (
        <section className="sticky top-16 z-10 flex flex-wrap items-center gap-2 rounded-lg border border-neon/40 bg-bg-secondary p-3 shadow-lg">
          <p className="text-sm font-semibold">
            <strong className="text-neon">{selected.size}</strong> selecionada
            {selected.size !== 1 ? 's' : ''}
          </p>
          <div className="flex-1" />
          <Button
            size="sm"
            onClick={() => handleBulkAction(bulkApproveAction, 'Aprovadas')}
            disabled={pending}
          >
            <Check className="h-3.5 w-3.5" />
            Aprovar selecionadas
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction(bulkRejectAction, 'Rejeitadas')}
            disabled={pending}
          >
            <X className="h-3.5 w-3.5" />
            Rejeitar
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmBulkDelete(true)}
              disabled={pending}
              className="text-danger hover:border-danger hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </Button>
          )}
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs text-gray-400 hover:text-foreground"
          >
            Limpar
          </button>
        </section>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-secondary p-12 text-center">
          <p className="text-sm text-foreground">
            Nenhuma avaliação encontrada
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Ajuste os filtros para ver mais
          </p>
        </div>
      ) : (
        <>
          {canModerate && (
            <label className="flex cursor-pointer items-center gap-2 px-1 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={selected.size === items.length}
                onChange={toggleAll}
                className="rounded border-border bg-bg-primary accent-neon"
              />
              Selecionar todos visíveis
            </label>
          )}
          <ul className="space-y-3">
            {items.map((review) => (
              <ReviewModerationCard
                key={review.id}
                review={review}
                selected={selected.has(review.id)}
                onToggleSelect={() => toggleSelect(review.id)}
                canModerate={canModerate}
                isAdmin={isAdmin}
                pending={pending}
                onApprove={() =>
                  handleSingleAction(
                    approveReviewAction,
                    'Avaliação aprovada',
                    review.id,
                  )
                }
                onReject={() =>
                  handleSingleAction(
                    rejectReviewAction,
                    'Avaliação rejeitada',
                    review.id,
                  )
                }
                onToggleVerified={async () => {
                  setPending(true)
                  const result = await toggleVerifiedAction(
                    review.id,
                    !review.isVerifiedPurchase,
                  )
                  setPending(false)
                  if (result.ok) {
                    toast.success(
                      review.isVerifiedPurchase
                        ? 'Selo removido'
                        : 'Marcada como verificada',
                    )
                    router.refresh()
                  } else {
                    toast.error(result.error ?? '')
                  }
                }}
                onDeleteRequest={() => setConfirmDelete(review.id)}
                onImageClick={(src, alt) => setLightbox({ src, alt })}
              />
            ))}
          </ul>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseHref="/admin/avaliacoes"
          />
        </>
      )}

      <ReviewImageLightbox
        src={lightbox?.src ?? null}
        alt={lightbox?.alt ?? ''}
        onClose={() => setLightbox(null)}
      />

      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent className="border-border bg-bg-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase">
              Excluir avaliação?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-100">
              Ação <strong className="text-danger">permanente</strong>.
              Considere rejeitar (esconder) em vez de excluir definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-bg-tertiary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmDelete && handleSingleDelete(confirmDelete)
              }
              className="bg-danger text-white hover:bg-danger/90"
            >
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
      >
        <AlertDialogContent className="border-border bg-bg-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase">
              Excluir {selected.size} avaliações?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-100">
              Ação <strong className="text-danger">permanente</strong> para
              todas as selecionadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-bg-tertiary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-danger text-white hover:bg-danger/90"
            >
              Excluir todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function StatPill({
  label,
  value,
  tone,
  active,
  onClick,
  icon,
}: {
  label: string
  value: number
  tone: 'success' | 'warning' | 'neutral'
  active?: boolean
  onClick?: () => void
  icon?: React.ReactNode
}) {
  const toneStyles = {
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    neutral: 'border-border bg-bg-secondary',
  } as const
  const valueStyles = {
    success: 'text-success',
    warning: 'text-warning',
    neutral: 'text-foreground',
  } as const

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          'rounded-lg border p-3 text-left transition-all',
          toneStyles[tone],
          'cursor-pointer hover:border-neon',
          active && 'ring-2 ring-neon',
        )}
      >
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-400">
          {icon}
          {label}
        </div>
        <p
          className={cn(
            'mt-1 font-display text-2xl leading-none md:text-3xl',
            valueStyles[tone],
          )}
        >
          {value}
        </p>
      </button>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-3 text-left transition-all',
        toneStyles[tone],
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-400">
        {icon}
        {label}
      </div>
      <p
        className={cn(
          'mt-1 font-display text-2xl leading-none md:text-3xl',
          valueStyles[tone],
        )}
      >
        {value}
      </p>
    </div>
  )
}

function ReviewModerationCard({
  review,
  selected,
  onToggleSelect,
  canModerate,
  isAdmin,
  pending,
  onApprove,
  onReject,
  onToggleVerified,
  onDeleteRequest,
  onImageClick,
}: {
  review: AdminReviewItem
  selected: boolean
  onToggleSelect: () => void
  canModerate: boolean
  isAdmin: boolean
  pending: boolean
  onApprove: () => void
  onReject: () => void
  onToggleVerified: () => void
  onDeleteRequest: () => void
  onImageClick: (src: string, alt: string) => void
}) {
  const dateLabel = new Date(review.createdAt).toLocaleString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <li>
      <article
        className={cn(
          'rounded-lg border bg-bg-secondary p-4 transition-all md:p-5',
          selected && 'border-neon ring-1 ring-neon/40',
          !review.isApproved && !selected && 'border-warning/30',
          review.isApproved && !selected && 'border-border',
        )}
      >
        <div className="flex items-start gap-3">
          {canModerate && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              className="mt-1.5 shrink-0 rounded border-border bg-bg-primary accent-neon"
              aria-label="Selecionar"
            />
          )}
          <div className="min-w-0 flex-1 space-y-3">
            <Link
              href={`/admin/produtos/${review.product.id}/editar`}
              className="group flex items-center gap-2"
            >
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-bg-tertiary">
                {review.product.imageUrl ? (
                  <Image
                    src={review.product.imageUrl}
                    alt={review.product.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <ImageOff className="h-3 w-3 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                  {review.product.brand}
                </p>
                <p className="line-clamp-1 text-xs text-foreground transition-colors group-hover:text-neon">
                  {review.product.name}
                </p>
              </div>
            </Link>

            <div className="h-px bg-border" />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {review.customerName}
                  </p>
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[9px] font-semibold text-success">
                      <ShieldCheck className="h-3 w-3" />
                      Verificado
                    </span>
                  )}
                  {!review.isApproved && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[9px] font-semibold text-warning">
                      Pendente
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
              <div className="flex shrink-0 gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < review.rating
                        ? 'fill-warning text-warning'
                        : 'text-gray-600',
                    )}
                  />
                ))}
              </div>
            </div>

            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-100">
              {review.comment}
            </p>

            {review.imageUrl && (
              <button
                type="button"
                onClick={() =>
                  onImageClick(
                    review.imageUrl!,
                    `Foto de ${review.customerName}`,
                  )
                }
                className="group relative block h-20 w-20 cursor-zoom-in overflow-hidden rounded-md border border-border bg-bg-tertiary"
                aria-label="Ampliar foto"
              >
                <Image
                  src={review.imageUrl}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover transition-transform group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 grid place-items-center bg-black/0 transition-colors group-hover:bg-black/30">
                  <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100" />
                </div>
              </button>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
              <p className="text-[10px] text-gray-500">{dateLabel}</p>
              {canModerate && (
                <TooltipProvider delayDuration={300}>
                  <div className="flex items-center gap-1">
                    {!review.isApproved ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={onApprove}
                            disabled={pending}
                            aria-label="Aprovar"
                            className="grid h-8 w-8 place-items-center rounded-md text-success transition-colors hover:bg-success/10"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Aprovar</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={onReject}
                            disabled={pending}
                            aria-label="Rejeitar"
                            className="grid h-8 w-8 place-items-center rounded-md text-warning transition-colors hover:bg-warning/10"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Rejeitar / Esconder</TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={onToggleVerified}
                          disabled={pending}
                          aria-label="Alternar verificado"
                          className={cn(
                            'grid h-8 w-8 place-items-center rounded-md transition-colors',
                            review.isVerifiedPurchase
                              ? 'text-success hover:bg-success/10'
                              : 'text-gray-400 hover:bg-bg-tertiary hover:text-foreground',
                          )}
                        >
                          {review.isVerifiedPurchase ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {review.isVerifiedPurchase
                          ? 'Remover selo Verificado'
                          : 'Marcar Verificado'}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/produto/${review.product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Ver produto no site"
                          className="grid h-8 w-8 place-items-center rounded-md text-gray-400 hover:bg-bg-tertiary hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Ver produto no site</TooltipContent>
                    </Tooltip>
                    {isAdmin && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={onDeleteRequest}
                            disabled={pending}
                            aria-label="Excluir"
                            className="grid h-8 w-8 place-items-center rounded-md text-gray-400 transition-colors hover:bg-danger/10 hover:text-danger"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Excluir permanentemente
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </article>
    </li>
  )
}
