'use client'

import * as React from 'react'

/**
 * Retorna true apenas após o componente ter hidratado no cliente.
 * Use para evitar mismatch SSR/CSR ao renderizar estado vindo do localStorage
 * (cart-store, theme, cookie-consent, etc).
 */
export function useHasHydrated() {
  const [hydrated, setHydrated] = React.useState(false)
  React.useEffect(() => setHydrated(true), [])
  return hydrated
}
