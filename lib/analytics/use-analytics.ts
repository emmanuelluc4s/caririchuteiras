'use client'

import * as React from 'react'
import type { TrackPayload, EventType } from './event-types'
import { getDeviceType } from './session'
import { trackMetaPixelEvent } from './meta-pixel'
import { trackGA4Event } from './ga4'
import type { AnalyticsEventPayload } from './types'

type TrackOptions = Omit<TrackPayload, 'type'> & {
  productName?: string
  productPrice?: number
  brand?: string
  category?: string
  source?: string
  query?: string
  totalValue?: number
}

function isDebug(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('debug')
}

/**
 * Hook centralizado para disparar eventos de tracking.
 * Dispara em paralelo para 3 destinos:
 *   1. Banco interno via POST /api/track (fire-and-forget, keepalive)
 *   2. Meta Pixel (se configurado e consentido)
 *   3. Google Analytics 4 (se configurado e consentido)
 *
 * Microsoft Clarity só grava sessão (não recebe eventos).
 *
 * Características:
 *  - fire-and-forget (nunca bloqueia UX)
 *  - falha silenciosa em erro
 *  - debug via ?debug na URL
 */
export function useAnalytics() {
  const track = React.useCallback((type: EventType, options: TrackOptions = {}) => {
    const {
      productName,
      productPrice,
      brand,
      category,
      source,
      query,
      totalValue,
      items,
      ...rest
    } = options

    const debug = isDebug()
    if (debug) {
      console.log('[analytics]', type, {
        productId: rest.productId,
        productName,
        productPrice,
        brand,
        source,
        query,
        items,
        totalValue,
      })
    }

    // 1) Backend interno (banco)
    const internalPayload: TrackPayload = {
      type,
      productId: rest.productId,
      items,
      couponCode: rest.couponCode,
      metadata: {
        ...(rest.metadata ?? {}),
        ...(source ? { source } : {}),
        ...(query ? { query } : {}),
        ...(totalValue ? { totalValue } : {}),
        device: getDeviceType(),
        timestamp: Date.now(),
      },
    }

    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(internalPayload),
        keepalive: true,
      }).catch(() => {
        // falha silenciosa — tracking nunca bloqueia UX
      })
    } catch {
      // falha silenciosa
    }

    // 2) Meta + GA4 (payload enriquecido)
    const externalPayload: AnalyticsEventPayload = {
      productId: rest.productId,
      productName,
      productPrice,
      brand,
      category,
      source,
      query,
      totalValue,
      metadata: rest.metadata,
      items: items?.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity ?? 1,
        price: Number(i.promoPrice ?? i.price ?? 0),
      })),
    }

    try {
      trackMetaPixelEvent(type, externalPayload)
    } catch (err) {
      if (debug) console.error('[analytics] meta error:', err)
    }

    try {
      trackGA4Event(type, externalPayload)
    } catch (err) {
      if (debug) console.error('[analytics] ga4 error:', err)
    }
  }, [])

  return { track }
}
