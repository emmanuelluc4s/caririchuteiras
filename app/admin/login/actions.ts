'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const LoginSchema = z.object({
  email: z.string().email('Email inválido').max(200),
  password: z.string().min(6, 'Senha muito curta').max(100),
})

type LoginResult =
  | { ok: true; adminName: string }
  | { ok: false; error: string }

export async function loginAction(formData: FormData): Promise<LoginResult> {
  try {
    const parsed = LoginSchema.safeParse({
      email: String(formData.get('email') ?? '')
        .trim()
        .toLowerCase(),
      password: String(formData.get('password') ?? ''),
    })

    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      return { ok: false, error: issue?.message ?? 'Dados inválidos' }
    }

    const { email, password } = parsed.data
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      return { ok: false, error: 'Email ou senha inválidos' }
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { supabaseId: data.user.id },
    })

    if (!adminUser) {
      await supabase.auth.signOut()
      return {
        ok: false,
        error: 'Usuário sem permissão de acesso. Contate um administrador.',
      }
    }

    if (!adminUser.isActive) {
      await supabase.auth.signOut()
      return { ok: false, error: 'Sua conta está desativada.' }
    }

    await Promise.all([
      prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { lastLoginAt: new Date() },
      }),
      prisma.siteEvent.create({
        data: {
          type: 'admin_login',
          metadata: {
            adminUserId: adminUser.id,
            email: adminUser.email,
          },
        },
      }),
    ])

    return { ok: true, adminName: adminUser.name }
  } catch (error) {
    console.error('[loginAction] error:', error)
    return { ok: false, error: 'Erro ao processar login. Tente novamente.' }
  }
}
