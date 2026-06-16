import type { Metadata } from 'next'
import { requireRole } from '@/lib/admin/auth'
import { CouponForm } from '@/components/admin/coupons/coupon-form'

export const metadata: Metadata = { title: 'Novo cupom' }

export default async function NovoCupomPage() {
  await requireRole(['admin', 'editor'])
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <CouponForm />
    </div>
  )
}
