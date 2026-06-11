import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const QuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
})

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const parsed = QuerySchema.safeParse({ q: url.searchParams.get('q') ?? '' })

    if (!parsed.success) {
      return NextResponse.json(
        { query: '', products: [], categories: [], brands: [] },
        { status: 200 },
      )
    }

    const q = parsed.data.q

    const [products, categories, brandsRaw] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { brand: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 6,
        orderBy: [{ whatsappClicks: 'desc' }, { views: 'desc' }],
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          category: { select: { name: true, slug: true } },
        },
      }),

      prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: q, mode: 'insensitive' },
        },
        take: 3,
        orderBy: { order: 'asc' },
      }),

      prisma.product.groupBy({
        by: ['brand'],
        where: {
          isActive: true,
          brand: { contains: q, mode: 'insensitive' },
        },
        _count: true,
        take: 3,
        orderBy: { _count: { brand: 'desc' } },
      }),
    ])

    return NextResponse.json({
      query: q,
      products: products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        price: Number(p.price),
        promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
        imageUrl: p.images[0]?.urlThumb,
        categoryName: p.category.name,
      })),
      categories: categories.map((c) => ({
        slug: c.slug,
        name: c.name,
      })),
      brands: brandsRaw.map((b) => ({
        value: b.brand,
        count: b._count,
      })),
    })
  } catch (error) {
    console.error('[search/suggestions] error:', error)
    return NextResponse.json(
      { query: '', products: [], categories: [], brands: [] },
      { status: 500 },
    )
  }
}
