const SESSION_COOKIE = 'cc-session'

/**
 * Lê o sessionId do cookie no browser.
 * Retorna null se não existir (será criado pelo /api/track no primeiro request).
 */
export function getClientSessionId(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))
  return match?.[1] ?? null
}

/**
 * Detecta tipo de dispositivo aproximado pelo viewport.
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}
