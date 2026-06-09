import Image from 'next/image'
import Link from 'next/link'

type Props = {
  variant?: 'horizontal' | 'shield'
  className?: string
  width?: number
  height?: number
  href?: string
  ariaLabel?: string
}

export function Logo({
  variant = 'horizontal',
  className,
  width,
  height,
  href = '/',
  ariaLabel = 'Cariri Chuteiras — voltar para a home',
}: Props) {
  const src = variant === 'horizontal' ? '/logo-horizontal.svg' : '/escudo.svg'
  const defaultW = variant === 'horizontal' ? 160 : 48
  const defaultH = variant === 'horizontal' ? 40 : 56

  const img = (
    <Image
      src={src}
      alt="Cariri Chuteiras"
      width={width ?? defaultW}
      height={height ?? defaultH}
      priority
      className={className}
    />
  )

  if (!href) return img

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="inline-flex items-center transition-transform hover:scale-105"
    >
      {img}
    </Link>
  )
}
