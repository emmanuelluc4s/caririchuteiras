'use client'

import * as React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { MetaPixelScript } from './meta-pixel-script'
import { GA4Script } from './ga4-script'
import { ClarityScript } from './clarity-script'
import { metaPixelPageView } from '@/lib/analytics/meta-pixel'
import { ga4PageView } from '@/lib/analytics/ga4'

type Props = {
  metaPixelId: string | null
  ga4Id: string | null
  clarityId: string | null
  children: React.ReactNode
}

export function AnalyticsProvider(props: Props) {
  return (
    <React.Suspense fallback={props.children}>
      <AnalyticsProviderInner {...props} />
    </React.Suspense>
  )
}

const CONSENT_KEY = 'cc-cookie-consent'

function readConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { value?: string }
    return parsed.value === 'accepted'
  } catch {
    return false
  }
}

function AnalyticsProviderInner({
  metaPixelId,
  ga4Id,
  clarityId,
  children,
}: Props) {
  const [consentGiven, setConsentGiven] = React.useState(false)
  const [hydrated, setHydrated] = React.useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    setHydrated(true)
    setConsentGiven(readConsent())
  }, [])

  React.useEffect(() => {
    function handleConsentChange(e: Event) {
      const detail = (e as CustomEvent).detail
      if (detail === 'accepted') {
        setConsentGiven(true)
      } else if (detail === 'essentials-only' || detail === 'rejected') {
        const wasLoaded = typeof window !== 'undefined' && Boolean(window.fbq)
        setConsentGiven(false)
        if (wasLoaded) window.location.reload()
      }
    }
    window.addEventListener('cc-consent-changed', handleConsentChange)
    return () =>
      window.removeEventListener('cc-consent-changed', handleConsentChange)
  }, [])

  React.useEffect(() => {
    if (!consentGiven || !hydrated) return
    const fullPath =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    if (metaPixelId) metaPixelPageView()
    if (ga4Id) ga4PageView(fullPath, ga4Id)
  }, [pathname, searchParams, consentGiven, hydrated, metaPixelId, ga4Id])

  const isProduction = process.env.NODE_ENV === 'production'
  const shouldLoad = isProduction && consentGiven

  return (
    <>
      {shouldLoad && metaPixelId && (
        <MetaPixelScript pixelId={metaPixelId} enabled={true} />
      )}
      {shouldLoad && ga4Id && <GA4Script ga4Id={ga4Id} enabled={true} />}
      {shouldLoad && clarityId && (
        <ClarityScript clarityId={clarityId} enabled={true} />
      )}
      {children}
    </>
  )
}
