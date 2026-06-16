'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Edit,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  ImageOff,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { formatBRL, cn } from '@/lib/utils'
import {
  toggleProductActiveAction,
  duplicateProductAction,
  deleteProductAction,
} from '@/app/admin/(authenticated)/produtos/actions'

type Product = {
  id: string
  slug: string
  name: string
  sku: string
  brand: string
  categoryName: string
  price: number
  promoPrice: number | null
  isActive: boolean
  isNew: boolean
  isBestSellerManual: boolean
  totalStock: number
  imageUrl?: string
  updatedAt: Date | string
}

type Props = {
  products: Product[]
}

export function ProductsTable({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-bg-secondary p-12 text-center">
        <p className="text-sm text-gray-100">Nenhum produto encontrado.</p>
        <p className="mt-1 text-xs text-gray-400">
          Ajuste os filtros ou cadastre um novo produto.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-bg-tertiary/50">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Produto
              </th>
              <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 md:table-cell">
                SKU
              </th>
              <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 lg:table-cell">
                Categoria
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Preço
              </th>
              <th className="hidden px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 md:table-cell">
                Estoque
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProductRow({ product }: { product: Product }) {
  const router = useRouter()
  const [deleting, setDeleting] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [pending, setPending] = React.useState(false)

  async function handleToggle() {
    setPending(true)
    const result = await toggleProductActiveAction(product.id)
    setPending(false)
    if (result.ok) {
      toast.success(
        result.data?.isActive ? 'Produto ativado' : 'Produto desativado',
      )
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleDuplicate() {
    setPending(true)
    const result = await duplicateProductAction(product.id)
    setPending(false)
    if (result.ok && result.data) {
      toast.success('Produto duplicado!', {
        description: 'Versão inativa criada para revisão',
      })
      router.push(`/admin/produtos/${result.data.id}/editar`)
    } else if (!result.ok) {
      toast.error(result.error)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteProductAction(product.id)
    setDeleting(false)
    setConfirmDelete(false)
    if (result.ok) {
      toast.success('Produto excluído permanentemente')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <tr
        className={cn(
          'border-b border-border transition-colors last:border-0 hover:bg-bg-tertiary/30',
          !product.isActive && 'opacity-60',
        )}
      >
        <td className="px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-bg-tertiary">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <ImageOff className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <Link
                href={`/admin/produtos/${product.id}/editar`}
                className="block line-clamp-1 text-sm font-medium transition-colors hover:text-neon"
              >
                {product.name}
              </Link>
              <p className="truncate text-[10px] text-gray-400">
                {product.brand}
              </p>
            </div>
          </div>
        </td>
        <td className="hidden px-4 py-3 md:table-cell">
          <code className="font-mono text-xs text-gray-100">{product.sku}</code>
        </td>
        <td className="hidden px-4 py-3 lg:table-cell">
          <span className="text-xs text-gray-100">{product.categoryName}</span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="text-sm">
            {product.promoPrice ? (
              <>
                <span className="block text-[10px] text-gray-600 line-through">
                  {formatBRL(product.price)}
                </span>
                <span className="font-semibold text-neon">
                  {formatBRL(product.promoPrice)}
                </span>
              </>
            ) : (
              <span className="font-medium">{formatBRL(product.price)}</span>
            )}
          </div>
        </td>
        <td className="hidden px-4 py-3 text-center md:table-cell">
          <span
            className={cn(
              'inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-semibold tabular-nums',
              product.totalStock === 0
                ? 'bg-danger/10 text-danger'
                : product.totalStock < 5
                  ? 'bg-warning/10 text-warning'
                  : 'bg-success/10 text-success',
            )}
          >
            {product.totalStock}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <button
            type="button"
            onClick={handleToggle}
            disabled={pending}
            aria-pressed={product.isActive}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all',
              product.isActive
                ? 'bg-success/10 text-success hover:bg-success/20'
                : 'bg-gray-600/10 text-gray-400 hover:bg-gray-600/20',
            )}
            title={
              product.isActive ? 'Clique para desativar' : 'Clique para ativar'
            }
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                product.isActive ? 'bg-success' : 'bg-gray-500',
              )}
            />
            {product.isActive ? 'Ativo' : 'Inativo'}
          </button>
        </td>
        <td className="px-4 py-3 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Ações"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-bg-tertiary hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-border bg-bg-secondary"
            >
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/produtos/${product.id}/editar`}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/produto/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                  Ver no site
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDuplicate}
                disabled={pending}
                className="cursor-pointer"
              >
                <Copy className="mr-2 h-3.5 w-3.5" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleToggle}
                disabled={pending}
                className="cursor-pointer"
              >
                {product.isActive ? (
                  <>
                    <EyeOff className="mr-2 h-3.5 w-3.5" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-3.5 w-3.5" />
                    Ativar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => setConfirmDelete(true)}
                className="cursor-pointer text-danger focus:text-danger"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Excluir permanentemente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="border-border bg-bg-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase">
              Excluir &ldquo;{product.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-100">
              Esta ação é{' '}
              <strong className="text-danger">permanente</strong>. O produto,
              suas imagens, variantes e avaliações serão excluídos do banco e do
              storage. Não há como desfazer.
              <br />
              <br />
              Para desativar temporariamente (recomendado), use a opção
              &ldquo;Desativar&rdquo;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-danger text-white hover:bg-danger/90"
            >
              {deleting ? 'Excluindo...' : 'Sim, excluir permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
