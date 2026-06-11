'use client'

import * as React from 'react'
import { SlidersHorizontal } from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FilterSidebar } from './filter-sidebar'
import type { CategoryFacets } from '@/lib/queries/catalog'
import { useCatalogFilters } from '@/lib/catalog/use-filters'
import { countActiveFilters } from '@/lib/catalog/filters-parser'

type Props = {
  facets: CategoryFacets
}

export function FilterDrawer({ facets }: Props) {
  const { filters, clearAll } = useCatalogFilters()
  const activeCount = countActiveFilters(filters)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="lg" className="relative w-full md:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-neon px-1.5 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l border-border bg-bg-primary p-0 sm:max-w-sm"
      >
        <SheetHeader className="shrink-0 border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display text-xl uppercase tracking-tight">
            <SlidersHorizontal className="h-5 w-5 text-neon" />
            Filtros
            {activeCount > 0 && (
              <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-neon px-2 text-xs font-bold text-white">
                {activeCount}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-5">
          <div className="py-4">
            <FilterSidebar facets={facets} />
          </div>
        </ScrollArea>

        <div className="flex shrink-0 gap-2 border-t border-border bg-bg-secondary p-4">
          {activeCount > 0 && (
            <Button
              variant="outline"
              size="default"
              onClick={clearAll}
              className="flex-1"
            >
              Limpar
            </Button>
          )}
          <SheetClose asChild>
            <Button variant="default" size="default" className="flex-1">
              Aplicar
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
