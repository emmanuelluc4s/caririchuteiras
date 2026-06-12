import Link from 'next/link'
import { Scale, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CompareEmpty() {
  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-16 text-center">
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-bg-secondary">
        <Scale className="h-12 w-12 text-gray-600" />
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-3xl uppercase tracking-tight">
          Comparador vazio
        </h2>
        <p className="text-sm text-gray-400">
          Volte para o catálogo e adicione até 4 produtos para comparar lado a
          lado. Procure pelo ícone{' '}
          <Scale className="mx-0.5 inline-block h-3.5 w-3.5" /> nos cards.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/">
            Voltar para a home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/categoria/chuteiras-society">Ver chuteiras</Link>
        </Button>
      </div>
    </div>
  )
}
