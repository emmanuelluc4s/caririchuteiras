'use client'

import * as React from 'react'
import { Plus, Trash2, Copy, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { VariantValues } from '@/lib/admin/products/schema'

const COMMON_COLORS = [
  { name: 'Preto', hex: '#000000' },
  { name: 'Branco', hex: '#FFFFFF' },
  { name: 'Vermelho', hex: '#DC2626' },
  { name: 'Azul', hex: '#2563EB' },
  { name: 'Verde', hex: '#16A34A' },
  { name: 'Amarelo', hex: '#EAB308' },
  { name: 'Cinza', hex: '#6B7280' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Roxo', hex: '#9333EA' },
  { name: 'Laranja', hex: '#F97316' },
  { name: 'Marrom', hex: '#92400E' },
  { name: 'Bege', hex: '#D6B89C' },
]

const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44']
const APPAREL_SIZES = ['P', 'M', 'G', 'GG']

type Props = {
  variants: VariantValues[]
  onChange: (variants: VariantValues[]) => void
}

export function ProductVariantsTab({ variants, onChange }: Props) {
  const [bulkMode, setBulkMode] = React.useState<'shoe' | 'apparel' | ''>('')
  const [bulkColor, setBulkColor] = React.useState<string>('Preto')
  const [bulkColorHex, setBulkColorHex] = React.useState<string>('#000000')
  const [bulkStock, setBulkStock] = React.useState<number>(5)

  function addVariant() {
    onChange([
      ...variants,
      { color: '', colorHex: '#000000', size: '', stock: 0 },
    ])
  }

  function updateVariant(index: number, patch: Partial<VariantValues>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)))
  }

  function removeVariant(index: number) {
    onChange(variants.filter((_, i) => i !== index))
  }

  function duplicateVariant(index: number) {
    const v = variants[index]
    if (!v) return
    const copy = { ...v, id: undefined, size: '' }
    const next = [...variants]
    next.splice(index + 1, 0, copy)
    onChange(next)
  }

  function bulkAddSizes() {
    if (!bulkMode || !bulkColor) {
      toast.error('Selecione cor e tipo de tamanho')
      return
    }
    const sizes = bulkMode === 'shoe' ? SHOE_SIZES : APPAREL_SIZES
    const existing = new Set(
      variants.filter((v) => v.color === bulkColor).map((v) => v.size),
    )
    const newVariants: VariantValues[] = sizes
      .filter((s) => !existing.has(s))
      .map((size) => ({
        color: bulkColor,
        colorHex: bulkColorHex,
        size,
        stock: bulkStock,
      }))

    if (newVariants.length === 0) {
      toast.info('Todas as variantes dessa cor já existem')
      return
    }
    onChange([...variants, ...newVariants])
    toast.success(`${newVariants.length} variante(s) adicionada(s)`)
  }

  const grouped = React.useMemo(() => {
    const map = new Map<string, VariantValues[]>()
    variants.forEach((v) => {
      const list = map.get(v.color) ?? []
      list.push(v)
      map.set(v.color, list)
    })
    return Array.from(map.entries())
  }, [variants])

  const totalStock = variants.reduce((s, v) => s + v.stock, 0)

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base uppercase tracking-tight">
              Adicionar em massa
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Crie todas as variantes de uma cor de uma vez
            </p>
          </div>
        </header>

        <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
              Cor
            </Label>
            <select
              value={bulkColor}
              onChange={(e) => {
                setBulkColor(e.target.value)
                const c = COMMON_COLORS.find((x) => x.name === e.target.value)
                if (c) setBulkColorHex(c.hex)
              }}
              className="h-10 w-full cursor-pointer rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none"
            >
              {COMMON_COLORS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
              Tipo de tamanho
            </Label>
            <select
              value={bulkMode}
              onChange={(e) =>
                setBulkMode(e.target.value as 'shoe' | 'apparel' | '')
              }
              className="h-10 w-full cursor-pointer rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none"
            >
              <option value="">Selecione...</option>
              <option value="shoe">Chuteira/Tênis (36-44)</option>
              <option value="apparel">Vestuário (P-GG)</option>
            </select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
              Estoque inicial
            </Label>
            <input
              type="number"
              value={bulkStock}
              onChange={(e) =>
                setBulkStock(Math.max(0, Number(e.target.value)))
              }
              min="0"
              max="9999"
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none"
            />
          </div>

          <Button onClick={bulkAddSizes} disabled={!bulkMode}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base uppercase tracking-tight">
              Variantes ({variants.length})
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Estoque total:{' '}
              <strong className="text-foreground">{totalStock}</strong> unidades
            </p>
          </div>
          <Button onClick={addVariant} variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            Adicionar manual
          </Button>
        </header>

        {variants.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-bg-primary p-8 text-center">
            <p className="text-sm text-foreground">Nenhuma variante cadastrada</p>
            <p className="mt-1 text-xs text-gray-400">
              Use a opção acima para adicionar todas de uma vez, ou clique em
              &ldquo;Adicionar manual&rdquo;
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([color, group]) => (
              <div
                key={color}
                className="rounded-md border border-border bg-bg-primary"
              >
                <div className="flex items-center gap-2 border-b border-border bg-bg-tertiary/30 px-4 py-2">
                  <div
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: group[0]?.colorHex ?? '#666' }}
                  />
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    {color || 'Sem cor'}
                  </p>
                  <span className="text-[10px] text-gray-400">
                    ({group.length} variante{group.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {group.map((variant) => {
                    const globalIndex = variants.indexOf(variant)
                    return (
                      <VariantRow
                        key={globalIndex}
                        variant={variant}
                        onUpdate={(patch) =>
                          updateVariant(globalIndex, patch)
                        }
                        onRemove={() => removeVariant(globalIndex)}
                        onDuplicate={() => duplicateVariant(globalIndex)}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {variants.length === 0 && (
          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-xs text-warning">
              Produto sem variantes não pode ser adicionado ao carrinho do
              WhatsApp.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

function VariantRow({
  variant,
  onUpdate,
  onRemove,
  onDuplicate,
}: {
  variant: VariantValues
  onUpdate: (patch: Partial<VariantValues>) => void
  onRemove: () => void
  onDuplicate: () => void
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr_120px_100px_auto] items-center gap-2 px-4 py-2">
      <input
        type="text"
        value={variant.color}
        onChange={(e) => onUpdate({ color: e.target.value })}
        placeholder="Cor"
        maxLength={40}
        className="h-9 rounded-md border border-border bg-bg-secondary px-2 text-sm focus:border-neon focus:outline-none"
      />
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={variant.colorHex ?? '#000000'}
          onChange={(e) => onUpdate({ colorHex: e.target.value })}
          className="h-9 w-9 cursor-pointer rounded border border-border bg-bg-secondary"
        />
        <input
          type="text"
          value={variant.colorHex ?? ''}
          onChange={(e) => onUpdate({ colorHex: e.target.value })}
          placeholder="#000000"
          maxLength={7}
          className="h-9 flex-1 rounded-md border border-border bg-bg-secondary px-2 font-mono text-xs focus:border-neon focus:outline-none"
        />
      </div>
      <input
        type="text"
        value={variant.size}
        onChange={(e) => onUpdate({ size: e.target.value })}
        placeholder="Tamanho"
        maxLength={10}
        className="h-9 rounded-md border border-border bg-bg-secondary px-2 text-center text-sm focus:border-neon focus:outline-none"
      />
      <input
        type="number"
        value={variant.stock}
        onChange={(e) =>
          onUpdate({ stock: Math.max(0, Number(e.target.value)) })
        }
        min="0"
        max="9999"
        className={cn(
          'h-9 rounded-md border bg-bg-secondary px-2 text-center text-sm focus:border-neon focus:outline-none',
          variant.stock === 0
            ? 'border-danger/40 text-danger'
            : 'border-border',
        )}
      />
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onDuplicate}
          aria-label="Duplicar"
          title="Duplicar variante"
          className="grid h-8 w-8 place-items-center rounded-md text-gray-400 hover:bg-bg-tertiary hover:text-foreground"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover"
          className="grid h-8 w-8 place-items-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
