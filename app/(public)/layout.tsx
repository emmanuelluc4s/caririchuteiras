import { PromoBar } from '@/components/public/layout/promo-bar'
import { Header } from '@/components/public/layout/header'
import { Footer } from '@/components/public/layout/footer'
import { WhatsappFloatingButton } from '@/components/public/whatsapp/whatsapp-floating-button'
import { WhatsappCartDrawer } from '@/components/public/whatsapp/whatsapp-cart-drawer'
import { CookieBanner } from '@/components/public/cookie-banner'
import { SearchModal } from '@/components/public/search/search-modal'
import { CompareBottomBarWrapper } from '@/components/public/compare/compare-bottom-bar-wrapper'
import { ExitIntentModal } from '@/components/public/conversion/exit-intent-modal'
import { QuickViewModal } from '@/components/public/quick-view/quick-view-modal'
import { RecentlyViewedCarousel } from '@/components/public/recently-viewed/recently-viewed-carousel'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'
import { AnalyticsDebugOverlay } from '@/components/analytics/analytics-debug-overlay'
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
    <AnalyticsProvider
      metaPixelId={config.metaPixelId ?? null}
      ga4Id={config.ga4Id ?? null}
      clarityId={config.clarityId ?? null}
    >
      <PromoBar messages={promoMessages} />
      <Header whatsappNumber={config.whatsappNumber} />

      <main className="min-h-screen pb-[100px] md:pb-[120px]">{children}</main>

      {/* Carrossel "Vistos recentemente" antes do footer (Módulo 10) */}
      <RecentlyViewedCarousel />

      <Footer siteConfig={config} />

      {/* Sistema WhatsApp (Módulo 03) */}
      <WhatsappFloatingButton whatsappNumber={config.whatsappNumber} />
      <WhatsappCartDrawer />

      {/* Sistema de busca (Módulo 07) */}
      <SearchModal
        popularSearches={popularSearches}
        popularProducts={popularProducts}
      />

      {/* Comparador (Módulo 08) */}
      <CompareBottomBarWrapper />

      {/* Gatilhos de conversão (Módulo 10) */}
      <QuickViewModal />
      <ExitIntentModal />

      <CookieBanner />

      {/* Debug overlay — só ativo com ?debug=analytics na URL (Módulo 17) */}
      <AnalyticsDebugOverlay />
    </AnalyticsProvider>
  )
}
