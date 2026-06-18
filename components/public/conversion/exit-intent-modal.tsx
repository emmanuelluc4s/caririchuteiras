'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Clock, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExitIntent } from '@/lib/hooks/use-exit-intent'
import { useCartStore } from '@/lib/whatsapp/cart-store'
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { buildWhatsappUrl } from '@/lib/whatsapp/build-message'

const SESSION_KEY = 'cc-exit-intent-shown'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

const DISABLED_PATHS = [
  '/admin',
  '/manutencao',
  '/privacidade',
  '/termos',
  '/comparar',
  '/contato',
]

export function ExitIntentModal() {
  const hydrated = useHasHydrated()
  const pathname = usePathname()
  const cartItems = useCartStore((s) => s.items)
  const openCart = useCartStore((s) => s.open)
  const { track } = useAnalytics()
  const [isOpen, setIsOpen] = React.useState(false)
  const [alreadyShown, setAlreadyShown] = React.useState(true)

  // Carrega flag de sessão APÓS hydrate (true como default evita flash inicial)
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setAlreadyShown(sessionStorage.getItem(SESSION_KEY) === '1')
    } catch {
      setAlreadyShown(false)
    }
  }, [])

  const disabled = React.useMemo(() => {
    if (!hydrated || alreadyShown || isOpen) return true
    if (DISABLED_PATHS.some((p) => pathname?.startsWith(p))) return true
    if (cartItems.length > 0) return true
    return false
  }, [hydrated, alreadyShown, isOpen, pathname, cartItems.length])

  const handleExit = React.useCallback(() => {
    setIsOpen(true)
    setAlreadyShown(true)
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {}
    track('exit_intent_shown', { metadata: { pathname } })
  }, [pathname, track])

  useExitIntent({ onExit: handleExit, disabled })

  function close() {
    setIsOpen(false)
  }

  function handleWhatsApp() {
    track('whatsapp_click_single', { metadata: { source: 'exit-intent' } })
    const url = buildWhatsappUrl({ items: [] })
    window.open(url, '_blank', 'noopener,noreferrer')
    close()
  }

  // Fecha com ESC
  React.useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  // Suppress unused warning
  void openCart

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 grid place-items-center bg-bg-primary/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-intent-title"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative w-full max-w-md rounded-2xl border border-neon/40 bg-bg-secondary p-6 md:p-8 neon-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-neon/20 blur-3xl"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-gray-400 transition-colors hover:bg-bg-tertiary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-whatsapp/30 bg-whatsapp/10 px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5 text-whatsapp" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-whatsapp">
                    Espera aí!
                  </span>
                </div>
                <h2
                  id="exit-intent-title"
                  className="font-display text-3xl uppercase leading-[0.95] tracking-tight md:text-4xl"
                >
                  Tá com dúvida? <br />
                  <span className="text-neon">Fala com a gente.</span>
                </h2>
                <p className="text-sm text-gray-100">
                  Atendimento direto pelo WhatsApp. Sem fila, sem robô, sem
                  enrolação. A gente te ajuda a achar o que tá procurando.
                </p>
              </div>

              <div className="space-y-2.5 py-2">
                <BenefitLine icon={<Clock className="h-4 w-4 text-neon" />}>
                  Resposta rápida no horário comercial
                </BenefitLine>
                <BenefitLine icon={<Truck className="h-4 w-4 text-neon" />}>
                  Entrega para todo o Brasil
                </BenefitLine>
                <BenefitLine icon={<Sparkles className="h-4 w-4 text-neon" />}>
                  Cupons exclusivos pra quem conversa
                </BenefitLine>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleWhatsApp}
                  variant="whatsapp"
                  size="lg"
                  className="w-full text-base"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Chamar no WhatsApp
                </Button>
                <button
                  type="button"
                  onClick={close}
                  className="block w-full py-2 text-center text-xs text-gray-400 transition-colors hover:text-foreground"
                >
                  Continuar navegando
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function BenefitLine({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-foreground">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-neon/20 bg-neon/10">
        {icon}
      </div>
      <span>{children}</span>
    </div>
  )
}
