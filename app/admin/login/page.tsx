import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin/auth'
import { LoginForm } from '@/components/admin/login/login-form'

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Painel administrativo da Cariri Chuteiras',
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const sp = await searchParams
  const admin = await getCurrentAdmin()
  if (admin) {
    const redirectTo = sp.redirect
    redirect(
      redirectTo && redirectTo.startsWith('/admin') ? redirectTo : '/admin',
    )
  }

  const redirectTo = sp.redirect

  return (
    <main className="grid min-h-screen bg-bg-primary lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-bg-secondary p-12 lg:flex">
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-neon/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-neon/10 blur-3xl"
          aria-hidden="true"
        />

        <Link href="/" className="group relative inline-flex items-center gap-3">
          <Image
            src="/escudo.svg"
            alt=""
            width={48}
            height={56}
            className="transition-transform group-hover:scale-110"
          />
          <div>
            <p className="font-display text-xl uppercase tracking-tight">
              Cariri <span className="text-neon">Chuteiras</span>
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400">
              Painel admin
            </p>
          </div>
        </Link>

        <div className="relative space-y-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-neon">
              Bem-vindo
            </p>
            <h2 className="font-display text-4xl uppercase leading-tight tracking-tight xl:text-5xl">
              Controle total <br />
              <span className="text-neon">do catálogo</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-gray-100">
            Gerencie produtos, categorias, cupons, avaliações e configurações
            do site em um só lugar. Cada alteração é registrada e auditada.
          </p>
        </div>

        <div className="relative">
          <p className="text-[10px] text-gray-500">
            Versão 1.0 • Desenvolvido com ❤️ no Cariri
          </p>
        </div>
      </aside>

      <div className="relative flex flex-col justify-center px-6 py-12 md:px-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-3 lg:hidden"
        >
          <Image src="/escudo.svg" alt="" width={36} height={42} />
          <div>
            <p className="font-display text-base uppercase tracking-tight">
              Cariri <span className="text-neon">Chuteiras</span>
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400">
              Painel admin
            </p>
          </div>
        </Link>

        <div className="mx-auto w-full max-w-md space-y-6">
          <div>
            <h1 className="mb-2 font-display text-3xl uppercase tracking-tight md:text-4xl">
              Entrar
            </h1>
            <p className="text-sm text-gray-400">
              Acesse o painel com seu email e senha cadastrados.
            </p>
          </div>

          <LoginForm redirectTo={redirectTo} />

          <p className="border-t border-border pt-4 text-center text-xs text-gray-400">
            Esqueceu a senha? Entre em contato com um administrador.
          </p>
        </div>
      </div>
    </main>
  )
}
