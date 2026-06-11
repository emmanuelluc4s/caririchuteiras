import { cache } from 'react'
import { prisma } from '@/lib/prisma'

const FALLBACK_SEARCHES = [
  'chuteira nike',
  'camisa brasil',
  'chuteira society',
  'tênis adidas',
  'chuteira futsal',
  'mochila esportiva',
  'camisa flamengo',
  'shorts compressão',
]

/**
 * Top termos buscados nos últimos 30 dias.
 * Vem da tabela SiteEvent (type='search', metadata.query).
 * Fallback hardcoded se não houver dados ainda.
 */
export const getPopularSearches = cache(
  async (limit = 8): Promise<string[]> => {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    try {
      const events = await prisma.siteEvent.findMany({
        where: {
          type: 'search',
          createdAt: { gte: cutoff },
        },
        select: { metadata: true },
        take: 500,
        orderBy: { createdAt: 'desc' },
      })

      const counts = new Map<string, number>()
      for (const event of events) {
        const meta = event.metadata as { query?: unknown } | null
        if (meta && typeof meta.query === 'string') {
          const q = meta.query.trim().toLowerCase()
          if (q.length >= 2 && q.length <= 50) {
            counts.set(q, (counts.get(q) ?? 0) + 1)
          }
        }
      }

      const top = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([q]) => q)

      if (top.length < 4) {
        const combined = [...new Set([...top, ...FALLBACK_SEARCHES])]
        return combined.slice(0, limit)
      }

      return top
    } catch {
      return FALLBACK_SEARCHES.slice(0, limit)
    }
  },
)

/**
 * Produtos populares para mostrar no modal de busca vazio.
 */
export const getPopularProductsForSearch = cache(async (limit = 6) => {
  try {
    return await prisma.product.findMany({
      where: { isActive: true },
      take: limit,
      orderBy: [{ whatsappClicks: 'desc' }, { views: 'desc' }],
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        category: { select: { name: true } },
      },
    })
  } catch {
    return []
  }
})
