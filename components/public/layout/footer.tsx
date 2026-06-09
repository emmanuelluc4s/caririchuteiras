import Link from 'next/link'
import { MapPin, Clock, Mail } from 'lucide-react'
import { Logo } from './logo'
import { FOOTER_NAV } from '@/lib/navigation'
import type { SiteConfig } from '@/lib/site-config'

// Lucide 1.x removeu ícones de marca (Instagram, TikTok, WhatsApp) por questões de licença.
// SVGs inline com paths originais oficiais.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.5a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.04z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

type Props = { siteConfig: SiteConfig }

export function Footer({ siteConfig }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-border bg-bg-primary text-foreground relative w-full border-t">
      {/* Watermark do escudo gigante (decorativo) */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden opacity-[0.025]"
        aria-hidden="true"
      >
        <div className="bg-neon h-[600px] w-[600px] rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
        {/* CTA WhatsApp grande no topo do footer */}
        <div className="border-neon/30 bg-bg-secondary neon-glow-sm mb-12 rounded-xl border p-8 text-center md:mb-16 md:p-12">
          <h2 className="font-display text-4xl uppercase tracking-tight md:text-6xl">
            Tá com dúvida? <span className="text-neon">Fala com a gente.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-400">
            Atendimento direto pelo WhatsApp. Sem fila, sem robô, sem enrolação.
          </p>
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-whatsapp hover:bg-whatsapp-dark mt-6 inline-flex items-center gap-2 rounded-md px-8 py-4 font-semibold uppercase tracking-wide text-white transition-all hover:scale-105"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Chamar no WhatsApp
          </a>
        </div>

        {/* Grid principal */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Coluna 1: logo + descrição */}
          <div className="space-y-4">
            <Logo variant="horizontal" width={180} height={45} />
            <p className="text-sm leading-relaxed text-gray-400">
              A maior loja esportiva do Cariri. Chuteiras, tênis, camisas e acessórios das
              melhores marcas com entrega para toda a região.
            </p>
            <div className="flex gap-3">
              {siteConfig.instagramUrl && (
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="border-border hover:border-neon hover:text-neon hover:neon-glow-sm flex h-10 w-10 items-center justify-center rounded-md border text-gray-100 transition-all"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
              )}
              {siteConfig.tiktokUrl && (
                <a
                  href={siteConfig.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="border-border hover:border-neon hover:text-neon hover:neon-glow-sm flex h-10 w-10 items-center justify-center rounded-md border text-gray-100 transition-all"
                >
                  <TiktokIcon className="h-5 w-5" />
                </a>
              )}
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="border-border text-whatsapp hover:border-whatsapp hover:bg-whatsapp/10 flex h-10 w-10 items-center justify-center rounded-md border transition-all"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Categorias */}
          <div>
            <h3 className="font-display mb-5 text-xl uppercase tracking-wide">Categorias</h3>
            <ul className="space-y-3">
              {FOOTER_NAV.categorias.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-neon text-sm text-gray-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Sobre + Atendimento */}
          <div className="space-y-8">
            <div>
              <h3 className="font-display mb-5 text-xl uppercase tracking-wide">A loja</h3>
              <ul className="space-y-3">
                {FOOTER_NAV.sobre.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="hover:text-neon text-sm text-gray-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display mb-5 text-xl uppercase tracking-wide">Atendimento</h3>
              <ul className="space-y-3">
                {FOOTER_NAV.atendimento.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="hover:text-neon text-sm text-gray-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coluna 4: Contato */}
          <div className="space-y-5">
            <h3 className="font-display text-xl uppercase tracking-wide">Contato</h3>
            {siteConfig.storeAddress && (
              <div className="flex gap-3 text-sm text-gray-400">
                <MapPin className="text-neon mt-0.5 h-5 w-5 shrink-0" />
                <span>{siteConfig.storeAddress}</span>
              </div>
            )}
            {siteConfig.storeHours && (
              <div className="flex gap-3 text-sm text-gray-400">
                <Clock className="text-neon mt-0.5 h-5 w-5 shrink-0" />
                <span className="whitespace-pre-line">{siteConfig.storeHours}</span>
              </div>
            )}
            <div className="flex gap-3 text-sm text-gray-400">
              <Mail className="text-neon mt-0.5 h-5 w-5 shrink-0" />
              <a href={`https://wa.me/${siteConfig.whatsappNumber}`} className="hover:text-neon">
                Fale conosco
              </a>
            </div>
          </div>
        </div>

        {/* Selo de marcas */}
        <div className="border-border mt-16 border-t pt-8">
          <p className="mb-4 text-center text-xs uppercase tracking-wider text-gray-600">
            Trabalhamos com as melhores marcas
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {['NIKE', 'ADIDAS', 'PUMA', 'PENALTY', 'TOPPER', 'UMBRO'].map((brand) => (
              <span
                key={brand}
                className="font-display hover:text-neon cursor-default text-sm text-gray-600 transition-colors md:text-base"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-border/50 mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-gray-600 md:flex-row">
          <p>© {year} Cariri Chuteiras. Todos os direitos reservados.</p>
          <p>CNPJ: 00.000.000/0001-00</p>
        </div>
      </div>
    </footer>
  )
}
