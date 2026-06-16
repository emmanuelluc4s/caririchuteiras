import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'
import { CategoryForm } from '@/components/admin/categories/category-form'

export const metadata: Metadata = { title: 'Editar categoria' }
export const dynamic = 'force-dynamic'

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole(['admin', 'editor'])
  const { id } = await params
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <CategoryForm
        initialData={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl,
          order: category.order,
          isActive: category.isActive,
          metaTitle: category.metaTitle,
          metaDescription: category.metaDescription,
        }}
      />
    </div>
  )
}
