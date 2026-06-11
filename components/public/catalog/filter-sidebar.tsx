'use client'

import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useCatalogFilters } from '@/lib/catalog/use-filters'
import type { CategoryFacets } from '@/lib/queries/catalog'
import { formatBRL, cn } from '@/lib/utils'

type Props = {
  facets: CategoryFacets
}

export function FilterSidebar({ facets }: Props) {
  const { filters, updateFilters } = useCatalogFilters()

  return (
    <aside className="space-y-1" aria-label="Filtros">
      {facets.brands.length > 0 && (
        <FilterSection title="Marca" defaultOpen>
          <BrandsFilter
            brands={facets.brands}
            selected={filters.brands}
            onChange={(brands) => updateFilters({ brands })}
          />
        </FilterSection>
      )}

      {facets.colors.length > 0 && (
        <FilterSection title="Cor" defaultOpen>
          <ColorsFilter
            colors={facets.colors}
            selected={filters.colors}
            onChange={(colors) => updateFilters({ colors })}
          />
        </FilterSection>
      )}

      {facets.sizes.length > 0 && (
        <FilterSection title="Numeração" defaultOpen>
          <SizesFilter
            sizes={facets.sizes}
            selected={filters.sizes}
            onChange={(sizes) => updateFilters({ sizes })}
          />
        </FilterSection>
      )}

      <FilterSection title="Faixa de preço" defaultOpen>
        <PriceFilter
          range={facets.priceRange}
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onChange={(min, max) =>
            updateFilters({ minPrice: min, maxPrice: max })
          }
        />
      </FilterSection>

      <FilterSection title="Outros filtros" defaultOpen>
        <ToggleFilters filters={filters} onChange={updateFilters} />
      </FilterSection>
    </aside>
  )
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <div className="border-b border-border py-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group flex w-full items-center justify-between text-left"
      >
        <span className="font-display text-base uppercase tracking-wide text-foreground transition-colors group-hover:text-neon">
          {title}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform duration-200',
            open ? 'rotate-180' : '',
          )}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <div className="pt-4">{children}</div>
      </motion.div>
    </div>
  )
}

function BrandsFilter({
  brands,
  selected,
  onChange,
}: {
  brands: Array<{ value: string; count: number }>
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  function toggle(brand: string) {
    if (selected.includes(brand)) {
      onChange(selected.filter((b) => b !== brand))
    } else {
      onChange([...selected, brand])
    }
  }

  return (
    <ul className="space-y-2">
      {brands.map((b) => {
        const isActive = selected.includes(b.value)
        return (
          <li key={b.value}>
            <button
              type="button"
              onClick={() => toggle(b.value)}
              className="group flex w-full items-center justify-between gap-2 py-1"
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'grid h-4 w-4 place-items-center rounded-sm border transition-all',
                    isActive
                      ? 'border-neon bg-neon'
                      : 'border-border group-hover:border-neon/50',
                  )}
                >
                  {isActive && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </span>
                <span
                  className={cn(
                    'text-sm transition-colors',
                    isActive
                      ? 'font-medium text-neon'
                      : 'text-foreground group-hover:text-neon',
                  )}
                >
                  {b.value}
                </span>
              </span>
              <span className="text-xs text-gray-600">({b.count})</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function ColorsFilter({
  colors,
  selected,
  onChange,
}: {
  colors: Array<{ value: string; hex: string | null }>
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  function toggle(color: string) {
    if (selected.includes(color)) {
      onChange(selected.filter((c) => c !== color))
    } else {
      onChange([...selected, color])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => {
        const isActive = selected.includes(c.value)
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => toggle(c.value)}
            aria-label={c.value}
            aria-pressed={isActive}
            title={c.value}
            className={cn(
              'relative h-9 w-9 rounded-full border-2 transition-all',
              isActive
                ? 'scale-110 border-neon neon-glow-sm'
                : 'border-border hover:border-neon/50',
            )}
            style={{ backgroundColor: c.hex ?? '#666' }}
          >
            {isActive && (
              <Check
                className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.7)]"
                strokeWidth={3}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

function SizesFilter({
  sizes,
  selected,
  onChange,
}: {
  sizes: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  function toggle(size: string) {
    if (selected.includes(size)) {
      onChange(selected.filter((s) => s !== size))
    } else {
      onChange([...selected, size])
    }
  }

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {sizes.map((s) => {
        const isActive = selected.includes(s)
        return (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            aria-pressed={isActive}
            className={cn(
              'h-9 rounded-md border-2 text-sm font-semibold transition-all',
              isActive
                ? 'border-neon bg-neon/10 text-neon'
                : 'border-border text-foreground hover:border-neon/50',
            )}
          >
            {s}
          </button>
        )
      })}
    </div>
  )
}

function PriceFilter({
  range,
  minPrice,
  maxPrice,
  onChange,
}: {
  range: { min: number; max: number }
  minPrice?: number
  maxPrice?: number
  onChange: (min: number | undefined, max: number | undefined) => void
}) {
  const [localValues, setLocalValues] = React.useState<[number, number]>([
    minPrice ?? range.min,
    maxPrice ?? range.max,
  ])
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setLocalValues([minPrice ?? range.min, maxPrice ?? range.max])
  }, [minPrice, maxPrice, range.min, range.max])

  function handleChange(values: number[]) {
    if (values.length < 2) return
    const next: [number, number] = [values[0]!, values[1]!]
    setLocalValues(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const newMin = next[0] === range.min ? undefined : next[0]
      const newMax = next[1] === range.max ? undefined : next[1]
      onChange(newMin, newMax)
    }, 350)
  }

  if (range.min === range.max) {
    return <p className="text-xs text-gray-400">Sem variação de preço.</p>
  }

  return (
    <div className="space-y-4 px-1 pt-2">
      <Slider
        value={localValues}
        min={range.min}
        max={range.max}
        step={Math.max(1, Math.floor((range.max - range.min) / 100))}
        onValueChange={handleChange}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="rounded-md border border-border bg-bg-primary px-3 py-1.5 text-xs">
          <p className="text-[10px] uppercase text-gray-400">Min</p>
          <p className="font-mono font-bold text-neon">
            {formatBRL(localValues[0])}
          </p>
        </div>
        <span className="text-gray-600">—</span>
        <div className="rounded-md border border-border bg-bg-primary px-3 py-1.5 text-xs">
          <p className="text-[10px] uppercase text-gray-400">Max</p>
          <p className="font-mono font-bold text-neon">
            {formatBRL(localValues[1])}
          </p>
        </div>
      </div>
    </div>
  )
}

function ToggleFilters({
  filters,
  onChange,
}: {
  filters: { onlyPromo: boolean; onlyNew: boolean; onlyInStock: boolean }
  onChange: (partial: {
    onlyPromo?: boolean
    onlyNew?: boolean
    onlyInStock?: boolean
  }) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="filter-promo"
          className="cursor-pointer text-sm text-foreground"
        >
          🔥 Apenas promoções
        </Label>
        <Switch
          id="filter-promo"
          checked={filters.onlyPromo}
          onCheckedChange={(v) => onChange({ onlyPromo: v })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label
          htmlFor="filter-new"
          className="cursor-pointer text-sm text-foreground"
        >
          ✨ Apenas novidades
        </Label>
        <Switch
          id="filter-new"
          checked={filters.onlyNew}
          onCheckedChange={(v) => onChange({ onlyNew: v })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label
          htmlFor="filter-stock"
          className="cursor-pointer text-sm text-foreground"
        >
          ✓ Apenas em estoque
        </Label>
        <Switch
          id="filter-stock"
          checked={filters.onlyInStock}
          onCheckedChange={(v) => onChange({ onlyInStock: v })}
        />
      </div>
    </div>
  )
}
