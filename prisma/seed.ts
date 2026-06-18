import { PrismaClient } from '@prisma/client'
import { generateSku, slugify } from '../lib/utils'

const prisma = new PrismaClient()

const CATEGORIES = [
  { name: 'Chuteiras Society', order: 1 },
  { name: 'Chuteiras Campo', order: 2 },
  { name: 'Chuteiras Futsal', order: 3 },
  { name: 'Tênis Esportivos', order: 4 },
  { name: 'Camisas de Times', order: 5 },
  { name: 'Camisas Casuais', order: 6 },
  { name: 'Roupas de Academia', order: 7 },
  { name: 'Shorts Térmicos', order: 8 },
  { name: 'Meias Esportivas', order: 9 },
  { name: 'Caneleiras', order: 10 },
  { name: 'Mochilas', order: 11 },
  { name: 'Acessórios', order: 12 },
]

const BRANDS = ['Nike', 'Adidas', 'Puma', 'Penalty', 'Topper', 'Umbro']

const COLORS = [
  { name: 'Preto', hex: '#0A0A0A' },
  { name: 'Branco', hex: '#FFFFFF' },
  { name: 'Azul Royal', hex: '#0057FF' },
  { name: 'Vermelho', hex: '#DC2626' },
  { name: 'Verde', hex: '#16A34A' },
  { name: 'Amarelo', hex: '#FACC15' },
  { name: 'Roxo', hex: '#6B1DFF' },
  { name: 'Rosa', hex: '#EC4899' },
]

const SIZES_SHOE = ['36', '37', '38', '39', '40', '41', '42', '43', '44']
const SIZES_APPAREL = ['P', 'M', 'G', 'GG']

const PRODUCT_TEMPLATES = [
  { prefix: 'Mercurial Vapor', categoryName: 'Chuteiras Society' },
  { prefix: 'Phantom GT2', categoryName: 'Chuteiras Society' },
  { prefix: 'Predator Edge', categoryName: 'Chuteiras Campo' },
  { prefix: 'Future Z', categoryName: 'Chuteiras Campo' },
  { prefix: 'Copa Sense', categoryName: 'Chuteiras Futsal' },
  { prefix: 'Tiempo Legend', categoryName: 'Chuteiras Futsal' },
  { prefix: 'Air Max', categoryName: 'Tênis Esportivos' },
  { prefix: 'Ultraboost', categoryName: 'Tênis Esportivos' },
  { prefix: 'Camisa Brasil', categoryName: 'Camisas de Times' },
  { prefix: 'Camisa Flamengo', categoryName: 'Camisas de Times' },
  { prefix: 'Camisa Real Madrid', categoryName: 'Camisas de Times' },
  { prefix: 'Regata Dry-Fit', categoryName: 'Roupas de Academia' },
  { prefix: 'Bermuda Compressão', categoryName: 'Shorts Térmicos' },
  { prefix: 'Caneleira Pro', categoryName: 'Caneleiras' },
  { prefix: 'Mochila Sport', categoryName: 'Mochilas' },
  { prefix: 'Meião Profissional', categoryName: 'Meias Esportivas' },
]

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200',
  'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1200',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200',
  'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200',
  'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=1200',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200',
]

function randomPrice(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function pickRandomMany<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

async function main() {
  console.log('🧹 Limpando dados antigos...')
  await prisma.review.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.siteConfig.deleteMany()

  console.log('📁 Criando categorias...')
  const categories = await Promise.all(
    CATEGORIES.map((cat) =>
      prisma.category.create({
        data: {
          name: cat.name,
          slug: slugify(cat.name),
          order: cat.order,
          isActive: true,
        },
      }),
    ),
  )

  console.log('⚽ Criando produtos fictícios...')
  let skuCounter = 1
  const products: Array<{ id: string; name: string }> = []

  for (const template of PRODUCT_TEMPLATES) {
    const category = categories.find((c) => c.name === template.categoryName)
    if (!category) continue

    const editions = ['Elite', 'Pro', 'Club']
    for (const edition of editions) {
      const brand = pickRandom(BRANDS)
      const name = `${template.prefix} ${edition}`
      const fullName = `${brand} ${name}`
      const price = randomPrice(199, 1299)
      const hasPromo = Math.random() < 0.4
      const promoPrice = hasPromo ? Math.round(price * 0.7 * 100) / 100 : null
      const isShoe =
        template.categoryName.toLowerCase().includes('chuteira') ||
        template.categoryName.toLowerCase().includes('tênis')

      const product = await prisma.product.create({
        data: {
          sku: generateSku(brand, template.categoryName, skuCounter++),
          slug: slugify(`${fullName}-${skuCounter}`),
          name: fullName,
          description: `<p>O <strong>${fullName}</strong> é a escolha definitiva para atletas que buscam performance e estilo. Desenvolvido com tecnologia de ponta, oferece conforto, durabilidade e o toque ideal para quem leva o esporte a sério.</p><ul><li>Material premium</li><li>Tecnologia de absorção de impacto</li><li>Design moderno e arrojado</li><li>Disponível em diversas cores e numerações</li></ul>`,
          brand,
          categoryId: category.id,
          price,
          promoPrice,
          installments: 10,
          installmentFree: true,
          isActive: true,
          isFeatured: Math.random() < 0.3,
          isNew: Math.random() < 0.25,
          isBestSellerManual: Math.random() < 0.15,
          material: isShoe ? 'Sintético + Microfibra' : 'Poliéster 100%',
          weight: isShoe ? `${randomBetween(220, 290)}g` : `${randomBetween(150, 250)}g`,
          collar: isShoe ? pickRandom(['Baixa', 'Média', 'Alta']) : undefined,
          technology: isShoe
            ? pickRandom(['Air Zoom', 'Boost', 'Flyknit', 'Primeknit'])
            : undefined,
          useIndication: isShoe
            ? pickRandom(['Gramado natural', 'Grama sintética', 'Quadra'])
            : undefined,
          warranty: '3 meses contra defeitos de fabricação',
          origin: pickRandom(['Nacional', 'Importado']),
          views: randomBetween(50, 2500),
          whatsappClicks: randomBetween(0, 120),
        },
      })

      // Imagens (3 por produto)
      const productImages = pickRandomMany(PLACEHOLDER_IMAGES, 3)
      for (let i = 0; i < productImages.length; i++) {
        const url = productImages[i]!
        await prisma.productImage.create({
          data: {
            productId: product.id,
            urlOriginal: url,
            urlLarge: url,
            urlMedium: url.replace('w=1200', 'w=600'),
            urlThumb: url.replace('w=1200', 'w=200'),
            alt: `${fullName} - Imagem ${i + 1}`,
            order: i,
          },
        })
      }

      // Variantes
      const colors = pickRandomMany(COLORS, randomBetween(2, 4))
      const sizes = isShoe ? SIZES_SHOE : SIZES_APPAREL
      for (const color of colors) {
        for (const size of sizes) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              color: color.name,
              colorHex: color.hex,
              size,
              stock: randomBetween(0, 15),
            },
          })
        }
      }

      // Avaliações
      const reviewCount = randomBetween(0, 8)
      for (let i = 0; i < reviewCount; i++) {
        await prisma.review.create({
          data: {
            productId: product.id,
            customerName: pickRandom([
              'João S.',
              'Maria L.',
              'Pedro M.',
              'Ana C.',
              'Lucas R.',
              'Fernanda B.',
              'Carlos A.',
              'Beatriz F.',
              'Gabriel N.',
            ]),
            city: pickRandom([
              'Barbalha/CE',
              'Juazeiro do Norte/CE',
              'Crato/CE',
              'Missão Velha/CE',
            ]),
            rating: randomBetween(4, 5),
            comment: pickRandom([
              'Produto excelente, chegou rápido e a qualidade é incrível!',
              'Comprei e amei. Recomendo demais!',
              'Atendimento nota 10, produto perfeito.',
              'Já é a segunda vez que compro aqui, sempre satisfeito.',
              'Qualidade Nike de verdade, vale cada centavo.',
              'Cariri Chuteiras é referência mesmo, ótima loja.',
            ]),
            isApproved: Math.random() < 0.8,
          },
        })
      }

      products.push({ id: product.id, name: product.name })
      console.log(`  ✓ ${fullName}`)
    }
  }

  console.log('🎟️  Criando cupons...')
  await prisma.coupon.createMany({
    data: [
      {
        code: 'CARIRI10',
        description: '10% de desconto em qualquer produto',
        discountType: 'percentage',
        discountValue: 10,
        isActive: true,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'CHUTEIRA15',
        description: '15% off em chuteiras',
        discountType: 'percentage',
        discountValue: 15,
        isActive: true,
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'BEMVINDO',
        description: 'R$ 30 off na primeira compra',
        discountType: 'fixed',
        discountValue: 30,
        isActive: true,
      },
    ],
  })

  console.log('⚙️  Criando configuração inicial do site...')
  await prisma.siteConfig.create({
    data: {
      id: 'singleton',
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5588981350830',
      storeAddress: 'Rua P 6, 5, Vila Sta Terezinha, Barbalha/CE — 63180-000',
      storeHours: 'Segunda a Sexta: 8h às 18h | Sábado: 8h às 13h',
      instagramUrl:
        'https://www.instagram.com/cariri__chuteiras?igsh=eHAyb3NuNXpyZzNn',
      tiktokUrl:
        'https://www.tiktok.com/@cariri__chuteiras01?_r=1&_t=ZS-977iiJHszTQ',
      googleMapsEmbed: '',
      promoBarMessages: [
        '🚚 Entregamos para todo o Brasil',
        '⚽ Chuteiras das melhores marcas',
        '🔥 Promoções exclusivas toda semana',
        '🏆 Novidades chegando toda semana',
      ],
      isMaintenanceMode: false,
      heroSlides: [
        {
          title: 'NOVA COLEÇÃO',
          subtitle: 'Chuteiras de elite que fazem você jogar diferente',
          cta: 'Ver Chuteiras',
          href: '/categoria/chuteiras-society',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920',
        },
        {
          title: 'PROMOÇÕES IMPERDÍVEIS',
          subtitle: 'Até 30% off nos melhores tênis esportivos',
          cta: 'Aproveitar',
          href: '/promocoes',
          image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1920',
        },
        {
          title: 'CAMISAS OFICIAIS',
          subtitle: 'Vista a camisa do seu time do coração',
          cta: 'Ver Camisas',
          href: '/categoria/camisas-de-times',
          image: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=1920',
        },
      ],
    },
  })

  console.log(`✅ Seed completo! ${products.length} produtos criados.`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
