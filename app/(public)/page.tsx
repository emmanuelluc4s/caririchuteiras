import type { Metadata } from 'next'
import { getHomeData } from '@/lib/queries/home'
import { getSiteConfig } from '@/lib/site-config'
import { toProductCardData } from '@/lib/types/product-card'
import { HeroCarousel, type HeroSlide } from '@/components/public/home/hero-carousel'
import { CategoryGrid } from '@/components/public/home/category-grid'
import { FeaturedProducts } from '@/components/public/home/featured-products'
import { BestsellersRanking } from '@/components/public/home/bestsellers-ranking'
import { PromoBanner } from '@/components/public/home/promo-banner'
import { NewArrivals } from '@/components/public/home/new-arrivals'
import { BrandsStrip } from '@/components/public/home/brands-strip'
import { TestimonialsCarousel } from '@/components/public/home/testimonials-carousel'
import { WhatsappCtaBlock } from '@/components/public/home/whatsapp-cta-block'
import { getFeaturedReviews } from '@/lib/queries/reviews'

// ISR — revalida o cache a cada 1h
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Cariri Chuteiras — A maior loja esportiva do Cariri',
  description:
    'Chuteiras, tênis, camisas e acessórios esportivos das melhores marcas (Nike, Adidas, Puma, Penalty, Topper, Umbro) com entrega para todo o Brasil. Atendimento direto pelo WhatsApp.',
  openGraph: {
    title: 'Cariri Chuteiras — A maior loja esportiva do Cariri',
    description: 'Chuteiras, tênis, camisas e mais com atendimento direto pelo WhatsApp.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default async function HomePage() {
  const [data, config, featuredReviews] = await Promise.all([
    getHomeData(),
    getSiteConfig(),
    getFeaturedReviews(6),
  ])

  const heroSlides: HeroSlide[] = Array.isArray(config.heroSlides)
    ? (config.heroSlides as HeroSlide[])
    : []

  return (
    <>
      <HeroCarousel slides={heroSlides} />

      <CategoryGrid categories={data.categories} />

      <FeaturedProducts
        title="Em destaque agora"
        subtitle="Selecionados a dedo pelo time da loja"
        eyebrow="Destaques"
        products={data.featuredProducts.map(toProductCardData)}
        seeAllHref="/categoria/chuteiras-society"
      />

      <BestsellersRanking products={data.bestsellers.map(toProductCardData)} />

      {data.activeCoupon && data.activeCoupon.validUntil && (
        <PromoBanner
          validUntil={data.activeCoupon.validUntil}
          couponCode={data.activeCoupon.code}
          headline="PROMOÇÃO RELÂMPAGO"
          subheadline={data.activeCoupon.description ?? 'Descontos exclusivos por tempo limitado'}
          imageUrl={data.activePromoProducts[0]?.images[0]?.urlLarge}
        />
      )}

      <NewArrivals products={data.newArrivals.map(toProductCardData)} />

      <BrandsStrip />

      {featuredReviews.length > 0 ? (
        <TestimonialsCarousel
          reviews={featuredReviews.map((r) => ({
            id: r.id,
            customerName: r.customerName,
            city: r.city,
            rating: r.rating,
            comment: r.comment,
            imageUrl: r.imageUrl,
            isVerifiedPurchase: r.isVerifiedPurchase,
            product: {
              slug: r.product.slug,
              name: r.product.name,
              brand: r.product.brand,
            },
          }))}
        />
      ) : null}

      <WhatsappCtaBlock storeHours={config.storeHours} storeAddress={config.storeAddress} />
    </>
  )
}
