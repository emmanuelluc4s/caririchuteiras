import type { Metadata } from 'next'
import { Flame, Tag } from 'lucide-react'
import {
  queryPromoProducts,
  getActiveCoupons,
  getCategoryFacets,
} from '@/lib/queries/catalog'
import { parseFiltersFromSearchParams } from '@/lib/catalog/filters-parser'
import { toProductCardData } from '@/lib/types/product-card'
import { PageHero } from '@/components/public/static/page-hero'
import { CouponCard } from '@/components/public/static/coupon-card'
import { FilterSidebar } from '@/components/public/catalog/filter-sidebar'
import { CatalogToolbar } from '@/components/public/catalog/catalog-toolbar'
import { ProductGrid } from '@/components/public/catalog/product-grid'
import { Pagination } from '@/components/public/catalog/pagination'

export const dynamic = 'force-dynamic'
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Promoções',
  description:
    'Confira as ofertas e cupons ativos da Cariri Chuteiras. Descontos especiais nas melhores marcas esportivas com entrega para todo o Brasil.',
  alternates: { canonical: '/promocoes' },
  openGraph: {
    title: 'Promoções — Cariri Chuteiras',
    description: 'Cupons ativos e produtos em oferta. Aproveite enquanto durar.',
    type: 'website',
    locale: 'pt_BR',
  },
}

type SearchParams = Record<string, string | string[] | undefined>

export default async function PromocoesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const filters = parseFiltersFromSearchParams(sp)

  const [catalog, coupons, facets] = await Promise.all([
    queryPromoProducts(filters),
    getActiveCoupons(),
    getCategoryFacets(),
  ])

  return (
    <>
      <PageHero
        eyebrow="Promoções ativas"
        title={
          <>
            Tá rolando <span className="text-neon">muito desconto</span>
          </>
        }
        description={
          <p>
            {catalog.total > 0
              ? `${catalog.total} produto${catalog.total !== 1 ? 's' : ''} em oferta agora. Aproveita antes que acabe.`
              : 'Volte em breve para conferir nossas ofertas.'}
          </p>
        }
        icon={<Flame className="h-5 w-5 text-neon" />}
      />

      {coupons.length > 0 && (
        <section className="border-b border-border bg-bg-primary py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-6 md:mb-8">
              <div className="mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-neon" />
                <p className="text-xs uppercase tracking-[0.2em] text-neon">
                  Cupons ativos
                </p>
              </div>
              <h2 className="font-display text-3xl uppercase tracking-tight md:text-5xl">
                Códigos pra <span className="text-neon">economizar</span>
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Copie o cupom e mencione na conversa do WhatsApp — descontos
                aplicados na hora.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((c) => (
                <CouponCard
                  key={c.id}
                  code={c.code}
                  description={c.description}
                  discountType={c.discountType}
                  discountValue={Number(c.discountValue)}
                  validUntil={c.validUntil}
                />
              ))}
            </div>
          </div>
        </section>
      )}

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
