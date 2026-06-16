'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  History,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminRole } from '@/lib/admin/types'
import { can, type Permission } from '@/lib/admin/permissions'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  permission?: Permission
  exact?: boolean
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  {
    href: '/admin/produtos',
    label: 'Produtos',
    icon: Package,
    permission: 'products.view',
  },
  {
    href: '/admin/categorias',
    label: 'Categorias',
    icon: FolderTree,
    permission: 'categories.view',
  },
  {
    href: '/admin/cupons',
    label: 'Cupons',
    icon: Tag,
    permission: 'coupons.view',
  },
  {
    href: '/admin/avaliacoes',
    label: 'Avaliações',
    icon: MessageSquare,
    permission: 'reviews.view',
  },
  {
    href: '/admin/dashboard',
    label: 'Analytics',
    icon: BarChart3,
    permission: 'dashboard.view',
  },
  {
    href: '/admin/usuarios',
    label: 'Usuários',
    icon: Users,
    permission: 'users.view',
  },
  {
    href: '/admin/auditoria',
    label: 'Auditoria',
    icon: History,
    permission: 'audit.view',
  },
  {
    href: '/admin/configuracoes',
    label: 'Configurações',
    icon: Settings,
    permission: 'config.view',
  },
]

type Props = {
  role: AdminRole
  collapsed: boolean
  onCollapseToggle: () => void
  pendingReviewsCount?: number
}

export function AdminSidebar({
  role,
  collapsed,
  onCollapseToggle,
  pendingReviewsCount,
}: Props) {
  const pathname = usePathname()
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || can(role, item.permission),
  ).map((item) =>
    item.href === '/admin/avaliacoes'
      ? { ...item, badge: pendingReviewsCount }
      : item,
  )

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-r border-border bg-bg-secondary transition-all duration-200 md:flex',
        collapsed ? 'w-16' : 'w-60',
      )}
      aria-label="Navegação principal"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        <Link href="/admin" className="flex min-w-0 items-center gap-2">
          <Image
            src="/escudo.svg"
            alt=""
            width={28}
            height={32}
            className="shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-sm uppercase tracking-tight">
                Cariri<span className="text-neon"> CH</span>
              </p>
              <p className="text-[9px] uppercase tracking-wider text-gray-400">
                Admin
              </p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          {visibleItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all',
                    isActive
                      ? 'bg-neon/10 font-medium text-neon'
                      : 'text-gray-100 hover:bg-bg-tertiary hover:text-foreground',
                    collapsed && 'justify-center px-0',
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-neon"
                    />
                  )}
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!collapsed &&
                    item.badge !== undefined &&
                    item.badge > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neon px-1.5 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={onCollapseToggle}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="flex h-9 w-full items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-bg-tertiary hover:text-foreground"
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform',
              collapsed && 'rotate-180',
            )}
          />
        </button>
      </div>
    </aside>
  )
}
