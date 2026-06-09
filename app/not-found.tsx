import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="space-y-6 text-center">
        <h1 className="font-display neon-text text-9xl">404</h1>
        <h2 className="font-display text-3xl uppercase">Esse produto driblou a gente</h2>
        <p className="text-gray-400">A página que você procura não existe ou foi removida.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link href="/">Voltar para a home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
