import {
  startOfDay,
  endOfDay,
  subDays,
  eachDayOfInterval,
  format,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { type PeriodKey, type DateRange, PERIODS } from './types'

export function parsePeriod(periodKey: string | undefined): PeriodKey {
  if (PERIODS.some((p) => p.key === periodKey)) return periodKey as PeriodKey
  return '30d'
}

export function getDateRange(periodKey: PeriodKey): DateRange {
  const period = PERIODS.find((p) => p.key === periodKey)!
  const to = endOfDay(new Date())
  const from = startOfDay(subDays(new Date(), period.days - 1))
  return { from, to }
}

export function getPreviousRange(range: DateRange): DateRange {
  const durationMs = range.to.getTime() - range.from.getTime()
  return {
    from: new Date(range.from.getTime() - durationMs - 1),
    to: new Date(range.from.getTime() - 1),
  }
}

export function formatDateLabel(
  date: Date | string,
  periodKey: PeriodKey,
): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (periodKey === '7d' || periodKey === '30d') {
    return format(d, "d 'de' MMM", { locale: ptBR })
  }
  if (periodKey === '90d') {
    return format(d, 'd MMM', { locale: ptBR })
  }
  return format(d, 'MMM/yy', { locale: ptBR })
}

export function enumerateDays(range: DateRange): string[] {
  return eachDayOfInterval({ start: range.from, end: range.to }).map((d) =>
    format(d, 'yyyy-MM-dd'),
  )
}

export function calculateVariation(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export function formatVariationLabel(variation: number): string {
  if (variation === 0) return 'estável'
  if (variation > 0) return `+${variation}% vs anterior`
  return `${variation}% vs anterior`
}
