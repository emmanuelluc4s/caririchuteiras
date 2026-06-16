'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PERIODS, type PeriodKey } from '@/lib/admin/dashboard/types'
import { cn } from '@/lib/utils'

type Props = {
  currentPeriod: PeriodKey
}

export function PeriodSelector({ currentPeriod }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = PERIODS.find((p) => p.key === currentPeriod) ?? PERIODS[1]!

  function selectPeriod(key: PeriodKey) {
    const params = new URLSearchParams(searchParams.toString())
    if (key === '30d') params.delete('periodo')
    else params.set('periodo', key)
    const q = params.toString()
    router.push(q ? `/admin/dashboard?${q}` : '/admin/dashboard')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-bg-secondary px-3 text-sm transition-colors hover:border-neon"
        >
          <Calendar className="h-3.5 w-3.5 text-neon" />
          <span className="font-medium text-foreground">{current.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border-border bg-bg-secondary"
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-gray-400">
          Período
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {PERIODS.map((period) => (
          <DropdownMenuItem
            key={period.key}
            onClick={() => selectPeriod(period.key)}
            className={cn(
              'flex cursor-pointer items-center justify-between',
              period.key === currentPeriod &&
                'bg-neon/10 text-neon focus:bg-neon/10 focus:text-neon',
            )}
          >
            <span>{period.label}</span>
            <span className="text-[10px] text-gray-400">
              {period.shortLabel}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
