'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Edit,
  Trash2,
  GripVertical,
  ExternalLink,
  ImageOff,
  Package,
} from 'lucide-react'
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
import { cn } from '@/lib/utils'
import {
  reorderCategoriesAction,
  toggleCategoryActiveAction,
  deleteCategoryAction,
} from '@/app/admin/(authenticated)/categorias/actions'

export type CategoryRow = {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  order: number
  isActive: boolean
  productsCount: number
}

type Props = {
  categories: CategoryRow[]
}

export function CategoriesTable({ categories: initialCategories }: Props) {
  const router = useRouter()
  const [categories, setCategories] = React.useState(initialCategories)
  const [reordering, setReordering] = React.useState(false)

  React.useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(categories, oldIndex, newIndex).map((c, i) => ({
      ...c,
      order: i,
    }))
    setCategories(reordered)
    setReordering(true)
    const result = await reorderCategoriesAction(
      reordered.map((c) => ({ id: c.id, order: c.order })),
    )
    setReordering(false)
    if (result.ok) {
      toast.success('Ordem atualizada')
    } else {
      toast.error(result.error)
      router.refresh()
    }
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-bg-secondary p-12 text-center">
        <p className="text-sm text-gray-100">Nenhuma categoria cadastrada</p>
        <p className="mt-1 text-xs text-gray-400">
          Clique em &ldquo;Nova categoria&rdquo; para criar a primeira.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-bg-secondary transition-opacity',
        reordering && 'opacity-60',
      )}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="divide-y divide-border">
            {categories.map((cat) => (
              <CategoryRow key={cat.id} category={cat} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function CategoryRow({ category }: { category: CategoryRow }) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  }

  async function handleToggle() {
    setPending(true)
    const result = await toggleCategoryActiveAction(category.id)
    setPending(false)
    if (result.ok) {
      toast.success(
        result.data?.isActive ? 'Categoria ativada' : 'Categoria desativada',
      )
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleDelete() {
    setPending(true)
    const result = await deleteCategoryAction(category.id)
    setPending(false)
    setConfirmDelete(false)
    if (result.ok) {
      toast.success('Categoria excluída')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <li
        ref={setNodeRef}
        style={style}
        className={cn(
          'flex items-center gap-3 px-3 py-3 transition-colors hover:bg-bg-tertiary/30 md:px-4',
          !category.isActive && 'opacity-60',
          isDragging && 'bg-bg-tertiary',
        )}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para reordenar"
          className="grid h-8 w-8 shrink-0 cursor-grab place-items-center rounded-md text-gray-400 hover:bg-bg-tertiary hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-bg-tertiary">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              sizes="48px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <ImageOff className="h-4 w-4 text-gray-600" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={`/admin/categorias/${category.id}/editar`}
            className="block line-clamp-1 text-sm font-medium transition-colors hover:text-neon"
          >
            {category.name}
          </Link>
          <p className="truncate text-[10px] text-gray-400">
            <code className="font-mono">/categoria/{category.slug}</code>
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-1 text-xs text-gray-400 sm:flex">
          <Package className="h-3 w-3" />
          <span className="tabular-nums">{category.productsCount}</span>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all',
            category.isActive
              ? 'bg-success/10 text-success'
              : 'bg-gray-600/10 text-gray-400',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              category.isActive ? 'bg-success' : 'bg-gray-500',
            )}
          />
          {category.isActive ? 'Ativa' : 'Inativa'}
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={`/categoria/${category.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-8 w-8 place-items-center rounded-md text-gray-400 hover:bg-bg-tertiary hover:text-foreground"
            title="Ver no site"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/admin/categorias/${category.id}/editar`}
            className="grid h-8 w-8 place-items-center rounded-md text-gray-400 hover:bg-bg-tertiary hover:text-foreground"
            title="Editar"
          >
            <Edit className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={pending}
            className="grid h-8 w-8 place-items-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
            title="Excluir"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </li>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="border-border bg-bg-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase">
              Excluir &ldquo;{category.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-100">
              {category.productsCount > 0 ? (
                <>
                  Esta categoria tem{' '}
                  <strong className="text-danger">
                    {category.productsCount} produto(s)
                  </strong>{' '}
                  vinculado(s). Mova-os para outra categoria antes de excluir.
                </>
              ) : (
                <>
                  Esta ação é{' '}
                  <strong className="text-danger">permanente</strong>. Para
                  desativar temporariamente, use o botão de status.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-bg-tertiary">
              Cancelar
            </AlertDialogCancel>
            {category.productsCount === 0 && (
              <AlertDialogAction
                onClick={handleDelete}
                disabled={pending}
                className="bg-danger text-white hover:bg-danger/90"
              >
                {pending ? 'Excluindo...' : 'Sim, excluir'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
