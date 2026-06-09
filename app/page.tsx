import type { Prisma } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { formatBRL } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type FeaturedProduct = Prisma.ProductGetPayload<{
  include: { images: true; category: true }
}>

export default async function Home() {
  let productsCount = 0
  let categoriesCount = 0
  let featuredProducts: FeaturedProduct[] = []
  let dbAvailable = true

  try {
    productsCount = await prisma.product.count()
    categoriesCount = await prisma.category.count()
    featuredProducts = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: 3,
      include: { images: { take: 1, orderBy: { order: 'asc' } }, category: true },
    })
  } catch {
    dbAvailable = false
  }

  return (
    <main className="min-h-screen p-8 md:p-16">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header de teste */}
        <header className="text-center">
          <Badge variant="new" className="mb-4">
            MÓDULO 01 — FUNDAÇÃO PRONTA
          </Badge>
          <h1 className="font-display neon-text text-6xl tracking-tight uppercase md:text-8xl">
            Cariri <span className="text-neon">Chuteiras</span>
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            A maior loja esportiva do Cariri — fundação técnica instalada com sucesso 🚀
          </p>
        </header>

        {/* Aviso de DB (se não conectado) */}
        {!dbAvailable && (
          <Card className="border-warning/40">
            <CardHeader>
              <CardTitle className="text-warning">⚠️ Banco de dados não conectado</CardTitle>
              <CardDescription>
                Preencha <code className="text-neon">DATABASE_URL</code> e{' '}
                <code className="text-neon">DIRECT_URL</code> em <code>.env</code> e{' '}
                <code>.env.local</code> com as credenciais do seu projeto Supabase, depois rode{' '}
                <code className="text-neon">pnpm db:push &amp;&amp; pnpm db:seed</code>.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Status do banco */}
        <Card>
          <CardHeader>
            <CardTitle>Status do banco de dados</CardTitle>
            <CardDescription>Validação do seed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              {dbAvailable ? '✅' : '⏳'} Produtos cadastrados:{' '}
              <strong className="text-neon">{productsCount}</strong>
            </p>
            <p>
              {dbAvailable ? '✅' : '⏳'} Categorias:{' '}
              <strong className="text-neon">{categoriesCount}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Botões — testar variantes */}
        <Card>
          <CardHeader>
            <CardTitle>Design System — Botões</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>CTA Principal</Button>
            <Button variant="whatsapp">WhatsApp</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button size="lg">Grande</Button>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="new">Novo</Badge>
            <Badge variant="danger">-30%</Badge>
            <Badge variant="success">Em estoque</Badge>
            <Badge variant="outline">Outline</Badge>
          </CardContent>
        </Card>

        {/* Produtos em destaque */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos em destaque</CardTitle>
            <CardDescription>Vindo direto do Supabase via Prisma</CardDescription>
          </CardHeader>
          <CardContent>
            {featuredProducts.length === 0 ? (
              <p className="text-gray-400">
                Nenhum produto em destaque ainda. Rode <code>pnpm db:seed</code>.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {featuredProducts.map((p) => (
                  <Card key={p.id} className="overflow-hidden">
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0].urlMedium}
                        alt={p.images[0].alt ?? p.name}
                        className="aspect-square w-full object-cover"
                      />
                    )}
                    <div className="space-y-2 p-4">
                      <Badge variant="outline" className="text-xs">
                        {p.brand}
                      </Badge>
                      <h3 className="font-display text-xl">{p.name}</h3>
                      <p className="text-sm text-gray-400">{p.category.name}</p>
                      <div className="flex items-baseline gap-2">
                        {p.promoPrice ? (
                          <>
                            <span className="text-sm text-gray-600 line-through">
                              {formatBRL(Number(p.price))}
                            </span>
                            <span className="text-neon text-xl font-bold">
                              {formatBRL(Number(p.promoPrice))}
                            </span>
                          </>
                        ) : (
                          <span className="text-neon text-xl font-bold">
                            {formatBRL(Number(p.price))}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
