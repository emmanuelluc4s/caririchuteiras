import type { EventType } from './event-types'

declare global {
  interface Window {
    fbq?: (
      action: 'init' | 'track' | 'trackCustom' | 'consent',
      ...args: unknown[]
    ) => void
    gtag?: (
      command: 'config' | 'event' | 'consent' | 'set',
      ...args: unknown[]
    ) => void
    dataLayer?: unknown[]
    clarity?: (action: string, ...args: unknown[]) => void
    _fbq?: unknown
  }
}

export type AnalyticsConfig = {
  metaPixelId: string | null
  ga4Id: string | null
  clarityId: string | null
  consentGiven: boolean
  isProduction: boolean
}

export type AnalyticsEventName = EventType

export type AnalyticsEventPayload = {
  productId?: string
  productName?: string
  productPrice?: number
  productSlug?: string
  brand?: string
  category?: string
  items?: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
  totalValue?: number
  query?: string
  source?: string
  metadata?: Record<string, unknown>
}

export {}
