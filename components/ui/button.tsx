import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'gradient-neon text-white shadow-lg hover:gradient-neon-hover hover:neon-glow active:scale-[0.98]',
        whatsapp: 'bg-whatsapp text-white shadow-lg hover:bg-whatsapp-dark active:scale-[0.98]',
        outline:
          'border border-neon bg-transparent text-neon hover:bg-neon hover:text-white hover:neon-glow-sm',
        ghost: 'hover:bg-bg-tertiary text-foreground',
        destructive: 'bg-danger text-white hover:bg-danger/90',
        link: 'text-neon underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-14 px-8 text-base',
        xl: 'h-16 px-10 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
