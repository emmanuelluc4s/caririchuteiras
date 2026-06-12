'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  distribution: Record<number, number>
  total: number
  average: number
  /** Filtro selecionado, ou null para "todas" */
  selectedRating?: number | null
  /** Callback ao clicar em uma estrela (filtra) */
  onSelectRating?: (rating: number | null) => void
}

export function RatingDistribution({
  distribution,
  total,
  average,
  selectedRating,
  onSelectRating,
}: Props) {
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[200px_1fr] md:gap-8">
      <div className="text-center sm:text-left">
        <p className="font-display text-6xl leading-none text-neon neon-text md:text-7xl">
          {average.toFixed(1)}
        </p>
        <div
          className="mt-2 flex justify-center gap-0.5 sm:justify-start"
          aria-label={`${average} de 5 estrelas`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-5 w-5',
                i < Math.round(average)
                  ? 'fill-warning text-warning'
                  : 'text-gray-600',
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {total} avaliaç{total === 1 ? 'ão' : 'ões'}
        </p>
      </div>

      <div className="space-y-1.5">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution[rating] ?? 0
          const percent = total > 0 ? (count / total) * 100 : 0
          const isActive = selectedRating === rating

          const Row = (
            <div
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-1 transition-colors',
                onSelectRating && 'cursor-pointer hover:bg-bg-tertiary',
                isActive && 'bg-neon/10',
              )}
            >
              <span className="inline-flex w-10 shrink-0 items-center gap-0.5 text-xs font-semibold">
                {rating}
                <Star className="h-3 w-3 fill-warning text-warning" />
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-tertiary">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isActive ? 'bg-neon' : 'bg-warning/70',
                  )}
                  style={{ width: `${percent}%` }}
                  aria-hidden="true"
                />
              </div>
              <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-gray-400">
                {count}
              </span>
            </div>
          )

          if (onSelectRating) {
            return (
              <button
                key={rating}
                type="button"
                onClick={() => onSelectRating(isActive ? null : rating)}
                aria-pressed={isActive}
                className="block w-full text-left"
              >
                {Row}
              </button>
            )
          }
          return <div key={rating}>{Row}</div>
        })}
      </div>
    </div>
  )
}
