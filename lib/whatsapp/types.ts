import { z } from 'zod'

export const CartItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  brand: z.string().min(1),
  slug: z.string().min(1),
  imageUrl: z.string().url().optional(),
  color: z.string().optional(),
  colorHex: z.string().optional(),
  size: z.string().optional(),
  price: z.number().nonnegative(),
  promoPrice: z.number().nonnegative().optional(),
  quantity: z.number().int().positive().default(1),
  addedAt: z.number(), // timestamp
})

export type CartItem = z.infer<typeof CartItemSchema>

// Input do consumidor (addedAt e quantity definidos pelo store)
export const CartItemInputSchema = CartItemSchema.omit({
  addedAt: true,
  quantity: true,
}).extend({
  quantity: z.number().int().positive().optional(),
})

export type CartItemInput = z.infer<typeof CartItemInputSchema>

/**
 * Chave única do item no carrinho.
 * O mesmo produto com cores/tamanhos diferentes = itens distintos.
 */
export function getCartItemKey(item: Pick<CartItem, 'productId' | 'color' | 'size'>) {
  return `${item.productId}|${item.color ?? '_'}|${item.size ?? '_'}`
}
