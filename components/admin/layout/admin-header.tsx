'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu,
  ChevronDown,
  LogOut,
  User,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { logoutAction } from '@/app/admin/actions'
import { AdminSidebar } from './admin-sidebar'
import {
  ADMIN_ROLE_LABELS,
  ADMIN_ROLE_COLORS,
  type AdminUser,
} from '@/lib/admin/types'
import { cn } from '@/lib/utils'

const PATH_LABELS: Record<string, string> = {
  admin: 'Dashboard',
  produtos: 'Produtos',
  categorias: 'Categorias',
  cupons: 'Cupons',
  avaliacoes: 'Avaliações',
  dashboard: 'Analytics',
  usuarios: 'Usuários',
  auditoria: 'Auditoria',
  configuracoes: 'Configurações',
  perfil: 'Meu perfil',
  novo: 'Novo',
  editar: 'Editar',
}

function buildBreadcrumb(
  pathname: string | null,
): Array<{ href: string; label: string }> {
  if (!pathname) return [{ href: '/admin', label: 'Dashboard' }]
  const segments = pathname.split('/').filter(Boolean)
  return segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    const label = PATH_LABELS[seg] ?? seg
    return { href, label }
  })
}

type Props = {
  admin: AdminUser
}

export function AdminHeader({ admin }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const breadcrumb = buildBreadcrumb(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg-primary/95 px-4 backdrop-blur md:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Abrir menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-bg-tertiary md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 border-r border-border bg-bg-secondary p-0"
        >
          <VisuallyHidden asChild>
            <SheetTitle>Navegação</SheetTitle>
          </VisuallyHidden>
          <AdminSidebar
            role={admin.role}
            collapsed={false}
            onCollapseToggle={() => {}}
          />
        </SheetContent>
      </Sheet>

      <nav className="min-w-0 flex-1" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm">
          {breadcrumb.map((item, i) => {
            const isLast = i === breadcrumb.length - 1
            return (
              <li
                key={item.href}
                className="flex min-w-0 items-center gap-2"
              >
                {i > 0 && <span className="text-gray-600">/</span>}
                {isLast ? (
                  <span className="truncate font-medium text-foreground">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="truncate text-gray-400 transition-colors hover:text-neon"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden h-9 items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3 text-xs text-gray-100 transition-colors hover:border-neon hover:text-neon sm:inline-flex"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Ver site
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-bg-secondary pl-2 pr-3 transition-colors hover:border-neon/40"
              aria-label="Menu do usuário"
            >
              <Avatar admin={admin} size="sm" />
              <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
                {admin.name.split(' ')[0]}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 border-border bg-bg-secondary"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3 py-1">
                <Avatar admin={admin} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {admin.name}
                  </p>
                  <p className="truncate text-[10px] text-gray-400">
                    {admin.email}
                  </p>
                  <p
                    className={cn(
                      'mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider',
                      ADMIN_ROLE_COLORS[admin.role],
                    )}
                  >
                    <ShieldCheck className="h-2.5 w-2.5" />
                    {ADMIN_ROLE_LABELS[admin.role]}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild>
              <Link href="/admin/perfil" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Meu perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer sm:hidden"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver site
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild>
              <form action={logoutAction} className="w-full">
                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center text-left text-danger hover:text-danger"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function Avatar({ admin, size }: { admin: AdminUser; size: 'sm' | 'md' }) {
  const dims = size === 'sm' ? 'h-6 w-6' : 'h-10 w-10'
  const text = size === 'sm' ? 'text-[10px]' : 'text-sm'

  if (admin.avatarUrl) {
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-full border border-border',
          dims,
        )}
      >
        <Image
          src={admin.avatarUrl}
          alt={admin.name}
          fill
          className="object-cover"
          sizes="40px"
          unoptimized
        />
      </div>
    )
  }

  const initials = admin.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center rounded-full border border-neon/40 bg-neon/20 font-bold text-neon',
        dims,
        text,
      )}
    >
      {initials}
    </div>
  )
}
