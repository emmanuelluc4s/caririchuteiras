import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductGridSkeleton } from '@/components/public/skeleton/product-card-skeleton'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 md:px-6 md:py-20">
      {/* Hero placeholder */}
      <section className="space-y-6 text-center">
        <Badge variant="new">MÓDULO 02 — LAYOUT GLOBAL PRONTO</Badge>
        <h1 className="font-display text-5xl tracking-tight uppercase md:text-8xl">
          A maior loja esportiva <br />
          <span className="text-neon neon-text">do Cariri</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-400">
          Header sticky, promo bar rotativa, mobile menu, footer estilo Nike, botão WhatsApp
          flutuante, cookie banner e tema escuro/claro instalados.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg">Ver Coleção</Button>
          <Button size="lg" variant="outline">
            Promoções
          </Button>
        </div>
      </section>

      {/* Status do módulo */}
      <Card>
        <CardHeader>
          <CardTitle>Validação do Módulo 02</CardTitle>
          <CardDescription>Componentes instalados nesta etapa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✅ Promo bar rotativa no topo (mensagens trocando a cada 4s)</p>
          <p>✅ Header sticky com escudo, busca, menu, tema e WhatsApp icon</p>
          <p>✅ Mobile menu via Sheet lateral</p>
          <p>✅ Footer estilo Nike com 4 colunas + CTA WhatsApp + marcas + selos</p>
          <p>✅ Botão WhatsApp flutuante circular com pulse e ondas</p>
          <p>✅ Cookie banner LGPD com 2 opções (rola apenas na 1ª visita)</p>
          <p>✅ Theme toggle com persistência localStorage e respeito a prefers-color-scheme</p>
        </CardContent>
      </Card>

      {/* Skeleton preview */}
      <section className="space-y-4">
        <h2 className="font-display text-3xl tracking-tight uppercase">Skeleton de carregamento</h2>
        <p className="text-sm text-gray-400">
          Componentes base de loading para uso nos próximos módulos.
        </p>
        <ProductGridSkeleton count={4} />
      </section>

      {/* Roteamento de teste — links que ainda não existem */}
      <Card>
        <CardHeader>
          <CardTitle>Rotas configuradas no menu</CardTitle>
          <CardDescription>
            Estas páginas serão criadas nos próximos módulos. Clique para verificar o 404
            customizado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            '/categoria/chuteiras-society',
            '/promocoes',
            '/novidades',
            '/quem-somos',
            '/contato',
            '/busca?q=nike',
          ].map((href) => (
            <Button key={href} asChild variant="ghost" size="sm">
              <a href={href}>{href}</a>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
