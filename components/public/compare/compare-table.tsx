'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  X,
  Star,
  Check,
  MinusCircle,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CompareTableRow } from './compare-table-row'
import { useCompareStore } from '@/lib/compare/compare-store'
import { useCartStore } from '@/lib/whatsapp/cart-store'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { buildWhatsappUrl } from '@/lib/whatsapp/build-message'
import { calcHighlights } from '@/lib/compare/highlights'
import { formatBRL, cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { CompareProduct } from '@/lib/queries/compare'
import type { CartItem } from '@/lib/whatsapp/types'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

type Props = {
  products: CompareProduct[]
}

function buildCartItem(product: CompareProduct): CartItem {
  const firstVariant =
    product.variants.find((v) => v.stock > 0) ?? product.variants[0]
  return {
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    slug: product.slug,
    imageUrl: product.images[0]?.urlMedium,
    price: Number(product.price),
    promoPrice: product.promoPrice ? Number(product.promoPrice) : undefined,
    color: firstVariant?.color,
    colorHex: firstVariant?.colorHex ?? undefined,
    size: firstVariant?.size,
    quantity: 1,
    addedAt: Date.now(),
  }
}

export function CompareTable({ products }: Props) {
  const removeFromCompare = useCompareStore((s) => s.remove)
  const addToCart = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.open)
  const couponCode = useCartStore((s) => s.couponCode)
  const { track } = useAnalytics()
  const router = useRouter()

  const highlights = React.useMemo(() => calcHighlights(products), [products])

  const categoryIds = new Set(products.map((p) => p.categoryId))
  const mixedCategories = categoryIds.size > 1

  const colCount = products.length

  function handleSendAll() {
    if (products.length === 0) return
    const items = products.map(buildCartItem)
    track('whatsapp_click_cart', {
      items,
      metadata: { source: 'compare-page' },
    })
    const url = buildWhatsappUrl({
      items,
      couponCode: couponCode ?? undefined,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleAddSingle(product: CompareProduct) {
    const item = buildCartItem(product)
    const result = addToCart({
      productId: item.productId,
      productName: item.productName,
      brand: item.brand,
      slug: item.slug,
      imageUrl: item.imageUrl,
      price: item.price,
      promoPrice: item.promoPrice,
      color: item.color,
      colorHex: item.colorHex,
      size: item.size,
    })
    track('cart_add', {
      productId: product.id,
      metadata: { source: 'compare-page' },
    })
    if (result === 'added' || result === 'updated') {
      toast.success('Adicionado à conversa', {
        description: `${product.brand} ${product.name}`,
        action: { label: 'Ver carrinho', onClick: openCart },
      })
    } else if (result === 'limit-reached') {
      toast.error('Limite atingido', {
        description: 'Máximo de 20 produtos por conversa.',
      })
    }
  }

  function handleRemove(productId: string) {
    removeFromCompare(productId)
    const remaining = products
      .filter((p) => p.id !== productId)
      .map((p) => p.id)
    if (remaining.length === 0) {
      router.push('/')
    } else {
      router.replace(`/comparar?ids=${remaining.join(',')}`, { scroll: false })
    }
  }

  return (
    <div
      style={{ ['--compare-cols' as string]: String(colCount) }}
      className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
    >
      {mixedCategories && (
        <div className="flex items-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Você está comparando produtos de categorias diferentes — alguns
            atributos podem não fazer sentido lado a lado.
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[600px] md:min-w-0">
          {/* Header: foto + marca + nome + remover */}
          <CompareTableRow
            label="Produto"
            columns={products.map((p) => ({
              productId: p.id,
              content: (
                <div className="space-y-3">
                  <div className="relative">
                    <Link
                      href={`/produto/${p.slug}`}
                      className="relative block aspect-square overflow-hidden rounded-md bg-bg-tertiary"
                    >
                      {p.images[0] && (
                        <Image
                          src={p.images[0].urlMedium}
                          alt={p.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover"
                        />
                      )}
                      {p.promoPrice && (
                        <Badge
                          variant="danger"
                          className="absolute left-2 top-2"
                        >
                          -
                          {Math.round(
                            ((Number(p.price) - Number(p.promoPrice)) /
                              Number(p.price)) *
                              100,
                          )}
                          %
                        </Badge>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(p.id)}
                      aria-label={`Remover ${p.name} da comparação`}
                      className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-border bg-bg-primary text-gray-400 transition-all hover:border-danger hover:bg-danger hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-1 text-[9px]">
                      {p.brand}
                    </Badge>
                    <Link
                      href={`/produto/${p.slug}`}
                      className="block text-sm font-medium leading-tight line-clamp-2 transition-colors hover:text-neon"
                    >
                      {p.name}
                    </Link>
                  </div>
                </div>
              ),
            }))}
          />

          <CompareTableRow
            label="Categoria"
            columns={products.map((p) => ({
              productId: p.id,
              content: (
                <Link
                  href={`/categoria/${p.category.slug}`}
                  className="text-sm text-foreground transition-colors hover:text-neon"
                >
                  {p.category.name}
                </Link>
              ),
            }))}
          />

          <CompareTableRow
            label="Preço"
            highlightLabel="Mais barato"
            columns={products.map((p) => {
              const finalPrice = p.promoPrice ?? p.price
              return {
                productId: p.id,
                highlight: highlights.cheapest === p.id,
                content: (
                  <div>
                    {p.promoPrice && (
                      <p className="text-xs text-gray-600 line-through">
                        {formatBRL(Number(p.price))}
                      </p>
                    )}
                    <p
                      className={cn(
                        'font-display text-2xl leading-none md:text-3xl',
                        highlights.cheapest === p.id
                          ? 'text-neon'
                          : 'text-foreground',
                      )}
                    >
                      {formatBRL(Number(finalPrice))}
                    </p>
                  </div>
                ),
              }
            })}
          />

          <CompareTableRow
            label="Parcelamento"
            columns={products.map((p) => {
              const finalPrice = Number(p.promoPrice ?? p.price)
              return {
                productId: p.id,
                content:
                  p.installments && p.installments > 1 ? (
                    <p className="text-xs text-gray-100">
                      {p.installments}x de{' '}
                      <strong className="text-foreground">
                        {formatBRL(finalPrice / p.installments)}
                      </strong>
                      <span className="block text-gray-400">no cartão</span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">À vista</p>
                  ),
              }
            })}
          />

          <CompareTableRow
            label="Avaliação"
            highlightLabel="Melhor avaliado"
            columns={products.map((p) => ({
              productId: p.id,
              highlight: highlights['best-rated'] === p.id,
              content:
                p.totalReviews > 0 ? (
                  <div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-display text-lg text-foreground">
                        {p.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {p.totalReviews} avaliaç
                      {p.totalReviews === 1 ? 'ão' : 'ões'}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Sem avaliações</p>
                ),
            }))}
          />

          <CompareTableRow
            label="Disponibilidade"
            highlightLabel="Mais estoque"
            columns={products.map((p) => ({
              productId: p.id,
              highlight: highlights['most-stock'] === p.id,
              content:
                p.totalStock === 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs text-danger">
                    <MinusCircle className="h-3.5 w-3.5" />
                    Esgotado
                  </span>
                ) : p.totalStock <= 3 ? (
                  <span className="inline-flex items-center gap-1 text-xs text-warning">
                    🔥 Últimas {p.totalStock} un.
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-success">
                    <Check className="h-3.5 w-3.5" />
                    Em estoque
                  </span>
                ),
            }))}
          />

          <CompareTableRow
            label="Cores"
            columns={products.map((p) => {
              const uniqueColors = Array.from(
                new Map(
                  p.variants
                    .filter((v) => v.stock > 0)
                    .map((v) => [v.color, v]),
                ).values(),
              ).slice(0, 6)
              return {
                productId: p.id,
                content:
                  uniqueColors.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {uniqueColors.map((v) => (
                        <span
                          key={v.color}
                          className="h-5 w-5 rounded-full border border-border"
                          style={{ backgroundColor: v.colorHex ?? '#666' }}
                          title={v.color}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">—</p>
                  ),
              }
            })}
          />

          <CompareTableRow
            label="Numerações"
            columns={products.map((p) => {
              const sizes = Array.from(
                new Set(
                  p.variants.filter((v) => v.stock > 0).map((v) => v.size),
                ),
              ).sort((a, b) => {
                const an = parseInt(a, 10)
                const bn = parseInt(b, 10)
                if (!isNaN(an) && !isNaN(bn)) return an - bn
                return a.localeCompare(b)
              })
              return {
                productId: p.id,
                content:
                  sizes.length > 0 ? (
                    <p className="text-xs leading-relaxed text-gray-100">
                      {sizes.join(' · ')}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">—</p>
                  ),
              }
            })}
          />

          {hasAnyAttribute(products, 'material') && (
            <CompareTableRow
              label="Material"
              columns={products.map((p) => ({
                productId: p.id,
                content: <AttributeCell value={p.material} />,
              }))}
            />
          )}
          {hasAnyAttribute(products, 'weight') && (
            <CompareTableRow
              label="Peso"
              columns={products.map((p) => ({
                productId: p.id,
                content: <AttributeCell value={p.weight} />,
              }))}
            />
          )}
          {hasAnyAttribute(products, 'collar') && (
            <CompareTableRow
              label="Gola"
              columns={products.map((p) => ({
                productId: p.id,
                content: <AttributeCell value={p.collar} />,
              }))}
            />
          )}
          {hasAnyAttribute(products, 'technology') && (
            <CompareTableRow
              label="Tecnologia"
              columns={products.map((p) => ({
                productId: p.id,
                content: <AttributeCell value={p.technology} />,
              }))}
            />
          )}
          {hasAnyAttribute(products, 'useIndication') && (
            <CompareTableRow
              label="Indicação"
              columns={products.map((p) => ({
                productId: p.id,
                content: <AttributeCell value={p.useIndication} />,
              }))}
            />
          )}
          {hasAnyAttribute(products, 'warranty') && (
            <CompareTableRow
              label="Garantia"
              columns={products.map((p) => ({
                productId: p.id,
                content: <AttributeCell value={p.warranty} />,
              }))}
            />
          )}
          {hasAnyAttribute(products, 'origin') && (
            <CompareTableRow
              label="Origem"
              columns={products.map((p) => ({
                productId: p.id,
                content: <AttributeCell value={p.origin} />,
              }))}
            />
          )}

          <CompareTableRow
            label="Ação"
            columns={products.map((p) => ({
              productId: p.id,
              content: (
                <div className="space-y-2">
                  <Button
                    variant="whatsapp"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleAddSingle(p)}
                    disabled={p.totalStock === 0}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {p.totalStock === 0 ? 'Esgotado' : 'Adicionar'}
                  </Button>
                  <Link
                    href={`/produto/${p.slug}`}
                    className="block text-center text-[10px] text-neon hover:underline"
                  >
                    Ver página completa
                  </Link>
                </div>
              ),
            }))}
            className="bg-bg-secondary/30"
          />
        </div>
      </div>

      <div className="border-t border-border bg-bg-secondary/50 p-4 md:p-6">
        <Button
          variant="whatsapp"
          size="lg"
          className="w-full text-base"
          onClick={handleSendAll}
        >
          <WhatsAppIcon className="h-5 w-5" />
          Enviar{' '}
          {products.length === 1
            ? 'no'
            : `todos os ${products.length} no`}{' '}
          WhatsApp
        </Button>
        <p className="mt-2 text-center text-[10px] text-gray-400">
          A mensagem inclui marca, nome, preço e link de cada produto
        </p>
      </div>
    </div>
  )
}

function AttributeCell({ value }: { value?: string | null }) {
  if (!value || value.trim() === '') {
    return <p className="text-xs text-gray-600">—</p>
  }
  return <p className="text-xs leading-relaxed text-gray-100">{value}</p>
}

function hasAnyAttribute(
  products: CompareProduct[],
  key: keyof CompareProduct,
): boolean {
  return products.some((p) => {
    const v = p[key]
    return typeof v === 'string' && v.trim() !== ''
  })
}
