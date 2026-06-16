import type { Metadata } from 'next'
import { requireRole } from '@/lib/admin/auth'
import { CategoryForm } from '@/components/admin/categories/category-form'

export const metadata: Metadata = { title: 'Nova categoria' }

export default async function NovaCategoriaPage() {
  await requireRole(['admin', 'editor'])
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <CategoryForm />
    </div>
  )
}
