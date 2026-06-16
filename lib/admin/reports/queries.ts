import { prisma } from '@/lib/prisma'
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type MonthlyReport = {
  month: string
  monthLabel: string
  visitors: number
  pageViews: number
  whatsappClicks: number
  cartAdds: number
  newReviews: number
  conversionRate: number
  variations: {
    visitors: number
    pageViews: number
    whatsappClicks: number
    cartAdds: number
    newReviews: number
    conversionRate: number
  }
  topProducts: Array<{
    productId: string
    name: string
    brand: string
    views: number
    whatsappClicks: number
  }>
  topSearches: Array<{ query: string; count: number }>
  sources: Array<{ source: string; count: number }>
}

export function getAvailableMonths(): Array<{ key: string; label: string }> {
  const now = new Date()
  const months: Array<{ key: string; label: string }> = []
  for (let i = 0; i < 12; i++) {
    const d = subMonths(now, i)
    months.push({
      key: format(d, 'yyyy-MM'),
      label: format(d, "MMMM 'de' yyyy", { locale: ptBR }),
    })
  }
  return months
}

export function parseMonth(monthKey: string | undefined): Date {
  if (!monthKey) return startOfMonth(new Date())
  const match = monthKey.match(/^(\d{4})-(\d{2})$/)
  if (!match) return startOfMonth(new Date())
  const year = parseInt(match[1]!, 10)
  const month = parseInt(match[2]!, 10) - 1
  return startOfMonth(new Date(year, month, 1))
}

function calculateVariation(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

async function getMonthMetrics(from: Date, to: Date) {
  const [
    pageViews,
    whatsappSingle,
    whatsappCart,
    cartAdds,
    reviews,
    pageViewSessions,
  ] = await Promise.all([
    prisma.siteEvent.count({
      where: { type: 'page_view', createdAt: { gte: from, lte: to } },
    }),
    prisma.siteEvent.count({
      where: {
        type: 'whatsapp_click_single',
        createdAt: { gte: from, lte: to },
      },
    }),
    prisma.siteEvent.count({
      where: {
        type: 'whatsapp_click_cart',
        createdAt: { gte: from, lte: to },
      },
    }),
    prisma.siteEvent.count({
      where: { type: 'cart_add', createdAt: { gte: from, lte: to } },
    }),
    prisma.review.count({
      where: { createdAt: { gte: from, lte: to } },
    }),
    prisma.siteEvent.findMany({
      where: {
        type: 'page_view',
        createdAt: { gte: from, lte: to },
        sessionId: { not: null },
      },
      distinct: ['sessionId'],
      select: { sessionId: true },
    }),
  ])

  const visitors = pageViewSessions.length
  const whatsappClicks = whatsappSingle + whatsappCart
  const conversionRate = visitors > 0 ? (whatsappClicks / visitors) * 100 : 0

  return {
    visitors,
    pageViews,
    whatsappClicks,
    cartAdds,
    newReviews: reviews,
    conversionRate,
  }
}

export async function getMonthlyReport(
  monthDate: Date,
): Promise<MonthlyReport> {
  const from = startOfMonth(monthDate)
  const to = endOfMonth(monthDate)
  const prevFrom = startOfMonth(subMonths(monthDate, 1))
  const prevTo = endOfMonth(subMonths(monthDate, 1))

  const [current, previous] = await Promise.all([
    getMonthMetrics(from, to),
    getMonthMetrics(prevFrom, prevTo),
  ])

  const viewEvents = await prisma.siteEvent.findMany({
    where: {
      type: 'product_view',
      createdAt: { gte: from, lte: to },
      productId: { not: null },
    },
    select: { productId: true },
  })
  const viewMap = new Map<string, number>()
  viewEvents.forEach((e) => {
    if (e.productId)
      viewMap.set(e.productId, (viewMap.get(e.productId) ?? 0) + 1)
  })

  const waEvents = await prisma.siteEvent.findMany({
    where: {
      type: { in: ['whatsapp_click_single', 'cart_add'] },
      createdAt: { gte: from, lte: to },
      productId: { not: null },
    },
    select: { productId: true },
  })
  const waMap = new Map<string, number>()
  waEvents.forEach((e) => {
    if (e.productId)
      waMap.set(e.productId, (waMap.get(e.productId) ?? 0) + 1)
  })

  const topProductIds = Array.from(
    new Set([...viewMap.keys(), ...waMap.keys()]),
  ).slice(0, 50)
  const products = topProductIds.length
    ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, brand: true },
      })
    : []

  const topProducts = products
    .map((p) => ({
      productId: p.id,
      name: p.name,
      brand: p.brand,
      views: viewMap.get(p.id) ?? 0,
      whatsappClicks: waMap.get(p.id) ?? 0,
    }))
    .sort(
      (a, b) =>
        b.whatsappClicks - a.whatsappClicks || b.views - a.views,
    )
    .slice(0, 10)

  const searchEvents = await prisma.siteEvent.findMany({
    where: { type: 'search', createdAt: { gte: from, lte: to } },
    select: { metadata: true },
  })
  const searchMap = new Map<string, number>()
  searchEvents.forEach((e) => {
    const meta = e.metadata as Record<string, unknown> | null
    const q = ((meta?.query as string) ?? '').trim().toLowerCase()
    if (q.length >= 2) searchMap.set(q, (searchMap.get(q) ?? 0) + 1)
  })
  const topSearches = Array.from(searchMap.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const sourceEvents = await prisma.siteEvent.findMany({
    where: {
      type: { in: ['whatsapp_click_single', 'whatsapp_click_cart'] },
      createdAt: { gte: from, lte: to },
    },
    select: { type: true, metadata: true },
  })
  const sourceMap = new Map<string, number>()
  sourceEvents.forEach((e) => {
    let source: string
    if (e.type === 'whatsapp_click_cart') source = 'cart'
    else {
      const meta = e.metadata as Record<string, unknown> | null
      source = (meta?.source as string) || 'unknown'
    }
    sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1)
  })
  const sources = Array.from(sourceMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)

  return {
    month: format(monthDate, 'yyyy-MM'),
    monthLabel: format(monthDate, "MMMM 'de' yyyy", { locale: ptBR }),
    ...current,
    variations: {
      visitors: calculateVariation(current.visitors, previous.visitors),
      pageViews: calculateVariation(current.pageViews, previous.pageViews),
      whatsappClicks: calculateVariation(
        current.whatsappClicks,
        previous.whatsappClicks,
      ),
      cartAdds: calculateVariation(current.cartAdds, previous.cartAdds),
      newReviews: calculateVariation(current.newReviews, previous.newReviews),
      conversionRate: calculateVariation(
        Math.round(current.conversionRate * 100),
        Math.round(previous.conversionRate * 100),
      ),
    },
    topProducts,
    topSearches,
    sources,
  }
}
