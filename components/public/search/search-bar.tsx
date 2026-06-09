'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

type Props = {
  className?: string
  placeholder?: string
}

export function SearchBar({
  className,
  placeholder = 'Buscar chuteiras, camisas, tênis...',
}: Props) {
  const router = useRouter()
  const [query, setQuery] = React.useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/busca?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`relative flex w-full max-w-xl items-center ${className ?? ''}`}
    >
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="border-border bg-bg-secondary text-foreground focus:border-neon focus:ring-neon/30 h-11 w-full rounded-md border pl-10 pr-4 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2"
        aria-label="Buscar produtos"
      />
    </form>
  )
}
