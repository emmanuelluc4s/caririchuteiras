import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const getActiveCoupon = cache(async () => {
  try {
    return await prisma.coupon.findFirst({
      where: {
        isActive: true,
        OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
      },
      orderBy: { validUntil: 'asc' },
    })
  } catch {
    return null
  }
})
