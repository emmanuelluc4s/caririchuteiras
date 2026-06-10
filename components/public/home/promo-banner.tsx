'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCountdown } from '@/lib/hooks/use-countdown'
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated'
import { useAnalytics } from '@/lib/analytics/use-analytics'

type Props = {
  validUntil: Date | string | null
  couponCode?: string | null
  headline?: string
  subheadline?: string
  ctaHref?: string
  ctaLabel?: string
  imageUrl?: string
}

export function PromoBanner({
  validUntil,
  couponCode,
  headline = 'PROMOÇÃO RELÂMPAGO',
  subheadline = 'Descontos exclusivos por tempo limitado',
  ctaHref = '/promocoes',
  ctaLabel = 'Ver promoções',
  imageUrl,
}: Props) {
  const countdown = useCountdown(validUntil)
  const hydrated = useHasHydrated()
  const { track } = useAnalytics()

  function handleCopyCode() {
    if (!couponCode) return
    navigator.clipboard.writeText(couponCode).catch(() => {})
    track('coupon_copy', { metadata: { code: couponCode, source: 'home-promo-banner' } })
    toast.success('Cupom copiado!', {
      description: `Use ${couponCode} no WhatsApp para aplicar o desconto`,
    })
  }

  // Esconder após hidratação se expirou (evita flash no SSR)
  if (hydrated && (countdown.expired || !validUntil)) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="border-neon/40 from-bg-secondary via-bg-primary to-bg-secondary neon-glow relative overflow-hidden rounded-2xl border-2 bg-gradient-to-r"
      >
        {imageUrl && (
          <div className="absolute inset-0 opacity-20" aria-hidden="true">
            <Image src={imageUrl} alt="" fill className="object-cover" sizes="100vw" />
            <div className="from-bg-primary via-bg-primary/80 to-bg-primary/40 absolute inset-0 bg-gradient-to-r" />
          </div>
        )}

        <div className="relative grid items-center gap-8 p-6 md:grid-cols-2 md:p-12">
          <div className="space-y-5">
            <div className="bg-neon/10 border-neon/30 inline-flex items-center gap-2 rounded-full border px-4 py-1.5">
              <Zap className="text-neon h-4 w-4" />
              <span className="text-neon text-xs font-semibold uppercase tracking-wider">
                Tempo limitado
              </span>
            </div>

            <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight md:text-5xl lg:text-6xl">
              {headline}
            </h2>

            <p className="text-base text-gray-100 md:text-lg">{subheadline}</p>

            {couponCode && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-gray-400">Cupom:</span>
                <button
                  onClick={handleCopyCode}
                  className="group border-neon bg-neon/5 text-neon hover:bg-neon/15 inline-flex items-center gap-2 rounded-md border-2 border-dashed px-4 py-2 font-mono font-bold transition-all"
                >
                  {couponCode}
                  <span className="text-[10px] uppercase tracking-wider opacity-70 group-hover:opacity-100">
                    clique p/ copiar
                  </span>
                </button>
              </div>
            )}

            <Button asChild size="lg">
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Contador */}
          <div className="space-y-4">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-gray-400 md:text-right">
              Termina em:
            </p>
            <div className="grid grid-cols-4 gap-2 md:gap-3" aria-live="polite">
              <CountdownBox value={hydrated ? countdown.days : 0} label="Dias" />
              <CountdownBox value={hydrated ? countdown.hours : 0} label="Horas" />
              <CountdownBox value={hydrated ? countdown.minutes : 0} label="Min" />
              <CountdownBox value={hydrated ? countdown.seconds : 0} label="Seg" pulse />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function CountdownBox({
  value,
  label,
  pulse,
}: {
  value: number
  label: string
  pulse?: boolean
}) {
  return (
    <div
      className={`border-neon/30 bg-bg-primary/80 rounded-lg border p-3 text-center backdrop-blur-sm md:p-4 ${
        pulse ? 'animate-pulse-neon' : ''
      }`}
    >
      <p className="font-display text-neon text-3xl leading-none tabular-nums md:text-5xl">
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400 md:text-xs">
        {label}
      </p>
    </div>
  )
}
