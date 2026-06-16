'use client'

import { Label } from '@/components/ui/label'
import type { ProductFormValues } from '@/lib/admin/products/schema'

type Props = {
  values: ProductFormValues
  onChange: (patch: Partial<ProductFormValues>) => void
}

const FIELDS: Array<{
  key: keyof Pick<
    ProductFormValues,
    | 'material'
    | 'weight'
    | 'collar'
    | 'technology'
    | 'useIndication'
    | 'warranty'
    | 'origin'
  >
  label: string
  placeholder: string
  maxLength: number
}> = [
  {
    key: 'material',
    label: 'Material',
    placeholder: 'Ex: Couro sintético, mesh respirável',
    maxLength: 120,
  },
  { key: 'weight', label: 'Peso', placeholder: 'Ex: 220g', maxLength: 40 },
  {
    key: 'collar',
    label: 'Gola/Cabedal',
    placeholder: 'Ex: Gola alta, cabedal flexível',
    maxLength: 40,
  },
  {
    key: 'technology',
    label: 'Tecnologia',
    placeholder: 'Ex: Sola Phylon com Air, AccuFlex',
    maxLength: 200,
  },
  {
    key: 'useIndication',
    label: 'Indicação de uso',
    placeholder: 'Ex: Society, campo amador',
    maxLength: 200,
  },
  {
    key: 'warranty',
    label: 'Garantia',
    placeholder: 'Ex: 3 meses contra defeitos de fabricação',
    maxLength: 120,
  },
  {
    key: 'origin',
    label: 'Origem',
    placeholder: 'Ex: Nacional, Importado',
    maxLength: 80,
  },
]

export function ProductAttributesTab({ values, onChange }: Props) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
      <header className="space-y-1">
        <h2 className="font-display text-base uppercase tracking-tight">
          Atributos opcionais
        </h2>
        <p className="text-xs text-gray-400">
          Esses campos aparecem na seção &ldquo;Especificações&rdquo; da página
          do produto. Deixe vazio se não souber.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={String(field.key)}>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
              {field.label}
            </Label>
            <input
              type="text"
              value={values[field.key] ?? ''}
              onChange={(e) =>
                onChange({
                  [field.key]: e.target.value || null,
                } as Partial<ProductFormValues>)
              }
              maxLength={field.maxLength}
              placeholder={field.placeholder}
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
