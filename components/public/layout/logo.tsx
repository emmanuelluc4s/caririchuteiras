import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {
  variant?: 'horizontal' | 'shield'
  className?: string
  width?: number
  height?: number
  href?: string
  ariaLabel?: string
}

/**
 * Logo da Cariri Chuteiras.
 *
 * - `shield`: usa /escudo.png inteiro (com banner CARIRI CHUTEIRAS já dentro).
 *   Bom pra hero, 404, watermark, dropdowns.
 * - `horizontal`: escudo compacto + texto "CARIRI CHUTEIRAS" ao lado em Anton.
 *   Bom pra header (onde o banner do escudo ficaria ilegível em tamanho pequeno).
 *
 * A imagem fica em `public/escudo.png` — pode ser substituída a qualquer
 * momento mantendo o mesmo nome.
 */
export function Logo({
  variant = 'horizontal',
  className,
  width,
  height,
  href = '/',
  ariaLabel = 'Cariri Chuteiras — voltar para a home',
}: Props) {
  const isShield = variant === 'shield'

  const defaultW = isShield ? 140 : 44
  const defaultH = isShield ? 160 : 50
  const w = width ?? defaultW
  const h = height ?? defaultH

  const content = isShield ? (
    <Image
      src="/escudo.png"
      alt="Cariri Chuteiras"
      width={w}
      height={h}
      priority
      className={className}
      style={{ height: 'auto' }}
    />
  ) : (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src="/escudo.png"
        alt=""
        width={w}
        height={h}
        priority
        className="shrink-0"
        style={{ height: 'auto' }}
      />
      <span className="font-display text-xl leading-none tracking-tight md:text-2xl">
        <span className="text-foreground">CARIRI</span>{' '}
        <span className="text-neon">CHUTEIRAS</span>
      </span>
    </div>
  )

  if (!href) return content

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="inline-flex items-center transition-transform hover:scale-105"
    >
      {content}
    </Link>
  )
}
