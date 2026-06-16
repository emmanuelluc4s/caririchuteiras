import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requireRole } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'
import { AdminPageHeader } from '@/components/admin/layout/admin-page-header'
import { CouponsTable } from '@/components/admin/coupons/coupons-table'

export const metadata: Metadata = { title: 'Cupons' }
export const dynamic = 'force-dynamic'

export default async function CuponsPage() {
  await requireRole(['admin', 'editor', 'viewer'])

  const coupons = await prisma.coupon.findMany({
    orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      <AdminPageHeader
        title="Cupons"
        description={`${coupons.length} cupom${coupons.length !== 1 ? 's' : ''} cadastrado${coupons.length !== 1 ? 's' : ''}`}
        action={
          <Button asChild>
            <Link href="/admin/cupons/novo">
              <Plus className="h-4 w-4" />
              Novo cupom
            </Link>
          </Button>
        }
      />

      <CouponsTable
        coupons={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          description: c.description,
          discountType: c.discountType as 'percentage' | 'fixed',
          discountValue: Number(c.discountValue),
          minPurchase: c.minPurchase ? Number(c.minPurchase) : null,
          validFrom: c.validFrom,
          validUntil: c.validUntil,
          maxUses: c.maxUses,
          usageCount: c.usageCount,
          isActive: c.isActive,
        }))}
      />
    </div>
  )
}
