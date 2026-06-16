'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Activity, X, Download, Search, User } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { exportAuditAction } from '@/app/admin/(authenticated)/auditoria/actions'
import { cn } from '@/lib/utils'

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  product_create: { label: 'Produto criado', color: 'text-success' },
  product_update: { label: 'Produto editado', color: 'text-foreground' },
  product_activate: { label: 'Produto ativado', color: 'text-success' },
  product_deactivate: { label: 'Produto desativado', color: 'text-warning' },
  product_duplicate: { label: 'Produto duplicado', color: 'text-foreground' },
  product_delete: { label: 'Produto EXCLUÍDO', color: 'text-danger' },
  category_create: { label: 'Categoria criada', color: 'text-success' },
  category_update: { label: 'Categoria editada', color: 'text-foreground' },
  category_activate: { label: 'Categoria ativada', color: 'text-success' },
  category_deactivate: { label: 'Categoria desativada', color: 'text-warning' },
  category_delete: { label: 'Categoria EXCLUÍDA', color: 'text-danger' },
  category_reorder: {
    label: 'Categorias reordenadas',
    color: 'text-foreground',
  },
  coupon_create: { label: 'Cupom criado', color: 'text-success' },
  coupon_update: { label: 'Cupom editado', color: 'text-foreground' },
  coupon_activate: { label: 'Cupom ativado', color: 'text-success' },
  coupon_deactivate: { label: 'Cupom desativado', color: 'text-warning' },
  coupon_duplicate: { label: 'Cupom duplicado', color: 'text-foreground' },
  coupon_delete: { label: 'Cupom EXCLUÍDO', color: 'text-danger' },
  review_approve: { label: 'Avaliação aprovada', color: 'text-success' },
  review_reject: { label: 'Avaliação rejeitada', color: 'text-warning' },
  review_mark_verified: {
    label: 'Avaliação marcada verificada',
    color: 'text-neon',
  },
  review_unmark_verified: {
    label: 'Selo verificado removido',
    color: 'text-warning',
  },
  review_delete: { label: 'Avaliação EXCLUÍDA', color: 'text-danger' },
  review_bulk_approve: {
    label: 'Avaliações aprovadas em massa',
    color: 'text-success',
  },
  review_bulk_reject: {
    label: 'Avaliações rejeitadas em massa',
    color: 'text-warning',
  },
  review_bulk_delete: {
    label: 'Avaliações EXCLUÍDAS em massa',
    color: 'text-danger',
  },
  config_update: { label: 'Configurações atualizadas', color: 'text-neon' },
  maintenance_enable: {
    label: '🛠️ MODO MANUTENÇÃO ATIVADO',
    color: 'text-warning',
  },
  maintenance_disable: {
    label: '✅ Site voltou ao ar',
    color: 'text-success',
  },
  admin_user_create: { label: 'Novo admin criado', color: 'text-success' },
  admin_user_update: { label: 'Admin editado', color: 'text-foreground' },
  admin_user_delete: { label: 'Admin EXCLUÍDO', color: 'text-danger' },
  admin_user_password_reset: {
    label: 'Senha de admin redefinida',
    color: 'text-warning',
  },
}

type AuditItem = {
  id: string
  action: string
  admin: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  } | null
  metadata: Record<string, unknown>
  createdAt: Date | string
}

type Props = {
  items: AuditItem[]
  admins: Array<{ id: string; name: string; email: string }>
  availableActions: string[]
  currentFilters: {
    adminId?: string
    action?: string
  }
}

export function AuditList({
  items,
  admins,
  availableActions,
  currentFilters,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedEvent, setSelectedEvent] = React.useState<AuditItem | null>(
    null,
  )
  const [exporting, setExporting] = React.useState(false)

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    params.delete('pagina')
    const q = params.toString()
    router.push(q ? `/admin/auditoria?${q}` : '/admin/auditoria')
  }

  function clearAll() {
    router.push('/admin/auditoria')
  }

  async function handleExport() {
    setExporting(true)
    const toastId = toast.loading('Gerando CSV...')
    const result = await exportAuditAction({
      adminId: currentFilters.adminId,
      action: currentFilters.action,
    })
    setExporting(false)
    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }
    const BOM = '﻿'
    const blob = new Blob([BOM + result.csv], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Exportado!', { id: toastId })
  }

  const hasFilters = currentFilters.adminId || currentFilters.action

  return (
    <>
      <section className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <select
          value={currentFilters.adminId ?? 'all'}
          onChange={(e) =>
            updateFilter('admin', e.target.value === 'all' ? null : e.target.value)
          }
          className="h-9 cursor-pointer rounded-md border border-border bg-bg-secondary px-3 text-xs focus:border-neon focus:outline-none"
        >
          <option value="all">Todos os admins</option>
          {admins.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select
          value={currentFilters.action ?? 'all'}
          onChange={(e) =>
            updateFilter('acao', e.target.value === 'all' ? null : e.target.value)
          }
          className="h-9 cursor-pointer rounded-md border border-border bg-bg-secondary px-3 text-xs focus:border-neon focus:outline-none"
        >
          <option value="all">Todas as ações</option>
          {availableActions.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a]?.label ?? a}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-danger"
          >
            <X className="h-3 w-3" />
            Limpar
          </button>
        )}
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
        >
          <Download className="h-3.5 w-3.5" />
          Exportar CSV
        </Button>
      </section>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-secondary p-12 text-center">
          <Activity className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="text-sm text-foreground">Nenhum evento encontrado</p>
          <p className="mt-1 text-xs text-gray-400">
            {hasFilters
              ? 'Ajuste os filtros'
              : 'Eventos aparecerão aqui conforme admins agirem'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-bg-secondary">
          {items.map((event) => {
            const actionInfo = ACTION_LABELS[event.action] ?? {
              label: event.action,
              color: 'text-gray-400',
            }
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-tertiary/30"
                >
                  {event.admin ? (
                    <Avatar admin={event.admin} />
                  ) : (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-gray-600/10">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm text-foreground">
                        <strong className="font-semibold">
                          {event.admin?.name ?? 'Desconhecido'}
                        </strong>{' '}
                        <span className={cn('font-medium', actionInfo.color)}>
                          {actionInfo.label}
                        </span>
                      </p>
                    </div>
                    <p className="mt-0.5 text-[10px] text-gray-500">
                      {format(
                        new Date(event.createdAt),
                        "dd 'de' MMM 'de' yyyy 'às' HH:mm",
                        { locale: ptBR },
                      )}
                    </p>
                  </div>
                  <Search className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog
        open={Boolean(selectedEvent)}
        onOpenChange={(o) => !o && setSelectedEvent(null)}
      >
        <DialogContent className="max-w-lg border-border bg-bg-secondary">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              Detalhes do evento
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3 py-2">
              <div className="rounded-md border border-border bg-bg-primary p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                  Ação
                </p>
                <p
                  className={cn(
                    'text-sm font-medium',
                    ACTION_LABELS[selectedEvent.action]?.color,
                  )}
                >
                  {ACTION_LABELS[selectedEvent.action]?.label ??
                    selectedEvent.action}
                </p>
              </div>
              <div className="rounded-md border border-border bg-bg-primary p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                  Executado por
                </p>
                <p className="text-sm">
                  {selectedEvent.admin?.name ?? 'Desconhecido'}{' '}
                  {selectedEvent.admin && (
                    <span className="text-gray-400">
                      ({selectedEvent.admin.email})
                    </span>
                  )}
                </p>
              </div>
              <div className="rounded-md border border-border bg-bg-primary p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                  Quando
                </p>
                <p className="text-sm">
                  {format(
                    new Date(selectedEvent.createdAt),
                    "dd 'de' MMM 'de' yyyy 'às' HH:mm:ss",
                    { locale: ptBR },
                  )}
                </p>
              </div>
              <div className="rounded-md border border-border bg-bg-primary p-3">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-400">
                  Metadados (JSON)
                </p>
                <pre className="max-h-72 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[10px] text-gray-100">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function Avatar({ admin }: { admin: NonNullable<AuditItem['admin']> }) {
  if (admin.avatarUrl) {
    return (
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border">
        <Image
          src={admin.avatarUrl}
          alt={admin.name}
          fill
          className="object-cover"
          sizes="36px"
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
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neon/40 bg-neon/20 text-xs font-bold text-neon">
      {initials}
    </div>
  )
}
