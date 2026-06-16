'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

type Props = {
  categories: Array<{ id: string; name: string }>
  brands: string[]
}

export function ProductsFilters({ categories, brands }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = React.useState(
    searchParams.get('q') ?? '',
  )

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all' && value !== '') params.set(key, value)
    else params.delete(key)
    params.delete('pagina')
    const q = params.toString()
    router.push(q ? `/admin/produtos?${q}` : '/admin/produtos')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    update('q', searchValue.trim() || null)
  }

  function clearAll() {
    setSearchValue('')
    router.push('/admin/produtos')
  }

  const hasFilters = Array.from(searchParams.keys()).some(
    (k) => k !== 'pagina',
  )

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Buscar por nome, SKU ou marca..."
          className="h-10 w-full rounded-md border border-border bg-bg-secondary pl-10 pr-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Categoria"
          value={searchParams.get('categoria') ?? 'all'}
          options={[
            { value: 'all', label: 'Todas' },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
          onChange={(v) => update('categoria', v === 'all' ? null : v)}
        />
        <FilterSelect
          label="Marca"
          value={searchParams.get('marca') ?? 'all'}
          options={[
            { value: 'all', label: 'Todas' },
            ...brands.map((b) => ({ value: b, label: b })),
          ]}
          onChange={(v) => update('marca', v === 'all' ? null : v)}
        />
        <FilterSelect
          label="Status"
          value={searchParams.get('status') ?? 'all'}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'active', label: 'Ativos' },
            { value: 'inactive', label: 'Inativos' },
          ]}
          onChange={(v) => update('status', v)}
        />
        <FilterSelect
          label="Estoque"
          value={searchParams.get('estoque') ?? 'all'}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'in-stock', label: '5+ unidades' },
            { value: 'low-stock', label: '1-4 unidades' },
            { value: 'out-of-stock', label: 'Sem estoque' },
          ]}
          onChange={(v) => update('estoque', v)}
        />
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-danger"
          >
            <X className="h-3 w-3" />
            Limpar tudo
          </button>
        )}
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <label className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-bg-secondary px-3 text-xs">
      <span className="whitespace-nowrap uppercase tracking-wider text-gray-400">
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-foreground outline-none"
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-bg-secondary"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}
