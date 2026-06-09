import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/public/layout/logo'

export default function NotFound() {
  return (
    <main className="bg-bg-primary flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <Logo variant="shield" width={120} height={140} href={undefined} />
        </div>
        <h1 className="font-display neon-text text-neon text-8xl md:text-9xl">404</h1>
        <h2 className="font-display text-2xl tracking-tight uppercase md:text-3xl">
          Esse produto driblou a gente
        </h2>
        <p className="text-gray-400">A página que você procura não existe ou foi removida.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Voltar para a home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/promocoes">Ver promoções</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
