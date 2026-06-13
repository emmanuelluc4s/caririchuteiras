import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { AdminUser, AdminRole } from './types'

/**
 * Busca o admin atual com base na sessão do Supabase.
 * Retorna null se não autenticado, sem registro AdminUser ou usuário inativo.
 * Cacheado por request via React cache.
 */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null

    const adminUser = await prisma.adminUser.findUnique({
      where: { supabaseId: data.user.id },
    })
    if (!adminUser || !adminUser.isActive) return null

    return {
      id: adminUser.id,
      supabaseId: adminUser.supabaseId,
      email: adminUser.email,
      name: adminUser.name,
      avatarUrl: adminUser.avatarUrl,
      role: adminUser.role as AdminRole,
      isActive: adminUser.isActive,
    }
  } catch (error) {
    console.error('[getCurrentAdmin] error:', error)
    return null
  }
})

/**
 * Garante que há admin autenticado. Redireciona para login se não.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin()
  if (!admin) {
    redirect('/admin/login')
  }
  return admin
}

/**
 * Garante que o admin atual tem uma das roles permitidas.
 * Redireciona para /admin/unauthorized se não.
 */
export async function requireRole(
  allowedRoles: AdminRole[],
): Promise<AdminUser> {
  const admin = await requireAdmin()
  if (!allowedRoles.includes(admin.role)) {
    redirect('/admin/unauthorized')
  }
  return admin
}
