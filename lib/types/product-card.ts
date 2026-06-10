export type ProductCardData = {
  id: string
  slug: string
  name: string
  brand: string
  price: number
  promoPrice?: number | null
  imageUrl?: string
  imageAlt?: string
  isNew?: boolean
  category?: { name: string; slug: string }
  variants?: Array<{
    color: string
    colorHex: string | null
    size: string
  }>
}

/**
 * Converte Product do Prisma (com images, variants, category include) em ProductCardData.
 * Usado nas queries da home para mapear results antes de passar pros componentes.
 */
type PrismaProductLike = {
  id: string
  slug: string
  name: string
  brand: string
  price: { toString: () => string } | number
  promoPrice: { toString: () => string } | number | null
  isNew: boolean
  images: Array<{ urlMedium: string; alt: string | null }>
  variants: Array<{ color: string; colorHex: string | null; size: string }>
  category?: { name: string; slug: string }
}

export function toProductCardData(p: PrismaProductLike): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    price: Number(p.price),
    promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
    imageUrl: p.images[0]?.urlMedium,
    imageAlt: p.images[0]?.alt ?? p.name,
    isNew: p.isNew,
    category: p.category,
    variants: p.variants,
  }
}
