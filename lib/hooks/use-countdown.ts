'use client'

import * as React from 'react'

type Countdown = {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number // ms restantes
  expired: boolean
}

const EXPIRED: Countdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 0,
  expired: true,
}

/**
 * Contador regressivo até `targetDate`.
 * Atualiza a cada segundo. Retorna `expired: true` se já passou ou data nula.
 * Seguro para SSR: durante o primeiro render no servidor retorna zeros
 * (o componente consumidor deve usar useHasHydrated para esconder até montar).
 */
export function useCountdown(targetDate: Date | string | null): Countdown {
  const target = React.useMemo(() => {
    if (!targetDate) return null
    return typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  }, [targetDate])

  const calc = React.useCallback((): Countdown => {
    if (!target) return EXPIRED
    const total = target.getTime() - Date.now()
    if (total <= 0) return EXPIRED
    const seconds = Math.floor((total / 1000) % 60)
    const minutes = Math.floor((total / 1000 / 60) % 60)
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
    const days = Math.floor(total / (1000 * 60 * 60 * 24))
    return { days, hours, minutes, seconds, total, expired: false }
  }, [target])

  const [state, setState] = React.useState<Countdown>(() => calc())

  React.useEffect(() => {
    setState(calc())
    if (!target) return
    const id = setInterval(() => setState(calc()), 1000)
    return () => clearInterval(id)
  }, [calc, target])

  return state
}
