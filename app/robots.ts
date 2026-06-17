import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cariri-chuteiras.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/manutencao',
          '/comparar',
          '/busca',
        ],
      },
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot'],
        crawlDelay: 10,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
