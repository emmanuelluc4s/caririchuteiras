import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const alt = 'Cariri Chuteiras'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await prisma.product
    .findUnique({
      where: { slug },
      select: {
        name: true,
        brand: true,
        price: true,
        promoPrice: true,
        images: {
          take: 1,
          orderBy: { order: 'asc' },
          select: { urlOriginal: true },
        },
      },
    })
    .catch(() => null)

  if (!product) {
    return new ImageResponse(<DefaultOG />, size)
  }

  const imageUrl = product.images[0]?.urlOriginal
  const finalPrice = Number(product.promoPrice ?? product.price).toFixed(2)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0A0A',
          display: 'flex',
          padding: 60,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(107,29,255,0.4), transparent 70%)',
          }}
        />
        {imageUrl && (
          <div
            style={{
              width: 480,
              height: 480,
              borderRadius: 24,
              background: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginRight: 50,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              width={480}
              height={480}
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                color: '#6B1DFF',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              Cariri Chuteiras
            </div>
            <div
              style={{
                color: '#6B1DFF',
                fontSize: 22,
                fontWeight: 600,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              {product.brand}
            </div>
            <div
              style={{
                color: '#FFF',
                fontSize: 48,
                fontWeight: 900,
                lineHeight: 1.1,
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              {product.name.slice(0, 80)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                color: '#999',
                fontSize: 16,
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              A partir de
            </div>
            <div
              style={{
                color: '#6B1DFF',
                fontSize: 72,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              R$ {finalPrice.replace('.', ',')}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}

function DefaultOG() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          color: '#FFF',
          fontSize: 72,
          fontWeight: 900,
          textTransform: 'uppercase',
          display: 'flex',
          gap: 16,
        }}
      >
        <span>Cariri</span>
        <span style={{ color: '#6B1DFF' }}>Chuteiras</span>
      </div>
      <div
        style={{
          color: '#999',
          fontSize: 24,
          marginTop: 20,
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}
      >
        O esporte do Cariri começa aqui
      </div>
    </div>
  )
}
