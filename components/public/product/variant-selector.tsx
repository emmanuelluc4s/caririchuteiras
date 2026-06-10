'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Variant = {
  id: string
  color: string
  colorHex: string | null
  size: string
  stock: number
}

type Props = {
  variants: Variant[]
  selectedColor?: string
  selectedSize?: string
  onColorChange: (color: string) => void
  onSizeChange: (size: string) => void
  onOpenSizeChart?: () => void
}

export function VariantSelector({
  variants,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
  onOpenSizeChart,
}: Props) {
  // Cores únicas, ordenadas
  const uniqueColors = React.useMemo(() => {
    const map = new Map<
      string,
      { color: string; colorHex: string | null; hasStock: boolean }
    >()
    for (const v of variants) {
      const existing = map.get(v.color)
      if (!existing) {
        map.set(v.color, {
          color: v.color,
          colorHex: v.colorHex,
          hasStock: v.stock > 0,
        })
      } else if (v.stock > 0) {
        existing.hasStock = true
      }
    }
    return Array.from(map.values())
  }, [variants])

  // Tamanhos da cor selecionada
  const sizesForColor = React.useMemo(() => {
    if (!selectedColor) return []
    const sizes = variants.filter((v) => v.color === selectedColor)
    return sizes.sort((a, b) => {
      const an = parseInt(a.size, 10)
      const bn = parseInt(b.size, 10)
      if (!isNaN(an) && !isNaN(bn)) return an - bn
      const order = ['P', 'M', 'G', 'GG', 'XGG']
      return order.indexOf(a.size) - order.indexOf(b.size)
    })
  }, [variants, selectedColor])

  const selectedVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize,
  )

  return (
    <div className="space-y-5">
      {/* Cor */}
      <div>
        <div className="mb-2.5 flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-wider text-gray-400">
            Cor:{' '}
            <span className="font-medium normal-case tracking-normal text-foreground">
              {selectedColor ?? 'Selecione'}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {uniqueColors.map((c) => {
            const isActive = c.color === selectedColor
            return (
              <button
                key={c.color}
                type="button"
                onClick={() => onColorChange(c.color)}
                aria-label={c.color}
                aria-pressed={isActive}
                title={c.color}
                disabled={!c.hasStock}
                className={cn(
                  'relative h-11 w-11 rounded-full border-2 transition-all',
                  isActive
                    ? 'scale-110 border-neon neon-glow-sm'
                    : 'border-border hover:scale-105 hover:border-neon/50',
                  !c.hasStock && 'cursor-not-allowed opacity-30',
                )}
                style={{ backgroundColor: c.colorHex ?? '#666' }}
              >
                {isActive && (
                  <Check
                    className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.7)]"
                    strokeWidth={3}
                  />
                )}
                {!c.hasStock && (
                  <span className="absolute inset-0 grid place-items-center">
                    <div className="h-12 w-0.5 rotate-45 bg-danger" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tamanho */}
      {sizesForColor.length > 0 && (
        <div>
          <div className="mb-2.5 flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-wider text-gray-400">
              Numeração:{' '}
              <span className="font-medium normal-case tracking-normal text-foreground">
                {selectedSize ?? 'Selecione'}
              </span>
            </p>
            {onOpenSizeChart && (
              <button
                type="button"
                onClick={onOpenSizeChart}
                className="text-xs text-neon underline-offset-2 hover:underline"
              >
                Tabela de numerações
              </button>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-7">
            {sizesForColor.map((v) => {
              const isActive = v.size === selectedSize
              const isAvailable = v.stock > 0
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSizeChange(v.size)}
                  aria-pressed={isActive}
                  disabled={!isAvailable}
                  className={cn(
                    'relative h-12 rounded-md border-2 text-sm font-semibold transition-all',
                    isActive
                      ? 'border-neon bg-neon/10 text-neon neon-glow-sm'
                      : isAvailable
                        ? 'border-border text-foreground hover:border-neon/50 hover:bg-bg-tertiary'
                        : 'cursor-not-allowed border-border text-gray-600',
                  )}
                >
                  {v.size}
                  {!isAvailable && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 grid place-items-center"
                    >
                      <span className="absolute h-full w-0.5 rotate-45 bg-gray-600" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Status do estoque */}
      {selectedVariant && (
        <div className="text-xs">
          {selectedVariant.stock === 0 ? (
            <p className="text-danger">⚠ Esta combinação está sem estoque</p>
          ) : selectedVariant.stock <= 3 ? (
            <p className="text-warning">🔥 Últimas {selectedVariant.stock} unidades</p>
          ) : (
            <p className="text-success">✓ Em estoque</p>
          )}
        </div>
      )}
    </div>
  )
}
