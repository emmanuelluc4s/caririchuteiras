'use client'

import { X, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCatalogFilters } from '@/lib/catalog/use-filters'
import { formatBRL } from '@/lib/utils'

export function ActiveFiltersBar() {
  const { filters, updateFilters, clearAll } = useCatalogFilters()

  const chips: Array<{ key: string; label: string; onRemove: () => void }> = []

  filters.brands.forEach((b) => {
    chips.push({
      key: `brand-${b}`,
      label: b,
      onRemove: () =>
        updateFilters({ brands: filters.brands.filter((x) => x !== b) }),
    })
  })

  filters.colors.forEach((c) => {
    chips.push({
      key: `color-${c}`,
      label: c,
      onRemove: () =>
        updateFilters({ colors: filters.colors.filter((x) => x !== c) }),
    })
  })

  filters.sizes.forEach((s) => {
    chips.push({
      key: `size-${s}`,
      label: `Num. ${s}`,
      onRemove: () =>
        updateFilters({ sizes: filters.sizes.filter((x) => x !== s) }),
    })
  })

  if (filters.minPrice != null || filters.maxPrice != null) {
    const minLabel =
      filters.minPrice != null ? formatBRL(filters.minPrice) : 'Min'
    const maxLabel =
      filters.maxPrice != null ? formatBRL(filters.maxPrice) : 'Max'
    chips.push({
      key: 'price',
      label: `${minLabel} — ${maxLabel}`,
      onRemove: () =>
        updateFilters({ minPrice: undefined, maxPrice: undefined }),
    })
  }

  if (filters.onlyPromo) {
    chips.push({
      key: 'promo',
      label: '🔥 Promoções',
      onRemove: () => updateFilters({ onlyPromo: false }),
    })
  }
  if (filters.onlyNew) {
    chips.push({
      key: 'new',
      label: '✨ Novidades',
      onRemove: () => updateFilters({ onlyNew: false }),
    })
  }
  if (filters.onlyInStock === false) {
    chips.push({
      key: 'stock',
      label: 'Incluindo esgotados',
      onRemove: () => updateFilters({ onlyInStock: true }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="region"
      aria-label="Filtros ativos"
    >
      <span className="shrink-0 text-xs uppercase tracking-wider text-gray-400">
        Filtros:
      </span>

      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.button
            key={chip.key}
            type="button"
            onClick={chip.onRemove}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            aria-label={`Remover filtro: ${chip.label}`}
            className="group inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-xs font-medium text-neon transition-all hover:bg-neon hover:text-white"
          >
            {chip.label}
            <X className="h-3 w-3 opacity-70 group-hover:opacity-100" />
          </motion.button>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={clearAll}
        className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-danger"
      >
        <Trash2 className="h-3 w-3" />
        Limpar tudo
      </button>
    </div>
  )
}
