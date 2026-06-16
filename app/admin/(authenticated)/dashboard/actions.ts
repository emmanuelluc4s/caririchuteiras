'use server'

import Papa from 'papaparse'
import { format } from 'date-fns'
import { requireRole } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'
import { parsePeriod, getDateRange } from '@/lib/admin/dashboard/period'
import type { PeriodKey } from '@/lib/admin/dashboard/types'

type ExportResult =
  | { ok: true; csv: string; filename: string }
  | { ok: false; error: string }

export async function exportEventsAction(
  periodKey: PeriodKey,
): Promise<ExportResult> {
  try {
    await requireRole(['admin', 'editor'])
    const range = getDateRange(parsePeriod(periodKey))

    const events = await prisma.siteEvent.findMany({
      where: { createdAt: { gte: range.from, lte: range.to } },
      orderBy: { createdAt: 'desc' },
      take: 10_000,
    })

    const productIds = Array.from(
      new Set(events.map((e) => e.productId).filter((x): x is string => !!x)),
    )
    const products = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, slug: true },
        })
      : []
    const productMap = new Map(products.map((p) => [p.id, p]))

    const rows = events.map((e) => {
      const meta = (e.metadata as Record<string, unknown> | null) ?? {}
      const product = e.productId ? productMap.get(e.productId) : null
      return {
        Data: format(new Date(e.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        Tipo: e.type,
        Sessao: e.sessionId ?? '',
        Produto: product?.name ?? '',
        ProdutoSlug: product?.slug ?? '',
        Origem: (meta.source as string) ?? '',
        Termo: (meta.query as string) ?? '',
        Cidade: (meta.city as string) ?? '',
        UserAgent: e.userAgent ? e.userAgent.slice(0, 100) : '',
      }
    })

    const csv = Papa.unparse(rows, {
      delimiter: ';',
      header: true,
    })

    return {
      ok: true,
      csv,
      filename: `eventos_${periodKey}_${format(new Date(), 'yyyy-MM-dd')}.csv`,
    }
  } catch (error) {
    console.error('[exportEvents]', error)
    return { ok: false, error: 'Erro ao exportar eventos' }
  }
}

export async function exportLeadsAction(
  periodKey: PeriodKey,
): Promise<ExportResult> {
  try {
    await requireRole(['admin', 'editor'])
    const range = getDateRange(parsePeriod(periodKey))

    const leads = await prisma.whatsappLead.findMany({
      where: { createdAt: { gte: range.from, lte: range.to } },
      orderBy: { createdAt: 'desc' },
      take: 10_000,
    })

    const rows = leads.map((lead) => {
      const items =
        (lead.items as Array<Record<string, unknown>> | null) ?? []
      const totalValue = items.reduce((sum, item) => {
        return sum + Number(item.price ?? 0) * Number(item.quantity ?? 1)
      }, 0)
      const itemsNames = items
        .map(
          (i) =>
            `${i.productName ?? ''} (${i.color ?? ''}/${i.size ?? ''})`,
        )
        .join(' | ')

      return {
        Data: format(new Date(lead.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        Cliente: lead.customerName ?? '',
        Telefone: lead.customerPhone ?? '',
        Origem: lead.source ?? '',
        Itens: items.length,
        Produtos: itemsNames,
        ValorEstimado: totalValue.toFixed(2),
        Cupom: lead.couponCode ?? '',
      }
    })

    const csv = Papa.unparse(rows, {
      delimiter: ';',
      header: true,
    })

    return {
      ok: true,
      csv,
      filename: `leads_whatsapp_${periodKey}_${format(new Date(), 'yyyy-MM-dd')}.csv`,
    }
  } catch (error) {
    console.error('[exportLeads]', error)
    return { ok: false, error: 'Erro ao exportar leads' }
  }
}

export async function exportTopProductsAction(
  periodKey: PeriodKey,
): Promise<ExportResult> {
  try {
    await requireRole(['admin', 'editor'])
    const range = getDateRange(parsePeriod(periodKey))

    const viewEvents = await prisma.siteEvent.findMany({
      where: {
        type: 'product_view',
        createdAt: { gte: range.from, lte: range.to },
        productId: { not: null },
      },
      select: { productId: true },
    })
    const viewCount = new Map<string, number>()
    viewEvents.forEach((e) => {
      if (e.productId)
        viewCount.set(e.productId, (viewCount.get(e.productId) ?? 0) + 1)
    })

    const waEvents = await prisma.siteEvent.findMany({
      where: {
        type: { in: ['whatsapp_click_single', 'cart_add'] },
        createdAt: { gte: range.from, lte: range.to },
        productId: { not: null },
      },
      select: { productId: true },
    })
    const waCount = new Map<string, number>()
    waEvents.forEach((e) => {
      if (e.productId)
        waCount.set(e.productId, (waCount.get(e.productId) ?? 0) + 1)
    })

    const allIds = new Set<string>([...viewCount.keys(), ...waCount.keys()])
    if (allIds.size === 0) {
      const csv = Papa.unparse([], { delimiter: ';', header: true })
      return {
        ok: true,
        csv,
        filename: `top_produtos_${periodKey}_${format(new Date(), 'yyyy-MM-dd')}.csv`,
      }
    }

    const products = await prisma.product.findMany({
      where: { id: { in: Array.from(allIds) } },
      select: { id: true, name: true, sku: true, brand: true, slug: true },
    })

    const rows = products
      .map((p) => ({
        Produto: p.name,
        SKU: p.sku,
        Marca: p.brand,
        Slug: p.slug,
        Visualizacoes: viewCount.get(p.id) ?? 0,
        CliquesWhatsApp: waCount.get(p.id) ?? 0,
      }))
      .sort(
        (a, b) =>
          b.CliquesWhatsApp - a.CliquesWhatsApp ||
          b.Visualizacoes - a.Visualizacoes,
      )

    const csv = Papa.unparse(rows, {
      delimiter: ';',
      header: true,
    })

    return {
      ok: true,
      csv,
      filename: `top_produtos_${periodKey}_${format(new Date(), 'yyyy-MM-dd')}.csv`,
    }
  } catch (error) {
    console.error('[exportTopProducts]', error)
    return { ok: false, error: 'Erro ao exportar produtos' }
  }
}
