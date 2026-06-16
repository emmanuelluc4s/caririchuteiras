import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { requireRole } from '@/lib/admin/auth'
import {
  listAdminProducts,
  getAdminProductBrands,
} from '@/lib/admin/products/queries'
import { prisma } from '@/lib/prisma'
import { ProductsTable } from '@/components/admin/products/products-table'
import { ProductsFilters } from '@/components/admin/products/products-filters'
import { AdminPageHeader } from '@/components/admin/layout/admin-page-header'
import { AdminPagination } from '@/components/admin/shared/admin-pagination'

export const metadata: Metadata = { title: 'Produtos' }
export const dynamic = 'force-dynamic'

const ParamsSchema = z.object({
  q: z.string().optional(),
  categoria: z.string().optional(),
  marca: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  estoque: z
    .enum(['all', 'in-stock', 'out-of-stock', 'low-stock'])
    .default('all'),
  pagina: z.coerce.number().int().min(1).default(1),
})

type SearchParams = Record<string, string | string[] | undefined>

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await requireRole(['admin', 'editor', 'viewer'])
  const sp = await searchParams
  const parsed = ParamsSchema.parse({
    q: typeof sp.q === 'string' ? sp.q : undefined,
    categoria: typeof sp.categoria === 'string' ? sp.categoria : undefined,
    marca: typeof sp.marca === 'string' ? sp.marca : undefined,
    status: typeof sp.status === 'string' ? sp.status : 'all',
    estoque: typeof sp.estoque === 'string' ? sp.estoque : 'all',
    pagina: typeof sp.pagina === 'string' ? sp.pagina : 1,
  })

  const [result, categories, brands] = await Promise.all([
    listAdminProducts(
      {
        search: parsed.q,
        categoryId: parsed.categoria,
        brand: parsed.marca,
        status: parsed.status,
        stock: parsed.estoque,
      },
      parsed.pagina,
    ),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    getAdminProductBrands(),
  ])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      <AdminPageHeader
        title="Produtos"
        description={`${result.total} produto${result.total !== 1 ? 's' : ''} cadastrado${result.total !== 1 ? 's' : ''}`}
        action={
          <Button asChild>
            <Link href="/admin/produtos/novo">
              <Plus className="h-4 w-4" />
              Novo produto
            </Link>
          </Button>
        }
      />
      <ProductsFilters categories={categories} brands={brands} />
      <ProductsTable products={result.products} />
      <AdminPagination
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        baseHref="/admin/produtos"
      />
    </div>
  )
}
