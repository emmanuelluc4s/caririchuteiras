import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  queryCatalog,
  getCategoryFacets,
  getCategoryBySlug,
  getCategorySlugsForStaticGeneration,
} from '@/lib/queries/catalog'
import { parseFiltersFromSearchParams } from '@/lib/catalog/filters-parser'
import { toProductCardData } from '@/lib/types/product-card'

import { CategoryHero } from '@/components/public/catalog/category-hero'
import { FilterSidebar } from '@/components/public/catalog/filter-sidebar'
import { CatalogToolbar } from '@/components/public/catalog/catalog-toolbar'
import { ProductGrid } from '@/components/public/catalog/product-grid'
import { Pagination } from '@/components/public/catalog/pagination'
import { JsonLd } from '@/components/seo/json-ld'
import { getBreadcrumbSchema } from '@/lib/seo/structured-data'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cariri-chuteiras.vercel.app'

export const revalidate = 3600

export async function generateStaticParams() {
  return getCategorySlugsForStaticGeneration()
}

type Params = { slug: string }
type SearchParams = Record<string, string | string[] | undefined>

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Categoria não encontrada' }

  const title = category.metaTitle ?? `${category.name} — Cariri Chuteiras`
  const description =
    category.metaDescription ??
    `Confira ${category.name} disponíveis na Cariri Chuteiras. Marcas premium, entrega para todo o Brasil, atendimento direto no WhatsApp.`

  return {
    title,
    description,
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
      siteName: 'Cariri Chuteiras',
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) {
  const { slug } = await params
  const sp = await searchParams

  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const filters = parseFiltersFromSearchParams(sp)

  const [catalog, facets] = await Promise.all([
    queryCatalog({ categorySlug: slug, filters }),
    getCategoryFacets(slug),
  ])

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Início', url: SITE_URL },
    {
      name: category.name,
      url: `${SITE_URL}/categoria/${category.slug}`,
    },
  ])

  return (
    <>
      <JsonLd data={breadcrumbSchema} id="schema-breadcrumb-category" />
      <CategoryHero
        name={category.name}
        productsCount={catalog.total}
        image={category.imageUrl}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
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
