import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { TrackPayloadSchema } from '@/lib/analytics/event-types'

const SESSION_COOKIE = 'cc-session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 dias em segundos

function generateSessionId() {
  return crypto.randomUUID()
}

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = TrackPayloadSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { type, productId, metadata, items, couponCode } = parsed.data

    // Cookie de sessão (Next 16: cookies() é async)
    const cookieStore = await cookies()
    let sessionId = cookieStore.get(SESSION_COOKIE)?.value
    let shouldSetCookie = false

    if (!sessionId) {
      sessionId = generateSessionId()
      shouldSetCookie = true
    }

    const headersList = await headers()
    const userAgent = headersList.get('user-agent') ?? null
    const referrer = headersList.get('referer') ?? null
    const deviceFromMeta = typeof metadata?.device === 'string' ? metadata.device : null

    // Persiste evento genérico
    await prisma.siteEvent.create({
      data: {
        type,
        productId: productId ?? null,
        metadata: metadata ? (metadata as object) : undefined,
        sessionId,
        userAgent,
        referrer,
        device: deviceFromMeta,
      },
    })

    // Eventos de WhatsApp → também gravam em WhatsappLead
    if (type === 'whatsapp_click_single' || type === 'whatsapp_click_cart') {
      if (items && items.length > 0) {
        await prisma.whatsappLead.create({
          data: {
            items: items as object,
            couponCode: couponCode ?? null,
            userAgent,
            referrer,
            device: deviceFromMeta,
          },
        })

        // Incrementa whatsappClicks de cada produto envolvido
        await Promise.all(
          items.map((item) =>
            prisma.product
              .update({
                where: { id: item.productId },
                data: { whatsappClicks: { increment: 1 } },
              })
              .catch(() => {
                // produto pode não existir mais — ignora
              }),
          ),
        )
      }
    }

    // product_view → incrementa Product.views
    if (type === 'product_view' && productId) {
      await prisma.product
        .update({
          where: { id: productId },
          data: { views: { increment: 1 } },
        })
        .catch(() => {})
    }

    const response = NextResponse.json({ ok: true, sessionId })
    if (shouldSetCookie) {
      response.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      })
    }
    return response
  } catch (error) {
    console.error('[track] error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
