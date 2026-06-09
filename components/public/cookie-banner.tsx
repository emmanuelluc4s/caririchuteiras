'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from '@/lib/cookies/use-cookie-consent'

export function CookieBanner() {
  const { consent, loaded, accept, reject } = useCookieConsent()

  if (!loaded || consent !== null) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-40 md:bottom-4 md:left-4 md:right-4 md:max-w-lg"
        role="dialog"
        aria-live="polite"
        aria-label="Aviso de cookies"
      >
        <div className="border-neon/40 bg-bg-secondary/95 neon-glow-sm relative m-3 rounded-lg border p-5 shadow-2xl backdrop-blur-md md:m-0">
          <button
            onClick={reject}
            aria-label="Fechar aviso"
            className="hover:text-foreground absolute right-3 top-3 rounded-full p-1 text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>

          <h3 className="font-display mb-2 text-lg uppercase tracking-wide">🍪 Cookies</h3>
          <p className="text-sm leading-relaxed text-gray-100">
            Usamos cookies para melhorar sua experiência e analisar o tráfego do site. Você pode
            aceitar todos ou apenas os essenciais. Saiba mais em nossa{' '}
            <Link href="/privacidade" className="text-neon underline-offset-4 hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button onClick={accept} size="sm" className="flex-1">
              Aceitar todos
            </Button>
            <Button onClick={reject} variant="outline" size="sm" className="flex-1">
              Apenas essenciais
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
