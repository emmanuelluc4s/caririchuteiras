import type { Metadata } from 'next'
import { z } from 'zod'
import { requireRole } from '@/lib/admin/auth'
import { listAdminReviews } from '@/lib/queries/reviews'
import { AdminPageHeader } from '@/components/admin/layout/admin-page-header'
import { ReviewsModerationPanel } from '@/components/admin/reviews/reviews-moderation-panel'

export const metadata: Metadata = { title: 'Avaliações' }
export const dynamic = 'force-dynamic'

const ParamsSchema = z.object({
  q: z.string().optional(),
  status: z.enum(['pending', 'approved', 'all']).default('pending'),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  withImage: z.coerce.boolean().optional(),
  verified: z.enum(['all', 'yes', 'no']).default('all'),
  pagina: z.coerce.number().int().min(1).default(1),
})

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const admin = await requireRole(['admin', 'editor', 'viewer'])
  const sp = await searchParams

  const parsed = ParamsSchema.parse({
    q: typeof sp.q === 'string' ? sp.q : undefined,
    status: typeof sp.status === 'string' ? sp.status : 'pending',
    rating: typeof sp.rating === 'string' ? sp.rating : undefined,
    withImage: typeof sp.withImage === 'string' ? sp.withImage : undefined,
    verified: typeof sp.verified === 'string' ? sp.verified : 'all',
    pagina: typeof sp.pagina === 'string' ? sp.pagina : 1,
  })

  const result = await listAdminReviews(
    {
      search: parsed.q,
      status: parsed.status,
      rating: parsed.rating,
      withImage: parsed.withImage,
      verified: parsed.verified,
    },
    parsed.pagina,
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      <AdminPageHeader
        title="Avaliações"
        description="Modere as avaliações dos clientes antes de publicar"
      />

      <ReviewsModerationPanel
        items={result.items.map((r) => ({
          id: r.id,
          customerName: r.customerName,
          city: r.city,
          rating: r.rating,
          comment: r.comment,
          imageUrl: r.imageUrl,
          isApproved: r.isApproved,
          isVerifiedPurchase: r.isVerifiedPurchase,
          createdAt: r.createdAt,
          product: {
            id: r.product.id,
            slug: r.product.slug,
            name: r.product.name,
            brand: r.product.brand,
            imageUrl: r.product.images[0]?.urlThumb,
          },
        }))}
        stats={result.stats}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        userRole={admin.role}
      />
    </div>
  )
}
