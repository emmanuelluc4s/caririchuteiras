import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Star } from 'lucide-react'
import {
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/queries/product'
import { getActiveCoupon } from '@/lib/queries/active-coupon'
import { getRatingDistribution, listReviews } from '@/lib/queries/reviews'
import { toProductCardData } from '@/lib/types/product-card'
import {
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
} from '@/lib/seo/product-schema'
import { buildUrgencyMessages } from '@/lib/product/urgency'

import { ProductBreadcrumb } from '@/components/public/product/product-breadcrumb'
import { ProductGallery } from '@/components/public/product/product-gallery'
import { UrgencyBanner } from '@/components/public/product/urgency-banner'
import { ProductPriceBlock } from '@/components/public/product/product-price-block'
import { ProductCouponHighlight } from '@/components/public/product/product-coupon-highlight'
import { Badge } from '@/components/ui/badge'

export const revalidate = 3600
export const runtime = 'nodejs'

type Params = { slug: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Produto não encontrado' }
  return { title: `${product.brand} ${product.name}` }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [related, activeCoupon, reviewsDistribution, reviewsList] =
    await Promise.all([
      getRelatedProducts(
        product.id,
        product.categoryId,
        product.brand,
        Array.from(new Set(product.variants.map((v) => v.color))),
      ),
      getActiveCoupon(),
      getRatingDistribution({ productId: product.id }),
      listReviews({ productId: product.id }, 1),
    ])

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
  const whatsappClicks7d = product.whatsappClicks

  const urgencyMessages = buildUrgencyMessages({
    productId: product.id,
    totalStock,
    whatsappClicks7d,
  })

  const breadcrumbItems = [
    { name: product.category.name, href: '/categoria/' + product.category.slug },
    { name: product.name, href: `/produto/${product.slug}` },
  ]

  const productSchema = buildProductJsonLd({
    id: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    sku: product.sku,
    slug: product.slug,
    price: Number(product.price),
    promoPrice: product.promoPrice ? Number(product.promoPrice) : null,
    images: product.images,
    variants: product.variants,
    averageRating: product.averageRating,
    totalReviews: product.totalReviews,
    category: { name: product.category.name },
  })

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Início', href: '/' },
    ...breadcrumbItems,
  ])

  // Não usados nesse diagnostico mas mantidos pra simular
  void related
  void reviewsList
  void toProductCardData

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <ProductBreadcrumb items={breadcrumbItems} />
      </div>

      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-20 md:space-y-16 md:px-6 md:pb-12">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:gap-14">
          <div>
            <ProductGallery
              images={product.images}
              productName={`${product.brand} ${product.name}`}
            />
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="default" className="mb-3">
                {product.brand}
              </Badge>
              <h1 className="font-display text-3xl uppercase leading-[1.05] tracking-tight md:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              {product.totalReviews > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-sm text-gray-400">
                    {product.averageRating.toFixed(1)} ({product.totalReviews})
                  </span>
                </div>
              )}
            </div>

            <ProductPriceBlock
              price={Number(product.price)}
              promoPrice={
                product.promoPrice ? Number(product.promoPrice) : null
              }
              installments={product.installments}
            />

            <UrgencyBanner messages={urgencyMessages} />

            {activeCoupon && (
              <ProductCouponHighlight
                code={activeCoupon.code}
                description={activeCoupon.description}
                discountType={activeCoupon.discountType}
                discountValue={Number(activeCoupon.discountValue)}
              />
            )}

            <p>Reviews: {reviewsDistribution.total}</p>
          </div>
        </div>
      </div>
    </>
  )
}
