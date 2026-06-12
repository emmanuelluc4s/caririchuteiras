'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCompareStore } from '@/lib/compare/compare-store'
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated'
import { COMPARE_MAX_ITEMS } from '@/lib/compare/types'

/**
 * Sincroniza o store com a URL na página /comparar.
 * - Ao carregar com IDs na URL e store vazio: importar da URL pro store
 * - Ao mudar store: atualizar URL
 */
export function CompareUrlSync() {
  const hydrated = useHasHydrated()
  const router = useRouter()
  const searchParams = useSearchParams()
  const items = useCompareStore((s) => s.items)
  const add = useCompareStore((s) => s.add)
  const importedRef = React.useRef(false)

  React.useEffect(() => {
    if (!hydrated || importedRef.current) return
    importedRef.current = true

    const idsParam = searchParams.get('ids') ?? ''
    const urlIds = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, COMPARE_MAX_ITEMS)

    if (urlIds.length === 0) return

    const currentIds = new Set(items.map((i) => i.productId))
    for (const id of urlIds) {
      if (!currentIds.has(id)) add(id)
    }
  }, [hydrated, searchParams, items, add])

  React.useEffect(() => {
    if (!hydrated || !importedRef.current) return

    const currentParams = searchParams.get('ids') ?? ''
    const newParams = items.map((i) => i.productId).join(',')

    if (currentParams !== newParams) {
      if (newParams) {
        router.replace(`/comparar?ids=${newParams}`, { scroll: false })
      } else {
        router.replace('/comparar', { scroll: false })
      }
    }
  }, [items, searchParams, router, hydrated])

  return null
}
