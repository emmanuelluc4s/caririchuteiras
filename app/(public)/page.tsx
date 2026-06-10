import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ProductShowcase,
  type ShowcaseProduct,
} from '@/components/public/whatsapp/_module3-showcase'

export const dynamic = 'force-dynamic'

type LoadedProduct = Prisma.ProductGetPayload<{
  include: {
    images: true
    variants: true
    category: true
  }
}>

type LoadData = {
  products: LoadedProduct[]
  productsCount: number
  leadsCount: number
  eventsCount: number
  dbOk: boolean
}

async function loadData(): Promise<LoadData> {
  try {
    const [products, productsCount, leadsCount, eventsCount] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          variants: {
            take: 4,
            where: { stock: { gt: 0 } },
            orderBy: [{ color: 'asc' }, { size: 'asc' }],
          },
          category: true,
        },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.whatsappLead.count(),
      prisma.siteEvent.count(),
    ])
    return { products, productsCount, leadsCount, eventsCount, dbOk: true }
  } catch {
    return {
      products: [],
      productsCount: 0,
      leadsCount: 0,
      eventsCount: 0,
      dbOk: false,
    }
  }
}

export default async function HomePage() {
  const { products, productsCount, leadsCount, eventsCount, dbOk } = await loadData()

  const showcaseProducts: ShowcaseProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    price: Number(p.price),
    promoPrice: p.promoPrice ? Number(p.promoPrice) : undefined,
    image: p.images[0]?.urlMedium,
    variants: p.variants.map((v) => ({
      color: v.color,
      colorHex: v.colorHex,
      size: v.size,
    })),
  }))

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 md:px-6 md:py-20">
      <section className="space-y-6 text-center">
        <Badge variant="new">MÓDULO 03 — SISTEMA WHATSAPP PRONTO</Badge>
        <h1 className="font-display text-5xl tracking-tight uppercase md:text-7xl">
          O <span className="text-neon neon-text">coração</span> do site
          <br />
          está batendo
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-400">
          Carrinho de intenção, drawer, builder de mensagem, tracking e botão flutuante integrados.
          Teste abaixo com produtos reais do banco.
        </p>
      </section>

      {!dbOk && (
        <Card className="border-warning/40">
          <CardHeader>
            <CardTitle className="text-warning">⚠️ Banco de dados não conectado</CardTitle>
            <CardDescription>
              O Showcase mostra zero produtos até você preencher{' '}
              <code className="text-neon">DATABASE_URL</code> no <code>.env</code> e rodar{' '}
              <code className="text-neon">pnpm db:push &amp;&amp; pnpm db:seed</code>. O sistema do
              WhatsApp continua funcionando — só não tem produto pra testar.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Status do sistema</CardTitle>
          <CardDescription>Dados em tempo real do Supabase</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="border-border bg-bg-secondary rounded-lg border p-4">
            <p className="text-xs tracking-wide text-gray-400 uppercase">Produtos ativos</p>
            <p className="font-display text-neon text-3xl">{productsCount}</p>
          </div>
          <div className="border-border bg-bg-secondary rounded-lg border p-4">
            <p className="text-xs tracking-wide text-gray-400 uppercase">Leads WhatsApp</p>
            <p className="font-display text-neon text-3xl">{leadsCount}</p>
          </div>
          <div className="border-border bg-bg-secondary rounded-lg border p-4">
            <p className="text-xs tracking-wide text-gray-400 uppercase">Eventos rastreados</p>
            <p className="font-display text-neon text-3xl">{eventsCount}</p>
          </div>
        </CardContent>
      </Card>

      {showcaseProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-3xl tracking-tight uppercase">
            🎯 Teste o sistema com produtos reais
          </h2>
          <p className="text-sm text-gray-400">
            Clique nos botões abaixo. Observe: o contador do botão flutuante atualiza, o drawer
            abre, a mensagem é construída e o tracking grava no banco.
          </p>

          <ProductShowcase products={showcaseProducts} />
        </section>
      )}

      <Card className="border-neon/40">
        <CardHeader>
          <CardTitle>Checklist manual de validação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-100">
          <p>1. ✅ Clique em &quot;Adicionar à conversa&quot; em vários produtos diferentes</p>
          <p>2. ✅ Veja o contador do botão flutuante (canto inferior direito) crescer</p>
          <p>3. ✅ Clique no botão flutuante — o drawer deve abrir pela direita</p>
          <p>
            4. ✅ Aumente/diminua quantidades, remova itens, aplique cupom{' '}
            <code className="text-neon">CARIRI10</code>
          </p>
          <p>
            5. ✅ Clique &quot;Enviar tudo no WhatsApp&quot; — abre wa.me com mensagem formatada
          </p>
          <p>6. ✅ Recarregue a página — o carrinho persiste (localStorage)</p>
          <p>
            7. ✅ Abra o Prisma Studio (<code>pnpm db:studio</code>) e veja registros em{' '}
            <code className="text-neon">SiteEvent</code> +{' '}
            <code className="text-neon">WhatsappLead</code>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
