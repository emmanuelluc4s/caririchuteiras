'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Package, ImageOff } from 'lucide-react'
import type { TopProductData } from '@/lib/admin/dashboard/types'

type Props = {
  title: string
  description?: string
  data: TopProductData[]
  metricLabel: string
}

export function ChartTopProducts({ title, description, data }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <article className="rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-neon" />
          <h2 className="font-display text-base uppercase tracking-tight">
            {title}
          </h2>
        </div>
        {description && (
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        )}
      </header>

      {data.length === 0 ? (
        <div className="grid h-64 place-items-center text-center">
          <div>
            <Package className="mx-auto mb-2 h-10 w-10 text-gray-600" />
            <p className="text-sm text-gray-400">Sem dados no período</p>
          </div>
        </div>
      ) : (
        <ol className="space-y-2.5">
          {data.map((item, i) => {
            const percent = (item.count / max) * 100
            return (
              <li key={item.productId}>
                <Link
                  href={`/admin/produtos/${item.productId}/editar`}
                  className="group -mx-2 flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-bg-tertiary"
                >
                  <span className="w-5 shrink-0 text-center font-mono text-[10px] text-gray-400">
                    #{i + 1}
                  </span>
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-bg-tertiary">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <ImageOff className="h-3 w-3 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-xs font-medium text-foreground transition-colors group-hover:text-neon">
                        {item.name}
                      </p>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-neon">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-neon/60 to-neon transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </article>
  )
}
