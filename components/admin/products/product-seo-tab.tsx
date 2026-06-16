'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search } from 'lucide-react'
import type { ProductFormValues } from '@/lib/admin/products/schema'

type Props = {
  values: ProductFormValues
  onChange: (patch: Partial<ProductFormValues>) => void
}

export function ProductSeoTab({ values, onChange }: Props) {
  const titlePreview =
    values.metaTitle ??
    (values.brand && values.name
      ? `${values.brand} ${values.name}`
      : 'Título do produto')
  const descPreview =
    values.metaDescription ??
    `${values.brand} ${values.name} disponível na Cariri Chuteiras. Entrega para todo o Cariri.`

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
        <header className="space-y-1">
          <h2 className="font-display text-base uppercase tracking-tight">
            SEO
          </h2>
          <p className="text-xs text-gray-400">
            Otimização para mecanismos de busca. Deixe vazio para usar valores
            automáticos.
          </p>
        </header>

        <div>
          <Label className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
            Meta título (max 70 chars)
          </Label>
          <input
            type="text"
            value={values.metaTitle ?? ''}
            onChange={(e) => onChange({ metaTitle: e.target.value || null })}
            maxLength={70}
            placeholder="Ex: Chuteira Nike Phantom Society Preta — Cariri Chuteiras"
            className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
          />
          <p className="mt-1 text-[10px] text-gray-500">
            {(values.metaTitle ?? '').length}/70 caracteres
          </p>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
            Meta descrição (max 170 chars)
          </Label>
          <Textarea
            value={values.metaDescription ?? ''}
            onChange={(e) =>
              onChange({ metaDescription: e.target.value || null })
            }
            maxLength={170}
            rows={3}
            placeholder="Ex: A nova Phantom Nike chegou ao Cariri. Society confortável, leveza para o jogo..."
            className="resize-none border-border bg-bg-primary"
          />
          <p className="mt-1 text-[10px] text-gray-500">
            {(values.metaDescription ?? '').length}/170 caracteres
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
        <header className="flex items-center gap-2">
          <Search className="h-4 w-4 text-neon" />
          <h2 className="font-display text-base uppercase tracking-tight">
            Preview no Google
          </h2>
        </header>
        <div className="space-y-1 rounded-md border border-border bg-bg-primary p-4">
          <p className="truncate text-[11px] text-gray-400">
            cariri-chuteiras.com.br › produto ›{' '}
            <span className="text-neon">
              {values.slug || 'slug-do-produto'}
            </span>
          </p>
          <p className="line-clamp-1 cursor-pointer text-base text-[#8ab4f8] hover:underline">
            {titlePreview}
          </p>
          <p className="line-clamp-2 text-xs text-gray-100">{descPreview}</p>
        </div>
        <p className="text-[10px] text-gray-500">
          Como o resultado aparecerá no Google. O preço e estrelas vêm do
          Schema.org.
        </p>
      </section>
    </div>
  )
}
