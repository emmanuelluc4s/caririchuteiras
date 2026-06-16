import type { Metadata } from 'next'
import { requireRole, getCurrentAdmin } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'
import { AdminPageHeader } from '@/components/admin/layout/admin-page-header'
import { UsersTable } from '@/components/admin/users/users-table'
import { CreateUserDialog } from '@/components/admin/users/create-user-dialog'

export const metadata: Metadata = { title: 'Usuários' }
export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  await requireRole(['admin'])
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) return null

  const users = await prisma.adminUser.findMany({
    orderBy: [{ isActive: 'desc' }, { role: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      <AdminPageHeader
        title="Usuários admin"
        description={`${users.length} usuário${users.length !== 1 ? 's' : ''} cadastrado${users.length !== 1 ? 's' : ''}`}
        action={<CreateUserDialog />}
      />

      <UsersTable
        users={users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          avatarUrl: u.avatarUrl,
          role: u.role as 'admin' | 'editor' | 'viewer',
          isActive: u.isActive,
          lastLoginAt: u.lastLoginAt,
          createdAt: u.createdAt,
        }))}
        currentUserId={currentAdmin.id}
      />
    </div>
  )
}
