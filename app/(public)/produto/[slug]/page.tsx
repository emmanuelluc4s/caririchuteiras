import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/queries/product'

export const revalidate = 3600
export const runtime = 'nodejs'

type Params = { slug: string }

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold">{product.brand} {product.name}</h1>
      <p className="mt-4 text-gray-400">SKU: {product.sku}</p>
      <p className="mt-2 text-gray-400">Slug: {product.slug}</p>
      <p className="mt-2 text-gray-400">
        Preço: R$ {Number(product.price).toFixed(2)}
      </p>
      <p className="mt-2 text-gray-400">
        Variantes: {product.variants.length}
      </p>
      <p className="mt-2 text-gray-400">
        Imagens: {product.images.length}
      </p>
    </div>
  )
}
