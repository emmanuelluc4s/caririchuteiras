'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { updateAdminAction } from '@/app/admin/(authenticated)/usuarios/actions'
import { ADMIN_ROLE_LABELS, type AdminRole } from '@/lib/admin/types'
import type { UserRow } from './users-table'

type Props = {
  user: UserRow
  open: boolean
  onOpenChange: (open: boolean) => void
  isCurrentUser: boolean
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  isCurrentUser,
}: Props) {
  const router = useRouter()
  const [name, setName] = React.useState(user.name)
  const [role, setRole] = React.useState<AdminRole>(user.role)
  const [isActive, setIsActive] = React.useState(user.isActive)
  const [pending, setPending] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setName(user.name)
      setRole(user.role)
      setIsActive(user.isActive)
    }
  }, [open, user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    const result = await updateAdminAction(user.id, { name, role, isActive })
    setPending(false)
    if (result.ok) {
      toast.success('Usuário atualizado')
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-bg-secondary">
        <DialogHeader>
          <DialogTitle className="font-display uppercase">
            Editar usuário
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="rounded-md border border-border bg-bg-primary p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-400">
              Email
            </p>
            <p className="break-all font-mono text-sm">{user.email}</p>
          </div>
          <div>
            <Label
              htmlFor="edit-name"
              className="text-xs uppercase tracking-wider text-gray-400"
            >
              Nome *
            </Label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={80}
              className="mt-1 h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            />
          </div>
          <div>
            <Label
              htmlFor="edit-role"
              className="text-xs uppercase tracking-wider text-gray-400"
            >
              Função *
            </Label>
            <select
              id="edit-role"
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              disabled={isCurrentUser}
              className="mt-1 h-10 w-full cursor-pointer rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="viewer">{ADMIN_ROLE_LABELS.viewer}</option>
              <option value="editor">{ADMIN_ROLE_LABELS.editor}</option>
              <option value="admin">{ADMIN_ROLE_LABELS.admin}</option>
            </select>
            {isCurrentUser && (
              <p className="mt-1 text-[10px] text-warning">
                Você não pode mudar sua própria função
              </p>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <Label className="text-sm">Usuário ativo</Label>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isCurrentUser}
            />
          </div>
          {isCurrentUser && (
            <p className="text-[10px] text-warning">
              Você não pode desativar a si mesmo
            </p>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              <Save className="h-4 w-4" />
              {pending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
