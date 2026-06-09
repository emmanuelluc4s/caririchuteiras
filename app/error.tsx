'use client'

import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="font-display text-danger text-6xl">Erro</h1>
        <p className="text-gray-400">Algo deu errado. Tente novamente.</p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="bg-bg-secondary overflow-auto rounded-md p-4 text-left text-xs">
            {error.message}
          </pre>
        )}
        <Button onClick={reset}>Tentar novamente</Button>
      </div>
    </main>
  )
}
