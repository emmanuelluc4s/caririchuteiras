import type { AdminRole } from './types'

/**
 * Matriz de permissões: cada chave é uma ação,
 * valor é a lista de roles que podem executá-la.
 */
export const PERMISSIONS = {
  // Produtos
  'products.create': ['admin', 'editor'],
  'products.update': ['admin', 'editor'],
  'products.delete': ['admin'],
  'products.view': ['admin', 'editor', 'viewer'],

  // Categorias
  'categories.create': ['admin', 'editor'],
  'categories.update': ['admin', 'editor'],
  'categories.delete': ['admin'],
  'categories.view': ['admin', 'editor', 'viewer'],

  // Cupons
  'coupons.create': ['admin', 'editor'],
  'coupons.update': ['admin', 'editor'],
  'coupons.delete': ['admin'],
  'coupons.view': ['admin', 'editor', 'viewer'],

  // Avaliações
  'reviews.approve': ['admin', 'editor'],
  'reviews.reject': ['admin', 'editor'],
  'reviews.markVerified': ['admin', 'editor'],
  'reviews.delete': ['admin'],
  'reviews.view': ['admin', 'editor', 'viewer'],

  // Site Config
  'config.update': ['admin'],
  'config.view': ['admin', 'editor', 'viewer'],

  // Usuários admin
  'users.create': ['admin'],
  'users.update': ['admin'],
  'users.delete': ['admin'],
  'users.view': ['admin'],

  // Dashboard e relatórios
  'dashboard.view': ['admin', 'editor', 'viewer'],
  'reports.export': ['admin', 'editor', 'viewer'],

  // Auditoria
  'audit.view': ['admin'],

  // Modo manutenção
  'maintenance.toggle': ['admin'],
} as const satisfies Record<string, AdminRole[]>

export type Permission = keyof typeof PERMISSIONS

/**
 * Verifica se a role tem permissão para a ação.
 */
export function can(role: AdminRole, permission: Permission): boolean {
  const allowed = PERMISSIONS[permission] as readonly AdminRole[]
  return allowed.includes(role)
}

/**
 * Helper para Server Actions: lança erro se a role não pode.
 */
export function assertCan(role: AdminRole, permission: Permission): void {
  if (!can(role, permission)) {
    throw new Error(`Permissão negada: ${permission}`)
  }
}
