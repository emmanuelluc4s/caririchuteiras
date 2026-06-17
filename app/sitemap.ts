import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getSiteConfig } from '@/lib/site-config'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cariri-chuteiras.vercel.app'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/quem-somos`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contato`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/promocoes`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/novidades`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/avaliacoes`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacidade`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/termos`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const config = await getSiteConfig().catch(() => null)
  if (config?.isMaintenanceMode) {
    return staticPages
  }

  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true },
        orderBy: { order: 'asc' },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          updatedAt: true,
          isNew: true,
          isBestSellerManual: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 5000,
      }),
    ])

    const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/categoria/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const productPages: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/produto/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency:
        p.isNew || p.isBestSellerManual ? 'daily' : 'weekly',
      priority: p.isNew || p.isBestSellerManual ? 0.9 : 0.7,
    }))

    return [...staticPages, ...categoryPages, ...productPages]
  } catch {
    return staticPages
  }
}
