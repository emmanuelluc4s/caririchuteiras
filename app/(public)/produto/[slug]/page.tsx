import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/queries/product'
import { getActiveCoupon } from '@/lib/queries/active-coupon'
import { getRatingDistribution, listReviews } from '@/lib/queries/reviews'

export const revalidate = 3600
export const runtime = 'nodejs'

type Params = { slug: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Produto não encontrado' }
  return {
    title: `${product.brand} ${product.name}`,
    description: `${product.brand} ${product.name}`,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [related, activeCoupon, reviewsDistribution, reviewsList] =
    await Promise.all([
      getRelatedProducts(
        product.id,
        product.categoryId,
        product.brand,
        Array.from(new Set(product.variants.map((v) => v.color))),
      ),
      getActiveCoupon(),
      getRatingDistribution({ productId: product.id }),
      listReviews({ productId: product.id }, 1),
    ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold">DIAGNOSE V2</h1>
      <p className="mt-2">Produto: {product.brand} {product.name}</p>
      <p className="mt-2">Related: {related.length}</p>
      <p className="mt-2">Coupon: {activeCoupon?.code ?? 'nenhum'}</p>
      <p className="mt-2">Reviews total: {reviewsDistribution.total}</p>
      <p className="mt-2">Reviews itens: {reviewsList.items.length}</p>
    </div>
  )
}
