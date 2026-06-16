'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  currentPage: number
  totalPages: number
  baseHref: string
}

export function AdminPagination({ currentPage, totalPages, baseHref }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function go(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) params.delete('pagina')
    else params.set('pagina', String(page))
    const q = params.toString()
    router.push(q ? `${baseHref}?${q}` : baseHref)
  }

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Paginação"
    >
      <button
        type="button"
        onClick={() => go(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Anterior"
        className="grid h-9 w-9 place-items-center rounded-md border border-border text-foreground transition-all hover:border-neon hover:text-neon disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="px-3 text-sm text-gray-100">
        Página <strong className="text-foreground">{currentPage}</strong> de{' '}
        <strong className="text-foreground">{totalPages}</strong>
      </span>
      <button
        type="button"
        onClick={() => go(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Próximo"
        className="grid h-9 w-9 place-items-center rounded-md border border-border text-foreground transition-all hover:border-neon hover:text-neon disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
