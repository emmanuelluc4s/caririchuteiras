'use client'

import { Copy, Sparkles, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/whatsapp/cart-store'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { formatBRL } from '@/lib/utils'

type Props = {
  code: string
  description?: string | null
  discountType: string
  discountValue: number
  validUntil?: Date | null
}

export function CouponCard({
  code,
  description,
  discountType,
  discountValue,
  validUntil,
}: Props) {
  const setCoupon = useCartStore((s) => s.setCoupon)
  const openCart = useCartStore((s) => s.open)
  const { track } = useAnalytics()

  const discountLabel =
    discountType === 'percentage'
      ? `${discountValue}% off`
      : `${formatBRL(discountValue)} off`

  function handleCopy() {
    navigator.clipboard.writeText(code).catch(() => {})
    setCoupon(code)
    track('coupon_copy', { metadata: { code, source: 'promo-page' } })
    toast.success('Cupom copiado!', {
      description: 'Será mencionado automaticamente no WhatsApp.',
      action: { label: 'Ver carrinho', onClick: openCart },
    })
  }

  return (
    <article className="group relative overflow-hidden rounded-xl border-2 border-dashed border-neon/50 bg-bg-secondary p-6 transition-all hover:border-neon hover:bg-neon/5">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-neon/15 blur-2xl" />

      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-neon" />
          <span className="text-xs font-bold uppercase tracking-wider text-neon">
            {discountLabel}
          </span>
        </div>

        <div>
          <p className="font-display text-3xl tracking-wider text-foreground tabular-nums">
            {code}
          </p>
          {description && (
            <p className="mt-1 text-sm leading-snug text-gray-100">
              {description}
            </p>
          )}
        </div>

        {validUntil && (
          <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Clock className="h-3 w-3" />
            Válido até{' '}
            <strong className="text-foreground">
              {new Date(validUntil).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </strong>
          </p>
        )}

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-neon px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neon-hover hover:neon-glow-sm"
        >
          <Copy className="h-4 w-4" />
          Copiar e usar no WhatsApp
        </button>
      </div>
    </article>
  )
}
