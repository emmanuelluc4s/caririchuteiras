'use server'

import Papa from 'papaparse'
import { format } from 'date-fns'
import { requireRole } from '@/lib/admin/auth'
import { listAuditEvents, type AuditFilters } from '@/lib/admin/audit/queries'

type ExportResult =
  | { ok: true; csv: string; filename: string }
  | { ok: false; error: string }

export async function exportAuditAction(
  filters: AuditFilters,
): Promise<ExportResult> {
  try {
    await requireRole(['admin'])

    type AuditItem = Awaited<ReturnType<typeof listAuditEvents>>['items'][number]
    const allItems: AuditItem[] = []
    let page = 1
    while (page <= 400) {
      const result = await listAuditEvents(filters, page)
      allItems.push(...result.items)
      if (page >= result.totalPages) break
      page++
      if (allItems.length >= 10_000) break
    }

    const rows = allItems.map((e) => ({
      Data: format(new Date(e.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      Acao: e.action,
      Admin: e.admin?.name ?? '(desconhecido)',
      AdminEmail: e.admin?.email ?? '',
      Metadados: JSON.stringify(e.metadata),
    }))

    const csv = Papa.unparse(rows, { delimiter: ';', header: true })

    return {
      ok: true,
      csv,
      filename: `auditoria_${format(new Date(), 'yyyy-MM-dd')}.csv`,
    }
  } catch (error) {
    console.error('[exportAudit]', error)
    return { ok: false, error: 'Erro ao exportar auditoria' }
  }
}
