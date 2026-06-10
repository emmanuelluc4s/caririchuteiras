'use client'

import * as React from 'react'
import type { TrackPayload, EventType } from './event-types'
import { getDeviceType } from './session'

type TrackOptions = Omit<TrackPayload, 'type'>

/**
 * Hook centralizado para disparar eventos de tracking.
 * No futuro (Módulo 17) também despacha para Meta Pixel, GA4, Clarity, PostHog.
 * Por enquanto: apenas POST /api/track interno.
 *
 * Características:
 *  - fire-and-forget (nunca bloqueia UX)
 *  - keepalive (entrega mesmo durante navegação/fechamento de aba)
 *  - falha silenciosa em erro
 */
export function useAnalytics() {
  const track = React.useCallback((type: EventType, options: TrackOptions = {}) => {
    const payload: TrackPayload = { type, ...options }
    const body = JSON.stringify({
      ...payload,
      metadata: {
        ...payload.metadata,
        device: getDeviceType(),
        timestamp: Date.now(),
      },
    })

    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {
        // falha silenciosa — tracking nunca bloqueia UX
      })
    } catch {
      // falha silenciosa
    }
  }, [])

  return { track }
}
