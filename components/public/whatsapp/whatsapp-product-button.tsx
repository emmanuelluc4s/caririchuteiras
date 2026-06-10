'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { ShoppingBag, MessageCircle } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { useCartStore } from '@/lib/whatsapp/cart-store'
import { buildWhatsappUrl } from '@/lib/whatsapp/build-message'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import type { CartItemInput, CartItem } from '@/lib/whatsapp/types'
import { cn } from '@/lib/utils'

type Mode = 'add' | 'direct'

type Props = {
  /**
   * - `add`: adiciona ao carrinho de intenção (padrão, recomendado)
   * - `direct`: abre o WhatsApp na hora com apenas este produto
   */
  mode?: Mode
  product: CartItemInput
  size?: ButtonProps['size']
  className?: string
  label?: string
  showIcon?: boolean
}

export function WhatsappProductButton({
  mode = 'add',
  product,
  size = 'lg',
  className,
  label,
  showIcon = true,
}: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.open)
  const { track } = useAnalytics()

  function handleClick() {
    if (mode === 'direct') {
      const fullItem: CartItem = {
        ...product,
        quantity: product.quantity ?? 1,
        addedAt: Date.now(),
      }
      track('whatsapp_click_single', {
        productId: product.productId,
        items: [fullItem],
      })
      const url = buildWhatsappUrl({ items: [fullItem] })
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    // mode === 'add'
    const result = addItem(product)
    track('cart_add', {
      productId: product.productId,
      metadata: { color: product.color, size: product.size },
    })

    if (result === 'added') {
      toast.success('Adicionado à conversa', {
        description: `${product.brand} ${product.productName}`,
        action: { label: 'Ver carrinho', onClick: openCart },
      })
    } else if (result === 'updated') {
      toast.success('Quantidade atualizada', {
        description: `${product.brand} ${product.productName}`,
        action: { label: 'Ver carrinho', onClick: openCart },
      })
    } else {
      toast.error('Limite atingido', {
        description: 'Você já adicionou o máximo de 20 produtos à conversa.',
      })
    }
  }

  const defaultLabel = mode === 'direct' ? 'Falar no WhatsApp' : 'Adicionar à conversa'
  const Icon = mode === 'direct' ? MessageCircle : ShoppingBag

  return (
    <Button
      onClick={handleClick}
      variant="whatsapp"
      size={size}
      className={cn('font-semibold', className)}
      aria-label={label ?? defaultLabel}
    >
      {showIcon && <Icon className="h-5 w-5" />}
      {label ?? defaultLabel}
    </Button>
  )
}
