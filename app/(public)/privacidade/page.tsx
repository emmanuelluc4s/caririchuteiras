import type { Metadata } from 'next'
import { Shield } from 'lucide-react'
import { PageHero } from '@/components/public/static/page-hero'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Política de Privacidade da Cariri Chuteiras conforme a LGPD (Lei Geral de Proteção de Dados).',
  alternates: { canonical: '/privacidade' },
}

const PROSE_CLASS =
  'prose prose-invert prose-sm md:prose-base max-w-none space-y-6 text-gray-100 leading-relaxed [&_h2]:font-display [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-display [&_h3]:uppercase [&_h3]:tracking-tight [&_h3]:text-xl [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-foreground [&_a]:text-neon [&_a]:underline-offset-4 [&_a]:hover:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:my-1'

export default function PrivacidadePage() {
  const updatedAt = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <PageHero
        eyebrow="LGPD"
        title="Política de Privacidade"
        description={
          <p>
            Última atualização:{' '}
            <strong className="text-foreground">{updatedAt}</strong>
          </p>
        }
        icon={<Shield className="h-5 w-5 text-neon" />}
        size="sm"
      />

      <article className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
        <div className={PROSE_CLASS}>
          <section>
            <p className="text-base">
              A <strong>Cariri Chuteiras</strong> respeita a sua privacidade e
              está comprometida com a proteção dos seus dados pessoais. Esta
              Política de Privacidade explica como tratamos os dados que
              coletamos quando você navega pelo nosso site e quando você nos
              contata pelo WhatsApp.
            </p>
            <p>
              Esta política está em conformidade com a{' '}
              <strong>
                Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD)
              </strong>
              .
            </p>
          </section>

          <section>
            <h2>1. Dados que coletamos</h2>
            <p>
              Coletamos apenas o mínimo necessário para que o site funcione
              bem:
            </p>

            <h3>1.1. Dados de navegação (anônimos)</h3>
            <ul>
              <li>Páginas e produtos visitados</li>
              <li>Tipo de dispositivo (mobile, desktop) e navegador</li>
              <li>Endereço IP (em formato anônimo)</li>
              <li>Página de origem (referrer)</li>
              <li>Eventos de clique (botões, cupons, filtros)</li>
              <li>Termo buscado (quando você usa a busca interna)</li>
            </ul>
            <p>
              Esses dados são armazenados de forma anônima — não identificamos
              você pessoalmente.
            </p>

            <h3>1.2. Dados de contato (quando você nos chama no WhatsApp)</h3>
            <ul>
              <li>
                Nome e número de telefone (fornecidos por você no WhatsApp)
              </li>
              <li>Conteúdo da mensagem que você enviar</li>
              <li>Histórico de conversa pelo WhatsApp</li>
            </ul>

            <h3>1.3. Dados de avaliação (quando você avalia um produto)</h3>
            <ul>
              <li>Nome que você informou</li>
              <li>Cidade (opcional)</li>
              <li>Nota e comentário</li>
              <li>
                Hash do seu endereço IP (anti-spam — não armazenamos o IP
                original)
              </li>
            </ul>
          </section>

          <section>
            <h2>2. Para que usamos seus dados</h2>
            <ul>
              <li>Melhorar a experiência do site e os produtos exibidos</li>
              <li>Personalizar a apresentação do catálogo</li>
              <li>Atender o seu pedido pelo WhatsApp</li>
              <li>Identificar problemas técnicos no site</li>
              <li>
                Analisar quais produtos têm mais interesse para reabastecer o
                estoque
              </li>
              <li>Combater spam e fraude nas avaliações</li>
            </ul>
            <p>
              <strong>O que NÃO fazemos:</strong>
            </p>
            <ul>
              <li>Vender seus dados para terceiros</li>
              <li>
                Usar seus dados para anúncios fora do nosso site sem
                consentimento
              </li>
              <li>Compartilhar conversas do WhatsApp com qualquer pessoa</li>
            </ul>
          </section>

          <section>
            <h2>3. Cookies e tecnologias similares</h2>
            <p>
              Usamos <strong>cookies essenciais</strong> (para o funcionamento
              do site) e <strong>cookies analíticos</strong> (para entender
              como o site é usado).
            </p>
            <p>
              Quando você acessa pela primeira vez, mostramos um banner
              perguntando se você aceita cookies. Você pode escolher entre:
            </p>
            <ul>
              <li>
                <strong>Aceitar todos:</strong> permite todos os cookies,
                incluindo os analíticos de terceiros (Google Analytics, Meta
                Pixel, Microsoft Clarity, PostHog).
              </li>
              <li>
                <strong>Apenas essenciais:</strong> bloqueia todos os cookies
                de terceiros. Apenas os cookies necessários para o site
                funcionar são mantidos.
              </li>
            </ul>
            <p>
              Você pode mudar essa escolha a qualquer momento limpando os
              cookies do seu navegador.
            </p>
          </section>

          <section>
            <h2>4. Compartilhamento com terceiros</h2>
            <p>
              Compartilhamos dados de navegação <strong>anônimos</strong>{' '}
              apenas com serviços que nos ajudam a melhorar o site:
            </p>
            <ul>
              <li>
                <strong>Google Analytics 4:</strong> análise de tráfego (apenas
                se você aceitar cookies)
              </li>
              <li>
                <strong>Meta Pixel (Facebook):</strong> remarketing em ads
                (apenas se você aceitar cookies)
              </li>
              <li>
                <strong>Microsoft Clarity:</strong> análise de comportamento
                por mapa de calor (apenas se você aceitar cookies)
              </li>
              <li>
                <strong>Sentry:</strong> monitoramento de erros técnicos
              </li>
              <li>
                <strong>Vercel:</strong> nosso provedor de hospedagem (armazena
                logs anônimos de acesso)
              </li>
              <li>
                <strong>Supabase:</strong> nosso banco de dados (armazena os
                dados do catálogo e eventos)
              </li>
            </ul>
          </section>

          <section>
            <h2>5. Por quanto tempo guardamos seus dados</h2>
            <ul>
              <li>
                <strong>Eventos de navegação:</strong> até 90 dias, depois são
                excluídos automaticamente
              </li>
              <li>
                <strong>Leads do WhatsApp:</strong> até 2 anos (para análises
                de tendência)
              </li>
              <li>
                <strong>Avaliações:</strong> ficam públicas no site enquanto o
                produto estiver ativo
              </li>
              <li>
                <strong>Cookies:</strong> de acordo com sua escolha no banner
                (até 6 meses)
              </li>
            </ul>
          </section>

          <section>
            <h2>6. Seus direitos (LGPD)</h2>
            <p>Você tem direito a:</p>
            <ul>
              <li>
                <strong>Acessar</strong> os dados que temos sobre você
              </li>
              <li>
                <strong>Corrigir</strong> dados incompletos, inexatos ou
                desatualizados
              </li>
              <li>
                <strong>Excluir</strong> dados que tratamos com base em
                consentimento
              </li>
              <li>
                <strong>Portar</strong> seus dados para outro serviço
              </li>
              <li>
                <strong>Revogar</strong> o consentimento para tratamento de
                dados
              </li>
              <li>
                <strong>Reclamar</strong> à Autoridade Nacional de Proteção de
                Dados (ANPD)
              </li>
            </ul>
            <p>
              Para exercer qualquer um desses direitos, entre em contato
              conosco pelo WhatsApp ou pela página de{' '}
              <a href="/contato">Contato</a>. Responderemos em até{' '}
              <strong>15 dias úteis</strong>.
            </p>
          </section>

          <section>
            <h2>7. Segurança dos dados</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus
              dados, incluindo:
            </p>
            <ul>
              <li>Criptografia HTTPS em todo o site</li>
              <li>Hashing de endereços IP</li>
              <li>
                Acesso restrito aos dados (apenas administradores autorizados)
              </li>
              <li>Backups regulares</li>
              <li>
                Monitoramento contínuo de tentativas de acesso indevido
              </li>
            </ul>
          </section>

          <section>
            <h2>8. Crianças e adolescentes</h2>
            <p>
              Nossos produtos podem ser comprados por menores de 18 anos com
              supervisão de pais ou responsáveis. Não coletamos
              intencionalmente dados de crianças menores de 13 anos. Se você é
              pai/mãe e identificou que coletamos dados do seu filho
              indevidamente, fale conosco para que possamos excluí-los.
            </p>
          </section>

          <section>
            <h2>9. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta Política periodicamente. A data de
              atualização sempre estará no topo desta página. Mudanças
              significativas serão comunicadas no site ou pelo WhatsApp.
            </p>
          </section>

          <section>
            <h2>10. Contato</h2>
            <p>
              Para qualquer dúvida sobre esta Política ou para exercer seus
              direitos, fale conosco pelo WhatsApp através da página de{' '}
              <a href="/contato">Contato</a>.
            </p>
          </section>
        </div>
      </article>
    </>
  )
}
