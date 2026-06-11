'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Tag,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import { useSearchModal } from '@/lib/search/search-modal-store'
import { useSearchHistory } from '@/lib/search/use-search-history'
import {
  useSearchSuggestions,
  highlightMatch,
  type SearchSuggestions,
} from '@/lib/search/use-search-suggestions'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { formatBRL } from '@/lib/utils'

type PopularProduct = {
  id: string
  slug: string
  name: string
  brand: string
  imageUrl?: string
  categoryName: string
}

type Props = {
  popularSearches: string[]
  popularProducts: PopularProduct[]
}

export function SearchModal({ popularSearches, popularProducts }: Props) {
  const isOpen = useSearchModal((s) => s.isOpen)
  const close = useSearchModal((s) => s.close)
  const router = useRouter()
  const [query, setQuery] = React.useState('')
  const {
    history,
    addTerm,
    removeTerm,
    clear: clearHistory,
    loaded,
  } = useSearchHistory()
  const { suggestions, loading } = useSearchSuggestions(query)
  const { track } = useAnalytics()

  const cleanQuery = query.trim()
  const hasQuery = cleanQuery.length >= 2

  React.useEffect(() => {
    if (isOpen) setQuery('')
  }, [isOpen])

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        useSearchModal.getState().toggle()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const submit = React.useCallback(
    (term: string) => {
      const cleaned = term.trim()
      if (cleaned.length < 2) return
      addTerm(cleaned)
      track('search', { metadata: { query: cleaned, source: 'modal' } })
      close()
      router.push(`/busca?q=${encodeURIComponent(cleaned)}`)
    },
    [addTerm, track, close, router],
  )

  function handleEnterKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && cleanQuery.length >= 2) {
      e.preventDefault()
      submit(cleanQuery)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => (o ? null : close())}>
      <DialogContent
        className="max-w-2xl gap-0 overflow-hidden border-border bg-bg-secondary p-0"
        aria-label="Buscar produtos"
      >
        <Command
          shouldFilter={false}
          className="bg-transparent [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-gray-400"
        >
          <div className="flex items-center border-b border-border px-4">
            <Search className="h-5 w-5 shrink-0 text-gray-400" />
            <CommandInput
              value={query}
              onValueChange={setQuery}
              onKeyDown={handleEnterKey}
              placeholder="Buscar chuteiras, marcas, categorias..."
              className="flex h-14 w-full border-0 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-gray-400"
              autoFocus
            />
            {loading && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neon" />
            )}
            {!loading && cleanQuery && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpar busca"
                className="rounded-md p-1 text-gray-400 transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="ml-2 hidden items-center gap-1 rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-gray-400 md:inline-flex">
              ESC
            </kbd>
          </div>

          <CommandList className="max-h-[60vh] overflow-y-auto p-2">
            {hasQuery ? (
              <SuggestionsView
                suggestions={suggestions}
                query={cleanQuery}
                loading={loading}
                onSearchAll={() => submit(cleanQuery)}
                onClose={close}
              />
            ) : (
              <EmptyView
                history={history}
                historyLoaded={loaded}
                onHistoryClick={submit}
                onHistoryRemove={removeTerm}
                onHistoryClear={clearHistory}
                popularSearches={popularSearches}
                onPopularClick={submit}
                popularProducts={popularProducts}
                onProductClick={close}
              />
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

/* ============================
   View vazia (sem query)
   ============================ */
function EmptyView({
  history,
  historyLoaded,
  onHistoryClick,
  onHistoryRemove,
  onHistoryClear,
  popularSearches,
  onPopularClick,
  popularProducts,
  onProductClick,
}: {
  history: string[]
  historyLoaded: boolean
  onHistoryClick: (term: string) => void
  onHistoryRemove: (term: string) => void
  onHistoryClear: () => void
  popularSearches: string[]
  onPopularClick: (term: string) => void
  popularProducts: PopularProduct[]
  onProductClick: () => void
}) {
  return (
    <>
      {historyLoaded && history.length > 0 && (
        <CommandGroup
          heading={
            <div className="flex items-center justify-between">
              <span>Buscas recentes</span>
              <button
                type="button"
                onClick={onHistoryClear}
                className="text-[10px] normal-case tracking-normal text-gray-400 hover:text-danger"
              >
                Limpar
              </button>
            </div>
          }
        >
          {history.map((term) => (
            <CommandItem
              key={term}
              value={`history-${term}`}
              onSelect={() => onHistoryClick(term)}
              className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-bg-tertiary"
            >
              <Clock className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="flex-1 truncate text-foreground">{term}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onHistoryRemove(term)
                }}
                aria-label={`Remover ${term} do histórico`}
                className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {popularSearches.length > 0 && (
        <>
          {history.length > 0 && (
            <CommandSeparator className="my-2 bg-border" />
          )}
          <CommandGroup heading="Buscas populares">
            <div className="flex flex-wrap gap-2 px-2 py-1">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onPopularClick(term)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-primary px-3 py-1.5 text-xs text-foreground transition-all hover:border-neon hover:text-neon"
                >
                  <TrendingUp className="h-3 w-3" />
                  {term}
                </button>
              ))}
            </div>
          </CommandGroup>
        </>
      )}

      {popularProducts.length > 0 && (
        <>
          <CommandSeparator className="my-2 bg-border" />
          <CommandGroup heading="Produtos populares">
            <div className="grid grid-cols-2 gap-2 px-2 sm:grid-cols-3">
              {popularProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/produto/${p.slug}`}
                  onClick={onProductClick}
                  className="group flex flex-col gap-1.5 rounded-md border border-border bg-bg-primary p-2 transition-all hover:border-neon"
                >
                  <div className="relative aspect-square overflow-hidden rounded-md bg-bg-tertiary">
                    {p.imageUrl && (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="160px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-neon">
                    {p.brand}
                  </p>
                  <p className="line-clamp-2 text-xs text-foreground transition-colors group-hover:text-neon">
                    {p.name}
                  </p>
                </Link>
              ))}
            </div>
          </CommandGroup>
        </>
      )}
    </>
  )
}

/* ============================
   View com sugestões (query ≥ 2 chars)
   ============================ */
function SuggestionsView({
  suggestions,
  query,
  loading,
  onSearchAll,
  onClose,
}: {
  suggestions: SearchSuggestions
  query: string
  loading: boolean
  onSearchAll: () => void
  onClose: () => void
}) {
  const router = useRouter()
  const hasAnything =
    suggestions.products.length > 0 ||
    suggestions.categories.length > 0 ||
    suggestions.brands.length > 0

  if (!hasAnything && !loading) {
    return (
      <CommandEmpty className="px-4 py-8 text-center">
        <p className="text-sm text-foreground">
          Nada encontrado para{' '}
          <strong className="text-neon">&ldquo;{query}&rdquo;</strong>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Tente termos mais gerais ou fale com a gente no WhatsApp.
        </p>
        <button
          type="button"
          onClick={onSearchAll}
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-neon hover:underline"
        >
          Buscar &ldquo;{query}&rdquo; mesmo assim
          <ArrowRight className="h-3 w-3" />
        </button>
      </CommandEmpty>
    )
  }

  function navigate(href: string) {
    onClose()
    router.push(href)
  }

  return (
    <>
      <CommandGroup heading="Pesquisar">
        <CommandItem
          value={`search-${query}`}
          onSelect={onSearchAll}
          className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm aria-selected:bg-bg-tertiary"
        >
          <Search className="h-4 w-4 shrink-0 text-neon" />
          <span className="flex-1">
            Buscar &ldquo;<strong className="text-neon">{query}</strong>&rdquo;
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
        </CommandItem>
      </CommandGroup>

      {suggestions.products.length > 0 && (
        <>
          <CommandSeparator className="my-2 bg-border" />
          <CommandGroup heading={`Produtos (${suggestions.products.length})`}>
            {suggestions.products.map((p) => (
              <CommandItem
                key={p.id}
                value={`product-${p.id}`}
                onSelect={() => navigate(`/produto/${p.slug}`)}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm aria-selected:bg-bg-tertiary"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-bg-tertiary">
                  {p.imageUrl && (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-neon">
                    {p.brand}
                  </p>
                  <p className="line-clamp-1 text-sm text-foreground">
                    {highlightMatch(p.name, query)}
                  </p>
                  <p className="truncate text-[10px] text-gray-400">
                    {p.categoryName}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {p.promoPrice && p.promoPrice < p.price && (
                    <p className="text-[10px] text-gray-600 line-through">
                      {formatBRL(p.price)}
                    </p>
                  )}
                  <p className="font-display text-base leading-none text-neon">
                    {formatBRL(p.promoPrice ?? p.price)}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      )}

      {suggestions.categories.length > 0 && (
        <>
          <CommandSeparator className="my-2 bg-border" />
          <CommandGroup heading="Categorias">
            {suggestions.categories.map((c) => (
              <CommandItem
                key={c.slug}
                value={`category-${c.slug}`}
                onSelect={() => navigate(`/categoria/${c.slug}`)}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-bg-tertiary"
              >
                <Tag className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="flex-1">{highlightMatch(c.name, query)}</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      )}

      {suggestions.brands.length > 0 && (
        <>
          <CommandSeparator className="my-2 bg-border" />
          <CommandGroup heading="Marcas">
            {suggestions.brands.map((b) => (
              <CommandItem
                key={b.value}
                value={`brand-${b.value}`}
                onSelect={() =>
                  navigate(`/busca?q=${encodeURIComponent(b.value)}`)
                }
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-bg-tertiary"
              >
                <Tag className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="flex-1">{highlightMatch(b.value, query)}</span>
                <span className="text-xs text-gray-400">
                  ({b.count} produtos)
                </span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      )}
    </>
  )
}
