type ProductForSchema = {
  id: string
  name: string
  description: string | null
  brand: string
  sku: string
  slug: string
  price: number
  promoPrice: number | null
  images: Array<{ urlLarge: string; urlOriginal: string }>
  variants: Array<{ stock: number }>
  averageRating: number
  totalReviews: number
  category: { name: string }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
}

export function buildProductJsonLd(product: ProductForSchema) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const productUrl = `${siteUrl}/produto/${product.slug}`
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
  const finalPrice = product.promoPrice ?? product.price

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    '@id': productUrl,
    name: `${product.brand} ${product.name}`,
    description: product.description
      ? stripHtml(product.description).slice(0, 5000)
      : `${product.brand} ${product.name} — Cariri Chuteiras`,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    category: product.category.name,
    image: product.images.map((img) => img.urlLarge ?? img.urlOriginal),
    url: productUrl,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BRL',
      price: finalPrice.toFixed(2),
      availability:
        totalStock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Cariri Chuteiras',
      },
    },
  }

  if (product.totalReviews > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating.toFixed(1),
      reviewCount: product.totalReviews,
      bestRating: '5',
      worstRating: '1',
    }
  }

  return schema
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; href: string }>,
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.href}`,
    })),
  }
}
