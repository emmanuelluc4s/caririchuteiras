'use client'

import { Search } from 'lucide-react'
import type { TopSearchData } from '@/lib/admin/dashboard/types'

type Props = {
  data: TopSearchData[]
}

export function ChartTopSearches({ data }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <article className="rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-neon" />
          <h2 className="font-display text-base uppercase tracking-tight">
            Termos mais buscados
          </h2>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          O que as pessoas estão procurando
        </p>
      </header>

      {data.length === 0 ? (
        <div className="grid h-64 place-items-center text-center">
          <div>
            <Search className="mx-auto mb-2 h-10 w-10 text-gray-600" />
            <p className="text-sm text-gray-400">Sem buscas no período</p>
          </div>
        </div>
      ) : (
        <ol className="space-y-3">
          {data.map((item, i) => {
            const percent = (item.count / max) * 100
            return (
              <li key={item.query} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex min-w-0 items-center gap-2 text-xs">
                    <span className="w-5 shrink-0 text-center font-mono text-[10px] text-gray-400">
                      #{i + 1}
                    </span>
                    <code
                      className="truncate text-foreground"
                      title={item.query}
                    >
                      &ldquo;{item.query}&rdquo;
                    </code>
                  </p>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-neon">
                    {item.count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bg-tertiary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-warning/60 to-warning transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </article>
  )
}
