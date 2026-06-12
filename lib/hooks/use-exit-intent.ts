'use client'

import * as React from 'react'

type Options = {
  /** Função chamada quando exit intent é detectado. */
  onExit: () => void
  /** Tempo de inatividade no mobile (ms) antes de disparar. Padrão: 30s. */
  mobileTimeoutMs?: number
  /** Atraso mínimo após mount antes de armar o handler (ms). Padrão: 5s. */
  armDelayMs?: number
  /** Se true, o handler é desabilitado. */
  disabled?: boolean
}

/**
 * Detecta intenção de saída:
 * - Desktop: mouse sai pela parte superior do viewport
 * - Mobile: 30s sem interação (touch, scroll, click)
 *
 * Não dispara mais de uma vez por mount.
 */
export function useExitIntent({
  onExit,
  mobileTimeoutMs = 30_000,
  armDelayMs = 5_000,
  disabled = false,
}: Options) {
  React.useEffect(() => {
    if (disabled || typeof window === 'undefined') return

    let armed = false
    let mobileTimeout: ReturnType<typeof setTimeout> | null = null
    let fired = false

    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window

    function scheduleMobileTimeout() {
      if (mobileTimeout) clearTimeout(mobileTimeout)
      mobileTimeout = setTimeout(fire, mobileTimeoutMs)
    }

    function arm() {
      armed = true
      if (isMobile) scheduleMobileTimeout()
    }

    function fire() {
      if (fired || !armed) return
      fired = true
      onExit()
    }

    function handleMouseLeave(e: MouseEvent) {
      if (!armed || isMobile) return
      // Só dispara se sair pela parte SUPERIOR
      if (e.clientY <= 5 && !e.relatedTarget) {
        fire()
      }
    }

    function handleMobileActivity() {
      if (!armed || !isMobile) return
      scheduleMobileTimeout()
    }

    const armTimeout = setTimeout(arm, armDelayMs)

    document.addEventListener('mouseleave', handleMouseLeave)
    if (isMobile) {
      window.addEventListener('touchstart', handleMobileActivity, {
        passive: true,
      })
      window.addEventListener('scroll', handleMobileActivity, { passive: true })
      window.addEventListener('click', handleMobileActivity)
    }

    return () => {
      clearTimeout(armTimeout)
      if (mobileTimeout) clearTimeout(mobileTimeout)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (isMobile) {
        window.removeEventListener('touchstart', handleMobileActivity)
        window.removeEventListener('scroll', handleMobileActivity)
        window.removeEventListener('click', handleMobileActivity)
      }
    }
  }, [onExit, mobileTimeoutMs, armDelayMs, disabled])
}
