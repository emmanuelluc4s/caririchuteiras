'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { buildWhatsappUrl } from '@/lib/whatsapp/build-message'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

type Props = {
  storeHours?: string | null
  storeAddress?: string | null
}

export function WhatsappCtaBlock({ storeHours, storeAddress }: Props) {
  const { track } = useAnalytics()

  function handleClick() {
    track('whatsapp_click_single', { metadata: { source: 'home-cta-block' } })
  }

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20"
      aria-labelledby="cta-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="border-neon/40 from-bg-secondary via-bg-primary to-bg-secondary neon-glow relative overflow-hidden rounded-2xl border bg-gradient-to-br p-8 md:p-14"
      >
        <div className="bg-neon/15 pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-neon/10 pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl" />

        <div className="relative grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="space-y-5">
            <div className="bg-whatsapp/10 border-whatsapp/30 inline-flex items-center gap-2 rounded-full border px-4 py-1.5">
              <MessageCircle className="text-whatsapp h-4 w-4" />
              <span className="text-whatsapp text-xs font-semibold uppercase tracking-wider">
                Atendimento direto
              </span>
            </div>

            <h2
              id="cta-heading"
              className="font-display text-4xl uppercase leading-[0.95] tracking-tight md:text-6xl"
            >
              Não achou o que <br />
              procurava? <span className="text-neon">Fala com a gente.</span>
            </h2>

            <p className="max-w-xl text-base text-gray-100 md:text-lg">
              Atendemos direto pelo WhatsApp. Sem fila, sem robô, sem enrolação. A gente te
              ajuda a encontrar a chuteira certa, tira dúvidas sobre numeração, fala dos prazos
              e fecha o pedido na hora.
            </p>

            <div className="flex flex-wrap gap-3 text-sm text-gray-400">
              {storeHours && (
                <div className="inline-flex items-center gap-2">
                  <Clock className="text-neon h-4 w-4" />
                  <span className="whitespace-pre-line">{storeHours}</span>
                </div>
              )}
              {storeAddress && (
                <div className="inline-flex items-center gap-2">
                  <MapPin className="text-neon h-4 w-4" />
                  <span>{storeAddress}</span>
                </div>
              )}
            </div>

            <Button
              asChild
              size="xl"
              variant="whatsapp"
              onClick={handleClick}
              className="text-base"
            >
              <a
                href={buildWhatsappUrl({ items: [] })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Chamar no WhatsApp
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border-border bg-bg-primary/60 hover:border-neon/40 rounded-xl border p-6 text-center backdrop-blur-sm transition-colors">
              <p className="font-display text-neon text-5xl leading-none">+500</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-gray-400">
                Clientes felizes
              </p>
            </div>
            <div className="border-border bg-bg-primary/60 hover:border-neon/40 rounded-xl border p-6 text-center backdrop-blur-sm transition-colors">
              <p className="font-display text-neon text-5xl leading-none">6</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-gray-400">
                Marcas premium
              </p>
            </div>
            <div className="border-border bg-bg-primary/60 hover:border-neon/40 col-span-2 rounded-xl border p-6 text-center backdrop-blur-sm transition-colors">
              <p className="font-display text-neon text-3xl">Entrega para todo o Brasil</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-gray-400">
                Barbalha · Juazeiro · Crato · Missão Velha · Região
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
