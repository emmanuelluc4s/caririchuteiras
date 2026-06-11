import { Search } from 'lucide-react'

type Props = {
  query: string
  total: number
}

export function SearchResultsHeader({ query, total }: Props) {
  return (
    <section className="relative w-full overflow-hidden border-b border-border bg-bg-secondary">
      <div
        className="pointer-events-none absolute -top-32 left-1/4"
        aria-hidden="true"
      >
        <div className="h-[300px] w-[300px] rounded-full bg-neon/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="flex items-start gap-3">
          <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-neon/30 bg-neon/10 sm:grid">
            <Search className="h-5 w-5 text-neon" />
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-neon">
              Resultados da busca
            </p>
            <h1 className="font-display text-3xl uppercase leading-tight tracking-tight md:text-5xl">
              Você buscou:{' '}
              <span className="text-neon">&ldquo;{query}&rdquo;</span>
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              {total === 0
                ? 'Nenhum produto encontrado'
                : `${total} produto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
