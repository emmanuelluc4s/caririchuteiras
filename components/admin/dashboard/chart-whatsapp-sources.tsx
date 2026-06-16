'use client'

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'
import { Target } from 'lucide-react'
import type { SourceData } from '@/lib/admin/dashboard/types'

const COLORS = [
  '#6B1DFF',
  '#22C55E',
  '#3B82F6',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#8B5CF6',
  '#10B981',
  '#F97316',
  '#A855F7',
]

type Props = {
  data: SourceData[]
}

export function ChartWhatsappSources({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <article className="h-full rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
      <header className="mb-5 flex items-center gap-2">
        <Target className="h-4 w-4 text-neon" />
        <h2 className="font-display text-base uppercase tracking-tight">
          Origem dos cliques
        </h2>
      </header>

      {data.length === 0 ? (
        <div className="grid h-64 place-items-center text-center">
          <div>
            <Target className="mx-auto mb-2 h-10 w-10 text-gray-600" />
            <p className="text-sm text-gray-400">Sem cliques no período</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  strokeWidth={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-display text-2xl leading-none text-foreground">
                  {total}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">
                  Total
                </p>
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-1.5">
            {data.slice(0, 5).map((item, i) => {
              const percent = total > 0 ? (item.count / total) * 100 : 0
              return (
                <li
                  key={item.source}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="flex-1 truncate text-gray-100">
                    {item.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-gray-400">
                    {item.count}{' '}
                    <span className="text-gray-500">
                      ({percent.toFixed(0)}%)
                    </span>
                  </span>
                </li>
              )
            })}
            {data.length > 5 && (
              <li className="pt-1 text-[10px] italic text-gray-500">
                + {data.length - 5} outras origens
              </li>
            )}
          </ul>
        </>
      )}
    </article>
  )
}

type PieTooltipEntry = {
  value?: number | string
  payload?: SourceData
}

function CustomTooltip(props: {
  active?: boolean
  payload?: PieTooltipEntry[]
  total: number
}) {
  const { active, payload, total } = props
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]!
  const value = Number(item.value ?? 0)
  const percent = total > 0 ? (value / total) * 100 : 0
  const meta = item.payload
  return (
    <div className="rounded-md border border-border bg-bg-primary px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground">{meta?.label}</p>
      <p className="text-xs text-gray-400">
        <strong className="text-neon">{value}</strong> cliques (
        {percent.toFixed(1)}%)
      </p>
    </div>
  )
}
