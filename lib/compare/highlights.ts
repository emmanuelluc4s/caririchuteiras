import type { CompareProduct } from '@/lib/queries/compare'

type ProductLike = Pick<
  CompareProduct,
  'id' | 'price' | 'promoPrice' | 'averageRating' | 'totalStock'
>

type HighlightId = 'cheapest' | 'best-rated' | 'most-stock'

export type HighlightMap = Record<HighlightId, string | null>

/**
 * Calcula qual produto é o melhor em cada critério.
 * Retorna IDs dos vencedores (ou null em caso de empate ou critério irrelevante).
 */
export function calcHighlights(products: ProductLike[]): HighlightMap {
  if (products.length < 2) {
    return { cheapest: null, 'best-rated': null, 'most-stock': null }
  }

  const prices = products.map((p) => ({
    id: p.id,
    price: Number(p.promoPrice ?? p.price),
  }))
  const minPrice = Math.min(...prices.map((p) => p.price))
  const cheapest = prices.filter((p) => p.price === minPrice)
  const cheapestId = cheapest.length === 1 ? cheapest[0]!.id : null

  const rated = products.filter((p) => p.averageRating > 0)
  let bestRatedId: string | null = null
  if (rated.length >= 2) {
    const maxRating = Math.max(...rated.map((p) => p.averageRating))
    const winners = rated.filter((p) => p.averageRating === maxRating)
    if (winners.length === 1) bestRatedId = winners[0]!.id
  }

  const stocks = products.map((p) => ({ id: p.id, stock: p.totalStock }))
  const maxStock = Math.max(...stocks.map((s) => s.stock))
  let mostStockId: string | null = null
  if (maxStock > 0) {
    const winners = stocks.filter((s) => s.stock === maxStock)
    if (winners.length === 1) mostStockId = winners[0]!.id
  }

  return {
    cheapest: cheapestId,
    'best-rated': bestRatedId,
    'most-stock': mostStockId,
  }
}
