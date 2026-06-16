'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { exportMonthlyReportAction } from '@/app/admin/(authenticated)/relatorios/actions'
import { cn } from '@/lib/utils'
import type { MonthlyReport } from '@/lib/admin/reports/queries'

type Props = {
  report: MonthlyReport
  availableMonths: Array<{ key: string; label: string }>
  currentMonth: string
  canExport: boolean
}

export function ReportView({
  report,
  availableMonths,
  currentMonth,
  canExport,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [exporting, setExporting] = React.useState(false)

  function changeMonth(monthKey: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (monthKey === availableMonths[0]?.key) params.delete('mes')
    else params.set('mes', monthKey)
    const q = params.toString()
    router.push(q ? `/admin/relatorios?${q}` : '/admin/relatorios')
  }

  async function handleExport() {
    setExporting(true)
    const toastId = toast.loading('Gerando CSV consolidado...')
    const result = await exportMonthlyReportAction(currentMonth)
    setExporting(false)
    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }
    const BOM = '﻿'
    const blob = new Blob([BOM + result.csv], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Relatório exportado!', { id: toastId })
  }

  const currentMonthLabel =
    availableMonths.find((m) => m.key === currentMonth)?.label ??
    report.monthLabel

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-bg-secondary px-4 text-sm transition-colors hover:border-neon"
            >
              <Calendar className="h-4 w-4 text-neon" />
              <span className="font-display uppercase tracking-tight">
                {currentMonthLabel}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 border-border bg-bg-secondary"
          >
            {availableMonths.map((m) => (
              <DropdownMenuItem
                key={m.key}
                onClick={() => changeMonth(m.key)}
                className={cn(
                  'cursor-pointer',
                  m.key === currentMonth &&
                    'bg-neon/10 text-neon focus:bg-neon/10 focus:text-neon',
                )}
              >
                {m.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {canExport && (
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Gerando...' : 'Exportar CSV completo'}
          </Button>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiBlock
          label="Visitantes"
          value={report.visitors}
          variation={report.variations.visitors}
        />
        <KpiBlock
          label="Page Views"
          value={report.pageViews}
          variation={report.variations.pageViews}
        />
        <KpiBlock
          label="Cliques WhatsApp"
          value={report.whatsappClicks}
          variation={report.variations.whatsappClicks}
        />
        <KpiBlock
          label="Conversão"
          value={`${report.conversionRate.toFixed(1)}%`}
          variation={report.variations.conversionRate}
        />
        <KpiBlock
          label="Carrinho"
          value={report.cartAdds}
          variation={report.variations.cartAdds}
        />
        <KpiBlock
          label="Avaliações"
          value={report.newReviews}
          variation={report.variations.newReviews}
        />
      </section>

      <Card title="Top 10 produtos">
        {report.topProducts.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Sem dados no período
          </p>
        ) : (
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="py-2 text-left text-[10px] uppercase tracking-wider text-gray-400">
                  #
                </th>
                <th className="py-2 text-left text-[10px] uppercase tracking-wider text-gray-400">
                  Produto
                </th>
                <th className="py-2 text-right text-[10px] uppercase tracking-wider text-gray-400">
                  Views
                </th>
                <th className="py-2 text-right text-[10px] uppercase tracking-wider text-gray-400">
                  WhatsApp
                </th>
              </tr>
            </thead>
            <tbody>
              {report.topProducts.map((p, i) => (
                <tr
                  key={p.productId}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-2 font-mono text-xs text-gray-400">
                    #{i + 1}
                  </td>
                  <td className="py-2 text-sm">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.brand}</p>
                  </td>
                  <td className="py-2 text-right text-sm tabular-nums">
                    {p.views}
                  </td>
                  <td className="py-2 text-right text-sm font-semibold tabular-nums text-success">
                    {p.whatsappClicks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Top termos buscados">
          {report.topSearches.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Sem buscas no período
            </p>
          ) : (
            <ol className="space-y-2">
              {report.topSearches.map((s, i) => (
                <li
                  key={s.query}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-center font-mono text-gray-400">
                      #{i + 1}
                    </span>
                    <code className="text-foreground">
                      &ldquo;{s.query}&rdquo;
                    </code>
                  </span>
                  <span className="font-semibold tabular-nums text-neon">
                    {s.count}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
        <Card title="Origem dos cliques WhatsApp">
          {report.sources.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Sem cliques no período
            </p>
          ) : (
            <ol className="space-y-2">
              {report.sources.map((s, i) => {
                const total = report.sources.reduce(
                  (sum, x) => sum + x.count,
                  0,
                )
                const pct = total > 0 ? (s.count / total) * 100 : 0
                return (
                  <li
                    key={s.source}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 text-center font-mono text-gray-400">
                        #{i + 1}
                      </span>
                      <span className="capitalize text-foreground">
                        {s.source}
                      </span>
                    </span>
                    <span className="tabular-nums">
                      <strong className="text-success">{s.count}</strong>{' '}
                      <span className="text-gray-500">
                        ({pct.toFixed(0)}%)
                      </span>
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </Card>
      </section>
    </div>
  )
}

function KpiBlock({
  label,
  value,
  variation,
}: {
  label: string
  value: number | string
  variation: number
}) {
  const isPositive = variation > 0
  const isNegative = variation < 0
  const formatted =
    typeof value === 'number' ? value.toLocaleString('pt-BR') : value
  return (
    <article className="rounded-lg border border-border bg-bg-secondary p-4">
      <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mb-1 font-display text-2xl leading-none tabular-nums text-foreground">
        {formatted}
      </p>
      <p
        className={cn(
          'inline-flex items-center gap-0.5 text-[10px] font-semibold',
          isPositive && 'text-success',
          isNegative && 'text-danger',
          !isPositive && !isNegative && 'text-gray-400',
        )}
      >
        {isPositive && <TrendingUp className="h-3 w-3" />}
        {isNegative && <TrendingDown className="h-3 w-3" />}
        {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
        {variation > 0 ? '+' : ''}
        {variation}% vs mês anterior
      </p>
    </article>
  )
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <article className="rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
      <header className="mb-4 border-b border-border pb-2">
        <h2 className="font-display text-base uppercase tracking-tight">
          {title}
        </h2>
      </header>
      {children}
    </article>
  )
}
