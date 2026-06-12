'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Star, ArrowRight, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQuickViewStore } from '@/lib/quick-view/store'
import { useCartStore } from '@/lib/whatsapp/cart-store'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { formatBRL, cn } from '@/lib/utils'
import { toast } from 'sonner'

type QuickViewProduct = {
  id: string
  slug: string
  name: string
  brand: string
  description: string | null
  price: number
  promoPrice: number | null
  installments: number | null
  installmentFree: boolean
  averageRating: number
  totalReviews: number
  category: { name: string; slug: string }
  images: Array<{ urlMedium: string; urlThumb: string; alt: string | null }>
  variants: Array<{
    id: string
    color: string
    colorHex: string | null
    size: string
    stock: number
  }>
}

export function QuickViewModal() {
  const productSlug = useQuickViewStore((s) => s.productSlug)
  const close = useQuickViewStore((s) => s.close)
  const { track } = useAnalytics()

  const [product, setProduct] = React.useState<QuickViewProduct | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isOpen = productSlug !== null

  React.useEffect(() => {
    if (productSlug) {
      track('quick_view_open', { metadata: { slug: productSlug } })
    }
  }, [productSlug, track])

  React.useEffect(() => {
    if (!productSlug) {
      setProduct(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setProduct(null)

    fetch(`/api/quick-view/${encodeURIComponent(productSlug)}`)
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          throw new Error(body.error || 'Erro ao carregar produto')
        }
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setProduct(data.product as QuickViewProduct)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [productSlug])

  return (
    <Dialog open={isOpen} onOpenChange={(o) => (o ? null : close())}>
      <DialogContent
        className="max-w-4xl gap-0 overflow-hidden border-border bg-bg-secondary p-0"
        aria-describedby={undefined}
      >
        <VisuallyHidden asChild>
          <DialogTitle>
            {product
              ? `${product.brand} ${product.name}`
              : 'Visualização rápida do produto'}
          </DialogTitle>
        </VisuallyHidden>

        {loading && <QuickViewSkeleton />}
        {error && <QuickViewError error={error} onClose={close} />}
        {product && !loading && (
          <QuickViewBody product={product} onClose={close} />
        )}

        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-bg-primary/80 text-white backdrop-blur-md transition-colors hover:bg-neon"
        >
          <X className="h-4 w-4" />
        </button>
      </DialogContent>
    </Dialog>
  )
}

function QuickViewSkeleton() {
  return (
    <div className="grid place-items-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-neon" />
      <p className="mt-3 text-xs uppercase tracking-wider text-gray-400">
        Carregando...
      </p>
    </div>
  )
}

function QuickViewError({
  error,
  onClose,
}: {
  error: string
  onClose: () => void
}) {
  return (
    <div className="space-y-4 px-6 py-12 text-center">
      <p className="text-sm text-foreground">{error}</p>
      <Button onClick={onClose} variant="outline">
        Fechar
      </Button>
    </div>
  )
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function QuickViewBody({
  product,
  onClose,
}: {
  product: QuickViewProduct
  onClose: () => void
}) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.open)
  const { track } = useAnalytics()

  const uniqueColors = React.useMemo(() => {
    const map = new Map<string, { color: string; colorHex: string | null }>()
    for (const v of product.variants) {
      if (!map.has(v.color)) {
        map.set(v.color, { color: v.color, colorHex: v.colorHex })
      }
    }
    return Array.from(map.values())
  }, [product.variants])

  const firstAvailable = product.variants.find((v) => v.stock > 0)
  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(
    firstAvailable?.color,
  )
  const [selectedSize, setSelectedSize] = React.useState<string | undefined>(
    firstAvailable?.size,
  )
  const [activeImage, setActiveImage] = React.useState(0)

  const sizesForColor = React.useMemo(() => {
    if (!selectedColor) return []
    return product.variants
      .filter((v) => v.color === selectedColor)
      .sort((a, b) => {
        const an = parseInt(a.size, 10)
        const bn = parseInt(b.size, 10)
        if (!isNaN(an) && !isNaN(bn)) return an - bn
        return a.size.localeCompare(b.size)
      })
  }, [product.variants, selectedColor])

  function handleColorChange(color: string) {
    setSelectedColor(color)
    const sameSize = product.variants.find(
      (v) => v.color === color && v.size === selectedSize && v.stock > 0,
    )
    if (!sameSize) {
      const fallback = product.variants.find(
        (v) => v.color === color && v.stock > 0,
      )
      setSelectedSize(fallback?.size)
    }
  }

  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize,
  )
  const selectedHex = selectedVariant?.colorHex ?? undefined
  const stock = selectedVariant?.stock ?? 0
  const finalPrice = product.promoPrice ?? product.price
  const hasDiscount =
    product.promoPrice != null && product.promoPrice < product.price
  const discountPercent =
    hasDiscount && product.promoPrice != null
      ? Math.round(
          ((product.price - product.promoPrice) / product.price) * 100,
        )
      : 0

  function handleAdd() {
    if (!selectedColor || !selectedSize) {
      toast.error('Selecione cor e numeração')
      return
    }
    if (stock === 0) {
      toast.error('Sem estoque nesta combinação')
      return
    }

    const result = addItem({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      slug: product.slug,
      imageUrl: product.images[0]?.urlThumb,
      price: product.price,
      promoPrice: product.promoPrice ?? undefined,
      color: selectedColor,
      colorHex: selectedHex,
      size: selectedSize,
    })
    track('cart_add', {
      productId: product.id,
      metadata: {
        source: 'quick-view',
        color: selectedColor,
        size: selectedSize,
      },
    })

    if (result === 'added' || result === 'updated') {
      toast.success('Adicionado à conversa', {
        description: `${product.brand} ${product.name}`,
        action: {
          label: 'Ver carrinho',
          onClick: () => {
            onClose()
            openCart()
          },
        },
      })
      onClose()
    } else if (result === 'limit-reached') {
      toast.error('Limite de 20 produtos atingido')
    }
  }

  return (
    <div className="grid max-h-[90vh] md:grid-cols-2">
      {/* Galeria */}
      <div className="flex flex-col bg-bg-tertiary md:max-h-[90vh]">
        <div className="relative aspect-square">
          {product.images[activeImage] && (
            <Image
              key={activeImage}
              src={product.images[activeImage]!.urlMedium}
              alt={product.images[activeImage]!.alt ?? product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          )}
          {hasDiscount && (
            <Badge variant="danger" className="absolute left-3 top-3">
              -{discountPercent}%
            </Badge>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3 scrollbar-none">
            {product.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`Foto ${i + 1}`}
                className={cn(
                  'relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all',
                  activeImage === i
                    ? 'border-neon neon-glow-sm'
                    : 'border-border opacity-60 hover:opacity-100',
                )}
              >
                <Image
                  src={img.urlThumb}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detalhes */}
      <div className="space-y-5 overflow-y-auto p-5 md:max-h-[90vh] md:p-7">
        <div className="space-y-2">
          <Badge variant="default" className="text-[10px]">
            {product.brand}
          </Badge>
          <h2 className="font-display text-2xl uppercase leading-tight tracking-tight md:text-3xl">
            {product.name}
          </h2>
          <Link
            href={`/categoria/${product.category.slug}`}
            className="inline-block text-xs text-gray-400 hover:text-neon"
            onClick={onClose}
          >
            {product.category.name}
          </Link>
          {product.totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5',
                      i < Math.round(product.averageRating)
                        ? 'fill-warning text-warning'
                        : 'text-gray-600',
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">
                {product.averageRating.toFixed(1)} ({product.totalReviews})
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          {hasDiscount && (
            <p className="text-sm text-gray-500 line-through">
              {formatBRL(product.price)}
            </p>
          )}
          <p className="font-display text-3xl leading-none text-neon md:text-4xl">
            {formatBRL(finalPrice)}
          </p>
          {product.installments && product.installments > 1 && (
            <p className="text-xs text-gray-100">
              {product.installments}x de{' '}
              {formatBRL(finalPrice / product.installments)}{' '}
              {product.installmentFree && (
                <span className="text-success">sem juros</span>
              )}
            </p>
          )}
        </div>

        {uniqueColors.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-400">
              Cor:{' '}
              <span className="normal-case tracking-normal text-foreground">
                {selectedColor ?? '-'}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map((c) => {
                const isActive = c.color === selectedColor
                const hasStock = product.variants.some(
                  (v) => v.color === c.color && v.stock > 0,
                )
                return (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => handleColorChange(c.color)}
                    aria-label={c.color}
                    aria-pressed={isActive}
                    disabled={!hasStock}
                    title={c.color}
                    className={cn(
                      'h-9 w-9 rounded-full border-2 transition-all',
                      isActive
                        ? 'scale-110 border-neon neon-glow-sm'
                        : 'border-border hover:border-neon/50',
                      !hasStock && 'cursor-not-allowed opacity-30',
                    )}
                    style={{ backgroundColor: c.colorHex ?? '#666' }}
                  />
                )
              })}
            </div>
          </div>
        )}

        {sizesForColor.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-400">
              Numeração:{' '}
              <span className="normal-case tracking-normal text-foreground">
                {selectedSize ?? '-'}
              </span>
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {sizesForColor.map((v) => {
                const isActive = v.size === selectedSize
                const available = v.stock > 0
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedSize(v.size)}
                    aria-pressed={isActive}
                    disabled={!available}
                    className={cn(
                      'h-10 rounded-md border-2 text-sm font-semibold transition-all',
                      isActive
                        ? 'border-neon bg-neon/10 text-neon'
                        : available
                          ? 'border-border text-foreground hover:border-neon/50'
                          : 'cursor-not-allowed border-border text-gray-600 line-through',
                    )}
                  >
                    {v.size}
                  </button>
                )
              })}
            </div>
            {stock > 0 && stock <= 3 && (
              <p className="mt-2 text-xs text-warning">
                🔥 Últimas {stock} unidades
              </p>
            )}
            {stock === 0 && selectedVariant && (
              <p className="mt-2 text-xs text-danger">
                Sem estoque nesta combinação
              </p>
            )}
          </div>
        )}

        {product.description && (
          <div className="line-clamp-3 text-sm leading-relaxed text-gray-100">
            {stripHtml(product.description)}
          </div>
        )}

        <div className="space-y-2 pt-2">
          <Button
            variant="whatsapp"
            size="lg"
            className="w-full text-base"
            onClick={handleAdd}
            disabled={stock === 0}
          >
            {stock === 0 ? 'Esgotado' : 'Adicionar à conversa'}
          </Button>
          <Button asChild variant="outline" size="default" className="w-full">
            <Link href={`/produto/${product.slug}`} onClick={onClose}>
              Ver página completa
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
