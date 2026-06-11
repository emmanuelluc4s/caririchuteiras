import { PromoBar } from '@/components/public/layout/promo-bar'
import { Header } from '@/components/public/layout/header'
import { Footer } from '@/components/public/layout/footer'
import { WhatsappFloatingButton } from '@/components/public/whatsapp/whatsapp-floating-button'
import { WhatsappCartDrawer } from '@/components/public/whatsapp/whatsapp-cart-drawer'
import { CookieBanner } from '@/components/public/cookie-banner'
import { SearchModal } from '@/components/public/search/search-modal'
import { getSiteConfig } from '@/lib/site-config'
import {
  getPopularSearches,
  getPopularProductsForSearch,
} from '@/lib/queries/search'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [config, popularSearches, popularProductsRaw] = await Promise.all([
    getSiteConfig(),
    getPopularSearches(8),
    getPopularProductsForSearch(6),
  ])

  const promoMessages = Array.isArray(config.promoBarMessages)
    ? (config.promoBarMessages as string[])
    : []

  const popularProducts = popularProductsRaw.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    imageUrl: p.images[0]?.urlThumb,
    categoryName: p.category.name,
  }))

  return (
    <>
      <PromoBar messages={promoMessages} />
      <Header whatsappNumber={config.whatsappNumber} />

      <main className="min-h-screen">{children}</main>

      <Footer siteConfig={config} />

      {/* Sistema WhatsApp (Módulo 03) */}
      <WhatsappFloatingButton whatsappNumber={config.whatsappNumber} />
      <WhatsappCartDrawer />

      {/* Sistema de busca (Módulo 07) */}
      <SearchModal
        popularSearches={popularSearches}
        popularProducts={popularProducts}
      />

      <CookieBanner />
    </>
  )
}
