'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, X, ArrowRight, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useCompareStore,
  selectCompareCount,
} from '@/lib/compare/compare-store'
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated'
import { COMPARE_MAX_ITEMS } from '@/lib/compare/types'

type ProductThumb = {
  id: string
  slug: string
  name: string
  brand: string
  imageUrl?: string
}

type Props = {
  thumbnails: ProductThumb[]
}

export function CompareBottomBar({ thumbnails }: Props) {
  const hydrated = useHasHydrated()
  const count = useCompareStore(selectCompareCount)
  const items = useCompareStore((s) => s.items)
  const remove = useCompareStore((s) => s.remove)
  const clear = useCompareStore((s) => s.clear)
  const [dismissed, setDismissed] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Reabrir quando adicionar novo item após ter dispensado
  React.useEffect(() => {
    if (count > 0 && dismissed) {
      const last = items[items.length - 1]
      if (last && Date.now() - last.addedAt < 1000) {
        setDismissed(false)
      }
    }
  }, [count, items, dismissed])

  const isOnComparePage = pathname === '/comparar'

  if (!hydrated || count === 0 || dismissed || isOnComparePage) {
    return null
  }

  const itemIds = items.map((i) => i.productId)
  const orderedThumbs = itemIds
    .map((id) => thumbnails.find((t) => t.id === id))
    .filter((t): t is ProductThumb => t !== undefined)

  const emptySlots = COMPARE_MAX_ITEMS - orderedThumbs.length

  function handleCompare() {
    const query = itemIds.join(',')
    router.push(`/comparar?ids=${query}`)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-neon/30 bg-bg-secondary/95 backdrop-blur-xl"
        style={{
          boxShadow: '0 -10px 40px rgba(107, 29, 255, 0.15)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        role="region"
        aria-label="Barra do comparador"
      >
        <div className="mx-auto max-w-7xl px-3 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden shrink-0 items-center gap-3 md:flex">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-neon/40 bg-neon/15">
                <Scale className="h-5 w-5 text-neon" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neon">
                  Comparar
                </p>
                <p className="text-[10px] text-gray-400">
                  {count} de {COMPARE_MAX_ITEMS} produtos
                </p>
              </div>
            </div>

            {/* Miniaturas */}
            <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-none">
              <AnimatePresence initial={false}>
                {orderedThumbs.map((thumb) => (
                  <motion.div
                    key={thumb.id}
                    layout
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="group relative shrink-0"
                  >
                    <Link
                      href={`/produto/${thumb.slug}`}
                      title={thumb.name}
                      className="relative block h-14 w-14 overflow-hidden rounded-lg border-2 border-border bg-bg-tertiary transition-all hover:border-neon md:h-16 md:w-16"
                    >
                      {thumb.imageUrl ? (
                        <Image
                          src={thumb.imageUrl}
                          alt={thumb.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[8px] text-gray-600">
                          sem foto
                        </div>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(thumb.id)}
                      aria-label={`Remover ${thumb.name}`}
                      className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-border bg-bg-primary text-gray-400 transition-all hover:border-danger hover:bg-danger hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}

                {Array.from({ length: emptySlots }).map((_, i) => (
                  <motion.div
                    key={`empty-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    exit={{ opacity: 0 }}
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border-2 border-dashed border-border bg-bg-tertiary/40 text-gray-600 md:h-16 md:w-16"
                    title="Adicione mais produtos"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={clear}
                aria-label="Limpar comparação"
                title="Limpar tudo"
                className="hidden h-10 w-10 place-items-center rounded-md text-gray-400 transition-colors hover:bg-bg-tertiary hover:text-danger sm:grid"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <Button
                onClick={handleCompare}
                disabled={count < 2}
                size="default"
                className="whitespace-nowrap"
              >
                <span className="hidden md:inline">Comparar agora</span>
                <span className="md:hidden">Comparar</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Fechar barra"
                className="grid h-10 w-10 place-items-center rounded-md text-gray-400 transition-colors hover:bg-bg-tertiary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {count < 2 && (
            <p className="mt-2 text-center text-[11px] text-gray-400 md:text-left">
              Adicione pelo menos 2 produtos para comparar
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
