import * as React from 'react'
import { cn } from '@/lib/utils'

type Props = {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  align?: 'left' | 'center'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PageHero({
  eyebrow,
  title,
  description,
  icon,
  align = 'left',
  size = 'md',
  className,
}: Props) {
  const sizeClasses = {
    sm: 'py-8 md:py-12',
    md: 'py-10 md:py-16',
    lg: 'py-12 md:py-20',
  }

  const titleSize = {
    sm: 'text-3xl md:text-4xl',
    md: 'text-4xl md:text-6xl',
    lg: 'text-5xl md:text-7xl',
  }

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden border-b border-border bg-bg-secondary',
        sizeClasses[size],
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -top-32 left-1/4"
        aria-hidden="true"
      >
        <div className="h-[400px] w-[400px] rounded-full bg-neon/10 blur-3xl" />
      </div>

      <div
        className={cn(
          'relative mx-auto max-w-7xl px-4 md:px-6',
          align === 'center' && 'text-center',
        )}
      >
        <div
          className={cn(
            'flex gap-3',
            align === 'center' ? 'flex-col items-center' : 'items-start',
          )}
        >
          {icon && (
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-neon/30 bg-neon/15">
              {icon}
            </div>
          )}
          <div>
            {eyebrow && (
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-neon">
                {eyebrow}
              </p>
            )}
            <h1
              className={cn(
                'font-display uppercase leading-[0.95] tracking-tight',
                titleSize[size],
              )}
              style={{ textShadow: '0 0 24px rgba(107, 29, 255, 0.25)' }}
            >
              {title}
            </h1>
            {description && (
              <div
                className={cn(
                  'mt-3 text-base text-gray-100 md:mt-4 md:text-lg',
                  align === 'left' && 'max-w-2xl',
                )}
              >
                {description}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
