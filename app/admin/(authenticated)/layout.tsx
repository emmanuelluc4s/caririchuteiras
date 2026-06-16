import { requireAdmin } from '@/lib/admin/auth'
import { AdminLayoutShell } from '@/components/admin/layout/admin-layout-shell'
import { prisma } from '@/lib/prisma'

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireAdmin()
  const pendingReviewsCount = await prisma.review.count({
    where: { isApproved: false },
  })
  return (
    <AdminLayoutShell admin={admin} pendingReviewsCount={pendingReviewsCount}>
      {children}
    </AdminLayoutShell>
  )
}
