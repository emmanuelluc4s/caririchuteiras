import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/**
 * Busca um produto completo pelo slug.
 * Retorna null se não encontrado ou inativo.
 */
export const getProductBySlug = cache(async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { order: 'asc' } },
      variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
      category: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!product) return null

  const totalReviews = product.reviews.length
  const averageRating =
    totalReviews > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

  return {
    ...product,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
  }
})

/**
 * Busca produtos relacionados em 3 níveis de prioridade:
 * 1. Mesma categoria (até 4)
 * 2. Mesma marca (preenche até 8)
 * 3. Mesma cor (preenche até 8)
 */
export const getRelatedProducts = cache(
  async (productId: string, categoryId: string, brand: string, colors: string[]) => {
    const baseInclude = {
      images: { take: 1, orderBy: { order: 'asc' as const } },
      variants: { where: { stock: { gt: 0 } }, orderBy: [{ color: 'asc' as const }] },
      category: { select: { name: true, slug: true } },
    }

    const sameCategoryProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        categoryId,
        id: { not: productId },
      },
      take: 4,
      orderBy: [{ whatsappClicks: 'desc' }, { views: 'desc' }],
      include: baseInclude,
    })

    if (sameCategoryProducts.length >= 8) {
      return sameCategoryProducts.slice(0, 8)
    }

    const excludeIds = [productId, ...sameCategoryProducts.map((p) => p.id)]
    const sameBrandProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        brand,
        id: { notIn: excludeIds },
      },
      take: 8 - sameCategoryProducts.length,
      orderBy: { whatsappClicks: 'desc' },
      include: baseInclude,
    })

    const combined = [...sameCategoryProducts, ...sameBrandProducts]

    if (combined.length >= 8 || colors.length === 0) {
      return combined.slice(0, 8)
    }

    const excludeIdsFinal = [...excludeIds, ...sameBrandProducts.map((p) => p.id)]
    const sameColorProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { notIn: excludeIdsFinal },
        variants: { some: { color: { in: colors } } },
      },
      take: 8 - combined.length,
      orderBy: { whatsappClicks: 'desc' },
      include: baseInclude,
    })

    return [...combined, ...sameColorProducts].slice(0, 8)
  },
)

/**
 * Lista de slugs para SSG (generateStaticParams).
 * Limite controlado por env (PRODUCT_SSG_LIMIT, default 10) para respeitar
 * pools restritos no build (Supabase free). O resto é ISR sob demanda.
 */
export async function getProductSlugsForStaticGeneration() {
  const limit = Number(process.env.PRODUCT_SSG_LIMIT ?? 10)
  if (!Number.isFinite(limit) || limit <= 0) return []

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
      orderBy: { whatsappClicks: 'desc' },
      take: limit,
    })
    return products.map((p) => ({ slug: p.slug }))
  } catch {
    // Banco indisponível em build → 100% ISR
    return []
  }
}
