import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'
import { CouponForm } from '@/components/admin/coupons/coupon-form'

export const metadata: Metadata = { title: 'Editar cupom' }
export const dynamic = 'force-dynamic'

export default async function EditarCupomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole(['admin', 'editor'])
  const { id } = await params
  const c = await prisma.coupon.findUnique({ where: { id } })
  if (!c) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <CouponForm
        initialData={{
          id: c.id,
          code: c.code,
          description: c.description,
          discountType: c.discountType as 'percentage' | 'fixed',
          discountValue: Number(c.discountValue),
          minPurchase: c.minPurchase ? Number(c.minPurchase) : null,
          validFrom: c.validFrom,
          validUntil: c.validUntil,
          maxUses: c.maxUses,
          isActive: c.isActive,
          usageCount: c.usageCount,
        }}
      />
    </div>
  )
}
