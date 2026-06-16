'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/admin/auth'
import {
  CreateAdminSchema,
  UpdateAdminSchema,
  generateTempPassword,
  type CreateAdminValues,
  type UpdateAdminValues,
} from '@/lib/admin/users/schema'

type Result<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

let _supabaseAdmin: Awaited<
  ReturnType<typeof createSupabaseAdminClient>
> | null = null

async function createSupabaseAdminClient() {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function getSupabaseAdmin() {
  if (!_supabaseAdmin) _supabaseAdmin = await createSupabaseAdminClient()
  return _supabaseAdmin
}

export async function createAdminAction(
  values: CreateAdminValues,
): Promise<Result<{ tempPassword: string; userId: string }>> {
  try {
    const admin = await requireRole(['admin'])

    const parsed = CreateAdminSchema.safeParse(values)
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      }
    }

    const existing = await prisma.adminUser.findUnique({
      where: { email: parsed.data.email },
    })
    if (existing) {
      return { ok: false, error: 'Já existe um admin com este email' }
    }

    const tempPassword = generateTempPassword()

    const supabase = await getSupabaseAdmin()
    const { data: supabaseUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: parsed.data.email,
        password: tempPassword,
        email_confirm: true,
      })

    if (createError || !supabaseUser.user) {
      console.error('[createAdmin] supabase error:', createError)
      return {
        ok: false,
        error: 'Erro ao criar usuário no sistema de autenticação',
      }
    }

    const adminUser = await prisma.adminUser.create({
      data: {
        supabaseId: supabaseUser.user.id,
        email: parsed.data.email,
        name: parsed.data.name,
        role: parsed.data.role,
        isActive: true,
      },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'admin_user_create',
          adminId: admin.id,
          newUserId: adminUser.id,
          newUserEmail: adminUser.email,
          newUserRole: adminUser.role,
        },
      },
    })

    revalidatePath('/admin/usuarios')
    return { ok: true, data: { tempPassword, userId: adminUser.id } }
  } catch (error) {
    console.error('[createAdmin]', error)
    return { ok: false, error: 'Erro ao criar admin' }
  }
}

export async function updateAdminAction(
  userId: string,
  values: UpdateAdminValues,
): Promise<Result> {
  try {
    const admin = await requireRole(['admin'])

    const parsed = UpdateAdminSchema.safeParse(values)
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      }
    }

    const target = await prisma.adminUser.findUnique({ where: { id: userId } })
    if (!target) return { ok: false, error: 'Usuário não encontrado' }

    if (target.id === admin.id) {
      if (parsed.data.role !== 'admin') {
        return {
          ok: false,
          error: 'Você não pode rebaixar sua própria função',
        }
      }
      if (!parsed.data.isActive) {
        return { ok: false, error: 'Você não pode desativar a si mesmo' }
      }
    }

    if (target.role === 'admin' && parsed.data.role !== 'admin') {
      const otherAdmins = await prisma.adminUser.count({
        where: {
          role: 'admin',
          isActive: true,
          id: { not: userId },
        },
      })
      if (otherAdmins === 0) {
        return {
          ok: false,
          error: 'Não é possível rebaixar o último administrador ativo',
        }
      }
    }

    if (target.isActive && !parsed.data.isActive && target.role === 'admin') {
      const otherActiveAdmins = await prisma.adminUser.count({
        where: { role: 'admin', isActive: true, id: { not: userId } },
      })
      if (otherActiveAdmins === 0) {
        return {
          ok: false,
          error: 'Não é possível desativar o último administrador ativo',
        }
      }
    }

    await prisma.adminUser.update({
      where: { id: userId },
      data: parsed.data,
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'admin_user_update',
          adminId: admin.id,
          targetUserId: userId,
          changes: parsed.data,
        },
      },
    })

    revalidatePath('/admin/usuarios')
    return { ok: true }
  } catch (error) {
    console.error('[updateAdmin]', error)
    return { ok: false, error: 'Erro ao atualizar admin' }
  }
}

export async function resetPasswordAction(
  userId: string,
): Promise<Result<{ tempPassword: string }>> {
  try {
    const admin = await requireRole(['admin'])

    const target = await prisma.adminUser.findUnique({ where: { id: userId } })
    if (!target) return { ok: false, error: 'Usuário não encontrado' }

    const tempPassword = generateTempPassword()

    const supabase = await getSupabaseAdmin()
    const { error } = await supabase.auth.admin.updateUserById(
      target.supabaseId,
      { password: tempPassword },
    )

    if (error) {
      console.error('[resetPassword] supabase error:', error)
      return { ok: false, error: 'Erro ao redefinir senha' }
    }

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'admin_user_password_reset',
          adminId: admin.id,
          targetUserId: userId,
        },
      },
    })

    return { ok: true, data: { tempPassword } }
  } catch (error) {
    console.error('[resetPassword]', error)
    return { ok: false, error: 'Erro ao redefinir senha' }
  }
}

export async function deleteAdminAction(userId: string): Promise<Result> {
  try {
    const admin = await requireRole(['admin'])

    if (userId === admin.id) {
      return { ok: false, error: 'Você não pode excluir a si mesmo' }
    }

    const target = await prisma.adminUser.findUnique({ where: { id: userId } })
    if (!target) return { ok: false, error: 'Usuário não encontrado' }

    if (target.role === 'admin' && target.isActive) {
      const otherActiveAdmins = await prisma.adminUser.count({
        where: { role: 'admin', isActive: true, id: { not: userId } },
      })
      if (otherActiveAdmins === 0) {
        return {
          ok: false,
          error: 'Não é possível excluir o último administrador ativo',
        }
      }
    }

    const supabase = await getSupabaseAdmin()
    const { error: authError } = await supabase.auth.admin.deleteUser(
      target.supabaseId,
    )
    if (authError) {
      console.error('[deleteAdmin] supabase error:', authError)
      return {
        ok: false,
        error: 'Erro ao excluir do sistema de autenticação',
      }
    }

    await prisma.adminUser.delete({ where: { id: userId } })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'admin_user_delete',
          adminId: admin.id,
          deletedUserEmail: target.email,
          deletedUserId: target.id,
        },
      },
    })

    revalidatePath('/admin/usuarios')
    return { ok: true }
  } catch (error) {
    console.error('[deleteAdmin]', error)
    return { ok: false, error: 'Erro ao excluir admin' }
  }
}
