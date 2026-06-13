export type AdminRole = 'admin' | 'editor' | 'viewer'

export type AdminUser = {
  id: string
  supabaseId: string
  email: string
  name: string
  avatarUrl: string | null
  role: AdminRole
  isActive: boolean
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
}

export const ADMIN_ROLE_COLORS: Record<AdminRole, string> = {
  admin: 'text-neon',
  editor: 'text-warning',
  viewer: 'text-gray-400',
}
