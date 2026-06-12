/**
 * Atualiza o SiteConfig com os dados reais da loja Cariri Chuteiras.
 * Executar via: pnpm tsx scripts/update-site-config.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const data = {
    whatsappNumber: '5588981350830',
    storeAddress: 'Rua P 6, 5, Vila Sta Terezinha, Barbalha/CE — 63180-000',
    instagramUrl:
      'https://www.instagram.com/cariri__chuteiras?igsh=eHAyb3NuNXpyZzNn',
    tiktokUrl:
      'https://www.tiktok.com/@cariri__chuteiras01?_r=1&_t=ZS-977iiJHszTQ',
  }

  const updated = await prisma.siteConfig.upsert({
    where: { id: 'singleton' },
    update: data,
    create: {
      id: 'singleton',
      ...data,
      storeHours: 'Segunda a Sexta: 8h às 18h | Sábado: 8h às 13h',
      googleMapsEmbed: '',
      promoBarMessages: [
        '🚚 Entregamos para todo o Brasil',
        '⚽ Chuteiras das melhores marcas',
        '🔥 Promoções exclusivas toda semana',
      ],
      isMaintenanceMode: false,
      heroSlides: [],
    },
  })

  console.log('✓ SiteConfig atualizado:')
  console.log({
    whatsappNumber: updated.whatsappNumber,
    storeAddress: updated.storeAddress,
    instagramUrl: updated.instagramUrl,
    tiktokUrl: updated.tiktokUrl,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
