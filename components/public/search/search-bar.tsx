'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { useSearchModal } from '@/lib/search/search-modal-store'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  placeholder?: string
}

export function SearchBar({
  className,
  placeholder = 'Buscar chuteiras, camisas, tênis...',
}: Props) {
  const open = useSearchModal((s) => s.open)
  const isOpen = useSearchModal((s) => s.isOpen)
  const [isMac, setIsMac] = React.useState(false)

  React.useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes('mac'))
  }, [])

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Abrir busca"
      aria-expanded={isOpen}
      className={cn(
        'group relative flex h-11 w-full max-w-xl items-center rounded-md border px-3 text-left transition-all',
        isOpen
          ? 'border-neon bg-bg-tertiary neon-glow-sm'
          : 'border-border bg-bg-secondary hover:border-neon/40',
        className,
      )}
    >
      <Search
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          isOpen ? 'text-neon' : 'text-gray-400',
        )}
      />
      <span className="ml-3 flex-1 truncate text-sm text-gray-400">
        {placeholder}
      </span>
      <kbd className="ml-2 hidden shrink-0 items-center gap-1 rounded border border-border bg-bg-primary px-1.5 py-0.5 font-mono text-[10px] text-gray-400 md:inline-flex">
        {isMac ? '⌘' : 'Ctrl'} K
      </kbd>
    </button>
  )
}
