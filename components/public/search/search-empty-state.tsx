import Link from 'next/link'
import { SearchX, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

type Props = {
  query: string
  popularSearches: string[]
  categories: Array<{ slug: string; name: string }>
}

export function SearchEmptyState({
  query,
  popularSearches,
  categories,
}: Props) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
  const whatsappMsg = `Olá! Tô procurando "${query}" na Cariri Chuteiras mas não encontrei. Vocês têm algo parecido?`
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`

  return (
    <div className="space-y-8 px-4 py-12 text-center md:py-16">
      <div className="space-y-4">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-bg-secondary">
          <SearchX className="h-12 w-12 text-gray-600" />
        </div>
        <div className="mx-auto max-w-md space-y-2">
          <h2 className="font-display text-3xl uppercase tracking-tight">
            Nada por aqui
          </h2>
          <p className="text-sm text-gray-400">
            Não encontramos produtos para{' '}
            <strong className="text-foreground">
              &ldquo;{query}&rdquo;
            </strong>
            . Mas a gente pode ajudar a achar.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-md rounded-2xl border border-whatsapp/30 bg-whatsapp/5 p-6 md:p-8">
        <p className="mb-2 font-display text-xl uppercase tracking-tight">
          Fala com a gente!
        </p>
        <p className="mb-4 text-sm text-gray-100">
          Tem produtos que ainda não estão no site. Pergunta no WhatsApp que a
          gente acha pra você.
        </p>
        <Button asChild variant="whatsapp" size="lg" className="w-full">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="h-5 w-5" />
            Perguntar no WhatsApp
          </a>
        </Button>
      </div>

      {popularSearches.length > 0 && (
        <div className="mx-auto max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-neon">
            Que tal experimentar?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearches.slice(0, 6).map((term) => (
              <Link
                key={term}
                href={`/busca?q=${encodeURIComponent(term)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-foreground transition-all hover:border-neon hover:text-neon"
              >
                {term}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="mx-auto max-w-2xl space-y-3 pt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Ou navegue por categoria
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                className="text-sm text-gray-400 transition-colors hover:text-neon"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
