import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/**
 * Busca os produtos mínimos para a sticky bar (foto, nome, marca, slug).
 */
export const getCompareThumbnails = cache(async (ids: string[]) => {
  if (ids.length === 0) return []

  try {
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        brand: true,
        images: {
          take: 1,
          orderBy: { order: 'asc' },
          select: { urlThumb: true },
        },
      },
    })

    const byId = new Map(products.map((p) => [p.id, p]))
    return ids
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        imageUrl: p.images[0]?.urlThumb,
      }))
  } catch {
    return []
  }
})

/**
 * Busca produtos completos para a página /comparar.
 */
export const getCompareProducts = cache(async (ids: string[]) => {
  if (ids.length === 0) return []

  try {
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        variants: true,
        category: { select: { name: true, slug: true } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
    })

    const byId = new Map(
      products.map((p) => {
        const ratings = p.reviews.map((r) => r.rating)
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((s, r) => s + r, 0) / ratings.length
            : 0
        const totalStock = p.variants.reduce((s, v) => s + v.stock, 0)
        return [
          p.id,
          {
            ...p,
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: ratings.length,
            totalStock,
          },
        ] as const
      }),
    )

    return ids
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
  } catch {
    return []
  }
})

export type CompareProduct = Awaited<
  ReturnType<typeof getCompareProducts>
>[number]
