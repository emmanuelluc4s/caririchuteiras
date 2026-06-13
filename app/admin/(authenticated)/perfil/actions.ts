'use server'

import { z } from 'zod'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin/auth'
import { createClient as createServerClient } from '@/lib/supabase/server'

const ProfileSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(80),
})

const PasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(100),
})

type Result = { ok: true; message: string } | { ok: false; error: string }

let _supabaseAdmin: SupabaseClient | null = null

async function getSupabaseAdmin(): Promise<SupabaseClient> {
  if (_supabaseAdmin) return _supabaseAdmin
  const { createClient } = await import('@supabase/supabase-js')
  _supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
  return _supabaseAdmin
}

export async function updateProfileAction(
  formData: FormData,
): Promise<Result> {
  try {
    const admin = await requireAdmin()

    const parsed = ProfileSchema.safeParse({
      name: String(formData.get('name') ?? '').trim(),
    })
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      }
    }

    let avatarUrl: string | undefined
    const file = formData.get('avatar')
    if (file && file instanceof File && file.size > 0) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return { ok: false, error: 'Tipo de imagem inválido' }
      }
      if (file.size > 2 * 1024 * 1024) {
        return { ok: false, error: 'Avatar máximo 2MB' }
      }
      const ext = file.type.includes('png')
        ? 'png'
        : file.type.includes('webp')
          ? 'webp'
          : 'jpg'
      const fileName = `${admin.id}/${crypto.randomBytes(8).toString('hex')}-${Date.now()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const supabaseAdmin = await getSupabaseAdmin()
      const { error: uploadError } = await supabaseAdmin.storage
        .from('avatars')
        .upload(fileName, buffer, { contentType: file.type, upsert: true })
      if (uploadError) {
        console.error('[updateProfile upload]', uploadError)
        return { ok: false, error: 'Erro ao salvar avatar' }
      }
      const { data } = supabaseAdmin.storage
        .from('avatars')
        .getPublicUrl(fileName)
      avatarUrl = data.publicUrl
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        name: parsed.data.name,
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    })

    revalidatePath('/admin', 'layout')
    return { ok: true, message: 'Perfil atualizado' }
  } catch (error) {
    console.error('[updateProfile] error:', error)
    return { ok: false, error: 'Erro ao atualizar perfil' }
  }
}

export async function updatePasswordAction(
  formData: FormData,
): Promise<Result> {
  try {
    await requireAdmin()

    const parsed = PasswordSchema.safeParse({
      newPassword: String(formData.get('newPassword') ?? ''),
    })
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      }
    }

    const supabase = await createServerClient()
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    })
    if (error) {
      console.error('[updatePassword]', error)
      return { ok: false, error: 'Erro ao atualizar senha' }
    }

    return { ok: true, message: 'Senha atualizada' }
  } catch (error) {
    console.error('[updatePassword] error:', error)
    return { ok: false, error: 'Erro ao atualizar senha' }
  }
}
