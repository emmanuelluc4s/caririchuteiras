import { cache } from 'react'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { CatalogFilters } from '@/lib/catalog/filters-schema'
import { PRODUCTS_PER_PAGE } from '@/lib/catalog/filters-schema'

type CatalogQuery = {
  categorySlug?: string
  filters: CatalogFilters
}

function buildWhere(query: CatalogQuery): Prisma.ProductWhereInput {
  const { filters, categorySlug } = query

  const where: Prisma.ProductWhereInput = { isActive: true }

  if (categorySlug) {
    where.category = { slug: categorySlug, isActive: true }
  }

  if (filters.brands.length > 0) {
    where.brand = { in: filters.brands }
  }

  // Cor + numeração combinam dentro de variants.some (mesma variante)
  const variantConditions: Prisma.ProductVariantWhereInput = {}
  if (filters.colors.length > 0) variantConditions.color = { in: filters.colors }
  if (filters.sizes.length > 0) variantConditions.size = { in: filters.sizes }
  if (filters.onlyInStock) variantConditions.stock = { gt: 0 }

  if (Object.keys(variantConditions).length > 0) {
    where.variants = { some: variantConditions }
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    const priceFilter: Prisma.DecimalFilter = {}
    if (filters.minPrice != null) priceFilter.gte = filters.minPrice
    if (filters.maxPrice != null) priceFilter.lte = filters.maxPrice
    where.OR = [
      { promoPrice: priceFilter },
      { AND: [{ promoPrice: null }, { price: priceFilter }] },
    ]
  }

  if (filters.onlyPromo) {
    where.promoPrice = { not: null }
  }

  if (filters.onlyNew) {
    where.isNew = true
  }

  return where
}

function buildOrderBy(
  sort: CatalogFilters['sort'],
):
  | Prisma.ProductOrderByWithRelationInput
  | Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'newest':
      return [{ isNew: 'desc' }, { createdAt: 'desc' }]
    case 'price-asc':
      return { price: 'asc' }
    case 'price-desc':
      return { price: 'desc' }
    case 'name-asc':
      return { name: 'asc' }
    case 'discount':
      return [
        { promoPrice: { sort: 'desc', nulls: 'last' } },
        { whatsappClicks: 'desc' },
      ]
    case 'best':
    default:
      return [
        { whatsappClicks: 'desc' },
        { isBestSellerManual: 'desc' },
        { views: 'desc' },
      ]
  }
}

/**
 * Query principal: lista paginada de produtos + contagem total.
 */
export const queryCatalog = cache(async (query: CatalogQuery) => {
  const where = buildWhere(query)
  const orderBy = buildOrderBy(query.filters.sort)
  const skip = (query.filters.page - 1) * PRODUCTS_PER_PAGE

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: PRODUCTS_PER_PAGE,
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          variants: { where: { stock: { gt: 0 } } },
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    return {
      products,
      total,
      totalPages: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
      currentPage: query.filters.page,
    }
  } catch {
    return {
      products: [],
      total: 0,
      totalPages: 1,
      currentPage: query.filters.page,
    }
  }
})

/**
 * Buscar facetas para os filtros (marcas, cores, numerações disponíveis na categoria).
 * Usado para mostrar apenas opções relevantes.
 */
export const getCategoryFacets = cache(async (categorySlug?: string) => {
  const baseWhere: Prisma.ProductWhereInput = {
    isActive: true,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  }

  try {
    const [brandsRaw, colorsRaw, sizesRaw, priceStats] = await Promise.all([
      prisma.product.groupBy({
        by: ['brand'],
        where: baseWhere,
        _count: true,
        orderBy: { _count: { brand: 'desc' } },
      }),

      prisma.productVariant.findMany({
        where: {
          stock: { gt: 0 },
          product: baseWhere,
        },
        select: { color: true, colorHex: true },
        distinct: ['color'],
      }),

      prisma.productVariant.findMany({
        where: {
          stock: { gt: 0 },
          product: baseWhere,
        },
        select: { size: true },
        distinct: ['size'],
      }),

      prisma.product.aggregate({
        where: baseWhere,
        _min: { price: true, promoPrice: true },
        _max: { price: true, promoPrice: true },
      }),
    ])

    const sizes = sizesRaw
      .map((s) => s.size)
      .sort((a, b) => {
        const an = parseInt(a, 10)
        const bn = parseInt(b, 10)
        if (!isNaN(an) && !isNaN(bn)) return an - bn
        if (!isNaN(an)) return -1
        if (!isNaN(bn)) return 1
        const order = ['P', 'M', 'G', 'GG', 'XGG']
        return order.indexOf(a) - order.indexOf(b)
      })

    const minCandidates = [
      Number(priceStats._min.price ?? Infinity),
      Number(priceStats._min.promoPrice ?? Infinity),
    ].filter(Number.isFinite)
    const maxCandidates = [
      Number(priceStats._max.price ?? 0),
      Number(priceStats._max.promoPrice ?? 0),
    ]
    const minPriceAll = minCandidates.length ? Math.min(...minCandidates) : 0
    const maxPriceAll = Math.max(...maxCandidates, 0)

    return {
      brands: brandsRaw.map((b) => ({ value: b.brand, count: b._count })),
      colors: colorsRaw.map((c) => ({ value: c.color, hex: c.colorHex })),
      sizes,
      priceRange: {
        min: Math.floor(minPriceAll),
        max: Math.max(Math.ceil(maxPriceAll), Math.floor(minPriceAll) + 1),
      },
    }
  } catch {
    return {
      brands: [] as Array<{ value: string; count: number }>,
      colors: [] as Array<{ value: string; hex: string | null }>,
      sizes: [] as string[],
      priceRange: { min: 0, max: 1000 },
    }
  }
})

export type CategoryFacets = Awaited<ReturnType<typeof getCategoryFacets>>

export const getActiveCategories = cache(async () => {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
  } catch {
    return []
  }
})

export async function getCategoryBySlug(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug, isActive: true },
    })
  } catch {
    return null
  }
}

export async function getCategorySlugsForStaticGeneration() {
  const limit = Number(process.env.CATEGORY_SSG_LIMIT ?? 20)
  if (!Number.isFinite(limit) || limit <= 0) return []
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
      take: limit,
    })
    return categories.map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

/* ============================================================
   Busca textual (Módulo 07)
   ============================================================ */

function buildSearchBaseWhere(q: string): Prisma.ProductWhereInput {
  return {
    isActive: true,
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { brand: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
      { category: { name: { contains: q, mode: 'insensitive' } } },
    ],
  }
}

/**
 * Query de busca textual + filtros do catálogo.
 */
export const queryCatalogSearch = cache(
  async (params: { query: string; filters: CatalogFilters }) => {
    const { query, filters } = params
    const q = query.trim()

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      AND: [buildSearchBaseWhere(q)],
    }
    const andClauses = where.AND as Prisma.ProductWhereInput[]

    if (filters.brands.length > 0)
      andClauses.push({ brand: { in: filters.brands } })
    if (filters.onlyPromo) andClauses.push({ promoPrice: { not: null } })
    if (filters.onlyNew) andClauses.push({ isNew: true })

    const variantConditions: Prisma.ProductVariantWhereInput = {}
    if (filters.colors.length > 0)
      variantConditions.color = { in: filters.colors }
    if (filters.sizes.length > 0)
      variantConditions.size = { in: filters.sizes }
    if (filters.onlyInStock) variantConditions.stock = { gt: 0 }
    if (Object.keys(variantConditions).length > 0) {
      andClauses.push({ variants: { some: variantConditions } })
    }

    if (filters.minPrice != null || filters.maxPrice != null) {
      const priceFilter: Prisma.DecimalFilter = {}
      if (filters.minPrice != null) priceFilter.gte = filters.minPrice
      if (filters.maxPrice != null) priceFilter.lte = filters.maxPrice
      andClauses.push({
        OR: [
          { promoPrice: priceFilter },
          { AND: [{ promoPrice: null }, { price: priceFilter }] },
        ],
      })
    }

    let orderBy:
      | Prisma.ProductOrderByWithRelationInput
      | Prisma.ProductOrderByWithRelationInput[]
    switch (filters.sort) {
      case 'price-asc':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'discount':
        orderBy = [
          { promoPrice: { sort: 'desc', nulls: 'last' } },
          { whatsappClicks: 'desc' },
        ]
        break
      case 'name-asc':
        orderBy = { name: 'asc' }
        break
      default:
        orderBy = [{ whatsappClicks: 'desc' }, { views: 'desc' }]
    }

    const skip = (filters.page - 1) * PRODUCTS_PER_PAGE

    try {
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: PRODUCTS_PER_PAGE,
          include: {
            images: { take: 1, orderBy: { order: 'asc' } },
            variants: { where: { stock: { gt: 0 } } },
            category: { select: { name: true, slug: true } },
          },
        }),
        prisma.product.count({ where }),
      ])

      return {
        products,
        total,
        totalPages: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
        currentPage: filters.page,
        query: q,
      }
    } catch {
      return {
        products: [],
        total: 0,
        totalPages: 1,
        currentPage: filters.page,
        query: q,
      }
    }
  },
)

/**
 * Facetas para a página de busca (sobre o resultado da busca).
 */
export const getSearchFacets = cache(async (query: string) => {
  const q = query.trim()
  const baseWhere = buildSearchBaseWhere(q)

  try {
    const [brandsRaw, colorsRaw, sizesRaw, priceStats] = await Promise.all([
      prisma.product.groupBy({
        by: ['brand'],
        where: baseWhere,
        _count: true,
        orderBy: { _count: { brand: 'desc' } },
      }),
      prisma.productVariant.findMany({
        where: { stock: { gt: 0 }, product: baseWhere },
        select: { color: true, colorHex: true },
        distinct: ['color'],
      }),
      prisma.productVariant.findMany({
        where: { stock: { gt: 0 }, product: baseWhere },
        select: { size: true },
        distinct: ['size'],
      }),
      prisma.product.aggregate({
        where: baseWhere,
        _min: { price: true, promoPrice: true },
        _max: { price: true, promoPrice: true },
      }),
    ])

    const sizes = sizesRaw
      .map((s) => s.size)
      .sort((a, b) => {
        const an = parseInt(a, 10)
        const bn = parseInt(b, 10)
        if (!isNaN(an) && !isNaN(bn)) return an - bn
        if (!isNaN(an)) return -1
        if (!isNaN(bn)) return 1
        return a.localeCompare(b)
      })

    const minCandidates = [
      Number(priceStats._min.price ?? Infinity),
      Number(priceStats._min.promoPrice ?? Infinity),
    ].filter(Number.isFinite)
    const maxCandidates = [
      Number(priceStats._max.price ?? 0),
      Number(priceStats._max.promoPrice ?? 0),
    ]
    const minPriceAll = minCandidates.length ? Math.min(...minCandidates) : 0
    const maxPriceAll = Math.max(...maxCandidates, 0)

    return {
      brands: brandsRaw.map((b) => ({ value: b.brand, count: b._count })),
      colors: colorsRaw.map((c) => ({ value: c.color, hex: c.colorHex })),
      sizes,
      priceRange: {
        min: Math.floor(minPriceAll),
        max: Math.max(Math.ceil(maxPriceAll), Math.floor(minPriceAll) + 1),
      },
    }
  } catch {
    return {
      brands: [] as Array<{ value: string; count: number }>,
      colors: [] as Array<{ value: string; hex: string | null }>,
      sizes: [] as string[],
      priceRange: { min: 0, max: 1000 },
    }
  }
})
