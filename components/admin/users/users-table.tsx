'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ADMIN_ROLE_LABELS,
  ADMIN_ROLE_COLORS,
  type AdminRole,
} from '@/lib/admin/types'
import {
  resetPasswordAction,
  deleteAdminAction,
  updateAdminAction,
} from '@/app/admin/(authenticated)/usuarios/actions'
import { EditUserDialog } from './edit-user-dialog'

export type UserRow = {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: AdminRole
  isActive: boolean
  lastLoginAt: Date | string | null
  createdAt: Date | string
}

type Props = {
  users: UserRow[]
  currentUserId: string
}

export function UsersTable({ users, currentUserId }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-bg-tertiary/50">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Usuário
              </th>
              <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 md:table-cell">
                Função
              </th>
              <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 lg:table-cell">
                Último acesso
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserTableRow
                key={u.id}
                user={u}
                isCurrentUser={u.id === currentUserId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UserTableRow({
  user,
  isCurrentUser,
}: {
  user: UserRow
  isCurrentUser: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)
  const [showResetResult, setShowResetResult] = React.useState<string | null>(
    null,
  )
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  async function handleToggleActive() {
    if (isCurrentUser) {
      toast.error('Você não pode desativar a si mesmo')
      return
    }
    setPending(true)
    const result = await updateAdminAction(user.id, {
      name: user.name,
      role: user.role,
      isActive: !user.isActive,
    })
    setPending(false)
    if (result.ok) {
      toast.success(user.isActive ? 'Usuário desativado' : 'Usuário ativado')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleResetPassword() {
    setPending(true)
    const result = await resetPasswordAction(user.id)
    setPending(false)
    if (result.ok && result.data) {
      setShowResetResult(result.data.tempPassword)
    } else if (!result.ok) {
      toast.error(result.error)
    }
  }

  async function handleDelete() {
    setPending(true)
    const result = await deleteAdminAction(user.id)
    setPending(false)
    setConfirmDelete(false)
    if (result.ok) {
      toast.success('Usuário excluído')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  function copyResetCredentials() {
    if (!showResetResult) return
    navigator.clipboard
      .writeText(`Email: ${user.email}\nNova senha: ${showResetResult}`)
      .catch(() => {})
    setCopied(true)
    toast.success('Copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <tr
        className={cn(
          'border-b border-border transition-colors last:border-0 hover:bg-bg-tertiary/30',
          !user.isActive && 'opacity-60',
        )}
      >
        <td className="px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar user={user} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                {isCurrentUser && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neon">
                    Você
                  </span>
                )}
              </div>
              <p className="truncate text-[10px] text-gray-400">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="hidden px-4 py-3 md:table-cell">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold',
              ADMIN_ROLE_COLORS[user.role],
            )}
          >
            <ShieldCheck className="h-3 w-3" />
            {ADMIN_ROLE_LABELS[user.role]}
          </span>
        </td>
        <td className="hidden px-4 py-3 lg:table-cell">
          {user.lastLoginAt ? (
            <p className="text-xs text-gray-100">
              {formatDistanceToNow(new Date(user.lastLoginAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Nunca entrou</p>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              user.isActive
                ? 'bg-success/10 text-success'
                : 'bg-gray-600/10 text-gray-400',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                user.isActive ? 'bg-success' : 'bg-gray-500',
              )}
            />
            {user.isActive ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Ações"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-bg-tertiary hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-border bg-bg-secondary"
            >
              <DropdownMenuItem
                onClick={() => setEditOpen(true)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-3.5 w-3.5" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleResetPassword}
                className="cursor-pointer"
              >
                <KeyRound className="mr-2 h-3.5 w-3.5" />
                Redefinir senha
              </DropdownMenuItem>
              {!isCurrentUser && (
                <DropdownMenuItem
                  onClick={handleToggleActive}
                  className="cursor-pointer"
                >
                  {user.isActive ? (
                    <>
                      <EyeOff className="mr-2 h-3.5 w-3.5" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-3.5 w-3.5" />
                      Ativar
                    </>
                  )}
                </DropdownMenuItem>
              )}
              {!isCurrentUser && (
                <>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={() => setConfirmDelete(true)}
                    className="cursor-pointer text-danger focus:text-danger"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Excluir
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      <EditUserDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        isCurrentUser={isCurrentUser}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="border-border bg-bg-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase">
              Excluir {user.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-100">
              O usuário será removido do sistema de autenticação e do banco.{' '}
              <strong className="text-danger">
                Esta ação não pode ser desfeita.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-bg-tertiary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={pending}
              className="bg-danger text-white hover:bg-danger/90"
            >
              {pending ? 'Excluindo...' : 'Sim, excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(showResetResult)}
        onOpenChange={(o) => !o && setShowResetResult(null)}
      >
        <DialogContent className="max-w-md border-border bg-bg-secondary">
          <DialogHeader>
            <DialogTitle className="font-display uppercase text-success">
              ✅ Senha redefinida
            </DialogTitle>
          </DialogHeader>
          <div className="my-2 rounded-md border border-warning/30 bg-warning/10 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-warning">
              <ShieldAlert className="h-3.5 w-3.5" />
              Anote agora — não será mostrada de novo
            </p>
          </div>
          <div className="space-y-3 py-2">
            <div className="rounded-md border border-border bg-bg-primary p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">
                Email
              </p>
              <p className="break-all font-mono text-sm">{user.email}</p>
            </div>
            <div className="rounded-md border border-neon/40 bg-neon/5 p-3">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-neon">
                Nova senha
              </p>
              <p className="select-all break-all font-mono text-base">
                {showResetResult}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyResetCredentials}
              className="w-full"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copiar email + senha
                </>
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowResetResult(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Avatar({ user }: { user: UserRow }) {
  if (user.avatarUrl) {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border">
        <Image
          src={user.avatarUrl}
          alt={user.name}
          fill
          className="object-cover"
          sizes="40px"
          unoptimized
        />
      </div>
    )
  }
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-neon/40 bg-neon/20 text-sm font-bold text-neon">
      {initials}
    </div>
  )
}
