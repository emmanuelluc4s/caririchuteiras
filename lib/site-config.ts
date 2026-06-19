import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

/**
 * Busca a configuração singleton do site.
 * - `cache(react)` deduplica chamadas no mesmo request.
 * - `unstable_cache` compartilha entre requests por 5min — sem isso,
 *   cada navegação refetch a config no banco e a navegação fica lenta.
 */
const _getSiteConfigCached = unstable_cache(
  async () => {
    try {
      const config = await prisma.siteConfig.findUnique({
        where: { id: 'singleton' },
      })
      if (config) return config
    } catch {
      // Cai no fallback abaixo
    }
    return null
  },
  ['site-config-singleton'],
  { revalidate: 300, tags: ['site-config'] },
)

export const getSiteConfig = cache(async () => {
  const config = await _getSiteConfigCached()
  if (config) return config

  return {
    id: 'singleton',
    storeName: 'Cariri Chuteiras',
    storeTagline: null,
    storeDescription: null,
    storeEmail: null,
    storeCity: 'Barbalha/CE',
    storeAddress: 'Rua P 6, 5, Vila Sta Terezinha, Barbalha/CE — 63180-000',
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5588981350830',
    storeHours: 'Segunda a Sábado: 8h às 18h',
    whatsappBusinessHours: null,
    whatsappWelcomeMessage: null,
    instagramUrl:
      'https://www.instagram.com/cariri__chuteiras?igsh=eHAyb3NuNXpyZzNn',
    facebookUrl: null,
    tiktokUrl:
      'https://www.tiktok.com/@cariri__chuteiras01?_r=1&_t=ZS-977iiJHszTQ',
    youtubeUrl: null,
    twitterUrl: null,
    googleMapsEmbed: null,
    promoBarMessages: [
      '🚚 Entregamos para todo o Brasil',
      '⚽ Chuteiras das melhores marcas',
      '🔥 Promoções exclusivas toda semana',
    ],
    promoBarEnabled: true,
    metaPixelId: null,
    ga4Id: null,
    clarityId: null,
    defaultMetaTitle: null,
    defaultMetaDescription: null,
    ogImageUrl: null,
    isMaintenanceMode: false,
    maintenanceMessage: null,
    heroSlides: [],
    updatedAt: new Date(),
  }
})

export type SiteConfig = Awaited<ReturnType<typeof getSiteConfig>>
