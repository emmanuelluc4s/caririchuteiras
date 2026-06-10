import type { CartItem } from './types'
import { formatBRL } from '@/lib/utils'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ''

type BuildOptions = {
  items: CartItem[]
  couponCode?: string | null
  customerName?: string
}

/**
 * Constrói a mensagem WhatsApp pré-formatada.
 *  - 0 itens: mensagem genérica
 *  - 1 item: bloco detalhado com emojis
 *  - N itens: lista numerada com subtotal estimado
 *
 * Suporta couponCode opcional (mencionado no final).
 */
export function buildWhatsappMessage({ items, couponCode, customerName }: BuildOptions): string {
  if (items.length === 0) {
    return 'Olá! Tudo bem? Vim pelo site da *Cariri Chuteiras*. Gostaria de mais informações sobre os produtos.'
  }

  const greeting = customerName
    ? `Olá! Meu nome é ${customerName} e vim pelo site da *Cariri Chuteiras*.`
    : 'Olá! Tudo bem? Vim pelo site da *Cariri Chuteiras*.'

  let msg = `${greeting}\n\n`

  if (items.length === 1) {
    const p = items[0]!
    const finalPrice = p.promoPrice ?? p.price
    msg += `Tenho interesse no seguinte produto:\n\n`
    msg += `📦 *Produto:* ${p.brand} ${p.productName}\n`
    if (p.color) msg += `🎨 *Cor:* ${p.color}\n`
    if (p.size) msg += `📏 *Numeração:* ${p.size}\n`
    if (p.quantity > 1) msg += `🔢 *Quantidade:* ${p.quantity}\n`
    msg += `💰 *Preço:* ${formatBRL(finalPrice)}`
    if (p.promoPrice && p.promoPrice < p.price) {
      msg += ` _(de ${formatBRL(p.price)})_`
    }
    msg += `\n`
    if (SITE_URL && p.slug) {
      msg += `🔗 ${SITE_URL}/produto/${p.slug}\n`
    }
  } else {
    msg += `Tenho interesse nos seguintes *${items.length} produtos*:\n\n`
    items.forEach((p, i) => {
      const finalPrice = p.promoPrice ?? p.price
      msg += `*${i + 1}.* ${p.brand} ${p.productName}\n`
      const details: string[] = []
      if (p.color) details.push(`🎨 ${p.color}`)
      if (p.size) details.push(`📏 ${p.size}`)
      if (p.quantity > 1) details.push(`🔢 ${p.quantity}un`)
      if (details.length) msg += `   ${details.join(' · ')}\n`
      msg += `   💰 ${formatBRL(finalPrice * p.quantity)}\n`
      if (SITE_URL && p.slug) msg += `   🔗 ${SITE_URL}/produto/${p.slug}\n`
      msg += `\n`
    })

    const subtotal = items.reduce((sum, p) => sum + (p.promoPrice ?? p.price) * p.quantity, 0)
    msg += `_Subtotal estimado: ${formatBRL(subtotal)}_\n`
  }

  if (couponCode) {
    msg += `\n🎟️ *Cupom:* ${couponCode}\n`
  }

  msg += `\nGostaria de mais informações sobre disponibilidade, formas de pagamento e entrega. Obrigado!`

  return msg
}

/**
 * Retorna a URL completa do wa.me com a mensagem pronta.
 */
export function buildWhatsappUrl(options: BuildOptions): string {
  const message = buildWhatsappMessage(options)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
}
