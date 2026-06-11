import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import {
  queryCatalogSearch,
  getSearchFacets,
  getActiveCategories,
} from '@/lib/queries/catalog'
import { getPopularSearches } from '@/lib/queries/search'
import { parseFiltersFromSearchParams } from '@/lib/catalog/filters-parser'
import { toProductCardData } from '@/lib/types/product-card'

import { SearchResultsHeader } from '@/components/public/search/search-results-header'
import { SearchEmptyState } from '@/components/public/search/search-empty-state'
import { SearchPageTracker } from '@/components/public/search/search-page-tracker'
import { FilterSidebar } from '@/components/public/catalog/filter-sidebar'
import { CatalogToolbar } from '@/components/public/catalog/catalog-toolbar'
import { ProductGrid } from '@/components/public/catalog/product-grid'
import { Pagination } from '@/components/public/catalog/pagination'

type SearchParams = Record<string, string | string[] | undefined>

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''
  if (!q) {
    return { title: 'Busca', robots: { index: false, follow: true } }
  }
  return {
    title: `Busca: ${q}`,
    description: `Resultados da busca por "${q}" na Cariri Chuteiras.`,
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const rawQuery = typeof sp.q === 'string' ? sp.q.trim() : ''

  if (rawQuery.length === 0) {
    redirect('/')
  }

  if (rawQuery.length < 2) {
    const [popularSearches, categories] = await Promise.all([
      getPopularSearches(6),
      getActiveCategories(),
    ])
    return (
      <>
        <SearchPageTracker query={rawQuery} total={0} />
        <SearchResultsHeader query={rawQuery} total={0} />
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <SearchEmptyState
            query={rawQuery}
            popularSearches={popularSearches}
            categories={categories.map((c) => ({
              slug: c.slug,
              name: c.name,
            }))}
          />
        </div>
      </>
    )
  }

  const filters = parseFiltersFromSearchParams(sp)

  const [catalog, facets, popularSearches, categories] = await Promise.all([
    queryCatalogSearch({ query: rawQuery, filters }),
    getSearchFacets(rawQuery),
    getPopularSearches(6),
    getActiveCategories(),
  ])

  const hasResults = catalog.total > 0

  return (
    <>
      <SearchPageTracker query={rawQuery} total={catalog.total} />
      <SearchResultsHeader query={rawQuery} total={catalog.total} />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {!hasResults ? (
          <SearchEmptyState
            query={rawQuery}
            popularSearches={popularSearches}
            categories={categories.map((c) => ({
              slug: c.slug,
              name: c.name,
            }))}
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <FilterSidebar facets={facets} />
              </div>
            </aside>

            <div id="catalog-grid">
              <CatalogToolbar facets={facets} total={catalog.total} />

              <ProductGrid
                products={catalog.products.map(toProductCardData)}
                total={catalog.total}
              />

              <Pagination
                totalPages={catalog.totalPages}
                currentPage={catalog.currentPage}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
