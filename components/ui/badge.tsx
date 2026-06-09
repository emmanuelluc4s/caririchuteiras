import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent gradient-neon text-white neon-glow-sm',
        secondary: 'border-border bg-bg-tertiary text-foreground',
        outline: 'border-neon text-neon',
        success: 'border-transparent bg-success/20 text-success',
        danger: 'border-transparent bg-danger text-white',
        warning: 'border-transparent bg-warning/20 text-warning',
        new: 'border-transparent gradient-neon text-white animate-pulse-neon',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
