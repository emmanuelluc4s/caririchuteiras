'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, ArrowRight, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/whatsapp/cart-store'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { formatBRL } from '@/lib/utils'
import type { ProductCardData } from '@/lib/types/product-card'

type Props = {
  products: ProductCardData[]
}

export function BestsellersRanking({ products }: Props) {
  if (products.length === 0) return null

  const top3 = products.slice(0, 3)
  const rest = products.slice(3, 10)

  return (
    <section
      className="from-bg-primary via-bg-secondary to-bg-primary relative overflow-hidden bg-gradient-to-b py-12 md:py-20"
      aria-labelledby="bestsellers-heading"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div className="bg-neon/8 h-[500px] w-[500px] rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <header className="mb-10 text-center md:mb-14">
          <p className="text-neon mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <Trophy className="h-4 w-4" />
            Top do Cariri
          </p>
          <h2
            id="bestsellers-heading"
            className="font-display text-4xl uppercase tracking-tight md:text-6xl"
          >
            Os mais <span className="text-neon">vendidos</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400 md:text-base">
            Os queridinhos dos clientes — aprovados pela galera do Cariri
          </p>
        </header>

        {/* Top 3 pódio */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:mb-10 md:grid-cols-3 md:gap-6">
          {top3.map((product, i) => (
            <PodiumCard key={product.id} product={product} position={i + 1} delay={i * 0.1} />
          ))}
        </div>

        {/* Lista 4-10 */}
        {rest.length > 0 && (
          <div className="border-border bg-bg-secondary overflow-hidden rounded-lg border">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {rest.map((product, i) => (
                <RankingListItem key={product.id} product={product} position={i + 4} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function PodiumCard({
  product,
  position,
  delay,
}: {
  product: ProductCardData
  position: number
  delay: number
}) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.open)
  const { track } = useAnalytics()

  const finalPrice = product.promoPrice ?? product.price
  const isFirst = position === 1

  function handleAdd() {
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
      metadata: { source: 'bestseller-podium', position },
    })
    if (result === 'added' || result === 'updated') {
      toast.success('Adicionado à conversa', {
        description: `${product.brand} ${product.name}`,
        action: { label: 'Ver carrinho', onClick: openCart },
      })
    } else {
      toast.error('Limite atingido', { description: 'Máximo de 20 produtos.' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={`relative ${isFirst ? 'md:-mt-4 md:scale-105' : ''}`}
    >
      <div
        className={`bg-bg-secondary relative overflow-hidden rounded-xl border-2 ${
          isFirst ? 'border-neon neon-glow' : 'border-border'
        }`}
      >
        {/* Badge de posição */}
        <div
          className={`font-display absolute left-3 top-3 z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 text-3xl font-bold ${
            isFirst
              ? 'bg-neon border-neon neon-glow-sm text-white'
              : position === 2
                ? 'bg-bg-primary text-foreground border-gray-400'
                : 'bg-bg-primary text-foreground border-warning'
          }`}
        >
          {position}º
        </div>

        {isFirst && (
          <Badge variant="new" className="absolute right-3 top-3 z-10">
            <Trophy className="mr-1 h-3 w-3" />
            Top 1
          </Badge>
        )}

        <Link
          href={`/produto/${product.slug}`}
          className="bg-bg-tertiary relative block aspect-square"
        >
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          )}
        </Link>

        <div className="space-y-3 p-4 md:p-5">
          <div>
            <Badge variant="outline" className="text-[10px]">
              {product.brand}
            </Badge>
            <Link href={`/produto/${product.slug}`}>
              <h3 className="hover:text-neon mt-2 text-base font-medium leading-tight transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="flex items-baseline gap-2">
            {product.promoPrice && (
              <span className="text-xs text-gray-600 line-through">
                {formatBRL(product.price)}
              </span>
            )}
            <span className="font-display text-neon text-2xl">{formatBRL(finalPrice)}</span>
          </div>

          <Button variant="whatsapp" size="default" className="w-full" onClick={handleAdd}>
            <ShoppingBag className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function RankingListItem({ product, position }: { product: ProductCardData; position: number }) {
  const finalPrice = product.promoPrice ?? product.price

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group border-border hover:bg-bg-tertiary flex items-center gap-3 border-b p-3 transition-colors last:border-b-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:border-border sm:[&:nth-last-child(2)]:border-b-0 md:p-4"
    >
      <span className="bg-bg-tertiary font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-gray-400">
        {position}
      </span>

      <div className="bg-bg-tertiary relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="64px"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-neon text-[10px] font-semibold uppercase tracking-wide">
          {product.brand}
        </p>
        <p className="group-hover:text-neon text-sm font-medium transition-colors line-clamp-1">
          {product.name}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-display text-neon text-lg leading-none">{formatBRL(finalPrice)}</p>
        <ArrowRight className="group-hover:text-neon ml-auto mt-1 h-3 w-3 text-gray-600 transition-all group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
