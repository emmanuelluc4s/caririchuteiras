'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Activity } from 'lucide-react'
import type { TimelinePoint } from '@/lib/admin/dashboard/types'

type Props = {
  data: TimelinePoint[]
}

export function ChartTraffic({ data }: Props) {
  const hasData = data.some((d) => d.visitors > 0 || d.whatsappClicks > 0)

  return (
    <article className="rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
      <header className="mb-5 flex items-center gap-2">
        <Activity className="h-4 w-4 text-neon" />
        <h2 className="font-display text-base uppercase tracking-tight">
          Tráfego e conversão
        </h2>
      </header>

      {hasData ? (
        <div className="-ml-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6B1DFF" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6B1DFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWhatsapp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(255 255 255 / 0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="rgb(255 255 255 / 0.4)"
                style={{ fontSize: '10px' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="rgb(255 255 255 / 0.4)"
                style={{ fontSize: '10px' }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="visitors"
                name="Visitantes"
                stroke="#6B1DFF"
                strokeWidth={2}
                fill="url(#colorVisitors)"
              />
              <Area
                type="monotone"
                dataKey="whatsappClicks"
                name="Cliques WhatsApp"
                stroke="#22C55E"
                strokeWidth={2}
                fill="url(#colorWhatsapp)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState />
      )}
    </article>
  )
}

type TooltipEntry = {
  dataKey: string | number
  name?: string
  value?: number | string
  color?: string
}

function CustomTooltip(props: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
}) {
  const { active, payload, label } = props
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-md border border-border bg-bg-primary px-3 py-2 shadow-lg">
      <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-400">
        {label}
      </p>
      {payload.map((entry) => (
        <p
          key={String(entry.dataKey)}
          className="flex items-center gap-1.5 text-xs"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground">
            {entry.name}: <strong>{entry.value}</strong>
          </span>
        </p>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="grid h-72 place-items-center text-center">
      <div>
        <Activity className="mx-auto mb-2 h-10 w-10 text-gray-600" />
        <p className="text-sm text-gray-400">Sem dados no período</p>
        <p className="mt-1 text-xs text-gray-500">
          Aguarde mais visitantes para ver gráficos
        </p>
      </div>
    </div>
  )
}
