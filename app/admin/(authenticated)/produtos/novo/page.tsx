import type { Metadata } from 'next'
import { requireRole } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/products/product-form'

export const metadata: Metadata = { title: 'Novo produto' }
export const dynamic = 'force-dynamic'

export default async function NovoProdutoPage() {
  await requireRole(['admin', 'editor'])
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <ProductForm categories={categories} />
    </div>
  )
}
