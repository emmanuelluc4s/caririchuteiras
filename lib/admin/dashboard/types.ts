export type PeriodKey = '7d' | '30d' | '90d' | '365d'

export type DateRange = {
  from: Date
  to: Date
}

export type PeriodLabel = {
  key: PeriodKey
  label: string
  shortLabel: string
  days: number
}

export const PERIODS: PeriodLabel[] = [
  { key: '7d', label: 'Últimos 7 dias', shortLabel: '7d', days: 7 },
  { key: '30d', label: 'Últimos 30 dias', shortLabel: '30d', days: 30 },
  { key: '90d', label: 'Últimos 90 dias', shortLabel: '90d', days: 90 },
  { key: '365d', label: 'Últimos 12 meses', shortLabel: '12m', days: 365 },
]

export type Kpi = {
  label: string
  value: number
  formatted: string
  variation?: number
  variationLabel?: string
  helpText?: string
}

export type TimelinePoint = {
  date: string
  label: string
  visitors: number
  whatsappClicks: number
}

export type SourceData = {
  source: string
  count: number
  label: string
}

export type TopProductData = {
  productId: string
  name: string
  brand: string
  imageUrl?: string
  slug: string
  count: number
}

export type TopSearchData = {
  query: string
  count: number
}

export type RecentLead = {
  id: string
  customerName?: string | null
  customerPhone?: string | null
  itemsCount: number
  totalValue?: number | null
  source: string
  createdAt: Date
}
