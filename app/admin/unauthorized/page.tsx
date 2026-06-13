import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentAdmin } from '@/lib/admin/auth'
import { ADMIN_ROLE_LABELS } from '@/lib/admin/types'

export const metadata: Metadata = { title: 'Acesso negado' }

export default async function UnauthorizedPage() {
  const admin = await getCurrentAdmin()

  return (
    <main className="grid min-h-screen place-items-center bg-bg-primary px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-danger/30 bg-danger/10">
          <ShieldOff className="h-10 w-10 text-danger" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-3xl uppercase tracking-tight md:text-4xl">
            Acesso negado
          </h1>
          <p className="text-sm text-gray-100">
            Você não tem permissão para acessar esta área.
          </p>
          {admin && (
            <p className="mt-3 text-xs text-gray-400">
              Sua função atual:{' '}
              <strong className="text-foreground">
                {ADMIN_ROLE_LABELS[admin.role]}
              </strong>
            </p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>
    </main>
  )
}
