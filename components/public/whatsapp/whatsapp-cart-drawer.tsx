'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCartStore, selectSubtotal } from '@/lib/whatsapp/cart-store'
import { buildWhatsappUrl } from '@/lib/whatsapp/build-message'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated'
import { getCartItemKey } from '@/lib/whatsapp/types'
import type { CartItem } from '@/lib/whatsapp/types'
import { formatBRL } from '@/lib/utils'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

export function WhatsappCartDrawer() {
  const hydrated = useHasHydrated()
  const isOpen = useCartStore((s) => s.isOpen)
  const close = useCartStore((s) => s.close)
  const items = useCartStore((s) => s.items)
  const couponCode = useCartStore((s) => s.couponCode)
  const setCoupon = useCartStore((s) => s.setCoupon)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clear = useCartStore((s) => s.clear)
  const subtotal = useCartStore(selectSubtotal)
  const { track } = useAnalytics()

  const [couponInput, setCouponInput] = React.useState(couponCode ?? '')

  React.useEffect(() => {
    setCouponInput(couponCode ?? '')
  }, [couponCode])

  if (!hydrated) return null

  function handleSendAll() {
    if (items.length === 0) return
    track('whatsapp_click_cart', { items, couponCode: couponCode ?? undefined })
    const url = buildWhatsappUrl({ items, couponCode })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleRemove(key: string, item: CartItem) {
    removeItem(key)
    track('cart_remove', {
      productId: item.productId,
      metadata: { color: item.color, size: item.size },
    })
  }

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? null : close())}>
      <SheetContent
        side="right"
        className="bg-bg-primary border-border flex w-full flex-col border-l p-0 sm:max-w-md"
      >
        <SheetHeader className="border-border border-b px-5 py-4">
          <SheetTitle className="font-display flex items-center gap-2 text-2xl uppercase tracking-tight">
            <ShoppingBag className="text-neon h-6 w-6" />
            Sua conversa
            {items.length > 0 && (
              <Badge variant="default" className="ml-auto">
                {totalUnits} {totalUnits > 1 ? 'itens' : 'item'}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Carrinho de intenção. Itens adicionados aqui serão enviados juntos pelo WhatsApp da loja.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <EmptyState onClose={close} />
        ) : (
          <>
            <ScrollArea className="flex-1 px-5">
              <div className="space-y-4 py-4">
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const key = getCartItemKey(item)
                    const finalPrice = item.promoPrice ?? item.price
                    return (
                      <motion.div
                        key={key}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-border bg-bg-secondary flex gap-3 rounded-lg border p-3"
                      >
                        {/* Imagem */}
                        <Link
                          href={`/produto/${item.slug}`}
                          onClick={close}
                          className="bg-bg-tertiary relative h-20 w-20 shrink-0 overflow-hidden rounded-md"
                        >
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.productName}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-xs text-gray-600">
                              sem foto
                            </div>
                          )}
                        </Link>

                        {/* Detalhes */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-neon text-xs font-semibold uppercase tracking-wide">
                                {item.brand}
                              </p>
                              <Link
                                href={`/produto/${item.slug}`}
                                onClick={close}
                                className="hover:text-neon block text-sm font-medium leading-tight line-clamp-2 transition-colors"
                              >
                                {item.productName}
                              </Link>
                            </div>
                            <button
                              onClick={() => handleRemove(key, item)}
                              className="hover:text-danger hover:bg-danger/10 shrink-0 rounded-md p-1 text-gray-400 transition-colors"
                              aria-label={`Remover ${item.productName}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Variantes */}
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {item.color && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                                {item.colorHex && (
                                  <span
                                    className="border-border inline-block h-2.5 w-2.5 rounded-full border"
                                    style={{ backgroundColor: item.colorHex }}
                                  />
                                )}
                                {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className="text-[11px] text-gray-400">
                                Tam. {item.size}
                              </span>
                            )}
                          </div>

                          {/* Quantidade + preço */}
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="border-border inline-flex items-center rounded-md border">
                              <button
                                onClick={() => updateQuantity(key, item.quantity - 1)}
                                className="hover:text-neon grid h-7 w-7 place-items-center text-gray-400 transition-colors"
                                aria-label="Diminuir quantidade"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-sm font-medium tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(key, item.quantity + 1)}
                                className="hover:text-neon grid h-7 w-7 place-items-center text-gray-400 transition-colors"
                                aria-label="Aumentar quantidade"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-right">
                              {item.promoPrice && item.promoPrice < item.price && (
                                <p className="text-[10px] text-gray-600 line-through">
                                  {formatBRL(item.price * item.quantity)}
                                </p>
                              )}
                              <p className="text-neon text-sm font-bold">
                                {formatBRL(finalPrice * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Footer fixo */}
            <div className="border-border bg-bg-secondary/50 space-y-4 border-t px-5 py-4">
              {/* Cupom */}
              <div>
                <label
                  htmlFor="coupon"
                  className="mb-1.5 block text-xs uppercase tracking-wide text-gray-400"
                >
                  Cupom de desconto (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="CARIRI10"
                    className="border-border bg-bg-primary text-foreground focus:border-neon focus:ring-neon/30 h-10 flex-1 rounded-md border px-3 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2"
                  />
                  <Button
                    size="sm"
                    variant={couponCode ? 'outline' : 'default'}
                    onClick={() => {
                      const trimmed = couponInput.trim()
                      setCoupon(trimmed || null)
                      if (trimmed) {
                        track('coupon_copy', {
                          metadata: { code: trimmed, source: 'cart-input' },
                        })
                      }
                    }}
                    className="h-10"
                  >
                    {couponCode ? 'Trocar' : 'Aplicar'}
                  </Button>
                </div>
                {couponCode && (
                  <p className="text-success mt-1.5 flex items-center gap-1 text-xs">
                    ✓ Cupom <strong className="font-bold">{couponCode}</strong> será
                    mencionado na conversa
                  </p>
                )}
              </div>

              {/* Subtotal */}
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-400">Subtotal estimado</span>
                <span className="font-display text-foreground text-2xl">
                  {formatBRL(subtotal)}
                </span>
              </div>

              {/* CTA */}
              <Button
                variant="whatsapp"
                size="lg"
                className="w-full text-base"
                onClick={handleSendAll}
              >
                <WhatsAppIcon className="h-5 w-5" />
                Enviar tudo no WhatsApp
                <ArrowRight className="h-4 w-4" />
              </Button>

              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja limpar a conversa?')) clear()
                }}
                className="hover:text-danger w-full py-1 text-center text-xs text-gray-400 transition-colors"
              >
                Limpar conversa
              </button>

              <p className="text-center text-[11px] leading-relaxed text-gray-600">
                Os preços e disponibilidade serão confirmados pelo atendente.
                <br />A conversa abre direto no WhatsApp da loja.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center space-y-4 px-6 text-center">
      <div className="bg-bg-secondary grid h-20 w-20 place-items-center rounded-full">
        <ShoppingBag className="h-10 w-10 text-gray-600" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-xl uppercase tracking-tight">Conversa vazia</h3>
        <p className="max-w-xs text-sm text-gray-400">
          Adicione produtos para enviar todos de uma vez no WhatsApp da loja.
        </p>
      </div>
      <Button variant="outline" onClick={onClose}>
        Continuar navegando
      </Button>
    </div>
  )
}
