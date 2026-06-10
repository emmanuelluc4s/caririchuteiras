import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/**
 * Pega todos os dados que a home precisa em um único round-trip,
 * cacheado por request via React.cache().
 *
 * Resiliente a falhas: se o banco estiver fora, retorna defaults
 * vazios em vez de derrubar a página.
 */
export const getHomeData = cache(async () => {
  try {
    const [
      featuredProducts,
      bestsellersRaw,
      newArrivals,
      activePromoProducts,
      activeCoupon,
      testimonials,
      categories,
    ] = await Promise.all([
      // 1. Produtos em destaque (até 8)
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        take: 8,
        orderBy: { updatedAt: 'desc' },
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          variants: { where: { stock: { gt: 0 } }, orderBy: [{ color: 'asc' }] },
          category: { select: { name: true, slug: true } },
        },
      }),

      // 2. Candidatos a mais vendidos
      // Fórmula final aplicada em JS (Prisma não suporta ORDER BY com expressão custom)
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [{ whatsappClicks: { gt: 0 } }, { isBestSellerManual: true }],
        },
        take: 30,
        orderBy: [{ whatsappClicks: 'desc' }, { isBestSellerManual: 'desc' }],
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          variants: { where: { stock: { gt: 0 } }, orderBy: [{ color: 'asc' }] },
          category: { select: { name: true, slug: true } },
        },
      }),

      // 3. Lançamentos
      prisma.product.findMany({
        where: { isActive: true, isNew: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          variants: { where: { stock: { gt: 0 } }, orderBy: [{ color: 'asc' }] },
          category: { select: { name: true, slug: true } },
        },
      }),

      // 4. Produtos em promoção (para imagem do banner)
      prisma.product.findMany({
        where: { isActive: true, promoPrice: { not: null } },
        take: 5,
        orderBy: { whatsappClicks: 'desc' },
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          category: { select: { name: true, slug: true } },
        },
      }),

      // 5. Cupom ativo com validade
      prisma.coupon.findFirst({
        where: { isActive: true, validUntil: { gt: new Date() } },
        orderBy: { validUntil: 'asc' },
      }),

      // 6. Depoimentos: reviews aprovados ≥ 4 estrelas
      prisma.review.findMany({
        where: { isApproved: true, rating: { gte: 4 } },
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true, brand: true } } },
      }),

      // 7. Categorias ativas
      prisma.category.findMany({
        where: { isActive: true },
        take: 8,
        orderBy: { order: 'asc' },
      }),
    ])

    // Score combinado: 0.7 × clicks normalizados + 0.3 × boost manual
    const maxClicks = Math.max(...bestsellersRaw.map((p) => p.whatsappClicks), 1)
    const bestsellers = bestsellersRaw
      .map((p) => ({
        ...p,
        _score: 0.7 * (p.whatsappClicks / maxClicks) + 0.3 * (p.isBestSellerManual ? 1 : 0),
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 10)

    return {
      featuredProducts,
      bestsellers,
      newArrivals,
      activePromoProducts,
      activeCoupon,
      testimonials,
      categories,
      dbOk: true,
    }
  } catch {
    return {
      featuredProducts: [],
      bestsellers: [],
      newArrivals: [],
      activePromoProducts: [],
      activeCoupon: null,
      testimonials: [],
      categories: [],
      dbOk: false,
    }
  }
})

export type HomeData = Awaited<ReturnType<typeof getHomeData>>
