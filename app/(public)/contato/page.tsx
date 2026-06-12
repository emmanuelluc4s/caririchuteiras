import type { Metadata } from 'next'
import { MessageCircle, MapPin, Clock, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/public/static/page-hero'
import { ContactForm } from '@/components/public/static/contact-form'
import { ContactMap } from '@/components/public/static/contact-map'
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

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.5a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.04z" />
    </svg>
  )
}

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Fale Conosco',
  description:
    'Entre em contato com a Cariri Chuteiras pelo WhatsApp, Instagram ou TikTok. Atendimento humano e direto.',
  alternates: { canonical: '/contato' },
  openGraph: {
    title: 'Fale Conosco — Cariri Chuteiras',
    description: 'WhatsApp, Instagram, TikTok e endereço da loja.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default async function ContatoPage() {
  const config = await getSiteConfig()

  return (
    <>
      <PageHero
        eyebrow="Fale conosco"
        title={
          <>
            A gente tá <span className="text-neon">aqui</span>
          </>
        }
        description={
          <p>
            Atendimento direto, sem fila, sem robô. Mande sua mensagem que a
            gente responde rapidinho.
          </p>
        }
        icon={<MessageCircle className="h-5 w-5 text-neon" />}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-16">
        <div className="mb-10 gap-6 rounded-2xl border border-whatsapp/30 bg-whatsapp/5 p-6 text-center md:mb-12 md:flex md:items-center md:justify-between md:p-8 md:text-left">
          <div>
            <h2 className="mb-2 font-display text-2xl uppercase tracking-tight md:text-3xl">
              Atendimento <span className="text-whatsapp">imediato</span>
            </h2>
            <p className="text-sm text-gray-100">
              Mande mensagem agora — respondemos em minutos no horário
              comercial.
            </p>
          </div>
          <Button
            asChild
            variant="whatsapp"
            size="xl"
            className="mt-4 shrink-0 md:mt-0"
          >
            <a
              href={buildWhatsappUrl({ items: [] })}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chamar agora
            </a>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-8">
            <ContactForm />

            <div className="space-y-3">
              <h2 className="font-display text-2xl uppercase tracking-tight">
                Outras <span className="text-neon">redes</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {config.instagramUrl && (
                  <a
                    href={config.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-lg border border-border bg-bg-secondary p-4 transition-all hover:border-neon hover:neon-glow-sm"
                  >
                    <InstagramIcon className="h-5 w-5 text-neon" />
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        Instagram
                      </p>
                      <p className="truncate text-sm font-medium transition-colors group-hover:text-neon">
                        Ver perfil
                      </p>
                    </div>
                  </a>
                )}
                {config.tiktokUrl && (
                  <a
                    href={config.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-lg border border-border bg-bg-secondary p-4 transition-all hover:border-neon hover:neon-glow-sm"
                  >
                    <TiktokIcon className="h-5 w-5 text-neon" />
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        TikTok
                      </p>
                      <p className="truncate text-sm font-medium transition-colors group-hover:text-neon">
                        Ver perfil
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <ContactMap
              embedUrl={config.googleMapsEmbed}
              address={config.storeAddress}
            />

            <div className="space-y-4">
              {config.storeAddress && (
                <InfoCard
                  icon={<MapPin className="h-5 w-5 text-neon" />}
                  label="Endereço"
                >
                  {config.storeAddress}
                </InfoCard>
              )}
              {config.storeHours && (
                <InfoCard
                  icon={<Clock className="h-5 w-5 text-neon" />}
                  label="Atendimento"
                >
                  <span className="whitespace-pre-line">
                    {config.storeHours}
                  </span>
                </InfoCard>
              )}
              <InfoCard
                icon={<Phone className="h-5 w-5 text-neon" />}
                label="WhatsApp"
              >
                <a
                  href={buildWhatsappUrl({ items: [] })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground transition-colors hover:text-neon"
                >
                  Iniciar conversa
                </a>
              </InfoCard>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-border bg-bg-secondary p-5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-neon/20 bg-neon/10">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <div className="mt-0.5 text-sm text-foreground">{children}</div>
      </div>
    </div>
  )
}
