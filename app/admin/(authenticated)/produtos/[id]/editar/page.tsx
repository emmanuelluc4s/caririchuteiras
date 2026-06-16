import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/products/product-form'

export const metadata: Metadata = { title: 'Editar produto' }
export const dynamic = 'force-dynamic'

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole(['admin', 'editor'])
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  if (!product) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <ProductForm
        categories={categories}
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          brand: product.brand,
          categoryId: product.categoryId,
          price: Number(product.price),
          promoPrice: product.promoPrice ? Number(product.promoPrice) : null,
          installments: product.installments,
          installmentFree: product.installmentFree,
          description: product.description,
          isActive: product.isActive,
          isNew: product.isNew,
          isBestSellerManual: product.isBestSellerManual,
          material: product.material,
          weight: product.weight,
          collar: product.collar,
          technology: product.technology,
          useIndication: product.useIndication,
          warranty: product.warranty,
          origin: product.origin,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          images: product.images.map((img) => ({
            id: img.id,
            urlOriginal: img.urlOriginal,
            urlLarge: img.urlLarge,
            urlMedium: img.urlMedium,
            urlThumb: img.urlThumb,
            alt: img.alt,
            order: img.order,
          })),
          variants: product.variants.map((v) => ({
            id: v.id,
            color: v.color,
            colorHex: v.colorHex,
            size: v.size,
            stock: v.stock,
          })),
        }}
      />
    </div>
  )
}
