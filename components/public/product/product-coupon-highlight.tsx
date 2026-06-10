'use client'

import { Sparkles, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/whatsapp/cart-store'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { formatBRL } from '@/lib/utils'

type Props = {
  code: string
  description?: string | null
  discountType: string
  discountValue: number
}

export function ProductCouponHighlight({
  code,
  description,
  discountType,
  discountValue,
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
    track('coupon_copy', { metadata: { code, source: 'product-page' } })
    toast.success('Cupom aplicado!', {
      description: 'Será mencionado automaticamente no WhatsApp',
      action: { label: 'Ver carrinho', onClick: openCart },
    })
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex w-full items-center justify-between gap-3 rounded-lg border-2 border-dashed border-neon/50 bg-neon/5 px-4 py-3 text-left transition-all hover:border-neon hover:bg-neon/10"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Sparkles className="h-5 w-5 shrink-0 text-neon" />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-neon">
            Use o cupom <span className="font-mono">{code}</span>
          </p>
          <p className="truncate text-xs text-gray-100">
            {description ?? `Desconto de ${discountLabel}`}
          </p>
        </div>
      </div>
      <Copy className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-neon" />
    </button>
  )
}
