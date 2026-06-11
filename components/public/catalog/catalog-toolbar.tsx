'use client'

import { FilterDrawer } from './filter-drawer'
import { SortDropdown } from './sort-dropdown'
import { ActiveFiltersBar } from './active-filters'
import type { CategoryFacets } from '@/lib/queries/catalog'

type Props = {
  facets: CategoryFacets
  total: number
}

export function CatalogToolbar({ facets, total }: Props) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="hidden text-sm text-gray-400 md:block">
          <strong className="text-foreground">{total}</strong> produto
          {total !== 1 ? 's' : ''}
        </p>

        <div className="flex flex-1 items-center gap-2 md:flex-initial">
          <div className="flex-1 md:hidden">
            <FilterDrawer facets={facets} />
          </div>
          <SortDropdown />
        </div>
      </div>

      <ActiveFiltersBar />
    </div>
  )
}
