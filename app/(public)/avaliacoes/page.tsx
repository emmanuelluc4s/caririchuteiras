import type { Metadata } from 'next'
import { Star, MessageSquare } from 'lucide-react'
import { z } from 'zod'
import {
  getGlobalReviewStats,
  listReviews,
  type ReviewFilters,
} from '@/lib/queries/reviews'
import { PageHero } from '@/components/public/static/page-hero'
import { RatingDistribution } from '@/components/public/reviews/rating-distribution'
import { GlobalReviewsList } from '@/components/public/reviews/global-reviews-list'

export const dynamic = 'force-dynamic'
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Avaliações',
  description:
    'O que dizem sobre a Cariri Chuteiras — avaliações reais de clientes verificados, com fotos e detalhes.',
  alternates: { canonical: '/avaliacoes' },
  openGraph: {
    title: 'Avaliações — Cariri Chuteiras',
    description: 'Avaliações reais de clientes verificados.',
    type: 'website',
    locale: 'pt_BR',
  },
}

type SearchParams = Record<string, string | string[] | undefined>

const SearchParamsSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  withImage: z.coerce.boolean().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
})

export default async function AvaliacoesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const parsed = SearchParamsSchema.safeParse({
    rating: typeof sp.rating === 'string' ? sp.rating : undefined,
    withImage: sp.withImage === '1' || sp.withImage === 'true',
    verifiedOnly: sp.verifiedOnly === '1' || sp.verifiedOnly === 'true',
  })

  const filters: ReviewFilters = parsed.success ? parsed.data : {}

  const [stats, page1] = await Promise.all([
    getGlobalReviewStats(),
    listReviews(filters, 1),
  ])

  return (
    <>
      <PageHero
        eyebrow="Prova social"
        title={
          <>
            O que dizem <br />
            <span className="text-neon">sobre a gente</span>
          </>
        }
        description={
          stats.total > 0 ? (
            <p>
              <strong className="text-foreground">{stats.total}</strong>{' '}
              avaliaç{stats.total === 1 ? 'ão' : 'ões'} reais de clientes —{' '}
              <strong className="text-success">
                {stats.verifiedCount} verificadas
              </strong>{' '}
              e{' '}
              <strong className="text-foreground">
                {stats.withImageCount} com fotos
              </strong>
              .
            </p>
          ) : (
            <p>Ainda não temos avaliações. Seja o primeiro a avaliar!</p>
          )
        }
        icon={<MessageSquare className="h-5 w-5 text-neon" />}
        size="lg"
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-6 md:py-14">
        {stats.total === 0 ? (
          <div className="rounded-lg border border-border bg-bg-secondary p-12 text-center">
            <Star className="mx-auto mb-3 h-12 w-12 text-gray-600" />
            <p className="font-medium text-foreground">
              Ainda sem avaliações
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-400">
              Conforme nossos clientes forem avaliando seus produtos, essa
              página será preenchida com depoimentos reais.
            </p>
          </div>
        ) : (
          <>
            <section className="rounded-lg border border-border bg-bg-secondary p-6 md:p-8">
              <RatingDistribution
                distribution={stats.distribution}
                total={stats.total}
                average={stats.average}
              />
            </section>

            <GlobalReviewsList
              initialItems={page1.items.map((r) => {
                const withProduct = r as typeof r & {
                  product?: {
                    slug: string
                    name: string
                    brand: string
                    images: Array<{ urlThumb: string }>
                  }
                }
                const productData = withProduct.product
                  ? {
                      slug: withProduct.product.slug,
                      name: withProduct.product.name,
                      brand: withProduct.product.brand,
                      imageUrl: withProduct.product.images[0]?.urlThumb,
                    }
                  : undefined
                return {
                  id: r.id,
                  customerName: r.customerName,
                  city: r.city,
                  rating: r.rating,
                  comment: r.comment,
                  imageUrl: r.imageUrl,
                  isVerifiedPurchase: r.isVerifiedPurchase,
                  createdAt: r.createdAt,
                  product: productData,
                }
              })}
              initialTotalPages={page1.totalPages}
              initialFilters={filters}
            />
          </>
        )}
      </div>
    </>
  )
}
