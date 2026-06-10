'use client'

import * as React from 'react'
import { ShoppingBag, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/whatsapp/cart-store'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { buildWhatsappUrl } from '@/lib/whatsapp/build-message'
import { toast } from 'sonner'
import type { CartItem, CartItemInput } from '@/lib/whatsapp/types'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

type BaseProduct = Omit<CartItemInput, 'color' | 'colorHex' | 'size' | 'quantity'>

type Props = {
  product: BaseProduct
  selectedColor?: string
  selectedColorHex?: string
  selectedSize?: string
  selectedVariantStock: number
  requiresSelection: boolean
}

export function WhatsappAddBlock({
  product,
  selectedColor,
  selectedColorHex,
  selectedSize,
  selectedVariantStock,
  requiresSelection,
}: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.open)
  const couponCode = useCartStore((s) => s.couponCode)
  const { track } = useAnalytics()

  const isDisabled = requiresSelection && (!selectedColor || !selectedSize)
  const isOutOfStock = Boolean(
    selectedColor && selectedSize && selectedVariantStock === 0,
  )

  function buildItem(): CartItemInput {
    return {
      ...product,
      color: selectedColor,
      colorHex: selectedColorHex,
      size: selectedSize,
    }
  }

  function handleAdd() {
    if (isDisabled) {
      toast.error('Selecione cor e numeração antes de continuar')
      return
    }
    if (isOutOfStock) {
      toast.error('Esta combinação está sem estoque', {
        description: 'Tente outra cor ou numeração.',
      })
      return
    }

    const item = buildItem()
    const result = addItem(item)
    track('cart_add', {
      productId: product.productId,
      metadata: {
        source: 'product-page',
        color: selectedColor,
        size: selectedSize,
      },
    })

    if (result === 'added') {
      toast.success('Adicionado à conversa', {
        description: `${product.brand} ${product.productName}`,
        action: { label: 'Ver carrinho', onClick: openCart },
      })
    } else if (result === 'updated') {
      toast.success('Quantidade atualizada', {
        description: `${product.brand} ${product.productName}`,
      })
    } else if (result === 'limit-reached') {
      toast.error('Limite atingido', {
        description: 'Máximo de 20 produtos por conversa.',
      })
    }
  }

  function handleDirectWhatsapp() {
    if (isDisabled) {
      toast.error('Selecione cor e numeração antes de continuar')
      return
    }
    const item = buildItem()
    const fullItem: CartItem = {
      ...item,
      quantity: 1,
      addedAt: Date.now(),
    }
    track('whatsapp_click_single', {
      productId: product.productId,
      items: [fullItem],
      metadata: { source: 'product-page-direct' },
    })
    const url = buildWhatsappUrl({
      items: [fullItem],
      couponCode: couponCode ?? undefined,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {/* Bloco normal (no fluxo da página) */}
      <div className="space-y-3">
        <Button
          variant="whatsapp"
          size="xl"
          className="w-full text-base"
          onClick={handleAdd}
          disabled={isOutOfStock}
        >
          <ShoppingBag className="h-5 w-5" />
          {isOutOfStock ? 'Esgotado' : 'Adicionar à conversa'}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleDirectWhatsapp}
          disabled={isOutOfStock}
        >
          <WhatsAppIcon className="h-5 w-5" />
          Falar agora no WhatsApp
        </Button>

        {requiresSelection && (!selectedColor || !selectedSize) && (
          <p className="flex items-center gap-1.5 text-xs text-warning">
            <AlertCircle className="h-3.5 w-3.5" />
            Selecione cor e numeração para continuar
          </p>
        )}
      </div>

      {/* Sticky bottom no mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg-primary/95 p-3 pb-safe backdrop-blur-md md:hidden">
        <Button
          variant="whatsapp"
          size="lg"
          className="w-full text-base shadow-2xl"
          onClick={handleAdd}
          disabled={isOutOfStock}
          style={{ boxShadow: '0 -4px 24px rgba(37, 211, 102, 0.25)' }}
        >
          <ShoppingBag className="h-5 w-5" />
          {isOutOfStock ? 'Esgotado' : 'Adicionar à conversa'}
        </Button>
      </div>
    </>
  )
}
