import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type AdminProductFilters = {
  search?: string
  categoryId?: string
  brand?: string
  status?: 'all' | 'active' | 'inactive'
  stock?: 'all' | 'in-stock' | 'out-of-stock' | 'low-stock'
}

export const ADMIN_PRODUCTS_PER_PAGE = 20

export async function listAdminProducts(
  filters: AdminProductFilters,
  page: number = 1,
) {
  const where: Prisma.ProductWhereInput = {}

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { sku: { contains: filters.search, mode: 'insensitive' } },
      { brand: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  if (filters.categoryId) where.categoryId = filters.categoryId
  if (filters.brand) where.brand = filters.brand
  if (filters.status === 'active') where.isActive = true
  if (filters.status === 'inactive') where.isActive = false

  const skip = (page - 1) * ADMIN_PRODUCTS_PER_PAGE

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: ADMIN_PRODUCTS_PER_PAGE,
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          variants: { select: { stock: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    let filteredProducts = products
    if (filters.stock && filters.stock !== 'all') {
      filteredProducts = products.filter((p) => {
        const totalStock = p.variants.reduce((s, v) => s + v.stock, 0)
        if (filters.stock === 'out-of-stock') return totalStock === 0
        if (filters.stock === 'low-stock')
          return totalStock > 0 && totalStock < 5
        if (filters.stock === 'in-stock') return totalStock >= 5
        return true
      })
    }

    return {
      products: filteredProducts.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        categoryName: p.category.name,
        price: Number(p.price),
        promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
        isActive: p.isActive,
        isNew: p.isNew,
        isBestSellerManual: p.isBestSellerManual,
        totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
        imageUrl: p.images[0]?.urlThumb,
        updatedAt: p.updatedAt,
      })),
      total,
      totalPages: Math.max(1, Math.ceil(total / ADMIN_PRODUCTS_PER_PAGE)),
      currentPage: page,
    }
  } catch {
    return {
      products: [],
      total: 0,
      totalPages: 1,
      currentPage: page,
    }
  }
}

export async function getAdminProductBrands() {
  try {
    const result = await prisma.product.groupBy({
      by: ['brand'],
      orderBy: { brand: 'asc' },
    })
    return result.map((r) => r.brand)
  } catch {
    return []
  }
}
