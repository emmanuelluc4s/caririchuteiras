import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'border-border bg-bg-secondary text-foreground flex h-11 w-full rounded-md border px-3 py-2 text-sm transition-colors placeholder:text-gray-400',
          'focus-visible:border-neon focus-visible:neon-glow-sm focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
