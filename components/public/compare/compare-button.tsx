'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Scale, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button, type ButtonProps } from '@/components/ui/button'
import { useCompareStore } from '@/lib/compare/compare-store'
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { COMPARE_MAX_ITEMS } from '@/lib/compare/types'
import { cn } from '@/lib/utils'

type Props = {
  productId: string
  productName?: string
  variant?: 'icon' | 'full'
  size?: ButtonProps['size']
  className?: string
}

export function CompareButton({
  productId,
  productName,
  variant = 'icon',
  size = 'default',
  className,
}: Props) {
  const hydrated = useHasHydrated()
  const router = useRouter()
  const toggle = useCompareStore((s) => s.toggle)
  const isInCompare = useCompareStore((s) => s.has(productId))
  const { track } = useAnalytics()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const result = toggle(productId)

    if (result === 'limit-reached') {
      toast.error(`Máximo de ${COMPARE_MAX_ITEMS} produtos por comparação`, {
        description: 'Remova algum para adicionar este.',
      })
      return
    }

    if (result === 'added') {
      track('compare_add', { productId, metadata: { action: 'add' } })
      toast.success('Adicionado à comparação', {
        description: productName ?? 'Produto adicionado',
        action: {
          label: 'Comparar',
          onClick: () => router.push('/comparar'),
        },
      })
    } else if (result === 'removed') {
      track('compare_add', { productId, metadata: { action: 'remove' } })
      toast('Removido da comparação')
    }
  }

  const active = hydrated && isInCompare

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          active ? 'Remover da comparação' : 'Adicionar à comparação'
        }
        aria-pressed={active}
        title={active ? 'Remover da comparação' : 'Adicionar à comparação'}
        className={cn(
          'grid h-10 w-10 place-items-center rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110',
          active
            ? 'bg-neon text-white neon-glow-sm'
            : 'bg-bg-primary/90 text-foreground hover:bg-neon hover:text-white',
          className,
        )}
      >
        {active ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
      </button>
    )
  }

  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size={size}
      onClick={handleClick}
      aria-pressed={active}
      className={cn('gap-2', className)}
    >
      {active ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
      {active ? 'Comparando' : 'Comparar'}
    </Button>
  )
}
