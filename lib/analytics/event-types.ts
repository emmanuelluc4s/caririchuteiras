import { z } from 'zod'
import { CartItemSchema } from '@/lib/whatsapp/types'

export const EventTypeSchema = z.enum([
  'product_view',
  'category_view',
  'search',
  'whatsapp_click_single',
  'whatsapp_click_cart',
  'cart_add',
  'cart_remove',
  'coupon_copy',
  'filter_apply',
  'hero_click',
  'quick_view_open',
  'compare_add',
  'share_click',
  'exit_intent_shown',
  'theme_toggle',
])

export type EventType = z.infer<typeof EventTypeSchema>

export const TrackPayloadSchema = z.object({
  type: EventTypeSchema,
  productId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  // Para eventos de WhatsApp
  items: z.array(CartItemSchema).optional(),
  couponCode: z.string().optional(),
})

export type TrackPayload = z.infer<typeof TrackPayloadSchema>
