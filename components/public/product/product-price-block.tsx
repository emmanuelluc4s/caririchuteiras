import { Badge } from '@/components/ui/badge'
import { formatBRL } from '@/lib/utils'

type Props = {
  price: number
  promoPrice?: number | null
  installments?: number | null
}

export function ProductPriceBlock({
  price,
  promoPrice,
  installments,
}: Props) {
  const finalPrice = promoPrice ?? price
  const hasDiscount = promoPrice != null && promoPrice < price
  const discountPercent = hasDiscount
    ? Math.round(((price - promoPrice) / price) * 100)
    : 0
  const savings = hasDiscount ? price - promoPrice : 0

  return (
    <div className="space-y-2">
      {hasDiscount && (
        <div className="flex items-baseline gap-2">
          <span className="text-base text-gray-500 line-through">
            {formatBRL(price)}
          </span>
          <Badge variant="danger" className="text-[10px]">
            -{discountPercent}%
          </Badge>
        </div>
      )}

      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-display text-5xl leading-none text-neon neon-text md:text-6xl">
          {formatBRL(finalPrice)}
        </span>
        {hasDiscount && (
          <span className="text-xs font-semibold text-success">
            Economize {formatBRL(savings)}
          </span>
        )}
      </div>

      {installments && installments > 1 && (
        <p className="text-sm text-gray-100">
          ou{' '}
          <strong className="text-foreground">
            {installments}x de {formatBRL(finalPrice / installments)}
          </strong>{' '}
          <span className="text-gray-400">no cartão</span>
        </p>
      )}

      <p className="text-xs text-gray-400">
        Preços e condições finais confirmados no WhatsApp.
      </p>
    </div>
  )
}
