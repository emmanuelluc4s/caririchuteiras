'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { UrgencyMessage } from '@/lib/product/urgency'

type Props = {
  messages: UrgencyMessage[]
  intervalMs?: number
}

export function UrgencyBanner({ messages, intervalMs = 8000 }: Props) {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    if (messages.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [messages.length, intervalMs])

  if (messages.length === 0) return null

  const current = messages[index]!

  return (
    <div
      className="overflow-hidden rounded-md border border-neon/30 bg-neon/5 px-4 py-2.5"
      aria-live="polite"
      aria-label="Informações de urgência"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex items-center gap-2 text-sm"
        >
          <span className="text-lg" aria-hidden="true">
            {current.icon}
          </span>
          <span className="text-foreground">
            <strong className="font-bold text-neon">{current.emphasis}</strong>{' '}
            {current.text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
