'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import slugify from 'slugify'
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  saveCategoryAction,
  uploadCategoryImageAction,
} from '@/app/admin/(authenticated)/categorias/actions'
import { compressImage } from '@/lib/storage/compress-image'
import { cn } from '@/lib/utils'
import type { CategoryFormValues } from '@/lib/admin/categories/schema'

type Props = {
  initialData?: CategoryFormValues & { id: string }
}

function clientSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, locale: 'pt', trim: true })
}

const DEFAULT: CategoryFormValues = {
  name: '',
  slug: '',
  description: null,
  imageUrl: null,
  order: 0,
  isActive: true,
  metaTitle: null,
  metaDescription: null,
}

export function CategoryForm({ initialData }: Props) {
  const router = useRouter()
  const isEditing = Boolean(initialData)
  const [values, setValues] = React.useState<CategoryFormValues>(
    initialData ? { ...initialData } : DEFAULT,
  )
  const [slugManual, setSlugManual] = React.useState(isEditing)
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  function patch(p: Partial<CategoryFormValues>) {
    setValues((prev) => ({ ...prev, ...p }))
  }

  function handleNameChange(name: string) {
    patch({ name })
    if (!slugManual) patch({ slug: clientSlug(name) })
  }

  function handleSlugChange(slug: string) {
    patch({
      slug: slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-'),
    })
    setSlugManual(true)
  }

  const onDrop = React.useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.set('image', compressed)
      const result = await uploadCategoryImageAction(formData)
      if (result.ok && result.data) {
        setValues((prev) => ({ ...prev, imageUrl: result.data!.url }))
        toast.success('Imagem enviada')
      } else if (!result.ok) {
        toast.error(result.error)
      }
    } catch {
      toast.error('Erro ao processar imagem')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: uploading,
  })

  async function handleSave() {
    setSaving(true)
    setErrors({})
    const newErrors: Record<string, string> = {}
    if (!values.name) newErrors.name = 'Nome obrigatório'
    if (!values.slug) newErrors.slug = 'Slug obrigatório'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Corrija os campos obrigatórios')
      setSaving(false)
      return
    }

    const result = await saveCategoryAction(initialData?.id ?? null, values)
    setSaving(false)
    if (result.ok && result.data) {
      toast.success(isEditing ? 'Categoria atualizada!' : 'Categoria criada!')
      router.push('/admin/categorias')
    } else if (!result.ok) {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/categorias" aria-label="Voltar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-display text-2xl uppercase tracking-tight md:text-3xl">
            {isEditing ? 'Editar categoria' : 'Nova categoria'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/categorias">Cancelar</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </header>

      <section className="space-y-4 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
        <h2 className="border-b border-border pb-2 font-display text-base uppercase tracking-tight">
          Informações
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup
            label="Nome *"
            error={errors.name}
            className="sm:col-span-2"
          >
            <input
              type="text"
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={80}
              placeholder="Ex: Chuteiras Society"
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            />
          </FieldGroup>
          <FieldGroup
            label="Slug *"
            hint="Auto-gerado pelo nome, editável"
            error={errors.slug}
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                /categoria/
              </span>
              <input
                type="text"
                value={values.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                maxLength={100}
                placeholder="chuteiras-society"
                className="h-10 w-full rounded-md border border-border bg-bg-primary pl-[88px] pr-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
              />
            </div>
          </FieldGroup>
          <FieldGroup
            label="Ordem"
            hint="Quanto menor, mais à esquerda no menu"
          >
            <input
              type="number"
              value={values.order}
              onChange={(e) =>
                patch({ order: Math.max(0, Number(e.target.value)) })
              }
              min="0"
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            />
          </FieldGroup>
          <FieldGroup label="Descrição" className="sm:col-span-2">
            <Textarea
              value={values.description ?? ''}
              onChange={(e) =>
                patch({ description: e.target.value || null })
              }
              maxLength={500}
              rows={3}
              placeholder="Breve descrição da categoria — aparece no hero da página"
              className="resize-none border-border bg-bg-primary"
            />
          </FieldGroup>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <Label className="text-sm text-foreground">Categoria ativa</Label>
          <Switch
            checked={values.isActive}
            onCheckedChange={(v) => patch({ isActive: v })}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
        <h2 className="border-b border-border pb-2 font-display text-base uppercase tracking-tight">
          Imagem de capa
        </h2>
        {values.imageUrl ? (
          <div className="group relative">
            <div className="relative aspect-[3/1] overflow-hidden rounded-md border border-border bg-bg-tertiary">
              <Image
                src={values.imageUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
                unoptimized
              />
            </div>
            <button
              type="button"
              onClick={() => patch({ imageUrl: null })}
              aria-label="Remover imagem"
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-bg-primary/90 text-foreground transition-colors hover:bg-danger hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              'cursor-pointer rounded-lg border-2 border-dashed transition-all',
              isDragActive
                ? 'border-neon bg-neon/5'
                : 'border-border bg-bg-primary hover:border-neon/50',
              uploading && 'cursor-not-allowed opacity-50',
            )}
          >
            <input {...getInputProps()} />
            <div className="p-8 text-center">
              {uploading ? (
                <>
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-neon" />
                  <p className="text-sm">Enviando...</p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto mb-2 h-8 w-8 text-neon" />
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Solte aqui' : 'Arraste ou clique'}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    JPG, PNG ou WebP até 5MB
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
        <h2 className="border-b border-border pb-2 font-display text-base uppercase tracking-tight">
          SEO (opcional)
        </h2>
        <FieldGroup label={`Meta título (${(values.metaTitle ?? '').length}/70)`}>
          <input
            type="text"
            value={values.metaTitle ?? ''}
            onChange={(e) => patch({ metaTitle: e.target.value || null })}
            maxLength={70}
            placeholder="Auto: Nome — Cariri Chuteiras"
            className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
          />
        </FieldGroup>
        <FieldGroup
          label={`Meta descrição (${(values.metaDescription ?? '').length}/170)`}
        >
          <Textarea
            value={values.metaDescription ?? ''}
            onChange={(e) =>
              patch({ metaDescription: e.target.value || null })
            }
            maxLength={170}
            rows={3}
            placeholder="Descrição para SEO"
            className="resize-none border-border bg-bg-primary"
          />
        </FieldGroup>
      </section>
    </div>
  )
}

function FieldGroup({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-[10px] text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-danger">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}
