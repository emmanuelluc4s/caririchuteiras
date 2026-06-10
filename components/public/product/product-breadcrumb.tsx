import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

type Item = { name: string; href: string }

type Props = {
  items: Item[]
}

export function ProductBreadcrumb({ items }: Props) {
  return (
    <nav
      aria-label="Caminho de navegação"
      className="flex items-center gap-1.5 overflow-x-auto text-xs text-gray-400 scrollbar-none md:text-sm"
    >
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-1 transition-colors hover:text-neon"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only md:not-sr-only">Início</span>
      </Link>

      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span
            key={`${item.href}-${i}`}
            className="inline-flex shrink-0 items-center gap-1.5"
          >
            <ChevronRight className="h-3.5 w-3.5 text-gray-600" aria-hidden="true" />
            {isLast ? (
              <span
                aria-current="page"
                className="max-w-[200px] truncate font-medium text-foreground"
              >
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="max-w-[180px] truncate transition-colors hover:text-neon"
              >
                {item.name}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
