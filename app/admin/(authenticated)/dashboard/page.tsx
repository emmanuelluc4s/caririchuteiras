import type { Metadata } from 'next'
import { z } from 'zod'
import { requireRole } from '@/lib/admin/auth'
import {
  getKpis,
  getTimeline,
  getWhatsappSources,
  getTopViewedProducts,
  getTopWhatsappProducts,
  getTopSearches,
  getRecentLeads,
} from '@/lib/admin/dashboard/queries'
import {
  parsePeriod,
  getDateRange,
  getPreviousRange,
} from '@/lib/admin/dashboard/period'
import { AdminPageHeader } from '@/components/admin/layout/admin-page-header'
import { PeriodSelector } from '@/components/admin/dashboard/period-selector'
import { KpiCards } from '@/components/admin/dashboard/kpi-cards'
import { ChartTraffic } from '@/components/admin/dashboard/chart-traffic'
import { ChartWhatsappSources } from '@/components/admin/dashboard/chart-whatsapp-sources'
import { ChartTopProducts } from '@/components/admin/dashboard/chart-top-products'
import { ChartTopSearches } from '@/components/admin/dashboard/chart-top-searches'
import { RecentLeadsTable } from '@/components/admin/dashboard/recent-leads-table'
import { ExportButtons } from '@/components/admin/dashboard/export-buttons'

export const metadata: Metadata = { title: 'Analytics' }
export const dynamic = 'force-dynamic'

const ParamsSchema = z.object({
  periodo: z.string().optional(),
})

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const admin = await requireRole(['admin', 'editor', 'viewer'])
  const sp = await searchParams

  const parsed = ParamsSchema.parse({
    periodo: typeof sp.periodo === 'string' ? sp.periodo : undefined,
  })

  const periodKey = parsePeriod(parsed.periodo)
  const range = getDateRange(periodKey)
  const previousRange = getPreviousRange(range)

  const [
    kpis,
    timeline,
    sources,
    topViewed,
    topWhatsapp,
    topSearches,
    recentLeads,
  ] = await Promise.all([
    getKpis(range, previousRange),
    getTimeline(range, periodKey),
    getWhatsappSources(range),
    getTopViewedProducts(range),
    getTopWhatsappProducts(range),
    getTopSearches(range),
    getRecentLeads(range),
  ])

  const canExport = admin.role === 'admin' || admin.role === 'editor'

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      <AdminPageHeader
        title="Analytics"
        description="Visão geral de tráfego, conversão e desempenho"
        action={
          <div className="flex items-center gap-2">
            {canExport && <ExportButtons periodKey={periodKey} />}
            <PeriodSelector currentPeriod={periodKey} />
          </div>
        }
      />

      <KpiCards kpis={kpis} />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartTraffic data={timeline} />
        </div>
        <div className="lg:col-span-1">
          <ChartWhatsappSources data={sources} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartTopProducts
          title="Mais Visualizados"
          description="Produtos com mais visualizações na página"
          data={topViewed}
          metricLabel="visualizações"
        />
        <ChartTopProducts
          title="Mais Cliques WhatsApp"
          description="Produtos que mais geraram leads"
          data={topWhatsapp}
          metricLabel="cliques"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartTopSearches data={topSearches} />
        <RecentLeadsTable leads={recentLeads} />
      </section>
    </div>
  )
}
