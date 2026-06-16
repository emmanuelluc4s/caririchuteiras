import { cache } from 'react'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type ReviewFilters = {
  productId?: string
  rating?: number
  withImage?: boolean
  verifiedOnly?: boolean
}

export const REVIEWS_PER_PAGE = 6

function buildReviewWhere(filters: ReviewFilters): Prisma.ReviewWhereInput {
  const where: Prisma.ReviewWhereInput = { isApproved: true }
  if (filters.productId) where.productId = filters.productId
  if (filters.rating) where.rating = filters.rating
  if (filters.withImage) where.imageUrl = { not: null }
  if (filters.verifiedOnly) where.isVerifiedPurchase = true
  return where
}

/**
 * Distribuição de notas (quantos reviews por estrela).
 */
export const getRatingDistribution = cache(
  async (filters: { productId?: string } = {}) => {
    const where: Prisma.ReviewWhereInput = { isApproved: true }
    if (filters.productId) where.productId = filters.productId

    try {
      const groups = await prisma.review.groupBy({
        by: ['rating'],
        where,
        _count: true,
      })

      const distribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      }
      for (const g of groups) {
        distribution[g.rating] = g._count
      }

      const total = Object.values(distribution).reduce((a, b) => a + b, 0)
      const sum = Object.entries(distribution).reduce(
        (acc, [rating, count]) => acc + Number(rating) * count,
        0,
      )
      const average = total > 0 ? sum / total : 0

      return {
        distribution,
        total,
        average: Math.round(average * 10) / 10,
      }
    } catch {
      return {
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
        total: 0,
        average: 0,
      }
    }
  },
)

/**
 * Lista paginada de avaliações.
 */
export const listReviews = cache(
  async (filters: ReviewFilters, page: number = 1) => {
    const where = buildReviewWhere(filters)
    const skip = (page - 1) * REVIEWS_PER_PAGE

    try {
      const includeProduct = !filters.productId

      const [items, total] = await Promise.all([
        prisma.review.findMany({
          where,
          orderBy: [{ isVerifiedPurchase: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: REVIEWS_PER_PAGE,
          include: includeProduct
            ? {
                product: {
                  select: {
                    id: true,
                    slug: true,
                    name: true,
                    brand: true,
                    images: { take: 1, orderBy: { order: 'asc' } },
                  },
                },
              }
            : undefined,
        }),
        prisma.review.count({ where }),
      ])

      return {
        items,
        total,
        totalPages: Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE)),
        currentPage: page,
      }
    } catch {
      return {
        items: [],
        total: 0,
        totalPages: 1,
        currentPage: page,
      }
    }
  },
)

/**
 * Stats globais (página /avaliacoes e testimonials).
 */
export const getGlobalReviewStats = cache(async () => {
  try {
    const [stats, withImageCount, verifiedCount] = await Promise.all([
      getRatingDistribution(),
      prisma.review.count({
        where: { isApproved: true, imageUrl: { not: null } },
      }),
      prisma.review.count({
        where: { isApproved: true, isVerifiedPurchase: true },
      }),
    ])

    return {
      ...stats,
      withImageCount,
      verifiedCount,
    }
  } catch {
    return {
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
      total: 0,
      average: 0,
      withImageCount: 0,
      verifiedCount: 0,
    }
  }
})

const FEATURED_INCLUDE = {
  product: {
    select: { id: true, slug: true, name: true, brand: true },
  },
} satisfies Prisma.ReviewInclude

/**
 * Melhores avaliações para destaque (testimonials).
 * Critério: 5★ + verificada + com foto. Cai pra mais flexível em fallback.
 */
export const getFeaturedReviews = cache(async (limit = 6) => {
  try {
    let reviews = await prisma.review.findMany({
      where: {
        isApproved: true,
        rating: 5,
        isVerifiedPurchase: true,
        imageUrl: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: FEATURED_INCLUDE,
    })

    if (reviews.length < limit) {
      const additional = await prisma.review.findMany({
        where: {
          isApproved: true,
          rating: 5,
          id: { notIn: reviews.map((r) => r.id) },
          OR: [{ imageUrl: { not: null } }, { isVerifiedPurchase: true }],
        },
        orderBy: { createdAt: 'desc' },
        take: limit - reviews.length,
        include: FEATURED_INCLUDE,
      })
      reviews = [...reviews, ...additional]
    }

    if (reviews.length < limit) {
      const additional = await prisma.review.findMany({
        where: {
          isApproved: true,
          rating: 5,
          id: { notIn: reviews.map((r) => r.id) },
        },
        orderBy: { createdAt: 'desc' },
        take: limit - reviews.length,
        include: FEATURED_INCLUDE,
      })
      reviews = [...reviews, ...additional]
    }

    return reviews
  } catch {
    return []
  }
})

export type AdminReviewFilters = {
  search?: string
  status?: 'pending' | 'approved' | 'all'
  rating?: number
  withImage?: boolean
  verified?: 'all' | 'yes' | 'no'
}

export const ADMIN_REVIEWS_PER_PAGE = 12

export async function listAdminReviews(
  filters: AdminReviewFilters,
  page: number = 1,
) {
  const where: Prisma.ReviewWhereInput = {}

  if (filters.status === 'pending') where.isApproved = false
  if (filters.status === 'approved') where.isApproved = true
  if (filters.rating) where.rating = filters.rating
  if (filters.withImage) where.imageUrl = { not: null }
  if (filters.verified === 'yes') where.isVerifiedPurchase = true
  if (filters.verified === 'no') where.isVerifiedPurchase = false

  if (filters.search) {
    where.OR = [
      { customerName: { contains: filters.search, mode: 'insensitive' } },
      { comment: { contains: filters.search, mode: 'insensitive' } },
      {
        product: { name: { contains: filters.search, mode: 'insensitive' } },
      },
    ]
  }

  const skip = (page - 1) * ADMIN_REVIEWS_PER_PAGE

  const [items, total, pending, approved, withImage, verified] =
    await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: [{ isApproved: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: ADMIN_REVIEWS_PER_PAGE,
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              brand: true,
              images: { take: 1, orderBy: { order: 'asc' } },
            },
          },
        },
      }),
      prisma.review.count({ where }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.review.count({ where: { isApproved: true } }),
      prisma.review.count({ where: { imageUrl: { not: null } } }),
      prisma.review.count({ where: { isVerifiedPurchase: true } }),
    ])

  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_REVIEWS_PER_PAGE)),
    currentPage: page,
    stats: { pending, approved, withImage, verified },
  }
}
