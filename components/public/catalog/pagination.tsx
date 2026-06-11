'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCatalogFilters } from '@/lib/catalog/use-filters'
import { cn } from '@/lib/utils'

type Props = {
  totalPages: number
  currentPage: number
}

export function Pagination({ totalPages, currentPage }: Props) {
  const { updateFilters } = useCatalogFilters()

  if (totalPages <= 1) return null

  function goToPage(page: number) {
    updateFilters({ page }, false)
    setTimeout(() => {
      document
        .getElementById('catalog-grid')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const pages = getPaginationItems(currentPage, totalPages)

  return (
    <nav
      role="navigation"
      aria-label="Paginação"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className="grid h-10 w-10 place-items-center rounded-md border border-border text-foreground transition-all hover:border-neon hover:text-neon disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) => {
        if (p === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-gray-400"
              aria-hidden="true"
            >
              …
            </span>
          )
        }
        const isActive = p === currentPage
        return (
          <button
            key={p}
            type="button"
            onClick={() => goToPage(p)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'h-10 min-w-10 rounded-md border px-3 text-sm font-semibold transition-all',
              isActive
                ? 'border-neon bg-neon text-white neon-glow-sm'
                : 'border-border text-foreground hover:border-neon hover:text-neon',
            )}
          >
            {p}
          </button>
        )
      })}

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
        className="grid h-10 w-10 place-items-center rounded-md border border-border text-foreground transition-all hover:border-neon hover:text-neon disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

/**
 * Total ≤ 7: mostrar todas
 * Total > 7: primeira, vizinhas da atual, última, com elipses
 */
function getPaginationItems(
  current: number,
  total: number,
): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const items: Array<number | 'ellipsis'> = []
  items.push(1)
  if (current > 4) items.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    items.push(i)
  }

  if (current < total - 3) items.push('ellipsis')
  items.push(total)

  return items
}
