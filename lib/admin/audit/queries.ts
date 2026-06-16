import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type AuditFilters = {
  adminId?: string
  action?: string
  fromDate?: Date
  toDate?: Date
}

export const AUDIT_PER_PAGE = 25

export async function listAuditEvents(
  filters: AuditFilters,
  page: number = 1,
) {
  const where: Prisma.SiteEventWhereInput = {
    type: 'admin_action',
  }

  if (filters.fromDate || filters.toDate) {
    where.createdAt = {}
    if (filters.fromDate) where.createdAt.gte = filters.fromDate
    if (filters.toDate) where.createdAt.lte = filters.toDate
  }

  if (filters.adminId && filters.action) {
    where.AND = [
      { metadata: { path: ['adminId'], equals: filters.adminId } },
      { metadata: { path: ['action'], equals: filters.action } },
    ]
  } else if (filters.adminId) {
    where.metadata = { path: ['adminId'], equals: filters.adminId }
  } else if (filters.action) {
    where.metadata = { path: ['action'], equals: filters.action }
  }

  const skip = (page - 1) * AUDIT_PER_PAGE

  const [items, total] = await Promise.all([
    prisma.siteEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: AUDIT_PER_PAGE,
    }),
    prisma.siteEvent.count({ where }),
  ])

  const adminIds = new Set<string>()
  items.forEach((e) => {
    const meta = e.metadata as Record<string, unknown> | null
    const adminId = meta?.adminId as string | undefined
    if (adminId) adminIds.add(adminId)
  })

  const admins = await prisma.adminUser.findMany({
    where: { id: { in: Array.from(adminIds) } },
    select: { id: true, name: true, email: true, avatarUrl: true },
  })
  const adminMap = new Map(admins.map((a) => [a.id, a]))

  return {
    items: items.map((e) => {
      const meta = (e.metadata as Record<string, unknown> | null) ?? {}
      const adminId = meta.adminId as string | undefined
      const admin = adminId ? (adminMap.get(adminId) ?? null) : null
      return {
        id: e.id,
        action: (meta.action as string) ?? 'unknown',
        admin,
        metadata: meta,
        createdAt: e.createdAt,
        sessionId: e.sessionId,
      }
    }),
    total,
    totalPages: Math.max(1, Math.ceil(total / AUDIT_PER_PAGE)),
    currentPage: page,
  }
}

export async function getAuditFilterOptions() {
  const admins = await prisma.adminUser.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true },
  })

  const recent = await prisma.siteEvent.findMany({
    where: { type: 'admin_action' },
    orderBy: { createdAt: 'desc' },
    take: 1000,
    select: { metadata: true },
  })
  const actions = new Set<string>()
  recent.forEach((e) => {
    const meta = e.metadata as Record<string, unknown> | null
    const action = meta?.action as string | undefined
    if (action) actions.add(action)
  })

  return {
    admins,
    actions: Array.from(actions).sort(),
  }
}
