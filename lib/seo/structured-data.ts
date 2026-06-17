import { getSiteConfig } from '@/lib/site-config'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cariri-chuteiras.vercel.app'

export async function getOrganizationSchema() {
  const config = await getSiteConfig().catch(() => null)
  if (!config) return null

  const sameAs = [
    config.instagramUrl,
    config.facebookUrl,
    config.tiktokUrl,
    config.youtubeUrl,
    config.twitterUrl,
  ].filter((url): url is string => Boolean(url))

  const address = config.storeAddress
    ? {
        '@type': 'PostalAddress' as const,
        streetAddress: config.storeAddress,
        addressLocality: config.storeCity ?? 'Barbalha',
        addressRegion: 'CE',
        addressCountry: 'BR',
      }
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}#organization`,
    name: config.storeName ?? 'Cariri Chuteiras',
    description: config.storeDescription ?? undefined,
    url: SITE_URL,
    telephone: config.whatsappNumber ?? undefined,
    email: config.storeEmail ?? undefined,
    image: config.ogImageUrl ?? `${SITE_URL}/escudo.svg`,
    logo: `${SITE_URL}/escudo.svg`,
    address,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    openingHoursSpecification: config.whatsappBusinessHours
      ? [
          {
            '@type': 'OpeningHoursSpecification',
            description: config.whatsappBusinessHours,
          },
        ]
      : undefined,
  }
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: 'Cariri Chuteiras',
    inLanguage: 'pt-BR',
    publisher: { '@id': `${SITE_URL}#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/busca?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export type ProductForSchema = {
  id: string
  name: string
  slug: string
  description?: string | null
  brand: string
  sku: string
  category: string
  price: number
  promoPrice: number | null
  isActive: boolean
  totalStock: number
  images: Array<{ urlOriginal: string }>
  averageRating: number
  totalReviews: number
  reviews?: Array<{
    customerName: string
    rating: number
    comment: string
    createdAt: Date | string
  }>
}

export function getProductSchema(product: ProductForSchema) {
  const finalPrice = product.promoPrice ?? product.price
  const url = `${SITE_URL}/produto/${product.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description
      ? stripHtml(product.description).slice(0, 5000)
      : undefined,
    image: product.images.slice(0, 5).map((i) => i.urlOriginal),
    sku: product.sku,
    mpn: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    category: product.category,
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'BRL',
      price: finalPrice.toFixed(2),
      priceValidUntil: getPriceValidUntil(),
      availability:
        product.isActive && product.totalStock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}#organization` },
    },
    aggregateRating:
      product.totalReviews > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating.toFixed(1),
            reviewCount: product.totalReviews,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: product.reviews?.slice(0, 5).map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
      },
      author: { '@type': 'Person', name: r.customerName },
      reviewBody: r.comment.slice(0, 500),
      datePublished: new Date(r.createdAt).toISOString(),
    })),
  }
}

export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function getFAQSchema(
  items: Array<{ question: string; answer: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getPriceValidUntil(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().split('T')[0]!
}
