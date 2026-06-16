'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Percent,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { saveCouponAction } from '@/app/admin/(authenticated)/cupons/actions'
import {
  COUPON_STATUS_LABELS,
  COUPON_STATUS_STYLES,
  getCouponStatus,
  type CouponFormValues,
} from '@/lib/admin/coupons/schema'
import { cn, formatBRL } from '@/lib/utils'

type Props = {
  initialData?: CouponFormValues & { id: string; usageCount?: number }
}

const DEFAULT: CouponFormValues = {
  code: '',
  description: null,
  discountType: 'percentage',
  discountValue: 10,
  minPurchase: null,
  validFrom: null,
  validUntil: null,
  maxUses: null,
  isActive: true,
}

export function CouponForm({ initialData }: Props) {
  const router = useRouter()
  const isEditing = Boolean(initialData)
  const [values, setValues] = React.useState<CouponFormValues>(
    initialData ?? DEFAULT,
  )
  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  function patch(p: Partial<CouponFormValues>) {
    setValues((prev) => ({ ...prev, ...p }))
  }

  async function handleSave() {
    setSaving(true)
    setErrors({})
    const newErrors: Record<string, string> = {}
    if (!values.code) newErrors.code = 'Código obrigatório'
    if (!values.discountValue || values.discountValue <= 0)
      newErrors.discountValue = 'Valor inválido'
    if (
      values.discountType === 'percentage' &&
      values.discountValue > 100
    ) {
      newErrors.discountValue = 'Máximo 100%'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSaving(false)
      toast.error('Corrija os campos obrigatórios')
      return
    }

    const result = await saveCouponAction(initialData?.id ?? null, values)
    setSaving(false)
    if (result.ok) {
      toast.success(isEditing ? 'Cupom atualizado!' : 'Cupom criado!')
      router.push('/admin/cupons')
    } else {
      toast.error(result.error)
    }
  }

  const currentStatus = isEditing
    ? getCouponStatus({
        isActive: values.isActive,
        validFrom: values.validFrom,
        validUntil: values.validUntil,
        maxUses: values.maxUses,
        usageCount: initialData?.usageCount ?? 0,
      })
    : null

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/cupons" aria-label="Voltar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl uppercase tracking-tight md:text-3xl">
              {isEditing ? 'Editar cupom' : 'Novo cupom'}
            </h1>
            {isEditing && currentStatus && (
              <span
                className={cn(
                  'mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                  COUPON_STATUS_STYLES[currentStatus],
                )}
              >
                {COUPON_STATUS_LABELS[currentStatus]}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/cupons">Cancelar</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </header>

      <Card title="Identificação">
        <FieldGroup
          label="Código *"
          hint="Letras maiúsculas, números, _ ou -"
          error={errors.code}
        >
          <input
            type="text"
            value={values.code}
            onChange={(e) =>
              patch({
                code: e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9_-]/g, ''),
              })
            }
            maxLength={30}
            placeholder="BEMVINDO10"
            className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 font-mono text-sm uppercase focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
          />
        </FieldGroup>
        <FieldGroup
          label="Descrição interna"
          hint="Aparece na página de promoções (opcional)"
        >
          <Textarea
            value={values.description ?? ''}
            onChange={(e) => patch({ description: e.target.value || null })}
            maxLength={200}
            rows={2}
            placeholder="Ex: Cupom de boas-vindas, primeira compra"
            className="resize-none border-border bg-bg-primary"
          />
        </FieldGroup>
      </Card>

      <Card title="Desconto">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
              Tipo *
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <DiscountTypeButton
                active={values.discountType === 'percentage'}
                onClick={() => patch({ discountType: 'percentage' })}
                icon={<Percent className="h-4 w-4" />}
                label="Percentual"
              />
              <DiscountTypeButton
                active={values.discountType === 'fixed'}
                onClick={() => patch({ discountType: 'fixed' })}
                icon={<DollarSign className="h-4 w-4" />}
                label="Fixo"
              />
            </div>
          </div>
          <FieldGroup
            label={`Valor * ${values.discountType === 'percentage' ? '(%)' : '(R$)'}`}
            error={errors.discountValue}
          >
            <input
              type="number"
              value={values.discountValue || ''}
              onChange={(e) =>
                patch({ discountValue: Number(e.target.value) })
              }
              step={values.discountType === 'percentage' ? '1' : '0.01'}
              min="0"
              max={values.discountType === 'percentage' ? '100' : '99999'}
              placeholder={
                values.discountType === 'percentage' ? '10' : '50,00'
              }
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            />
          </FieldGroup>
          <FieldGroup label="Compra mínima (R$)" hint="Opcional">
            <input
              type="number"
              value={values.minPurchase ?? ''}
              onChange={(e) =>
                patch({
                  minPurchase: e.target.value ? Number(e.target.value) : null,
                })
              }
              step="0.01"
              min="0"
              placeholder="0,00"
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
            />
          </FieldGroup>
        </div>
        <div className="rounded-md border border-neon/30 bg-neon/5 p-3 text-xs">
          <p className="text-gray-100">
            <strong className="text-neon">Preview:</strong>{' '}
            {values.discountType === 'percentage'
              ? `${values.discountValue}% de desconto`
              : `${formatBRL(values.discountValue || 0)} de desconto`}
            {values.minPurchase
              ? ` em compras acima de ${formatBRL(values.minPurchase)}`
              : ''}
          </p>
        </div>
      </Card>

      <Card title="Validade">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Inicia em" hint="Vazio = vale desde já">
            <input
              type="datetime-local"
              value={dateToInput(values.validFrom)}
              onChange={(e) =>
                patch({
                  validFrom: e.target.value ? new Date(e.target.value) : null,
                })
              }
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none"
            />
          </FieldGroup>
          <FieldGroup label="Expira em" hint="Vazio = sem expiração">
            <input
              type="datetime-local"
              value={dateToInput(values.validUntil)}
              onChange={(e) =>
                patch({
                  validUntil: e.target.value
                    ? new Date(e.target.value)
                    : null,
                })
              }
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none"
            />
          </FieldGroup>
        </div>
      </Card>

      <Card title="Limites de uso">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Máximo de usos" hint="Vazio = ilimitado">
            <input
              type="number"
              value={values.maxUses ?? ''}
              onChange={(e) =>
                patch({
                  maxUses: e.target.value ? Number(e.target.value) : null,
                })
              }
              min="1"
              placeholder="∞"
              className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none"
            />
          </FieldGroup>
          {isEditing && initialData?.usageCount !== undefined && (
            <FieldGroup label="Usos atuais" hint="Apenas leitura">
              <input
                type="text"
                value={initialData.usageCount}
                readOnly
                className="h-10 w-full cursor-not-allowed rounded-md border border-border bg-bg-tertiary px-3 text-sm"
              />
            </FieldGroup>
          )}
        </div>
      </Card>

      <Card title="Status">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-foreground">Cupom ativo</Label>
          <Switch
            checked={values.isActive}
            onCheckedChange={(v) => patch({ isActive: v })}
          />
        </div>
      </Card>
    </div>
  )
}

function dateToInput(date?: Date | string | null): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
      <h2 className="border-b border-border pb-2 font-display text-base uppercase tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}

function FieldGroup({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-[10px] text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-danger">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

function DiscountTypeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex h-10 items-center justify-center gap-1.5 rounded-md border text-sm font-medium transition-all',
        active
          ? 'border-neon bg-neon/10 text-neon'
          : 'border-border bg-bg-primary text-gray-100 hover:border-neon/40',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
