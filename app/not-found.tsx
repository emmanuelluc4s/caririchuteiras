import Link from 'next/link'
import Image from 'next/image'
import { Search, Home, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { buildWhatsappUrl } from '@/lib/whatsapp/build-message'
import { formatBRL } from '@/lib/utils'

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

const FUNNY_PHRASES = [
  'Esse produto driblou a gente',
  'A bola saiu pela linha de fundo',
  'Essa página tá fora de combate',
  'Faltou a chuteira certa pra essa página',
  'Aqui é fora de jogo',
]

async function getPopular() {
  try {
    return await prisma.product.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: [{ whatsappClicks: 'desc' }, { views: 'desc' }],
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
      },
    })
  } catch {
    return []
  }
}

function pickPhrase(): string {
  // Determinístico por hora — evita mismatch SSR/CSR
  const hourBucket = Math.floor(Date.now() / (1000 * 60 * 60))
  return FUNNY_PHRASES[hourBucket % FUNNY_PHRASES.length]!
}

export default async function NotFound() {
  const popularProducts = await getPopular()
  const phrase = pickPhrase()

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary px-4 py-12">
      <div className="w-full max-w-4xl space-y-10 md:space-y-12">
        <div className="space-y-6 text-center">
          <div className="relative inline-block">
            <div
              className="absolute inset-0 animate-pulse rounded-full bg-neon/20 blur-2xl"
              aria-hidden="true"
            />
            <Image
              src="/escudo.svg"
              alt=""
              width={140}
              height={160}
              className="relative animate-pulse-neon"
              priority
            />
          </div>

          <h1
            className="font-display text-7xl leading-none text-neon neon-text md:text-9xl"
            style={{ textShadow: '0 0 32px rgba(107, 29, 255, 0.6)' }}
          >
            404
          </h1>

          <div className="space-y-2">
            <h2 className="font-display text-2xl uppercase tracking-tight md:text-4xl">
              {phrase}
            </h2>
            <p className="mx-auto max-w-md text-sm text-gray-400 md:text-base">
              A página que você procura não existe ou foi removida. Mas a
              gente tem outras jogadas — confere abaixo.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="h-4 w-4" />
                Voltar para a home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/promocoes">
                Ver promoções
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="whatsapp" size="lg">
              <a
                href={buildWhatsappUrl({ items: [] })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {popularProducts.length > 0 && (
          <section className="space-y-5">
            <div className="space-y-1 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-neon">
                Talvez você goste destes
              </p>
              <h3 className="font-display text-2xl uppercase tracking-tight md:text-3xl">
                Os <span className="text-neon">queridinhos</span> da galera
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {popularProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/produto/${p.slug}`}
                  className="group overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-neon hover:neon-glow-sm"
                >
                  <div className="relative aspect-square bg-bg-tertiary">
                    {p.images[0] && (
                      <Image
                        src={p.images[0].urlMedium}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-neon">
                      {p.brand}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs font-medium transition-colors group-hover:text-neon">
                      {p.name}
                    </p>
                    <p className="mt-2 font-display text-base leading-none text-neon">
                      {formatBRL(Number(p.promoPrice ?? p.price))}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="pt-2 text-center">
          <Link
            href="/busca"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-neon"
          >
            <Search className="h-4 w-4" />
            Ou tenta buscar o que você procura
          </Link>
        </div>
      </div>
    </main>
  )
}
