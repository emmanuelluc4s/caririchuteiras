'use client'

import * as React from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WhatsappProductButton } from './whatsapp-product-button'
import { formatBRL } from '@/lib/utils'

export type ShowcaseProduct = {
  id: string
  name: string
  slug: string
  brand: string
  price: number
  promoPrice?: number
  image?: string
  variants: Array<{ color: string; colorHex: string | null; size: string }>
}

export function ProductShowcase({ products }: { products: ShowcaseProduct[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductShowcaseCard key={p.id} product={p} />
      ))}
    </div>
  )
}

function ProductShowcaseCard({ product }: { product: ShowcaseProduct }) {
  // Cores únicas das variantes
  const uniqueColors = React.useMemo(() => {
    const seen = new Set<string>()
    return product.variants.filter((v) => {
      if (seen.has(v.color)) return false
      seen.add(v.color)
      return true
    })
  }, [product.variants])

  // Tamanhos únicos
  const uniqueSizes = React.useMemo(() => {
    const seen = new Set<string>()
    return product.variants
      .filter((v) => {
        if (seen.has(v.size)) return false
        seen.add(v.size)
        return true
      })
      .map((v) => v.size)
  }, [product.variants])

  const [color, setColor] = React.useState(uniqueColors[0]?.color)
  const [size, setSize] = React.useState(uniqueSizes[0])

  const colorHex = uniqueColors.find((c) => c.color === color)?.colorHex ?? undefined
  const finalPrice = product.promoPrice ?? product.price

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="bg-bg-tertiary relative aspect-square">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        )}
        {product.promoPrice && (
          <Badge variant="danger" className="absolute left-3 top-3">
            -{Math.round(((product.price - product.promoPrice) / product.price) * 100)}%
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col space-y-3 p-4">
        <div>
          <Badge variant="outline" className="text-[10px]">
            {product.brand}
          </Badge>
          <h3 className="mt-1 text-sm font-medium line-clamp-2">{product.name}</h3>
        </div>

        <div className="flex items-baseline gap-2">
          {product.promoPrice && (
            <span className="text-xs text-gray-600 line-through">
              {formatBRL(product.price)}
            </span>
          )}
          <span className="font-display text-neon text-xl">{formatBRL(finalPrice)}</span>
        </div>

        {/* Cores */}
        {uniqueColors.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-gray-400">Cor</p>
            <div className="flex flex-wrap gap-1.5">
              {uniqueColors.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setColor(c.color)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    color === c.color
                      ? 'border-neon neon-glow-sm scale-110'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: c.colorHex ?? '#666' }}
                  aria-label={c.color}
                  title={c.color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tamanhos */}
        {uniqueSizes.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-gray-400">
              Numeração
            </p>
            <div className="flex flex-wrap gap-1.5">
              {uniqueSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`h-8 min-w-8 rounded-md border px-2 text-xs font-semibold transition-all ${
                    size === s
                      ? 'border-neon bg-neon/10 text-neon'
                      : 'border-border hover:border-neon/50 text-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-2">
          <WhatsappProductButton
            mode="add"
            size="default"
            className="w-full"
            product={{
              productId: product.id,
              productName: product.name,
              slug: product.slug,
              brand: product.brand,
              imageUrl: product.image,
              price: product.price,
              promoPrice: product.promoPrice,
              color,
              colorHex: colorHex ?? undefined,
              size,
            }}
          />
        </div>
      </div>
    </Card>
  )
}
