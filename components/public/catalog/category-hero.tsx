import Image from 'next/image'

type Props = {
  name: string
  productsCount: number
  image?: string | null
  description?: string | null
}

export function CategoryHero({
  name,
  productsCount,
  image,
  description,
}: Props) {
  return (
    <section
      className="relative w-full overflow-hidden bg-bg-secondary"
      aria-labelledby="category-heading"
    >
      {image && (
        <div className="absolute inset-0 opacity-30" aria-hidden="true">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/40 via-bg-primary/70 to-bg-primary" />
        </div>
      )}

      <div
        className="pointer-events-none absolute -top-32 left-1/4"
        aria-hidden="true"
      >
        <div className="h-[400px] w-[400px] rounded-full bg-neon/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neon">
          Categoria
        </p>
        <h1
          id="category-heading"
          className="font-display text-5xl uppercase leading-[0.95] tracking-tight md:text-7xl"
          style={{ textShadow: '0 0 32px rgba(107, 29, 255, 0.3)' }}
        >
          {name}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base text-gray-100 md:text-lg">
            {description}
          </p>
        )}
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-gray-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
          {productsCount}{' '}
          {productsCount === 1 ? 'produto disponível' : 'produtos disponíveis'}
        </p>
      </div>
    </section>
  )
}
