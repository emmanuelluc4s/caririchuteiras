'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  serializeFiltersToSearchParams,
  parseFiltersFromSearchParams,
} from './filters-parser'
import type { CatalogFilters } from './filters-schema'
import { useAnalytics } from '@/lib/analytics/use-analytics'

/**
 * Hook que sincroniza filtros com a URL.
 * Mudanças disparam navegação sem reload via router.replace + useTransition.
 */
export function useCatalogFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { track } = useAnalytics()
  const [isPending, startTransition] = React.useTransition()

  const currentFilters = React.useMemo(() => {
    const obj: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      obj[key] = value
    })
    return parseFiltersFromSearchParams(obj)
  }, [searchParams])

  const updateFilters = React.useCallback(
    (partial: Partial<CatalogFilters>, resetPage = true) => {
      const merged: CatalogFilters = {
        ...currentFilters,
        ...partial,
        page:
          resetPage && partial.page === undefined
            ? 1
            : (partial.page ?? currentFilters.page),
      }

      const params = serializeFiltersToSearchParams(merged)
      const query = params.toString()

      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        })
      })

      // Tracking apenas para mudanças de filtro reais (não para paginação)
      if (partial.page === undefined) {
        track('filter_apply', {
          metadata: {
            brands: merged.brands,
            colors: merged.colors,
            sizes: merged.sizes,
            minPrice: merged.minPrice,
            maxPrice: merged.maxPrice,
            onlyPromo: merged.onlyPromo,
            onlyNew: merged.onlyNew,
            sort: merged.sort,
          },
        })
      }
    },
    [currentFilters, pathname, router, track],
  )

  const clearAll = React.useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }, [pathname, router])

  return {
    filters: currentFilters,
    updateFilters,
    clearAll,
    isPending,
  }
}
