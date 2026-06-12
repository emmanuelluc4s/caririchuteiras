import type { Metadata } from 'next'
import { FileText } from 'lucide-react'
import { PageHero } from '@/components/public/static/page-hero'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de Uso do site Cariri Chuteiras.',
  alternates: { canonical: '/termos' },
}

const PROSE_CLASS =
  'prose prose-invert prose-sm md:prose-base max-w-none space-y-6 text-gray-100 leading-relaxed [&_h2]:font-display [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_strong]:text-foreground [&_a]:text-neon [&_a]:underline-offset-4 [&_a]:hover:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1'

export default function TermosPage() {
  const updatedAt = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <PageHero
        eyebrow="Termos legais"
        title="Termos de Uso"
        description={
          <p>
            Última atualização:{' '}
            <strong className="text-foreground">{updatedAt}</strong>
          </p>
        }
        icon={<FileText className="h-5 w-5 text-neon" />}
        size="sm"
      />

      <article className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
        <div className={PROSE_CLASS}>
          <section>
            <p className="text-base">
              Bem-vindo ao site da <strong>Cariri Chuteiras</strong>. Ao
              acessar e usar este site, você concorda com os termos abaixo.
              Leia com atenção antes de continuar.
            </p>
          </section>

          <section>
            <h2>1. Sobre o site</h2>
            <p>
              Este site é um <strong>catálogo digital</strong> da Cariri
              Chuteiras. Ele tem por objetivo apresentar os produtos
              disponíveis na loja e permitir que você inicie uma conversa via
              WhatsApp para confirmar disponibilidade, fechar pedido e
              combinar entrega.
            </p>
            <p>
              <strong>Importante:</strong> as compras e pagamentos NÃO
              acontecem aqui no site. Todo fechamento é feito diretamente com
              nossa equipe pelo WhatsApp.
            </p>
          </section>

          <section>
            <h2>2. Preços e disponibilidade</h2>
            <ul>
              <li>
                Os preços exibidos são informativos e podem ser alterados sem
                aviso prévio.
              </li>
              <li>
                A disponibilidade de cores, numerações e quantidades é
                confirmada apenas na conversa do WhatsApp.
              </li>
              <li>
                Promoções e cupons têm prazo de validade — confira sempre as
                condições antes de usar.
              </li>
              <li>
                Erros de digitação ou exibição não obrigam a loja a vender por
                valores incorretos.
              </li>
              <li>
                Parcelamento, formas de pagamento e descontos finais são
                negociados no WhatsApp.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Como funcionam os pedidos</h2>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Você escolhe o produto no site e clica em &ldquo;Adicionar à
                conversa&rdquo;.
              </li>
              <li>O site abre o WhatsApp com a mensagem pré-formatada.</li>
              <li>Você envia a mensagem para nossa equipe.</li>
              <li>
                Confirmamos disponibilidade, combinamos forma de pagamento,
                entrega ou retirada.
              </li>
              <li>Pedido fechado e enviado conforme acordado.</li>
            </ol>
          </section>

          <section>
            <h2>4. Entrega e retirada</h2>
            <ul>
              <li>
                Realizamos entregas para a região do Cariri (Barbalha,
                Juazeiro do Norte, Crato, Missão Velha e arredores).
              </li>
              <li>
                Prazos e valores de frete são informados durante a conversa no
                WhatsApp, conforme localização.
              </li>
              <li>
                Retirada na loja física disponível em horário comercial.
              </li>
            </ul>
          </section>

          <section>
            <h2>5. Trocas e devoluções</h2>
            <ul>
              <li>
                Trocas por defeito de fabricação são aceitas em até 30 dias da
                entrega, conforme legislação.
              </li>
              <li>
                Trocas por desistência (arrependimento) são aceitas em até 7
                dias úteis para compras feitas online, conforme o Código de
                Defesa do Consumidor.
              </li>
              <li>
                O produto deve estar em perfeitas condições — sem uso, com
                etiquetas e embalagem original.
              </li>
              <li>O processo de troca é iniciado pelo WhatsApp.</li>
            </ul>
          </section>

          <section>
            <h2>6. Avaliações de clientes</h2>
            <p>
              Você pode deixar avaliações nos produtos. Ao fazer isso, você
              concorda que:
            </p>
            <ul>
              <li>
                O conteúdo será revisado antes de aparecer no site (moderação
                manual).
              </li>
              <li>Não publicará palavras ofensivas, discriminatórias ou spam.</li>
              <li>
                O nome e cidade que você informar serão exibidos publicamente.
              </li>
              <li>
                Reservamos o direito de remover avaliações que violem estas
                regras sem aviso prévio.
              </li>
            </ul>
          </section>

          <section>
            <h2>7. Uso permitido do site</h2>
            <p>Ao usar este site, você concorda em:</p>
            <ul>
              <li>
                Não tentar prejudicar o funcionamento técnico (ataques,
                scraping abusivo)
              </li>
              <li>Não enviar conteúdo malicioso através de formulários</li>
              <li>
                Não usar imagens ou textos do site sem autorização para fins
                comerciais
              </li>
              <li>
                Respeitar os direitos de propriedade intelectual das marcas e
                do site
              </li>
            </ul>
          </section>

          <section>
            <h2>8. Propriedade intelectual</h2>
            <p>
              Todo conteúdo do site — logotipo, identidade visual, textos,
              organização — pertence à <strong>Cariri Chuteiras</strong>. As
              marcas dos fabricantes (Nike, Adidas, Puma, Penalty, Topper,
              Umbro) pertencem aos respectivos proprietários e são exibidas
              apenas para identificar produtos vendidos legalmente.
            </p>
          </section>

          <section>
            <h2>9. Limitação de responsabilidade</h2>
            <p>
              A Cariri Chuteiras se esforça para manter o site sempre no ar e
              com informações corretas, mas não se responsabiliza por:
            </p>
            <ul>
              <li>Indisponibilidades momentâneas do site</li>
              <li>Erros de digitação que sejam corrigidos rapidamente</li>
              <li>
                Atrasos de entrega causados por terceiros (transportadoras,
                intempéries)
              </li>
              <li>
                Conteúdo de sites externos linkados a partir daqui (redes
                sociais, mapas etc.)
              </li>
            </ul>
          </section>

          <section>
            <h2>10. Privacidade</h2>
            <p>
              O tratamento de dados pessoais segue nossa{' '}
              <a href="/privacidade">Política de Privacidade</a>, em
              conformidade com a LGPD.
            </p>
          </section>

          <section>
            <h2>11. Alterações nos termos</h2>
            <p>
              Podemos atualizar estes Termos de Uso a qualquer momento. A data
              de atualização estará sempre no topo da página. Mudanças
              significativas serão comunicadas.
            </p>
          </section>

          <section>
            <h2>12. Lei aplicável e foro</h2>
            <p>
              Estes Termos são regidos pelas leis brasileiras. Quaisquer
              disputas serão resolvidas no{' '}
              <strong>foro da comarca de Barbalha/CE</strong>, salvo
              disposição legal em contrário.
            </p>
          </section>

          <section>
            <h2>13. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos, entre em contato pelo WhatsApp
              através da página de <a href="/contato">Contato</a>.
            </p>
          </section>
        </div>
      </article>
    </>
  )
}
