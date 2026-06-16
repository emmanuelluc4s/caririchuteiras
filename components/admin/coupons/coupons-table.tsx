'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Copy,
  CheckCircle2,
  Edit,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react'
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
import { toast } from 'sonner'
import { formatBRL, cn } from '@/lib/utils'
import {
  getCouponStatus,
  COUPON_STATUS_LABELS,
  COUPON_STATUS_STYLES,
} from '@/lib/admin/coupons/schema'
import {
  toggleCouponActiveAction,
  duplicateCouponAction,
  deleteCouponAction,
} from '@/app/admin/(authenticated)/cupons/actions'

export type CouponRow = {
  id: string
  code: string
  description: string | null
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minPurchase: number | null
  validFrom: Date | string | null
  validUntil: Date | string | null
  maxUses: number | null
  usageCount: number
  isActive: boolean
}

type Props = {
  coupons: CouponRow[]
}

export function CouponsTable({ coupons }: Props) {
  if (coupons.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-bg-secondary p-12 text-center">
        <Sparkles className="mx-auto mb-3 h-10 w-10 text-gray-600" />
        <p className="text-sm text-foreground">Nenhum cupom cadastrado</p>
        <p className="mt-1 text-xs text-gray-400">
          Crie cupons para impulsionar conversão no WhatsApp.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-bg-tertiary/50">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Código
              </th>
              <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 md:table-cell">
                Desconto
              </th>
              <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 lg:table-cell">
                Validade
              </th>
              <th className="hidden px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 md:table-cell">
                Uso
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
            {coupons.map((c) => (
              <CouponTableRow key={c.id} coupon={c} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CouponTableRow({ coupon }: { coupon: CouponRow }) {
  const router = useRouter()
  const [copied, setCopied] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const status = getCouponStatus(coupon)
  const discountLabel =
    coupon.discountType === 'percentage'
      ? `${coupon.discountValue}%`
      : formatBRL(coupon.discountValue)

  function handleCopyCode() {
    navigator.clipboard.writeText(coupon.code).catch(() => {})
    setCopied(true)
    toast.success(`Código ${coupon.code} copiado`)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleToggle() {
    setPending(true)
    const result = await toggleCouponActiveAction(coupon.id)
    setPending(false)
    if (result.ok) {
      toast.success(coupon.isActive ? 'Cupom desativado' : 'Cupom ativado')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleDuplicate() {
    setPending(true)
    const result = await duplicateCouponAction(coupon.id)
    setPending(false)
    if (result.ok && result.data) {
      toast.success('Cupom duplicado!', {
        description: 'Versão desativada criada',
      })
      router.push(`/admin/cupons/${result.data.id}/editar`)
    } else if (!result.ok) {
      toast.error(result.error)
    }
  }

  async function handleDelete() {
    setPending(true)
    const result = await deleteCouponAction(coupon.id)
    setPending(false)
    setConfirmDelete(false)
    if (result.ok) {
      toast.success('Cupom excluído')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <tr className="border-b border-border transition-colors last:border-0 hover:bg-bg-tertiary/30">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="group inline-flex items-center gap-1.5 rounded-md border border-dashed border-neon/40 bg-neon/5 px-2 py-1 transition-all hover:border-neon hover:bg-neon/10"
              title="Copiar código"
            >
              <code className="font-mono text-xs font-bold text-neon">
                {coupon.code}
              </code>
              {copied ? (
                <CheckCircle2 className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3 text-gray-400 group-hover:text-neon" />
              )}
            </button>
          </div>
          {coupon.description && (
            <p className="mt-1 line-clamp-1 text-[10px] text-gray-400">
              {coupon.description}
            </p>
          )}
        </td>
        <td className="hidden px-4 py-3 md:table-cell">
          <p className="font-display text-lg leading-none text-foreground">
            {discountLabel}
          </p>
          {coupon.minPurchase != null && coupon.minPurchase > 0 && (
            <p className="mt-1 text-[10px] text-gray-400">
              Min: {formatBRL(coupon.minPurchase)}
            </p>
          )}
        </td>
        <td className="hidden px-4 py-3 lg:table-cell">
          {coupon.validUntil ? (
            <p className="text-xs text-gray-100">
              Até{' '}
              <strong>
                {new Date(coupon.validUntil).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </strong>
            </p>
          ) : (
            <p className="text-xs text-gray-400">Sem validade</p>
          )}
          {coupon.validFrom && new Date(coupon.validFrom) > new Date() && (
            <p className="mt-0.5 text-[10px] text-neon">
              Inicia em{' '}
              {new Date(coupon.validFrom).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
              })}
            </p>
          )}
        </td>
        <td className="hidden px-4 py-3 text-center md:table-cell">
          <p className="text-xs font-semibold tabular-nums">
            {coupon.usageCount}
            {coupon.maxUses != null && (
              <span className="font-normal text-gray-400">
                {' '}
                / {coupon.maxUses}
              </span>
            )}
          </p>
        </td>
        <td className="px-4 py-3 text-center">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              COUPON_STATUS_STYLES[status],
            )}
          >
            {COUPON_STATUS_LABELS[status]}
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
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/cupons/${coupon.id}/editar`}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDuplicate}
                className="cursor-pointer"
              >
                <Copy className="mr-2 h-3.5 w-3.5" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleToggle}
                className="cursor-pointer"
              >
                {coupon.isActive ? (
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
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => setConfirmDelete(true)}
                className="cursor-pointer text-danger focus:text-danger"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="border-border bg-bg-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase">
              Excluir cupom &ldquo;{coupon.code}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-100">
              Ação <strong className="text-danger">permanente</strong>.
              Histórico de uso será perdido.
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
    </>
  )
}
