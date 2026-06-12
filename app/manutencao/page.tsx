import Image from 'next/image'
import type { Metadata } from 'next'
import { Wrench, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSiteConfig } from '@/lib/site-config'
import { buildWhatsappUrl } from '@/lib/whatsapp/build-message'

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

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Em manutenção — Voltamos já',
  description: 'Estamos atualizando o site. Em breve estaremos de volta.',
  robots: { index: false, follow: false },
}

export default async function ManutencaoPage() {
  const config = await getSiteConfig()
  const customMessage = config.maintenanceMessage?.trim()

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary px-4 py-12">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="relative inline-block">
          <div
            className="absolute inset-0 animate-pulse rounded-full bg-neon/15 blur-3xl"
            aria-hidden="true"
          />
          <Image
            src="/escudo.svg"
            alt=""
            width={160}
            height={180}
            className="relative animate-pulse-neon"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-4 py-1.5">
          <Wrench className="h-4 w-4 animate-spin-slow text-warning" />
          <span className="text-xs font-semibold uppercase tracking-wider text-warning">
            Em manutenção
          </span>
        </div>

        <div className="space-y-4">
          <h1
            className="font-display text-5xl uppercase leading-tight tracking-tight md:text-7xl"
            style={{ textShadow: '0 0 24px rgba(107, 29, 255, 0.3)' }}
          >
            Voltamos <span className="text-neon">já já</span>
          </h1>

          {customMessage ? (
            <p className="mx-auto max-w-xl text-base leading-relaxed text-gray-100 md:text-lg">
              {customMessage}
            </p>
          ) : (
            <p className="mx-auto max-w-xl text-base leading-relaxed text-gray-100 md:text-lg">
              Estamos fazendo uns ajustes no site pra deixar tudo redondo. Mas
              o WhatsApp continua funcionando — fala com a gente!
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild variant="whatsapp" size="xl">
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

        <div className="border-t border-border pt-6">
          <p className="inline-flex items-center gap-2 text-xs text-gray-400">
            <MessageCircle className="h-3 w-3" />
            Cariri Chuteiras — atendimento sempre disponível
          </p>
        </div>
      </div>
    </main>
  )
}
