import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Package, MessageSquare, BarChart3 } from 'lucide-react'
import { getCurrentAdmin } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Dashboard' }

async function fetchStats() {
  try {
    const [productsCount, reviewsPending, todayEvents] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.siteEvent.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ])
    return { productsCount, reviewsPending, todayEvents }
  } catch {
    return { productsCount: 0, reviewsPending: 0, todayEvents: 0 }
  }
}

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin()
  if (!admin) return null

  const { productsCount, reviewsPending, todayEvents } = await fetchStats()

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-8 md:py-10">
      <header className="space-y-2">
        <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-neon">
          <Sparkles className="h-3.5 w-3.5" />
          Painel Admin
        </p>
        <h1 className="font-display text-3xl uppercase leading-tight tracking-tight md:text-5xl">
          Olá, <span className="text-neon">{admin.name.split(' ')[0]}</span>
        </h1>
        <p className="text-sm text-gray-100">
          Bem-vindo de volta ao painel da Cariri Chuteiras. Aqui é onde a
          mágica acontece.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Package className="h-5 w-5 text-neon" />}
          label="Produtos ativos"
          value={productsCount}
          href="/admin/produtos"
        />
        <StatCard
          icon={<MessageSquare className="h-5 w-5 text-warning" />}
          label="Avaliações pendentes"
          value={reviewsPending}
          href="/admin/avaliacoes"
          highlight={reviewsPending > 0}
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5 text-success" />}
          label="Eventos hoje"
          value={todayEvents}
          href="/admin/dashboard"
        />
      </section>

      <section className="rounded-2xl border border-neon/30 bg-bg-secondary p-6 md:p-8">
        <h2 className="mb-3 font-display text-xl uppercase tracking-tight md:text-2xl">
          🚧 Painel em construção
        </h2>
        <p className="mb-4 text-sm text-gray-100">
          Esta é a versão inicial do painel. Os módulos abaixo serão liberados
          em breve:
        </p>
        <ul className="mb-5 grid gap-2 text-sm text-gray-100 sm:grid-cols-2">
          <li>📦 CRUD completo de produtos (Módulo 13)</li>
          <li>🗂️ Categorias, cupons e avaliações (Módulo 14)</li>
          <li>📊 Dashboard com gráficos reais (Módulo 15)</li>
          <li>⚙️ Configurações e usuários (Módulo 16)</li>
        </ul>
        <Button asChild>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            Ver site público
          </Link>
        </Button>
      </section>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  href,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: number
  href: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group rounded-lg border bg-bg-secondary p-5 transition-all hover:border-neon ${
        highlight ? 'border-warning/40' : 'border-border'
      }`}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-md border border-border bg-bg-primary">
          {icon}
        </div>
        <p className="text-xs uppercase tracking-wider text-gray-400">
          {label}
        </p>
      </div>
      <p className="font-display text-4xl leading-none text-foreground transition-colors group-hover:text-neon">
        {value}
      </p>
    </Link>
  )
}
