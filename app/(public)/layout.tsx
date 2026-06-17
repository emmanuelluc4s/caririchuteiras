import { PromoBar } from '@/components/public/layout/promo-bar'
import { Header } from '@/components/public/layout/header'
import { Footer } from '@/components/public/layout/footer'
import { WhatsappFloatingButton } from '@/components/public/whatsapp/whatsapp-floating-button'
import { CookieBanner } from '@/components/public/cookie-banner'
import { LazyOverlays } from '@/components/public/layout/lazy-overlays'
import { RecentlyViewedCarousel } from '@/components/public/recently-viewed/recently-viewed-carousel'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'
import { AnalyticsDebugOverlay } from '@/components/analytics/analytics-debug-overlay'
import { JsonLd } from '@/components/seo/json-ld'
import { SkipLink } from '@/components/public/layout/skip-link'
import { getSiteConfig } from '@/lib/site-config'
import {
  getOrganizationSchema,
  getWebSiteSchema,
} from '@/lib/seo/structured-data'
import {
  getPopularSearches,
  getPopularProductsForSearch,
} from '@/lib/queries/search'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [config, popularSearches, popularProductsRaw, organizationSchema] =
    await Promise.all([
      getSiteConfig(),
      getPopularSearches(8),
      getPopularProductsForSearch(6),
      getOrganizationSchema(),
    ])
  const websiteSchema = getWebSiteSchema()

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <AnalyticsProvider
      metaPixelId={config.metaPixelId ?? null}
      ga4Id={config.ga4Id ?? null}
      clarityId={config.clarityId ?? null}
    >
      {supabaseUrl && (
        <>
          <link
            rel="preconnect"
            href={supabaseUrl}
            crossOrigin="anonymous"
          />
          <link rel="dns-prefetch" href={supabaseUrl} />
        </>
      )}
      {(config.metaPixelId || config.ga4Id) && (
        <>
          <link rel="preconnect" href="https://connect.facebook.net" />
          <link rel="dns-prefetch" href="https://connect.facebook.net" />
        </>
      )}

      {organizationSchema && (
        <JsonLd data={organizationSchema} id="schema-organization" />
      )}
      <JsonLd data={websiteSchema} id="schema-website" />

      <SkipLink />
      <PromoBar messages={promoMessages} />
      <Header whatsappNumber={config.whatsappNumber} />

      <main
        id="main-content"
        className="min-h-screen pb-[100px] md:pb-[120px]"
      >
        {children}
      </main>

      {/* Carrossel "Vistos recentemente" antes do footer (Módulo 10) */}
      <RecentlyViewedCarousel />

      <Footer siteConfig={config} />

      {/* Sistema WhatsApp (Módulo 03) — botão flutuante fica SSR p/ aparecer rápido */}
      <WhatsappFloatingButton whatsappNumber={config.whatsappNumber} />

      {/* Overlays pesados — lazy-loaded client-only (M18) */}
      <LazyOverlays
        popularSearches={popularSearches}
        popularProducts={popularProducts}
      />

      <CookieBanner />

      {/* Debug overlay — só ativo com ?debug=analytics na URL (Módulo 17) */}
      <AnalyticsDebugOverlay />
    </AnalyticsProvider>
  )
}
