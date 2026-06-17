'use client'

import type { AnalyticsEventName, AnalyticsEventPayload } from './types'

const STANDARD_EVENTS: Partial<Record<AnalyticsEventName, string>> = {
  product_view: 'ViewContent',
  cart_add: 'AddToCart',
  search: 'Search',
  whatsapp_click_single: 'Lead',
  whatsapp_click_cart: 'Lead',
}

const CUSTOM_EVENTS: Partial<Record<AnalyticsEventName, string>> = {
  cart_remove: 'RemoveFromCart',
  exit_intent_shown: 'ExitIntent',
  quick_view_open: 'QuickView',
  category_view: 'ViewCategory',
  coupon_copy: 'CouponCopy',
  compare_add: 'CompareAdd',
  share_click: 'Share',
}

export function trackMetaPixelEvent(
  eventName: AnalyticsEventName,
  payload: AnalyticsEventPayload = {},
): void {
  if (typeof window === 'undefined' || !window.fbq) return

  const params: Record<string, unknown> = {}

  if (payload.productId) {
    params.content_ids = [payload.productId]
    params.content_type = 'product'
    params.content_name = payload.productName
    params.value = payload.productPrice
    params.currency = 'BRL'
  }

  if (payload.items && payload.items.length > 0) {
    params.content_ids = payload.items.map((i) => i.productId)
    params.content_type = 'product'
    params.contents = payload.items.map((i) => ({
      id: i.productId,
      quantity: i.quantity,
      item_price: i.price,
    }))
    params.value = payload.totalValue
    params.currency = 'BRL'
    params.num_items = payload.items.length
  }

  if (payload.query) {
    params.search_string = payload.query
  }

  const standard = STANDARD_EVENTS[eventName]
  if (standard) {
    window.fbq('track', standard, params)
    return
  }

  const custom = CUSTOM_EVENTS[eventName]
  if (custom) {
    window.fbq('trackCustom', custom, params)
  }
}

export function metaPixelPageView(): void {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', 'PageView')
}
