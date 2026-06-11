'use client'

import * as React from 'react'
import { ArrowUpDown, Check } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useCatalogFilters } from '@/lib/catalog/use-filters'
import { SORT_LABELS, type SortOption } from '@/lib/catalog/filters-schema'
import { cn } from '@/lib/utils'

const OPTIONS: SortOption[] = [
  'best',
  'newest',
  'price-asc',
  'price-desc',
  'discount',
  'name-asc',
]

export function SortDropdown() {
  const { filters, updateFilters } = useCatalogFilters()
  const [open, setOpen] = React.useState(false)

  function handleSelect(option: SortOption) {
    updateFilters({ sort: option })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="min-w-[180px] justify-between"
        >
          <span className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="text-sm">{SORT_LABELS[filters.sort]}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-56 border-border bg-bg-secondary p-1"
      >
        <ul className="space-y-0.5">
          {OPTIONS.map((opt) => {
            const isActive = filters.sort === opt
            return (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-neon/10 font-medium text-neon'
                      : 'text-foreground hover:bg-bg-tertiary',
                  )}
                >
                  {SORT_LABELS[opt]}
                  {isActive && <Check className="h-4 w-4" />}
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
