'use client'

import type { AnalyticsEventName, AnalyticsEventPayload } from './types'

const EVENT_MAP: Partial<Record<AnalyticsEventName, string>> = {
  product_view: 'view_item',
  category_view: 'view_item_list',
  cart_add: 'add_to_cart',
  cart_remove: 'remove_from_cart',
  search: 'search',
  whatsapp_click_single: 'generate_lead',
  whatsapp_click_cart: 'generate_lead',
  exit_intent_shown: 'exit_intent',
  quick_view_open: 'quick_view',
  coupon_copy: 'select_promotion',
  compare_add: 'add_to_compare',
  share_click: 'share',
  hero_click: 'select_content',
  filter_apply: 'view_search_results',
  theme_toggle: 'theme_toggle',
}

export function trackGA4Event(
  eventName: AnalyticsEventName,
  payload: AnalyticsEventPayload = {},
): void {
  if (typeof window === 'undefined' || !window.gtag) return

  const ga4Event = EVENT_MAP[eventName]
  if (!ga4Event) return

  const params: Record<string, unknown> = {}

  if (payload.productId) {
    params.currency = 'BRL'
    params.value = payload.productPrice
    params.items = [
      {
        item_id: payload.productId,
        item_name: payload.productName,
        item_brand: payload.brand,
        item_category: payload.category,
        price: payload.productPrice,
        quantity: 1,
      },
    ]
  }

  if (payload.items && payload.items.length > 0) {
    params.currency = 'BRL'
    params.value = payload.totalValue
    params.items = payload.items.map((i) => ({
      item_id: i.productId,
      item_name: i.productName,
      price: i.price,
      quantity: i.quantity,
    }))
  }

  if (payload.query) {
    params.search_term = payload.query
  }

  if (payload.source) {
    params.source = payload.source
  }

  if (payload.metadata) {
    Object.assign(params, payload.metadata)
  }

  window.gtag('event', ga4Event, params)
}

export function ga4PageView(path: string, ga4Id: string): void {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('config', ga4Id, {
    page_path: path,
    anonymize_ip: true,
  })
}
