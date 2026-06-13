import type { Metadata } from 'next'
import { getCurrentAdmin } from '@/lib/admin/auth'
import { ProfileForm } from '@/components/admin/profile/profile-form'
import { PasswordForm } from '@/components/admin/profile/password-form'
import { ADMIN_ROLE_LABELS } from '@/lib/admin/types'

export const metadata: Metadata = { title: 'Meu perfil' }

export default async function ProfilePage() {
  const admin = await getCurrentAdmin()
  if (!admin) return null

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 md:px-8 md:py-10">
      <header className="space-y-2">
        <h1 className="font-display text-3xl uppercase tracking-tight md:text-4xl">
          Meu perfil
        </h1>
        <p className="text-sm text-gray-400">
          Atualize suas informações de acesso.
        </p>
      </header>

      <div className="space-y-2 rounded-lg border border-border bg-bg-secondary p-6 md:p-8">
        <p className="text-xs uppercase tracking-wider text-gray-400">Função</p>
        <p className="font-display text-2xl text-neon">
          {ADMIN_ROLE_LABELS[admin.role]}
        </p>
        <p className="border-t border-border pt-2 text-xs text-gray-400">
          Email: <strong className="text-foreground">{admin.email}</strong>
        </p>
      </div>

      <ProfileForm
        currentName={admin.name}
        currentAvatarUrl={admin.avatarUrl}
      />
      <PasswordForm />
    </div>
  )
}
