'use client'

import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Kpi } from '@/lib/admin/dashboard/types'

type Props = {
  kpis: Kpi[]
}

export function KpiCards({ kpis }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>
    </TooltipProvider>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const variation = kpi.variation ?? 0
  const isPositive = variation > 0
  const isNegative = variation < 0
  const isFlat = variation === 0

  return (
    <article className="rounded-lg border border-border bg-bg-secondary p-4 transition-all hover:border-neon/30">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="truncate text-[10px] uppercase tracking-wider text-gray-400">
          {kpi.label}
        </p>
        {kpi.helpText && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`Sobre: ${kpi.label}`}
                className="shrink-0 text-gray-500 transition-colors hover:text-foreground"
              >
                <Info className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{kpi.helpText}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="mb-1 font-display text-2xl leading-none tabular-nums text-foreground md:text-3xl">
        {kpi.formatted}
      </p>
      {kpi.variationLabel && (
        <p
          className={cn(
            'inline-flex items-center gap-0.5 text-[10px] font-semibold',
            isPositive && 'text-success',
            isNegative && 'text-danger',
            isFlat && 'text-gray-400',
          )}
        >
          {isPositive && <TrendingUp className="h-3 w-3" />}
          {isNegative && <TrendingDown className="h-3 w-3" />}
          {isFlat && <Minus className="h-3 w-3" />}
          {kpi.variationLabel}
        </p>
      )}
    </article>
  )
}
