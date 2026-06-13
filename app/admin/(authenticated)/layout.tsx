import { requireAdmin } from '@/lib/admin/auth'
import { AdminLayoutShell } from '@/components/admin/layout/admin-layout-shell'

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireAdmin()
  return <AdminLayoutShell admin={admin}>{children}</AdminLayoutShell>
}
