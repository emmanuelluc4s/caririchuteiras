import { ProductCard } from '@/components/public/product/product-card'
import type { ProductCardData } from '@/lib/types/product-card'

type Props = {
  products: ProductCardData[]
}

export function RelatedProducts({ products }: Props) {
  if (products.length === 0) return null

  return (
    <section className="space-y-6" aria-labelledby="related-heading">
      <header>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neon">
          Recomendados
        </p>
        <h2
          id="related-heading"
          className="font-display text-3xl uppercase tracking-tight md:text-5xl"
        >
          Você também pode <span className="text-neon">gostar</span>
        </h2>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
