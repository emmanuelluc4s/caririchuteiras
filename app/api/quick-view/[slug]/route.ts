import { NextResponse } from 'next/server'
import { getProductBySlug } from '@/lib/queries/product'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const product = await getProductBySlug(slug)

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: Number(product.price),
        promoPrice: product.promoPrice ? Number(product.promoPrice) : null,
        installments: product.installments,
        installmentFree: product.installmentFree,
        averageRating: product.averageRating,
        totalReviews: product.totalReviews,
        category: { name: product.category.name, slug: product.category.slug },
        images: product.images.slice(0, 4).map((img) => ({
          urlMedium: img.urlMedium,
          urlThumb: img.urlThumb,
          alt: img.alt,
        })),
        variants: product.variants.map((v) => ({
          id: v.id,
          color: v.color,
          colorHex: v.colorHex,
          size: v.size,
          stock: v.stock,
        })),
      },
    })
  } catch (error) {
    console.error('[quick-view] error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
