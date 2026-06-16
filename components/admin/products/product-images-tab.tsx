'use client'

import * as React from 'react'
import Image from 'next/image'
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
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  X,
  GripVertical,
  Loader2,
  ImagePlus,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { compressImage } from '@/lib/storage/compress-image'
import { uploadProductImageAction } from '@/app/admin/(authenticated)/produtos/actions'
import { cn } from '@/lib/utils'
import type { ImageValues } from '@/lib/admin/products/schema'

const MAX_IMAGES = 10

type Props = {
  images: ImageValues[]
  productId?: string
  onChange: (images: ImageValues[]) => void
}

function imageKey(img: ImageValues, index: number): string {
  return img.id ?? `new-${index}-${img.urlOriginal.slice(-12)}`
}

export function ProductImagesTab({ images, productId, onChange }: Props) {
  const [uploading, setUploading] = React.useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const remaining = MAX_IMAGES - images.length
      if (remaining <= 0) {
        toast.error(`Máximo ${MAX_IMAGES} imagens por produto`)
        return
      }
      const toUpload = acceptedFiles.slice(0, remaining)
      if (acceptedFiles.length > remaining) {
        toast.info(
          `Apenas ${remaining} imagem(ns) serão enviadas (limite ${MAX_IMAGES})`,
        )
      }

      setUploading(true)
      const newImages: ImageValues[] = []
      let currentOrder = images.length

      for (const file of toUpload) {
        try {
          const compressed = await compressImage(file)
          const formData = new FormData()
          formData.set('image', compressed)
          const result = await uploadProductImageAction(
            productId ?? 'pending',
            formData,
          )
          if (!result.ok) {
            toast.error(result.error)
            continue
          }
          newImages.push({
            urlOriginal: result.data!.urlOriginal,
            urlLarge: result.data!.urlLarge,
            urlMedium: result.data!.urlMedium,
            urlThumb: result.data!.urlThumb,
            alt: null,
            order: currentOrder,
          })
          currentOrder++
        } catch {
          toast.error('Erro ao processar imagem')
        }
      }

      setUploading(false)
      if (newImages.length > 0) {
        onChange([...images, ...newImages])
        toast.success(`${newImages.length} imagem(ns) adicionada(s)`)
      }
    },
    [images, onChange, productId],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024,
    disabled: uploading || images.length >= MAX_IMAGES,
  })

  function handleRemove(index: number) {
    const next = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, order: i }))
    onChange(next)
  }

  function handleAltChange(index: number, alt: string) {
    const next = images.map((img, i) =>
      i === index ? { ...img, alt: alt || null } : img,
    )
    onChange(next)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = images.findIndex(
      (img, i) => imageKey(img, i) === active.id,
    )
    const newIndex = images.findIndex(
      (img, i) => imageKey(img, i) === over.id,
    )
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(images, oldIndex, newIndex).map((img, i) => ({
      ...img,
      order: i,
    }))
    onChange(reordered)
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
        <header className="flex items-center justify-between">
          <h2 className="font-display text-base uppercase tracking-tight">
            Imagens ({images.length}/{MAX_IMAGES})
          </h2>
          <p className="text-[10px] text-gray-400">
            Primeira imagem é a capa do produto
          </p>
        </header>

        <div
          {...getRootProps()}
          className={cn(
            'rounded-lg border-2 border-dashed transition-all',
            isDragActive
              ? 'border-neon bg-neon/5'
              : 'border-border bg-bg-primary hover:border-neon/50',
            (uploading || images.length >= MAX_IMAGES) &&
              'cursor-not-allowed opacity-50',
          )}
        >
          <input {...getInputProps()} />
          <div className="p-8 text-center">
            {uploading ? (
              <>
                <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-neon" />
                <p className="text-sm text-foreground">Fazendo upload...</p>
              </>
            ) : images.length >= MAX_IMAGES ? (
              <>
                <ImagePlus className="mx-auto mb-3 h-8 w-8 text-gray-600" />
                <p className="text-sm text-gray-400">
                  Limite de {MAX_IMAGES} imagens atingido
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Remova alguma para adicionar mais
                </p>
              </>
            ) : (
              <>
                <Upload className="mx-auto mb-3 h-8 w-8 text-neon" />
                <p className="text-sm font-medium text-foreground">
                  {isDragActive
                    ? 'Solte as imagens aqui'
                    : 'Arraste imagens ou clique para selecionar'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  JPG, PNG ou WebP até 5MB cada
                </p>
              </>
            )}
          </div>
        </div>

        {images.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((img, i) => imageKey(img, i))}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((img, i) => (
                  <SortableImage
                    key={imageKey(img, i)}
                    id={imageKey(img, i)}
                    image={img}
                    isCover={i === 0}
                    onRemove={() => handleRemove(i)}
                    onAltChange={(alt) => handleAltChange(i, alt)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {images.length === 0 && !uploading && (
          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-xs text-warning">
              Pelo menos 1 imagem é recomendada. Produtos sem imagem ficam sem
              destaque no catálogo.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

function SortableImage({
  id,
  image,
  isCover,
  onRemove,
  onAltChange,
}: {
  id: string
  image: ImageValues
  isCover: boolean
  onRemove: () => void
  onAltChange: (alt: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div className="relative aspect-square overflow-hidden rounded-md border-2 border-border bg-bg-tertiary transition-colors group-hover:border-neon">
        <Image
          src={image.urlMedium}
          alt={image.alt ?? ''}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover"
          unoptimized
        />
        {isCover && (
          <span className="absolute left-1.5 top-1.5 inline-flex items-center rounded-full bg-neon px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            Capa
          </span>
        )}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrastar"
          className="absolute right-9 top-1.5 grid h-7 w-7 cursor-grab place-items-center rounded-full bg-bg-primary/90 text-foreground transition-colors hover:bg-neon hover:text-white active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover"
          className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-bg-primary/90 text-foreground transition-colors hover:bg-danger hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        type="text"
        value={image.alt ?? ''}
        onChange={(e) => onAltChange(e.target.value)}
        maxLength={200}
        placeholder="Texto alternativo (alt)"
        className="mt-2 h-8 w-full rounded-md border border-border bg-bg-primary px-2 text-[10px] focus:border-neon focus:outline-none"
      />
    </div>
  )
}
