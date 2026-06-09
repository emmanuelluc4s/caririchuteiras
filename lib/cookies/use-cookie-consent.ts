'use client'

import * as React from 'react'

const STORAGE_KEY = 'cc-cookie-consent'
const MAX_AGE_MS = 6 * 30 * 24 * 60 * 60 * 1000 // 6 meses

export type ConsentValue = 'accepted' | 'essentials-only' | null

type StoredConsent = {
  value: ConsentValue
  timestamp: number
}

export function useCookieConsent() {
  const [consent, setConsent] = React.useState<ConsentValue>(null)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as StoredConsent
        const age = Date.now() - parsed.timestamp
        if (age < MAX_AGE_MS) {
          setConsent(parsed.value)
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch {
      // ignorar erros de parsing
    } finally {
      setLoaded(true)
    }
  }, [])

  function update(value: Exclude<ConsentValue, null>) {
    const payload: StoredConsent = { value, timestamp: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    setConsent(value)
  }

  return {
    consent,
    loaded,
    accept: () => update('accepted'),
    reject: () => update('essentials-only'),
  }
}
