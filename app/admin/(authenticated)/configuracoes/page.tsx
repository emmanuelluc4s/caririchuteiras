import type { Metadata } from 'next'
import { requireRole } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'
import { AdminPageHeader } from '@/components/admin/layout/admin-page-header'
import { ConfigForm } from '@/components/admin/config/config-form'

export const metadata: Metadata = { title: 'Configurações' }
export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const admin = await requireRole(['admin', 'editor', 'viewer'])
  const config = await prisma.siteConfig.findUnique({
    where: { id: 'singleton' },
  })

  const initialValues = {
    storeName: config?.storeName ?? 'Cariri Chuteiras',
    storeTagline: config?.storeTagline ?? null,
    storeDescription: config?.storeDescription ?? null,
    storeEmail: config?.storeEmail ?? null,
    storeAddress: config?.storeAddress ?? null,
    storeCity: config?.storeCity ?? 'Barbalha/CE',
    whatsappNumber: config?.whatsappNumber ?? '',
    whatsappBusinessHours: config?.whatsappBusinessHours ?? null,
    whatsappWelcomeMessage: config?.whatsappWelcomeMessage ?? null,
    instagramUrl: config?.instagramUrl ?? null,
    facebookUrl: config?.facebookUrl ?? null,
    tiktokUrl: config?.tiktokUrl ?? null,
    youtubeUrl: config?.youtubeUrl ?? null,
    twitterUrl: config?.twitterUrl ?? null,
    promoBarMessages: Array.isArray(config?.promoBarMessages)
      ? (config!.promoBarMessages as string[])
      : [],
    promoBarEnabled: config?.promoBarEnabled ?? true,
    metaPixelId: config?.metaPixelId ?? null,
    ga4Id: config?.ga4Id ?? null,
    clarityId: config?.clarityId ?? null,
    defaultMetaTitle: config?.defaultMetaTitle ?? null,
    defaultMetaDescription: config?.defaultMetaDescription ?? null,
    ogImageUrl: config?.ogImageUrl ?? null,
    isMaintenanceMode: config?.isMaintenanceMode ?? false,
    maintenanceMessage: config?.maintenanceMessage ?? null,
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      <AdminPageHeader
        title="Configurações"
        description="Personalize informações, integrações e comportamento do site"
      />
      <ConfigForm
        initialValues={initialValues}
        canEdit={admin.role === 'admin'}
      />
    </div>
  )
}
