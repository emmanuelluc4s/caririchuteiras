import type { Metadata } from 'next'
import { Sparkles } from 'lucide-react'
import { queryNewArrivals, getCategoryFacets } from '@/lib/queries/catalog'
import { parseFiltersFromSearchParams } from '@/lib/catalog/filters-parser'
import { toProductCardData } from '@/lib/types/product-card'
import { PageHero } from '@/components/public/static/page-hero'
import { FilterSidebar } from '@/components/public/catalog/filter-sidebar'
import { CatalogToolbar } from '@/components/public/catalog/catalog-toolbar'
import { ProductGrid } from '@/components/public/catalog/product-grid'
import { Pagination } from '@/components/public/catalog/pagination'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Novidades',
  description:
    'Confira os lançamentos da Cariri Chuteiras — chuteiras, tênis e camisas recém-chegadas.',
  alternates: { canonical: '/novidades' },
  openGraph: {
    title: 'Novidades — Cariri Chuteiras',
    description:
      'Os lançamentos mais recentes do catálogo, atualizados toda semana.',
    type: 'website',
    locale: 'pt_BR',
  },
}

type SearchParams = Record<string, string | string[] | undefined>

export default async function NovidadesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const filters = parseFiltersFromSearchParams(sp)

  const [catalog, facets] = await Promise.all([
    queryNewArrivals(filters),
    getCategoryFacets(),
  ])

  return (
    <>
      <PageHero
        eyebrow="Lançamentos"
        title={
          <>
            Acabou de <span className="text-neon">chegar</span>
          </>
        }
        description={
          <p>
            {catalog.total > 0
              ? `${catalog.total} produto${catalog.total !== 1 ? 's novos' : ' novo'} no catálogo. Os primeiros levam.`
              : 'Em breve mais novidades.'}
          </p>
        }
        icon={<Sparkles className="h-5 w-5 text-neon" />}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
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
      </div>
    </>
  )
}
