'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { History, Trash2, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useRecentlyViewedStore } from '@/lib/recently-viewed/store'
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated'
import { formatBRL } from '@/lib/utils'

export function RecentlyViewedDropdown() {
  const hydrated = useHasHydrated()
  const items = useRecentlyViewedStore((s) => s.items)
  const clear = useRecentlyViewedStore((s) => s.clear)
  const [open, setOpen] = React.useState(false)

  if (!hydrated || items.length === 0) return null

  const displayed = items.slice(0, 5)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Vistos recentemente (${items.length})`}
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-bg-tertiary hover:text-neon"
        >
          <History className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-neon px-1 text-[9px] font-bold text-white">
            {items.length}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 overflow-hidden border-border bg-bg-secondary p-0"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-neon" />
            <span className="font-display text-sm uppercase tracking-wide">
              Vistos recentemente
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-bg-tertiary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <ul className="max-h-[400px] overflow-y-auto py-2">
          {displayed.map((item) => (
            <li key={item.productId}>
              <Link
                href={`/produto/${item.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-bg-tertiary"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-bg-tertiary">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-neon">
                    {item.brand}
                  </p>
                  <p className="line-clamp-1 text-xs text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-0.5 font-display text-sm leading-none text-neon">
                    {formatBRL(item.promoPrice ?? item.price)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <footer className="flex items-center justify-between border-t border-border bg-bg-primary/40 px-4 py-3">
          {items.length > 5 ? (
            <span className="text-[10px] text-gray-400">
              +{items.length - 5} produto{items.length - 5 > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-[10px] text-gray-400">
              {items.length} de 8 produtos
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm('Limpar histórico?')) clear()
            }}
            className="inline-flex items-center gap-1 text-[11px] text-gray-400 transition-colors hover:text-danger"
          >
            <Trash2 className="h-3 w-3" />
            Limpar
          </button>
        </footer>
      </PopoverContent>
    </Popover>
  )
}
