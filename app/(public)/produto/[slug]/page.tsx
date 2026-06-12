import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Star } from 'lucide-react'
import {
  getProductBySlug,
  getRelatedProducts,
  getProductSlugsForStaticGeneration,
} from '@/lib/queries/product'
import { getActiveCoupon } from '@/lib/queries/active-coupon'
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
import { ProductDescription } from '@/components/public/product/product-description'
import { ShareButtons } from '@/components/public/product/share-buttons'
import { CompareButton } from '@/components/public/compare/compare-button'
import { ProductReviews } from '@/components/public/product/product-reviews'
import { RelatedProducts } from '@/components/public/product/related-products'
import { ProductPageClient } from '@/components/public/product/product-page-client'
import { ProductViewTracker } from '@/components/public/product/product-view-tracker'
import { RecentlyViewedTracker } from '@/components/public/recently-viewed/recently-viewed-tracker'
import { Badge } from '@/components/ui/badge'

export const revalidate = 3600

export async function generateStaticParams() {
  return getProductSlugsForStaticGeneration()
}

type Params = { slug: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Produto não encontrado' }

  const title = product.metaTitle ?? `${product.brand} ${product.name}`
  const description =
    product.metaDescription ??
    `${product.brand} ${product.name} disponível na Cariri Chuteiras. ${product.category.name} com entrega para todo o Cariri.`

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const canonical = `/produto/${product.slug}`
  const firstImage = product.images[0]?.urlLarge

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${siteUrl}${canonical}`,
      images: firstImage
        ? [{ url: firstImage, width: 1200, height: 1200, alt: product.name }]
        : [],
      locale: 'pt_BR',
      siteName: 'Cariri Chuteiras',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: firstImage ? [firstImage] : [],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [related, activeCoupon] = await Promise.all([
    getRelatedProducts(
      product.id,
      product.categoryId,
      product.brand,
      Array.from(new Set(product.variants.map((v) => v.color))),
    ),
    getActiveCoupon(),
  ])

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
  // Aproximação até o Módulo 15 com agregações por janela
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const productUrl = `${siteUrl}/produto/${product.slug}`

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

      <ProductViewTracker productId={product.id} slug={product.slug} />
      <RecentlyViewedTracker
        productId={product.id}
        slug={product.slug}
        name={product.name}
        brand={product.brand}
        imageUrl={product.images[0]?.urlThumb}
        price={Number(product.price)}
        promoPrice={
          product.promoPrice ? Number(product.promoPrice) : undefined
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <ProductBreadcrumb items={breadcrumbItems} />
      </div>

      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-20 md:space-y-16 md:px-6 md:pb-12">
        {/* Grid principal: galeria + info */}
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
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(product.averageRating)
                            ? 'fill-warning text-warning'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
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
              installmentFree={product.installmentFree}
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

            <ProductPageClient
              productId={product.id}
              productName={product.name}
              brand={product.brand}
              slug={product.slug}
              imageUrl={product.images[0]?.urlMedium}
              price={Number(product.price)}
              promoPrice={
                product.promoPrice ? Number(product.promoPrice) : undefined
              }
              variants={product.variants.map((v) => ({
                id: v.id,
                color: v.color,
                colorHex: v.colorHex,
                size: v.size,
                stock: v.stock,
              }))}
              categoryName={product.category.name}
            />

            <div className="flex items-center gap-3">
              <CompareButton
                productId={product.id}
                productName={product.name}
                variant="full"
              />
              <p className="text-xs text-gray-400">
                Compare com outros até decidir
              </p>
            </div>

            <ShareButtons
              productName={`${product.brand} ${product.name}`}
              productUrl={productUrl}
            />
          </div>
        </div>

        {/* Descrição + atributos */}
        <ProductDescription
          description={product.description}
          attributes={{
            material: product.material,
            weight: product.weight,
            collar: product.collar,
            technology: product.technology,
            useIndication: product.useIndication,
            warranty: product.warranty,
            origin: product.origin,
          }}
        />

        {/* Avaliações */}
        <ProductReviews
          productId={product.id}
          averageRating={product.averageRating}
          totalReviews={product.totalReviews}
          reviews={product.reviews.map((r) => ({
            id: r.id,
            customerName: r.customerName,
            city: r.city,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
          }))}
        />

        {/* Relacionados */}
        <RelatedProducts products={related.map(toProductCardData)} />
      </div>
    </>
  )
}
