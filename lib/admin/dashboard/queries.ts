import { prisma } from '@/lib/prisma'
import { cache } from 'react'
import { format } from 'date-fns'
import {
  type DateRange,
  type PeriodKey,
  type TimelinePoint,
  type SourceData,
  type TopProductData,
  type TopSearchData,
  type RecentLead,
  type Kpi,
} from './types'
import {
  enumerateDays,
  calculateVariation,
  formatVariationLabel,
  formatDateLabel,
} from './period'

async function countEventsByType(
  type: string,
  range: DateRange,
): Promise<number> {
  return prisma.siteEvent.count({
    where: {
      type,
      createdAt: { gte: range.from, lte: range.to },
    },
  })
}

async function countUniqueSessions(range: DateRange): Promise<number> {
  const result = await prisma.siteEvent.findMany({
    where: {
      type: 'page_view',
      createdAt: { gte: range.from, lte: range.to },
      sessionId: { not: null },
    },
    distinct: ['sessionId'],
    select: { sessionId: true },
  })
  return result.length
}

async function countWhatsappClicks(range: DateRange): Promise<number> {
  return prisma.siteEvent.count({
    where: {
      type: { in: ['whatsapp_click_single', 'whatsapp_click_cart'] },
      createdAt: { gte: range.from, lte: range.to },
    },
  })
}

export const getKpis = cache(
  async (
    range: DateRange,
    previousRange: DateRange,
  ): Promise<Kpi[]> => {
    const [
      visitors,
      visitorsPrev,
      pageViews,
      pageViewsPrev,
      whatsapp,
      whatsappPrev,
      cartAdds,
      cartAddsPrev,
      reviewsCount,
      reviewsCountPrev,
    ] = await Promise.all([
      countUniqueSessions(range),
      countUniqueSessions(previousRange),
      countEventsByType('page_view', range),
      countEventsByType('page_view', previousRange),
      countWhatsappClicks(range),
      countWhatsappClicks(previousRange),
      countEventsByType('cart_add', range),
      countEventsByType('cart_add', previousRange),
      prisma.review.count({
        where: { createdAt: { gte: range.from, lte: range.to } },
      }),
      prisma.review.count({
        where: {
          createdAt: { gte: previousRange.from, lte: previousRange.to },
        },
      }),
    ])

    const conversionRate = visitors > 0 ? (whatsapp / visitors) * 100 : 0
    const conversionRatePrev =
      visitorsPrev > 0 ? (whatsappPrev / visitorsPrev) * 100 : 0

    return [
      {
        label: 'Visitantes',
        value: visitors,
        formatted: visitors.toLocaleString('pt-BR'),
        variation: calculateVariation(visitors, visitorsPrev),
        variationLabel: formatVariationLabel(
          calculateVariation(visitors, visitorsPrev),
        ),
        helpText: 'Sessões únicas no período',
      },
      {
        label: 'Page Views',
        value: pageViews,
        formatted: pageViews.toLocaleString('pt-BR'),
        variation: calculateVariation(pageViews, pageViewsPrev),
        variationLabel: formatVariationLabel(
          calculateVariation(pageViews, pageViewsPrev),
        ),
        helpText: 'Total de visualizações de página',
      },
      {
        label: 'Cliques WhatsApp',
        value: whatsapp,
        formatted: whatsapp.toLocaleString('pt-BR'),
        variation: calculateVariation(whatsapp, whatsappPrev),
        variationLabel: formatVariationLabel(
          calculateVariation(whatsapp, whatsappPrev),
        ),
        helpText: 'Total de leads gerados',
      },
      {
        label: 'Taxa de Conversão',
        value: conversionRate,
        formatted: `${conversionRate.toFixed(1)}%`,
        variation: calculateVariation(
          Math.round(conversionRate * 100),
          Math.round(conversionRatePrev * 100),
        ),
        variationLabel: formatVariationLabel(
          calculateVariation(
            Math.round(conversionRate * 100),
            Math.round(conversionRatePrev * 100),
          ),
        ),
        helpText: 'Cliques WhatsApp ÷ Visitantes',
      },
      {
        label: 'Itens no Carrinho',
        value: cartAdds,
        formatted: cartAdds.toLocaleString('pt-BR'),
        variation: calculateVariation(cartAdds, cartAddsPrev),
        variationLabel: formatVariationLabel(
          calculateVariation(cartAdds, cartAddsPrev),
        ),
        helpText: 'Adições ao carrinho de intenção',
      },
      {
        label: 'Avaliações Recebidas',
        value: reviewsCount,
        formatted: reviewsCount.toLocaleString('pt-BR'),
        variation: calculateVariation(reviewsCount, reviewsCountPrev),
        variationLabel: formatVariationLabel(
          calculateVariation(reviewsCount, reviewsCountPrev),
        ),
        helpText: 'Novas avaliações no período',
      },
    ]
  },
)

export const getTimeline = cache(
  async (
    range: DateRange,
    periodKey: PeriodKey,
  ): Promise<TimelinePoint[]> => {
    const days = enumerateDays(range)

    const events = await prisma.siteEvent.findMany({
      where: {
        type: {
          in: ['page_view', 'whatsapp_click_single', 'whatsapp_click_cart'],
        },
        createdAt: { gte: range.from, lte: range.to },
      },
      select: { type: true, createdAt: true, sessionId: true },
    })

    const dailyMap = new Map<
      string,
      { visitorSet: Set<string>; whatsapp: number }
    >()
    days.forEach((d) =>
      dailyMap.set(d, { visitorSet: new Set(), whatsapp: 0 }),
    )

    events.forEach((e) => {
      const dayKey = format(new Date(e.createdAt), 'yyyy-MM-dd')
      const bucket = dailyMap.get(dayKey)
      if (!bucket) return
      if (e.type === 'page_view' && e.sessionId) {
        bucket.visitorSet.add(e.sessionId)
      } else if (
        e.type === 'whatsapp_click_single' ||
        e.type === 'whatsapp_click_cart'
      ) {
        bucket.whatsapp += 1
      }
    })

    return days.map((d) => {
      const bucket = dailyMap.get(d)!
      return {
        date: d,
        label: formatDateLabel(d, periodKey),
        visitors: bucket.visitorSet.size,
        whatsappClicks: bucket.whatsapp,
      }
    })
  },
)

const SOURCE_LABELS: Record<string, string> = {
  floating: 'Botão Flutuante',
  header: 'Header',
  product: 'Página do Produto',
  cart: 'Carrinho',
  'exit-intent': 'Exit Intent',
  'quick-view': 'Quick View',
  contact: 'Contato',
  testimonial: 'Testimonial',
  footer: 'Footer',
  unknown: 'Não identificado',
}

export const getWhatsappSources = cache(
  async (range: DateRange): Promise<SourceData[]> => {
    const events = await prisma.siteEvent.findMany({
      where: {
        type: { in: ['whatsapp_click_single', 'whatsapp_click_cart'] },
        createdAt: { gte: range.from, lte: range.to },
      },
      select: { type: true, metadata: true },
    })

    const sourceMap = new Map<string, number>()
    for (const e of events) {
      let source: string
      if (e.type === 'whatsapp_click_cart') {
        source = 'cart'
      } else {
        const meta = e.metadata as Record<string, unknown> | null
        source = (meta?.source as string) || 'unknown'
      }
      sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1)
    }

    return Array.from(sourceMap.entries())
      .map(([source, count]) => ({
        source,
        count,
        label: SOURCE_LABELS[source] ?? source,
      }))
      .sort((a, b) => b.count - a.count)
  },
)

export const getTopViewedProducts = cache(
  async (
    range: DateRange,
    limit: number = 10,
  ): Promise<TopProductData[]> => {
    const events = await prisma.siteEvent.findMany({
      where: {
        type: 'product_view',
        createdAt: { gte: range.from, lte: range.to },
        productId: { not: null },
      },
      select: { productId: true },
    })

    const countMap = new Map<string, number>()
    events.forEach((e) => {
      if (!e.productId) return
      countMap.set(e.productId, (countMap.get(e.productId) ?? 0) + 1)
    })

    const sorted = Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    if (sorted.length === 0) return []

    const products = await prisma.product.findMany({
      where: { id: { in: sorted.map(([id]) => id) } },
      include: { images: { take: 1, orderBy: { order: 'asc' } } },
    })
    const productMap = new Map(products.map((p) => [p.id, p]))

    return sorted
      .map(([productId, count]): TopProductData | null => {
        const p = productMap.get(productId)
        if (!p) return null
        const data: TopProductData = {
          productId,
          name: p.name,
          brand: p.brand,
          slug: p.slug,
          count,
        }
        if (p.images[0]?.urlThumb) data.imageUrl = p.images[0].urlThumb
        return data
      })
      .filter((x): x is TopProductData => x !== null)
  },
)

export const getTopWhatsappProducts = cache(
  async (
    range: DateRange,
    limit: number = 10,
  ): Promise<TopProductData[]> => {
    const events = await prisma.siteEvent.findMany({
      where: {
        type: { in: ['whatsapp_click_single', 'cart_add'] },
        createdAt: { gte: range.from, lte: range.to },
        productId: { not: null },
      },
      select: { productId: true },
    })

    const countMap = new Map<string, number>()
    events.forEach((e) => {
      if (!e.productId) return
      countMap.set(e.productId, (countMap.get(e.productId) ?? 0) + 1)
    })

    const sorted = Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    if (sorted.length === 0) return []

    const products = await prisma.product.findMany({
      where: { id: { in: sorted.map(([id]) => id) } },
      include: { images: { take: 1, orderBy: { order: 'asc' } } },
    })
    const productMap = new Map(products.map((p) => [p.id, p]))

    return sorted
      .map(([productId, count]): TopProductData | null => {
        const p = productMap.get(productId)
        if (!p) return null
        const data: TopProductData = {
          productId,
          name: p.name,
          brand: p.brand,
          slug: p.slug,
          count,
        }
        if (p.images[0]?.urlThumb) data.imageUrl = p.images[0].urlThumb
        return data
      })
      .filter((x): x is TopProductData => x !== null)
  },
)

export const getTopSearches = cache(
  async (
    range: DateRange,
    limit: number = 10,
  ): Promise<TopSearchData[]> => {
    const events = await prisma.siteEvent.findMany({
      where: {
        type: 'search',
        createdAt: { gte: range.from, lte: range.to },
      },
      select: { metadata: true },
    })

    const queryMap = new Map<string, number>()
    events.forEach((e) => {
      const meta = e.metadata as Record<string, unknown> | null
      const query = ((meta?.query as string) || '').trim().toLowerCase()
      if (!query || query.length < 2) return
      queryMap.set(query, (queryMap.get(query) ?? 0) + 1)
    })

    return Array.from(queryMap.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  },
)

export const getRecentLeads = cache(
  async (
    range: DateRange,
    limit: number = 20,
  ): Promise<RecentLead[]> => {
    const leads = await prisma.whatsappLead.findMany({
      where: {
        createdAt: { gte: range.from, lte: range.to },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return leads.map((lead) => {
      const items =
        (lead.items as Array<Record<string, unknown>> | null) ?? []
      const totalValue = items.reduce((sum, item) => {
        const price = Number(item.price ?? 0)
        const quantity = Number(item.quantity ?? 1)
        return sum + price * quantity
      }, 0)

      return {
        id: lead.id,
        customerName: lead.customerName ?? null,
        customerPhone: lead.customerPhone ?? null,
        itemsCount: items.length,
        totalValue: totalValue > 0 ? totalValue : null,
        source: lead.source ?? 'unknown',
        createdAt: lead.createdAt,
      }
    })
  },
)
