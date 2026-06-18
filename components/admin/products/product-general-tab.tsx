'use client'

import * as React from 'react'
import slugify from 'slugify'
import {
  Sparkles,
  Trophy,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TiptapEditor } from './tiptap-editor'
import { checkSlugAvailableAction } from '@/app/admin/(authenticated)/produtos/actions'
import type { ProductFormValues } from '@/lib/admin/products/schema'

type Props = {
  values: ProductFormValues
  categories: Array<{ id: string; name: string }>
  errors: Record<string, string>
  isEditing: boolean
  productId?: string
  onChange: (patch: Partial<ProductFormValues>) => void
}

function clientSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'pt',
    trim: true,
  })
}

export function ProductGeneralTab({
  values,
  categories,
  errors,
  isEditing,
  productId,
  onChange,
}: Props) {
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(isEditing)
  const [slugStatus, setSlugStatus] = React.useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle')

  function handleNameChange(name: string) {
    onChange({ name })
    if (!slugManuallyEdited) {
      onChange({ slug: clientSlug(name) })
    }
  }

  function handleSlugChange(slug: string) {
    onChange({
      slug: slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-'),
    })
    setSlugManuallyEdited(true)
  }

  React.useEffect(() => {
    if (!values.slug || values.slug.length < 2) {
      setSlugStatus('idle')
      return
    }
    let cancelled = false
    setSlugStatus('checking')
    const timer = setTimeout(async () => {
      const result = await checkSlugAvailableAction(values.slug, productId)
      if (cancelled) return
      setSlugStatus(result.available ? 'available' : 'taken')
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [values.slug, productId])

  return (
    <div className="space-y-6">
      <Card title="Informações básicas">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup
            label="Nome do produto *"
            error={errors.name}
            className="sm:col-span-2"
          >
            <input
              type="text"
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={200}
              placeholder="Ex: Chuteira Nike Phantom Society Preta"
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            />
          </FieldGroup>

          <FieldGroup
            label="Slug (URL) *"
            hint="Auto-gerado pelo nome, editável"
            error={errors.slug}
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                /produto/
              </span>
              <input
                type="text"
                value={values.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                maxLength={200}
                placeholder="nome-do-produto"
                className="h-10 w-full rounded-md border border-border bg-bg-primary pl-[78px] pr-9 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
              />
              <SlugStatusBadge status={slugStatus} />
            </div>
          </FieldGroup>

          <FieldGroup
            label="SKU *"
            hint="Código único do produto"
            error={errors.sku}
          >
            <input
              type="text"
              value={values.sku}
              onChange={(e) => onChange({ sku: e.target.value.toUpperCase() })}
              maxLength={50}
              placeholder="NK-PH-PR-39"
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 font-mono text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            />
          </FieldGroup>

          <FieldGroup label="Marca *" error={errors.brand}>
            <input
              type="text"
              value={values.brand}
              onChange={(e) => onChange({ brand: e.target.value })}
              maxLength={80}
              placeholder="Nike, Adidas, Puma..."
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            />
          </FieldGroup>

          <FieldGroup label="Categoria *" error={errors.categoryId}>
            <select
              value={values.categoryId}
              onChange={(e) => onChange({ categoryId: e.target.value })}
              className="h-10 w-full cursor-pointer rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FieldGroup>
        </div>
      </Card>

      <Card title="Preço">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Preço normal (R$) *" error={errors.price}>
            <input
              type="number"
              value={values.price === 0 ? '' : values.price}
              onChange={(e) => onChange({ price: Number(e.target.value) })}
              step="0.01"
              min="0"
              placeholder="0,00"
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            />
          </FieldGroup>

          <FieldGroup
            label="Preço promocional (R$)"
            hint="Deixe vazio se não tem promoção"
            error={errors.promoPrice}
          >
            <input
              type="number"
              value={values.promoPrice ?? ''}
              onChange={(e) =>
                onChange({
                  promoPrice: e.target.value ? Number(e.target.value) : null,
                })
              }
              step="0.01"
              min="0"
              placeholder="0,00"
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            />
          </FieldGroup>

          <FieldGroup
            label="Parcelas (sugestão)"
            hint="Quantidade de vezes para parcelar"
          >
            <input
              type="number"
              value={values.installments ?? ''}
              onChange={(e) =>
                onChange({
                  installments: e.target.value ? Number(e.target.value) : null,
                })
              }
              min="1"
              max="24"
              placeholder="12"
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            />
          </FieldGroup>

        </div>
      </Card>

      <Card title="Descrição">
        <TiptapEditor
          value={values.description ?? ''}
          onChange={(value) => onChange({ description: value })}
          placeholder="Descreva o produto, suas características, benefícios..."
        />
        <p className="mt-2 text-[10px] text-gray-400">
          A descrição é renderizada na página do produto com sanitização
          anti-XSS.
        </p>
      </Card>

      <Card title="Status e destaques">
        <div className="space-y-4">
          <SwitchRow
            checked={values.isActive}
            onChange={(v) => onChange({ isActive: v })}
            label="Produto ativo"
            description="Aparece no catálogo público quando ativo"
          />
          <SwitchRow
            checked={values.isNew}
            onChange={(v) => onChange({ isNew: v })}
            label="Marcar como novidade"
            description="Recebe badge 'NOVO' no card"
            icon={<Sparkles className="h-4 w-4 text-neon" />}
          />
          <SwitchRow
            checked={values.isBestSellerManual}
            onChange={(v) => onChange({ isBestSellerManual: v })}
            label="Forçar mais vendidos"
            description="Boost manual no ranking de mais vendidos"
            icon={<Trophy className="h-4 w-4 text-warning" />}
          />
        </div>
      </Card>
    </div>
  )
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
      <h2 className="border-b border-border pb-2 font-display text-base uppercase tracking-tight">
        {title}
      </h2>
      {children}
    </section>
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

function SwitchRow({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 gap-3">
        {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && (
            <p className="mt-0.5 text-xs text-gray-400">{description}</p>
          )}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function SlugStatusBadge({
  status,
}: {
  status: 'idle' | 'checking' | 'available' | 'taken'
}) {
  if (status === 'idle') return null
  return (
    <span className="absolute right-3 top-1/2 -translate-y-1/2">
      {status === 'checking' && (
        <RefreshCw className="h-3 w-3 animate-spin text-gray-400" />
      )}
      {status === 'available' && (
        <CheckCircle className="h-3 w-3 text-success" />
      )}
      {status === 'taken' && (
        <AlertCircle className="h-3 w-3 text-warning" />
      )}
    </span>
  )
}
