import { PromoBar } from '@/components/public/layout/promo-bar'
import { Header } from '@/components/public/layout/header'
import { Footer } from '@/components/public/layout/footer'
import { WhatsappFloatingButton } from '@/components/public/whatsapp/whatsapp-floating-button'
import { CookieBanner } from '@/components/public/cookie-banner'
import { getSiteConfig } from '@/lib/site-config'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig()
  const promoMessages = Array.isArray(config.promoBarMessages)
    ? (config.promoBarMessages as string[])
    : []

  return (
    <>
      <PromoBar messages={promoMessages} />
      <Header whatsappNumber={config.whatsappNumber} />

      <main className="min-h-screen">{children}</main>

      <Footer siteConfig={config} />
      <WhatsappFloatingButton whatsappNumber={config.whatsappNumber} />
      <CookieBanner />
    </>
  )
}
