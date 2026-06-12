import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/**
 * Busca a configuração singleton do site (cached por request).
 * Inclui fallback robusto para o caso de:
 *   - banco ainda não configurado (Supabase sem credenciais)
 *   - seed ainda não rodado
 *   - erro de conexão pontual
 */
export const getSiteConfig = cache(async () => {
  try {
    const config = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } })
    if (config) return config
  } catch {
    // Cai no fallback abaixo
  }

  return {
    id: 'singleton',
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5588981350830',
    storeAddress: 'Rua P 6, 5, Vila Sta Terezinha, Barbalha/CE — 63180-000',
    storeHours: 'Segunda a Sábado: 8h às 18h',
    instagramUrl:
      'https://www.instagram.com/cariri__chuteiras?igsh=eHAyb3NuNXpyZzNn',
    tiktokUrl:
      'https://www.tiktok.com/@cariri__chuteiras01?_r=1&_t=ZS-977iiJHszTQ',
    googleMapsEmbed: null,
    promoBarMessages: [
      '🚚 Entregamos para todo o Brasil',
      '⚽ Chuteiras das melhores marcas',
      '🔥 Promoções exclusivas toda semana',
    ],
    isMaintenanceMode: false,
    maintenanceMessage: null,
    heroSlides: [],
    updatedAt: new Date(),
  }
})

export type SiteConfig = Awaited<ReturnType<typeof getSiteConfig>>
