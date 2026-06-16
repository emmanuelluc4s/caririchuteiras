import type { Metadata } from 'next'
import { z } from 'zod'
import { requireRole } from '@/lib/admin/auth'
import {
  listAuditEvents,
  getAuditFilterOptions,
} from '@/lib/admin/audit/queries'
import { AdminPageHeader } from '@/components/admin/layout/admin-page-header'
import { AuditList } from '@/components/admin/audit/audit-list'
import { AdminPagination } from '@/components/admin/shared/admin-pagination'

export const metadata: Metadata = { title: 'Auditoria' }
export const dynamic = 'force-dynamic'

const ParamsSchema = z.object({
  admin: z.string().optional(),
  acao: z.string().optional(),
  pagina: z.coerce.number().int().min(1).default(1),
})

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireRole(['admin'])
  const sp = await searchParams

  const parsed = ParamsSchema.parse({
    admin: typeof sp.admin === 'string' ? sp.admin : undefined,
    acao: typeof sp.acao === 'string' ? sp.acao : undefined,
    pagina: typeof sp.pagina === 'string' ? sp.pagina : 1,
  })

  const [result, filterOptions] = await Promise.all([
    listAuditEvents(
      { adminId: parsed.admin, action: parsed.acao },
      parsed.pagina,
    ),
    getAuditFilterOptions(),
  ])

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      <AdminPageHeader
        title="Auditoria"
        description={`${result.total} evento${result.total !== 1 ? 's' : ''} registrado${result.total !== 1 ? 's' : ''}`}
      />

      <AuditList
        items={result.items}
        admins={filterOptions.admins}
        availableActions={filterOptions.actions}
        currentFilters={{
          adminId: parsed.admin,
          action: parsed.acao,
        }}
      />

      <AdminPagination
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        baseHref="/admin/auditoria"
      />
    </div>
  )
}
