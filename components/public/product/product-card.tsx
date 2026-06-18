'use client'

import * as React from 'react'
import Image from 'next/image'
import { getBlurDataURL } from '@/lib/seo/blur-placeholder'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/whatsapp/cart-store'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { CompareButton } from '@/components/public/compare/compare-button'
import { useQuickViewStore } from '@/lib/quick-view/store'
import { formatBRL, cn } from '@/lib/utils'
import type { ProductCardData } from '@/lib/types/product-card'

type Props = {
  product: ProductCardData
  className?: string
  /** true para cards above-the-fold (LCP) */
  priority?: boolean
}

export function ProductCard({ product, className, priority = false }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.open)
  const openQuickView = useQuickViewStore((s) => s.open)
  const { track } = useAnalytics()

  const finalPrice = product.promoPrice ?? product.price
  const discountPercent = product.promoPrice
    ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
    : 0

  // Cores únicas (até 5) para mini swatches
  const uniqueColors = React.useMemo(() => {
    if (!product.variants) return []
    const seen = new Set<string>()
    return product.variants
      .filter((v) => {
        if (seen.has(v.color)) return false
        seen.add(v.color)
        return true
      })
      .slice(0, 5)
  }, [product.variants])

  const extraColors = (product.variants?.length ?? 0) - uniqueColors.length

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const firstVariant = product.variants?.[0]
    const result = addItem({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      slug: product.slug,
      imageUrl: product.imageUrl,
      price: product.price,
      promoPrice: product.promoPrice ?? undefined,
      color: firstVariant?.color,
      colorHex: firstVariant?.colorHex ?? undefined,
      size: firstVariant?.size,
    })

    track('cart_add', {
      productId: product.id,
      metadata: {
        source: 'product-card',
        color: firstVariant?.color,
        size: firstVariant?.size,
      },
    })

    if (result === 'added') {
      toast.success('Adicionado à conversa', {
        description: `${product.brand} ${product.name}`,
        action: { label: 'Ver carrinho', onClick: openCart },
      })
    } else if (result === 'updated') {
      toast.success('Quantidade atualizada', {
        description: `${product.brand} ${product.name}`,
      })
    } else {
      toast.error('Limite atingido', { description: 'Máximo de 20 produtos.' })
    }
  }

  return (
    <motion.article
      whileHover="hover"
      initial="initial"
      className={cn(
        'group border-border bg-bg-secondary hover:border-neon/40 relative flex flex-col overflow-hidden rounded-lg border transition-all',
        className,
      )}
    >
      <Link
        href={`/produto/${product.slug}`}
        className="bg-bg-tertiary relative aspect-square overflow-hidden"
        aria-label={`Ver detalhes de ${product.brand} ${product.name}`}
      >
        {product.imageUrl ? (
          <motion.div
            variants={{
              initial: { scale: 1 },
              hover: { scale: 1.08 },
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Image
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              placeholder="blur"
              blurDataURL={getBlurDataURL(product.imageUrl)}
            />
          </motion.div>
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-gray-600">
            Sem foto
          </div>
        )}

        {/* Badges canto superior esquerdo */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.isNew && <Badge variant="new">Novo</Badge>}
          {discountPercent > 0 && <Badge variant="danger">-{discountPercent}%</Badge>}
        </div>

        {/* Ações rápidas (desktop, revela no hover) */}
        <motion.div
          variants={{
            initial: { opacity: 0, y: 8 },
            hover: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.25 }}
          className="absolute bottom-3 right-3 z-10 hidden flex-col gap-2 md:flex"
        >
          <button
            type="button"
            onClick={handleQuickAdd}
            className="bg-whatsapp hover:bg-whatsapp-dark grid h-10 w-10 place-items-center rounded-full text-white shadow-lg transition-all hover:scale-110"
            aria-label="Adicionar à conversa do WhatsApp"
            title="Adicionar à conversa"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
          <CompareButton
            productId={product.id}
            productName={product.name}
            variant="icon"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openQuickView(product.slug)
            }}
            className="bg-bg-primary/90 text-foreground hover:bg-neon grid h-10 w-10 place-items-center rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:text-white"
            aria-label={`Visualização rápida de ${product.name}`}
            title="Visualização rápida"
          >
            <Eye className="h-4 w-4" />
          </button>
        </motion.div>
      </Link>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-2 p-3 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-[10px]">
            {product.brand}
          </Badge>
          {product.category && (
            <Link
              href={`/categoria/${product.category.slug}`}
              className="hover:text-neon line-clamp-1 text-[10px] uppercase tracking-wide text-gray-400"
            >
              {product.category.name}
            </Link>
          )}
        </div>

        <Link
          href={`/produto/${product.slug}`}
          className="hover:text-neon block min-h-[2.5rem] text-sm font-medium leading-tight line-clamp-2 transition-colors md:text-base"
        >
          {product.name}
        </Link>

        {uniqueColors.length > 0 && (
          <div className="flex items-center gap-1">
            {uniqueColors.map((c, i) => (
              <span
                key={`${c.color}-${i}`}
                className="border-border h-3 w-3 rounded-full border"
                style={{ backgroundColor: c.colorHex ?? '#666' }}
                title={c.color}
                aria-hidden="true"
              />
            ))}
            {extraColors > 0 && (
              <span className="text-[10px] text-gray-400">+{extraColors}</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-1">
          <div className="flex flex-wrap items-baseline gap-2">
            {product.promoPrice && (
              <span className="text-xs text-gray-600 line-through">
                {formatBRL(product.price)}
              </span>
            )}
            <span className="font-display text-neon text-xl leading-none md:text-2xl">
              {formatBRL(finalPrice)}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-gray-400">
            ou 10x de {formatBRL(finalPrice / 10)} no cartão
          </p>
          {product.totalStock != null &&
            product.totalStock > 0 &&
            product.totalStock < 5 && (
              <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-warning">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
                Últimas {product.totalStock} unidade
                {product.totalStock > 1 ? 's' : ''}
              </p>
            )}
        </div>

        {/* CTA mobile */}
        <Button
          variant="whatsapp"
          size="sm"
          className="w-full text-xs md:hidden"
          onClick={handleQuickAdd}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Adicionar
        </Button>
      </div>
    </motion.article>
  )
}
