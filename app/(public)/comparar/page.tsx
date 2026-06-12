import type { Metadata } from 'next'
import { Scale } from 'lucide-react'
import { getCompareProducts } from '@/lib/queries/compare'
import { COMPARE_MAX_ITEMS } from '@/lib/compare/types'
import { CompareTable } from '@/components/public/compare/compare-table'
import { CompareEmpty } from '@/components/public/compare/compare-empty'
import { CompareUrlSync } from '@/components/public/compare/compare-url-sync'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Comparar produtos',
  description: 'Compare até 4 produtos lado a lado na Cariri Chuteiras.',
  robots: { index: false, follow: true },
}

type SearchParams = Record<string, string | string[] | undefined>

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const idsParam = typeof sp.ids === 'string' ? sp.ids : ''
  const ids = idsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, COMPARE_MAX_ITEMS)

  const products = ids.length > 0 ? await getCompareProducts(ids) : []

  return (
    <>
      <CompareUrlSync />

      <section className="relative w-full overflow-hidden border-b border-border bg-bg-secondary">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <div className="h-[400px] w-[400px] rounded-full bg-neon/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          <div className="flex items-start gap-3">
            <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-neon/30 bg-neon/15 sm:grid">
              <Scale className="h-5 w-5 text-neon" />
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-neon">
                Comparador
              </p>
              <h1 className="font-display text-3xl uppercase leading-tight tracking-tight md:text-5xl">
                {products.length > 1 ? (
                  <>
                    Comparando{' '}
                    <span className="text-neon">
                      {products.length} produtos
                    </span>
                  </>
                ) : products.length === 1 ? (
                  <>Adicione mais produtos para comparar</>
                ) : (
                  <>Compare produtos lado a lado</>
                )}
              </h1>
              {products.length >= 1 && (
                <p className="mt-2 text-sm text-gray-400">
                  Itens em destaque com troféu são os melhores em cada critério
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {products.length === 0 ? (
          <CompareEmpty />
        ) : (
          <CompareTable products={products} />
        )}
      </div>
    </>
  )
}
