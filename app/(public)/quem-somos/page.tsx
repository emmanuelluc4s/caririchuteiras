import type { Metadata } from 'next'
import Link from 'next/link'
import { Trophy, Heart, Shield, Sparkles, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/public/static/page-hero'
import { getSiteConfig } from '@/lib/site-config'
import { buildWhatsappUrl } from '@/lib/whatsapp/build-message'
import { prisma } from '@/lib/prisma'

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

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Quem Somos',
  description:
    'Conheça a Cariri Chuteiras — a maior loja esportiva do Cariri, com chuteiras, tênis e camisas das melhores marcas. Atendimento personalizado pelo WhatsApp.',
  alternates: { canonical: '/quem-somos' },
  openGraph: {
    title: 'Quem Somos — Cariri Chuteiras',
    description:
      'A maior loja esportiva do Cariri. Conheça nossa história, valores e o time por trás da loja.',
    type: 'website',
    locale: 'pt_BR',
  },
}

const VALUES = [
  {
    icon: Heart,
    title: 'Atendimento humano',
    description:
      'Cada cliente fala direto com a gente no WhatsApp. Sem robô, sem espera, sem enrolação.',
  },
  {
    icon: Shield,
    title: 'Produto original',
    description:
      'Trabalhamos apenas com produtos 100% originais das melhores marcas esportivas do mercado.',
  },
  {
    icon: Trophy,
    title: 'Variedade premium',
    description:
      'Chuteiras Society, Campo, Futsal, tênis, camisas e tudo que o atleta precisa em um só lugar.',
  },
  {
    icon: Sparkles,
    title: 'Lançamentos sempre',
    description:
      'Coleções novas chegando toda semana. Você fica por dentro do que tá rolando no mundo esportivo.',
  },
]

async function countProducts(): Promise<number> {
  try {
    return await prisma.product.count({ where: { isActive: true } })
  } catch {
    return 0
  }
}

export default async function QuemSomosPage() {
  const [config, productsCount] = await Promise.all([
    getSiteConfig(),
    countProducts(),
  ])

  return (
    <>
      <PageHero
        eyebrow="Quem somos"
        title={
          <>
            A maior loja <br />
            <span className="text-neon">esportiva do Cariri</span>
          </>
        }
        description={
          <p>
            Há anos atendendo atletas, jogadores e apaixonados pelo esporte de
            Barbalha, Juazeiro, Crato e toda a região do Cariri. Nascemos
            pequenos e crescemos junto com a galera que joga bola, treina e
            veste a camisa do seu time.
          </p>
        }
        size="lg"
      />

      <section className="border-b border-border bg-bg-primary py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            <StatCard value="+500" label="Clientes felizes" />
            <StatCard
              value={productsCount > 0 ? String(productsCount) : '—'}
              label="Produtos no catálogo"
            />
            <StatCard value="6" label="Marcas premium" />
            <StatCard value="100%" label="Atendimento humano" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-20">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-neon">
            Nossa história
          </p>
          <h2 className="font-display text-3xl uppercase leading-tight tracking-tight md:text-5xl">
            Começamos com uma{' '}
            <span className="text-neon">paixão por bola</span>
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-gray-100 md:text-lg">
            <p>
              A Cariri Chuteiras nasceu da paixão pelo esporte e da vontade de
              levar o melhor do mundo esportivo para a nossa região. Começamos
              pequeno, atendendo amigos e jogadores locais — e fomos crescendo
              conforme a galera ia recomendando.
            </p>
            <p>
              Hoje somos referência no Cariri quando o assunto é{' '}
              <strong className="text-foreground">
                chuteira, tênis ou camisa de time
              </strong>
              . Trabalhamos com as principais marcas do mercado —{' '}
              <strong>Nike, Adidas, Puma, Penalty, Topper, Umbro</strong> —
              sempre com produto original e atendimento direto.
            </p>
            <p>
              Nosso modelo é simples:{' '}
              <strong className="text-neon">
                você escolhe pelo site, a gente atende no WhatsApp
              </strong>
              . Sem cadastro, sem ficha, sem complicação. Você manda o que
              quer, a gente fecha o pedido, combina entrega e pronto. Como se
              fosse na loja física, mas com a comodidade de ver tudo do celular.
            </p>
            <p>
              Atendemos toda a região do Cariri —{' '}
              <strong>
                Barbalha, Juazeiro do Norte, Crato, Missão Velha e cidades
                vizinhas
              </strong>
              . Combinamos a entrega no momento da conversa.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-bg-secondary py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-10 text-center md:mb-14">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-neon">
              Nossos valores
            </p>
            <h2 className="font-display text-3xl uppercase tracking-tight md:text-5xl">
              O que nos move <span className="text-neon">todo dia</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {VALUES.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="rounded-lg border border-border bg-bg-primary p-6 transition-all hover:border-neon/40 hover:neon-glow-sm"
                >
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg border border-neon/30 bg-neon/10">
                    <Icon className="h-6 w-6 text-neon" />
                  </div>
                  <h3 className="mb-2 font-display text-lg uppercase tracking-tight">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-100">
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-20">
        <div className="relative overflow-hidden rounded-2xl border border-neon/40 bg-bg-secondary p-8 text-center md:p-12 neon-glow">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-neon/15 blur-3xl" />

          <div className="relative space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-whatsapp/30 bg-whatsapp/10 px-4 py-1.5">
              <MessageCircle className="h-4 w-4 text-whatsapp" />
              <span className="text-xs font-semibold uppercase tracking-wider text-whatsapp">
                Vem conversar com a gente
              </span>
            </div>

            <h2 className="font-display text-3xl uppercase leading-tight tracking-tight md:text-5xl">
              Tá afim de conhecer <br />
              <span className="text-neon">nossas chuteiras?</span>
            </h2>

            <p className="mx-auto max-w-xl text-base text-gray-100 md:text-lg">
              Atendimento direto, sem fila e sem robô. A gente te ajuda a
              escolher e fecha o pedido na hora.
            </p>

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
              <Button asChild variant="outline" size="xl">
                <Link href="/">Ver catálogo</Link>
              </Button>
            </div>

            {config.storeHours && (
              <p className="pt-2 text-xs text-gray-400">
                Atendimento:{' '}
                <strong className="text-gray-100">{config.storeHours}</strong>
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-4xl leading-none text-neon neon-text md:text-6xl">
        {value}
      </p>
      <p className="mt-2 text-xs uppercase tracking-wider text-gray-400 md:text-sm">
        {label}
      </p>
    </div>
  )
}
