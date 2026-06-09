'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

type Props = {
  messages: string[]
  intervalMs?: number
}

export function PromoBar({ messages, intervalMs = 4000 }: Props) {
  const [index, setIndex] = React.useState(0)
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    const dismissedInSession = sessionStorage.getItem('cc-promo-dismissed')
    if (dismissedInSession === '1') setDismissed(true)
  }, [])

  React.useEffect(() => {
    if (dismissed || messages.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [dismissed, messages.length, intervalMs])

  function handleDismiss() {
    setDismissed(true)
    sessionStorage.setItem('cc-promo-dismissed', '1')
  }

  if (dismissed || messages.length === 0) return null

  return (
    <div
      className="relative w-full overflow-hidden text-center text-xs font-medium text-white md:text-sm"
      style={{
        background:
          'linear-gradient(90deg, var(--color-neon-dark) 0%, var(--color-bg-primary) 50%, var(--color-neon-dark) 100%)',
        height: 36,
      }}
      role="region"
      aria-label="Mensagens promocionais"
    >
      <div className="flex h-full items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="tracking-wide"
          >
            {messages[index]}
          </motion.span>
        </AnimatePresence>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Fechar barra promocional"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
