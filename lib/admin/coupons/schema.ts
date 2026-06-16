import { z } from 'zod'

export const CouponFormSchema = z
  .object({
    code: z
      .string()
      .min(3, 'Código muito curto')
      .max(30)
      .regex(/^[A-Z0-9_-]+$/, 'Use letras maiúsculas, números, _ ou -'),
    description: z.string().max(200).nullish(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number().positive().max(99999),
    minPurchase: z.number().nonnegative().max(99999).nullish(),
    validFrom: z.date().nullish(),
    validUntil: z.date().nullish(),
    maxUses: z.number().int().positive().max(99999).nullish(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (d) => {
      if (d.discountType === 'percentage')
        return d.discountValue > 0 && d.discountValue <= 100
      return true
    },
    {
      message: 'Desconto em % deve estar entre 1 e 100',
      path: ['discountValue'],
    },
  )
  .refine(
    (d) =>
      !d.validFrom ||
      !d.validUntil ||
      new Date(d.validUntil) > new Date(d.validFrom),
    { message: 'Validade final deve ser depois da inicial', path: ['validUntil'] },
  )

export type CouponFormValues = z.infer<typeof CouponFormSchema>

export type CouponStatus =
  | 'active'
  | 'inactive'
  | 'expired'
  | 'depleted'
  | 'scheduled'

export function getCouponStatus(coupon: {
  isActive: boolean
  validFrom?: Date | string | null
  validUntil?: Date | string | null
  maxUses?: number | null
  usageCount?: number | null
}): CouponStatus {
  if (!coupon.isActive) return 'inactive'
  const now = new Date()
  if (coupon.validFrom && new Date(coupon.validFrom) > now) return 'scheduled'
  if (coupon.validUntil && new Date(coupon.validUntil) < now) return 'expired'
  if (
    coupon.maxUses != null &&
    coupon.usageCount != null &&
    coupon.usageCount >= coupon.maxUses
  ) {
    return 'depleted'
  }
  return 'active'
}

export const COUPON_STATUS_LABELS: Record<CouponStatus, string> = {
  active: 'Ativo',
  inactive: 'Desativado',
  expired: 'Expirado',
  depleted: 'Esgotado',
  scheduled: 'Agendado',
}

export const COUPON_STATUS_STYLES: Record<CouponStatus, string> = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-gray-600/10 text-gray-400',
  expired: 'bg-danger/10 text-danger',
  depleted: 'bg-warning/10 text-warning',
  scheduled: 'bg-neon/10 text-neon',
}
