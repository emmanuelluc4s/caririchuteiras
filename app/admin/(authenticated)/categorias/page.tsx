import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requireRole } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'
import { AdminPageHeader } from '@/components/admin/layout/admin-page-header'
import { CategoriesTable } from '@/components/admin/categories/categories-table'

export const metadata: Metadata = { title: 'Categorias' }
export const dynamic = 'force-dynamic'

export default async function CategoriasPage() {
  await requireRole(['admin', 'editor', 'viewer'])

  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
    },
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      <AdminPageHeader
        title="Categorias"
        description={`${categories.length} categoria${categories.length !== 1 ? 's' : ''} cadastrada${categories.length !== 1 ? 's' : ''}`}
        action={
          <Button asChild>
            <Link href="/admin/categorias/nova">
              <Plus className="h-4 w-4" />
              Nova categoria
            </Link>
          </Button>
        }
      />

      <CategoriesTable
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          imageUrl: c.imageUrl,
          order: c.order,
          isActive: c.isActive,
          productsCount: c._count.products,
        }))}
      />
    </div>
  )
}
