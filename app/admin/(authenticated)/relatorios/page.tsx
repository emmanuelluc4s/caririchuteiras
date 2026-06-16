import type { Metadata } from 'next'
import { z } from 'zod'
import { requireRole } from '@/lib/admin/auth'
import {
  getAvailableMonths,
  getMonthlyReport,
  parseMonth,
} from '@/lib/admin/reports/queries'
import { AdminPageHeader } from '@/components/admin/layout/admin-page-header'
import { ReportView } from '@/components/admin/reports/report-view'

export const metadata: Metadata = { title: 'Relatórios' }
export const dynamic = 'force-dynamic'

const ParamsSchema = z.object({
  mes: z.string().optional(),
})

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const admin = await requireRole(['admin', 'editor', 'viewer'])
  const sp = await searchParams

  const parsed = ParamsSchema.parse({
    mes: typeof sp.mes === 'string' ? sp.mes : undefined,
  })

  const monthDate = parseMonth(parsed.mes)
  const [report, availableMonths] = await Promise.all([
    getMonthlyReport(monthDate),
    Promise.resolve(getAvailableMonths()),
  ])

  const canExport = admin.role === 'admin' || admin.role === 'editor'

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      <AdminPageHeader
        title="Relatórios"
        description="Snapshot mensal consolidado com comparativos"
      />
      <ReportView
        report={report}
        availableMonths={availableMonths}
        currentMonth={report.month}
        canExport={canExport}
      />
    </div>
  )
}
