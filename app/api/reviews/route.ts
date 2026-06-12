import { NextResponse } from 'next/server'
import { z } from 'zod'
import { listReviews } from '@/lib/queries/reviews'

const QuerySchema = z.object({
  productId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  withImage: z.coerce.boolean().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
})

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const parsed = QuerySchema.safeParse({
      productId: url.searchParams.get('productId') ?? undefined,
      rating: url.searchParams.get('rating') ?? undefined,
      withImage: url.searchParams.get('withImage') ?? undefined,
      verifiedOnly: url.searchParams.get('verifiedOnly') ?? undefined,
      page: url.searchParams.get('page') ?? '1',
    })

    if (!parsed.success) {
      return NextResponse.json(
        { items: [], total: 0, totalPages: 1, currentPage: 1 },
        { status: 400 },
      )
    }

    const { page, ...filters } = parsed.data
    const result = await listReviews(filters, page)

    return NextResponse.json({
      items: result.items.map((r) => {
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
      }),
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    })
  } catch (error) {
    console.error('[reviews] error:', error)
    return NextResponse.json(
      { items: [], total: 0, totalPages: 1, currentPage: 1 },
      { status: 500 },
    )
  }
}
